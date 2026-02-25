package api

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"strings"

	"labbase-streaming/backend/processor"
	"labbase-streaming/backend/storage"

	"github.com/google/uuid"
)

type Server struct {
	processor *processor.Processor
	storage   *storage.Storage
}

func NewServer(p *processor.Processor, s *storage.Storage) *Server {
	return &Server{
		processor: p,
		storage:   s,
	}
}

func (s *Server) Routes() http.Handler {
	mux := http.NewServeMux()

	mux.HandleFunc("/api/upload", s.handleUpload)
	mux.HandleFunc("/api/video/", s.handleGetVideo)

	// Static streaming files
	hlsDir := strings.TrimSuffix(s.storage.GetHLSPath(""), string(os.PathSeparator))

	mux.Handle("/streams/", http.StripPrefix("/streams/", http.FileServer(http.Dir(hlsDir))))

	return mux
}

func (s *Server) handleUpload(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodPost {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	// 1GB limit
	r.Body = http.MaxBytesReader(w, r.Body, 1<<30)
	if err := r.ParseMultipartForm(1 << 30); err != nil {
		http.Error(w, "File too large or invalid form", http.StatusBadRequest)
		return
	}

	file, _, err := r.FormFile("file")
	if err != nil {
		http.Error(w, "Failed to get file", http.StatusBadRequest)
		return
	}
	defer file.Close()

	videoID := uuid.New().String()
	rawPath := s.storage.GetRawPath(videoID)

	dst, err := os.Create(rawPath)
	if err != nil {
		http.Error(w, "Failed to create file", http.StatusInternalServerError)
		return
	}
	defer dst.Close()

	if _, err := io.Copy(dst, file); err != nil {
		http.Error(w, "Failed to save file", http.StatusInternalServerError)
		return
	}

	s.processor.CreateVideo(videoID)
	s.processor.ProcessVideo(videoID)

	response := map[string]string{
		"id":  videoID,
		"url": fmt.Sprintf("/v/%s", videoID),
	}

	w.Header().Set("Content-Type", "json")
	json.NewEncoder(w).Encode(response)
}

func (s *Server) handleGetVideo(w http.ResponseWriter, r *http.Request) {
	if r.Method != http.MethodGet {
		http.Error(w, "Method not allowed", http.StatusMethodNotAllowed)
		return
	}

	id := strings.TrimPrefix(r.URL.Path, "/api/video/")
	if id == "" {
		http.Error(w, "ID is required", http.StatusBadRequest)
		return
	}

	video, ok := s.processor.GetVideo(id)
	if !ok {
		http.Error(w, "Video not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"id":     video.ID,
		"status": video.Status,
	})
}
