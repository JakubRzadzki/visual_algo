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
	"os/exec"
	"path/filepath"
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
var inMemorySnapshots = make(map[string][]byte)

func initDB() {
	dsn := os.Getenv("DATABASE_URL")
	if dsn == "" {
		dsn = "host=db user=user password=password dbname=visual_algo port=5432 sslmode=disable"
	}
	
	var err error
	// Attempt to connect to postgres once to avoid hanging
	db, err = gorm.Open(postgres.Open(dsn), &gorm.Config{})
	if err != nil {
		log.Println("Postgres DB not available. Falling back to in-memory snapshots storage.")
		db = nil
		return
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
	
	if db != nil {
		snapshot := Snapshot{
			ID:        id,
			Data:      datatypes.JSON(jsonData),
			CreatedAt: time.Now(),
		}
		if err := db.Create(&snapshot).Error; err != nil {
			c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to save snapshot to database"})
			return
		}
	} else {
		inMemorySnapshots[id] = jsonData
	}

	c.JSON(http.StatusOK, gin.H{"id": id})
}

func getSnapshot(c *gin.Context) {
	id := c.Param("id")
	
	if db != nil {
		var snapshot Snapshot
		if err := db.First(&snapshot, "id = ?", id).Error; err == nil {
			var data map[string]interface{}
			json.Unmarshal(snapshot.Data, &data)
			c.JSON(http.StatusOK, data)
			return
		}
	}

	if jsonData, exists := inMemorySnapshots[id]; exists {
		var data map[string]interface{}
		json.Unmarshal(jsonData, &data)
		c.JSON(http.StatusOK, data)
		return
	}

	c.JSON(http.StatusNotFound, gin.H{"error": "Snapshot not found"})
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

func executeLocally(code string, language string) (string, string, error) {
	if language == "python" {
		cmd := exec.Command("python", "-c", code)
		var stdout, stderr bytes.Buffer
		cmd.Stdout = &stdout
		cmd.Stderr = &stderr
		err := cmd.Run()
		if err != nil {
			// Try 'python3' fallback if 'python' is not mapped
			if strings.Contains(err.Error(), "executable file not found") {
				cmd3 := exec.Command("python3", "-c", code)
				stdout.Reset()
				stderr.Reset()
				cmd3.Stdout = &stdout
				cmd3.Stderr = &stderr
				err3 := cmd3.Run()
				return stdout.String(), stderr.String(), err3
			}
		}
		return stdout.String(), stderr.String(), err
	} else if language == "cpp" {
		tempDir, err := os.MkdirTemp("", "visual_algo_cpp_local")
		if err != nil {
			return "", "", fmt.Errorf("failed to create temp dir: %w", err)
		}
		defer os.RemoveAll(tempDir)

		cppFile := filepath.Join(tempDir, "main.cpp")
		err = os.WriteFile(cppFile, []byte(code), 0644)
		if err != nil {
			return "", "", fmt.Errorf("failed to write main.cpp: %w", err)
		}

		outFile := filepath.Join(tempDir, "main.exe")
		if os.PathSeparator == '/' {
			outFile = filepath.Join(tempDir, "main")
		}

		compileCmd := exec.Command("g++", "-O3", cppFile, "-o", outFile)
		var compileStderr bytes.Buffer
		compileCmd.Stderr = &compileStderr
		err = compileCmd.Run()
		if err != nil {
			return "", compileStderr.String(), fmt.Errorf("g++ compilation failed: %w", err)
		}

		runCmd := exec.Command(outFile)
		var stdout, stderr bytes.Buffer
		runCmd.Stdout = &stdout
		runCmd.Stderr = &stderr
		err = runCmd.Run()
		return stdout.String(), stderr.String(), err
	}
	return "", "", fmt.Errorf("unsupported language")
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

	// ── DOCKER CONNECTION & HEALTHY CHECK ──
	cli, err := client.NewClientWithOpts(client.FromEnv, client.WithVersion("1.44"))
	var dockerRunning = false
	if err == nil {
		ctx, cancel := context.WithTimeout(context.Background(), 800*time.Millisecond)
		_, pingErr := cli.Ping(ctx)
		cancel()
		if pingErr == nil {
			dockerRunning = true
		}
	}

	var rawOutput string
	var stderrStr string
	var trace []map[string]interface{}

	if dockerRunning {
		ctx := context.Background()
		imageName := "python:3.10-slim"
		cmd := []string{"python", "-c", req.Code}

		if req.Language == "cpp" {
			imageName = "gcc:13"
			script := fmt.Sprintf(`echo '%s' > main.cpp && g++ -O3 main.cpp && ./a.out`, strings.ReplaceAll(req.Code, "'", "'\\''"))
			cmd = []string{"sh", "-c", script}
		}

		_, _, err = cli.ImageInspectWithRaw(ctx, imageName)
		if err != nil {
			log.Printf("Pulling image %s...\n", imageName)
			reader, pullErr := cli.ImagePull(ctx, imageName, types.ImagePullOptions{})
			if pullErr == nil {
				io.Copy(os.Stdout, reader)
			}
		}

		resp, err := cli.ContainerCreate(ctx, &container.Config{
			Image:           imageName,
			Cmd:             cmd,
			NetworkDisabled: true,
		}, &container.HostConfig{
			AutoRemove: false,
			Resources: container.Resources{
				Memory:   256 * 1024 * 1024,
				NanoCPUs: 500000000,
			},
		}, nil, nil, "")

		if err != nil {
			log.Println("Failed to create container, falling back to local: ", err)
			rawOutput, stderrStr, _ = executeLocally(req.Code, req.Language)
		} else {
			defer cli.ContainerRemove(ctx, resp.ID, types.ContainerRemoveOptions{Force: true})

			if err := cli.ContainerStart(ctx, resp.ID, types.ContainerStartOptions{}); err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to start sandbox container"})
				return
			}

			statusCh, errCh := cli.ContainerWait(ctx, resp.ID, container.WaitConditionNotRunning)
			select {
			case err := <-errCh:
				if err != nil {
					c.JSON(http.StatusInternalServerError, gin.H{"error": "Sandbox execution error: " + err.Error()})
					return
				}
			case <-statusCh:
			case <-time.After(10 * time.Second):
				c.JSON(http.StatusRequestTimeout, gin.H{"error": "Execution timed out (limit: 10s)"})
				return
			}

			logs, err := cli.ContainerLogs(ctx, resp.ID, types.ContainerLogsOptions{ShowStdout: true, ShowStderr: true})
			if err != nil {
				c.JSON(http.StatusInternalServerError, gin.H{"error": "Failed to read container logs"})
				return
			}

			var stdoutBuf, stderrBuf bytes.Buffer
			stdcopy.StdCopy(&stdoutBuf, &stderrBuf, logs)
			rawOutput = stdoutBuf.String()
			stderrStr = stderrBuf.String()
		}
	} else {
		log.Println("Docker daemon not running. Falling back to host local execution.")
		var localErr error
		rawOutput, stderrStr, localErr = executeLocally(req.Code, req.Language)
		if localErr != nil && stderrStr == "" {
			stderrStr = localErr.Error()
		}
	}

	// ── PARSE TRACE PROTOCOL FROM OUTPUT ──
	lines := strings.Split(rawOutput, "\n")
	for _, line := range lines {
		line = strings.TrimSpace(line)
		if line == "" {
			continue
		}
		var event map[string]interface{}
		if err := json.Unmarshal([]byte(line), &event); err == nil {
			if _, hasType := event["type"]; hasType {
				trace = append(trace, event)
			}
		}
	}

	c.JSON(http.StatusOK, RunResponse{
		Trace:  trace,
		Output: rawOutput,
		Error:  stderrStr,
	})
}
