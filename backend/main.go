package main

import (
	"bytes"
	"context"
	"encoding/json"
	"fmt"
	"io"
	"log"
	"net/http"
	"os"
	"strings"
	"time"

	"github.com/docker/docker/api/types"
	"github.com/docker/docker/api/types/container"
	"github.com/docker/docker/client"
	"github.com/docker/docker/pkg/stdcopy"
	"github.com/gin-contrib/cors"
	"github.com/gin-gonic/gin"
	"github.com/google/uuid"
	"gorm.io/datatypes"
	"gorm.io/driver/postgres"
	"gorm.io/gorm"
)

// --- Persistence Subsystem (Step 4) ---

type Snapshot struct {
	ID        string         `gorm:"primaryKey;type:varchar(10)" json:"id"`
	Data      datatypes.JSON `json:"data"`
	CreatedAt time.Time      `json:"createdAt"`
}

var db *gorm.DB

func initDB() {
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		dsn = "host=db user=user password=password dbname=visual_algo port=5432 sslmode=disable"
	}
	
	var err error
	for i := 0; i < 5; i++ {
		db, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
		if err == nil {
			break
		}
		log.Println("Waiting for DB...")
		time.Sleep(2 * time.Second)
	}
	if err != nil {
		log.Fatal("Failed to connect to database:", err)
	}

	db.AutoMigrate(&Snapshot{})
}

func main() {
	initDB()

	r := gin.Default()

	// Enable CORS for Vite frontend
	r.Use(cors.New(cors.Config{
		AllowOrigins:     []string{"*"}, // Allow all origins for dev
		AllowMethods:     []string{"GET", "POST", "OPTIONS"},
		AllowHeaders:     []string{"Origin", "Content-Type", "Accept"},
		ExposeHeaders:    []string{"Content-Length"},
		AllowCredentials: true,
		MaxAge:           12 * time.Hour,
	}))

	// Step 4 Endpoints
	r.POST("/api/snapshots", createSnapshot)
	r.GET("/api/snapshots/:id", getSnapshot)

	// Step 5 Endpoint
	r.POST("/api/run", executeCode)

	port := os.Getenv("PORT")
	if port == "" {
		port = "8080"
	}
	fmt.Printf("Starting Visualizer Go Backend on port %s\n", port)
	r.Run(":" + port)
}

func createSnapshot(c *gin.Context) {
	var body map[string]interface{}
	if err := c.ShouldBindJSON(&body); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Invalid JSON body: " + err.Error()})
		return
	}

	jsonData, err := json.Marshal(body)
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to serialize payload"})
		return
	}

	// Generate a short 8-character UUID
	id := uuid.New().String()[:8]
	snapshot := Snapshot{
		ID:        id,
		Data:      datatypes.JSON(jsonData),
		CreatedAt: time.Now(),
	}

	if err := db.Create(&snapshot).Error; err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save snapshot to database"})
		return
	}

	c.JSON(http.StatusOK, gin.H{"id": snapshot.ID})
}

func getSnapshot(c *gin.Context) {
	id := c.Param("id")
	var snapshot Snapshot
	if err := db.First(&snapshot, "id = ?", id).Error; err != nil {
		c.JSON(http.StatusNotFound, gin.H{"error": "Snapshot not found"})
		return
	}

	// Unwrap JSON string into real JSON object to return
	var data map[string]interface{}
	json.Unmarshal(snapshot.Data, &data)

	c.JSON(http.StatusOK, data)
}

// --- Remote Code Execution (RCE) Sandbox Subsystem (Step 5) ---

type RunRequest struct {
	Code     string `json:"code" binding:"required"`
	Language string `json:"language" binding:"required"` // "python" or "cpp"
}

type RunResponse struct {
	Trace  []map[string]interface{} `json:"trace"`
	Error  string                   `json:"error,omitempty"`
	Output string                   `json:"output,omitempty"`
}

func executeCode(c *gin.Context) {
	var req RunRequest
	if err := c.ShouldBindJSON(&req); err != nil {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Missing code or language"})
		return
	}

	if req.Language != "python" && req.Language != "cpp" {
		c.JSON(http.StatusBadRequest, gin.H{"error": "Unsupported language. Use 'python' or 'cpp'"})
		return
	}

	cli, err := client.NewClientWithOpts(client.FromEnv, client.WithAPIVersionNegotiation())
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to connect to Docker daemon: " + err.Error()})
		return
	}

	ctx := context.Background()
	imageName := "python:3.10-slim"
	cmd := []string{"python", "-c", req.Code}

	if req.Language == "cpp" {
		imageName = "gcc:13"
		// Securely inject code via temp file in bash
		script := fmt.Sprintf(`echo '%s' > main.cpp && g++ -O3 main.cpp && ./a.out`, strings.ReplaceAll(req.Code, "'", "'\\''"))
		cmd = []string{"sh", "-c", script}
	}

	// Pull image if not exists
	_, _, err = cli.ImageInspectWithRaw(ctx, imageName)
	if err != nil {
		log.Printf("Pulling image %s...\n", imageName)
		reader, pullErr := cli.ImagePull(ctx, imageName, types.ImagePullOptions{})
		if pullErr == nil {
			io.Copy(os.Stdout, reader)
		}
	}

	// Create ephemeral container
	resp, err := cli.ContainerCreate(ctx, &container.Config{
		Image:           imageName,
		Cmd:             cmd,
		NetworkDisabled: true, // Crucial for security
	}, &container.HostConfig{
		AutoRemove: false,
		Resources: container.Resources{
			Memory:   256 * 1024 * 1024, // 256 MB RAM limit
			NanoCPUs: 500000000,         // 0.5 CPU limit
		},
	}, nil, nil, "")

	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to create sandbox container: " + err.Error()})
		return
	}

	// Ensure container is wiped after execution
	defer cli.ContainerRemove(ctx, resp.ID, types.ContainerRemoveOptions{Force: true})

	if err := cli.ContainerStart(ctx, resp.ID, types.ContainerStartOptions{}); err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to start sandbox container"})
		return
	}

	// Wait with timeout
	statusCh, errCh := cli.ContainerWait(ctx, resp.ID, container.WaitConditionNotRunning)
	select {
	case err := <-errCh:
		if err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Sandbox execution error: " + err.Error()})
			return
		}
	case <-statusCh:
		// Completed successfully
	case <-time.After(2 * time.Second):
		// Timeout
		c.JSON(http.StatusRequestTimeout, gin.H{"error": "Execution timed out (limit: 2s)"})
		return
	}

	logs, err := cli.ContainerLogs(ctx, resp.ID, types.ContainerLogsOptions{ShowStdout: true, ShowStderr: true})
	if err != nil {
		c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to read container logs"})
		return
	}

	var stdout, stderr bytes.Buffer
	stdcopy.StdCopy(&stdout, &stderr, logs)

	rawOutput := stdout.String()
	lines := strings.Split(rawOutput, "\n")
	
	// Collect any JSON lines that match the Trace Protocol
	var trace []map[string]interface{}
	for _, line := range lines {
		line = strings.TrimSpace(line)
		if line == "" {
			continue
		}
		var event map[string]interface{}
		// If the line is valid JSON and has a "type" field, it's a trace event
		if err := json.Unmarshal([]byte(line), &event); err == nil {
			if _, hasType := event["type"]; hasType {
				trace = append(trace, event)
			}
		}
	}

	c.JSON(http.StatusOK, RunResponse{
		Trace:  trace,
		Output: rawOutput,
		Error:  stderr.String(),
	})
}
