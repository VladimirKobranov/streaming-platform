package server

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
)

func (s *Server) handleUpload(w http.ResponseWriter, r *http.Request) {
	maxSize := s.config.Upload.MaxSizeBytes()
	r.Body = http.MaxBytesReader(w, r.Body, maxSize)
	if err := r.ParseMultipartForm(maxSize); err != nil {
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
		"url": fmt.Sprintf("/streams/%s/master.m3u8", videoID),
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}

func (s *Server) handleGetVideo(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
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
		"id":        video.ID,
		"status":    video.Status,
		"streamUrl": fmt.Sprintf("/streams/%s/master.m3u8", video.ID),
		"createdAt": video.CreatedAt,
	})
}

func (s *Server) handleListVideos(w http.ResponseWriter, r *http.Request) {
	videos := s.processor.ListVideos()

	result := make([]map[string]interface{}, 0, len(videos))
	for _, v := range videos {
		result = append(result, map[string]interface{}{
			"id":        v.ID,
			"status":    v.Status,
			"streamUrl": fmt.Sprintf("/streams/%s/master.m3u8", v.ID),
			"createdAt": v.CreatedAt,
		})
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"videos": result,
		"total":  len(result),
	})
}

func (s *Server) handleDeleteVideo(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	if id == "" {
		http.Error(w, "ID is required", http.StatusBadRequest)
		return
	}

	if !s.processor.DeleteVideo(id) {
		http.Error(w, "Video not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"message": "Video deleted successfully",
	})
}

func (s *Server) handleVideoStatus(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
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
