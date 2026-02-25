package main

import (
	"log"
	"net/http"
	"os"
	"path/filepath"

	"labbase-streaming/backend/internal/api"
	"labbase-streaming/backend/internal/ffmpeg"
	"labbase-streaming/backend/internal/processor"
	"labbase-streaming/backend/internal/storage"
)

func main() {
	// Get absolute path to videos directory
	cwd, err := os.Getwd()
	if err != nil {
		log.Fatalf("failed to get working directory: %v", err)
	}

	// Assuming the app runs from project root or backend dir
	// Let's make it flexible
	baseDir := filepath.Join(cwd, "..", "videos")
	if _, err := os.Stat(baseDir); os.IsNotExist(err) {
		baseDir = filepath.Join(cwd, "videos") // if running from root
	}

	s, err := storage.NewStorage(baseDir)
	if err != nil {
		log.Fatalf("failed to initialize storage: %v", err)
	}

	e := ffmpeg.NewEncoder()
	p := processor.NewProcessor(s, e)
	server := api.NewServer(p, s)

	port := "8080"
	log.Printf("Starting server on port %s...", port)

	// Simple CORS for development
	corsHandler := func(h http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Access-Control-Allow-Origin", "*")
			w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
			w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

			if r.Method == "OPTIONS" {
				w.WriteHeader(http.StatusOK)
				return
			}
			h.ServeHTTP(w, r)
		})
	}

	if err := http.ListenAndServe(":"+port, corsHandler(server.Routes())); err != nil {
		log.Fatalf("failed to start server: %v", err)
	}
}
