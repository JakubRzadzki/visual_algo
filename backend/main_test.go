package main

import (
	"bytes"
	"encoding/json"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/gin-gonic/gin"
)

func setupRouter() *gin.Engine {
	r := gin.Default()
	r.POST("/api/snapshots", createSnapshot)
	r.GET("/api/snapshots/:id", getSnapshot)
	r.POST("/api/run", executeCode)
	return r
}

func TestCreateSnapshot(t *testing.T) {
	router := setupRouter()

	payload := map[string]interface{}{
		"code":     "print('test')",
		"language": "python",
	}
	body, _ := json.Marshal(payload)

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("POST", "/api/snapshots", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	router.ServeHTTP(w, req)

	if w.Code != http.StatusOK {
		t.Errorf("Expected status 200, got %d", w.Code)
	}

	var response map[string]string
	err := json.Unmarshal(w.Body.Bytes(), &response)
	if err != nil || response["id"] == "" {
		t.Errorf("Expected valid JSON response with 'id', got: %v", w.Body.String())
	}
}

func TestGetSnapshotNotFound(t *testing.T) {
	router := setupRouter()

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("GET", "/api/snapshots/invalid-id", nil)
	router.ServeHTTP(w, req)

	if w.Code != http.StatusNotFound {
		t.Errorf("Expected status 404, got %d", w.Code)
	}
}

func TestExecuteCodeInvalidLanguage(t *testing.T) {
	router := setupRouter()

	reqBody := RunRequest{
		Code:     "echo 'test'",
		Language: "bash",
	}
	body, _ := json.Marshal(reqBody)

	w := httptest.NewRecorder()
	req, _ := http.NewRequest("POST", "/api/run", bytes.NewBuffer(body))
	req.Header.Set("Content-Type", "application/json")
	router.ServeHTTP(w, req)

	if w.Code != http.StatusBadRequest {
		t.Errorf("Expected status 400 for invalid language, got %d", w.Code)
	}
}
