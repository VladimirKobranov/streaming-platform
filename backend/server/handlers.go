package server

import (
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"os"
	"path/filepath"
	"sort"
	"strings"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
)

func (s *Server) handleHealth(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"status": "ok",
	})
}

func (s *Server) handleUpload(w http.ResponseWriter, r *http.Request) {
	maxSize := s.config.Upload.MaxSizeBytes()
	r.Body = http.MaxBytesReader(w, r.Body, maxSize)
	if err := r.ParseMultipartForm(maxSize); err != nil {
		http.Error(w, "File too large or invalid form", http.StatusBadRequest)
		return
	}

	file, header, err := r.FormFile("file")
	if err != nil {
		http.Error(w, "Failed to get file", http.StatusBadRequest)
		return
	}
	defer file.Close()

	if len(s.config.Upload.AllowedExtensions) > 0 {
		ext := strings.ToLower(filepath.Ext(header.Filename))
		allowed := false
		for _, a := range s.config.Upload.AllowedExtensions {
			if strings.ToLower(a) == ext {
				allowed = true
				break
			}
		}
		if !allowed {
			http.Error(w, "File type not allowed", http.StatusBadRequest)
			return
		}
	}

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
	resp := map[string]interface{}{
		"id":        video.ID,
		"status":    video.Status,
		"streamUrl": fmt.Sprintf("/streams/%s/master.m3u8", video.ID),
		"createdAt": video.CreatedAt,
	}
	if video.Error != "" {
		resp["error"] = video.Error
	}
	json.NewEncoder(w).Encode(resp)
}

func (s *Server) handleListVideos(w http.ResponseWriter, r *http.Request) {
	videos := s.processor.ListVideos()

	// Sort videos by CreatedAt descending
	sort.Slice(videos, func(i, j int) bool {
		return videos[i].CreatedAt.After(videos[j].CreatedAt)
	})

	type VideoResponse struct {
		ID        string `json:"id"`
		Status    string `json:"status"`
		StreamURL string `json:"streamUrl"`
		CreatedAt string `json:"createdAt"`
	}

	response := make([]VideoResponse, 0, len(videos))
	for _, v := range videos {
		response = append(response, VideoResponse{
			ID:        v.ID,
			Status:    string(v.Status),
			StreamURL: fmt.Sprintf("/streams/%s/master.m3u8", v.ID),
			CreatedAt: v.CreatedAt.Format("2006-01-02 15:04:05"),
		})
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(response)
}
