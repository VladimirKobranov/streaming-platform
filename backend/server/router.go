package server

import (
	"net/http"
	"path/filepath"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
)

func (s *Server) Router() http.Handler {
	r := chi.NewRouter()

	r.Use(middleware.Logger)
	r.Use(middleware.Recoverer)
	r.Use(middleware.RealIP)
	r.Use(corsMiddleware)

	r.Route("/api", func(r chi.Router) {
		r.Get("/health", s.handleHealth)
		r.Post("/upload", s.handleUpload)
		r.Get("/video/{id}", s.handleGetVideo)
		r.Get("/videos", s.handleListVideos)
	})

	hlsDir := filepath.Join(s.storage.GetBaseDir(), "hls")
	r.Handle("/streams/*", http.StripPrefix("/streams", http.FileServer(http.Dir(hlsDir))))

	return r
}

func corsMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.Header().Set("Access-Control-Allow-Origin", "*")
		w.Header().Set("Access-Control-Allow-Methods", "GET, POST, OPTIONS")
		w.Header().Set("Access-Control-Allow-Headers", "Content-Type")

		if r.Method == "OPTIONS" {
			w.WriteHeader(http.StatusOK)
			return
		}

		next.ServeHTTP(w, r)
	})
}
