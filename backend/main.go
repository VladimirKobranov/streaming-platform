package main

import (
	"log"
	"net/http"
	"os"
	"path/filepath"

	"labbase-streaming/backend/config"
	"labbase-streaming/backend/ffmpeg"
	"labbase-streaming/backend/processor"
	"labbase-streaming/backend/server"
	"labbase-streaming/backend/storage"
)

func main() {
	cfg, err := loadConfig()
	if err != nil {
		log.Fatalf("failed to load config: %v", err)
	}

	videosDir := cfg.Storage.VideosDir
	if !isAbsolutePath(videosDir) {
		videosDir = filepath.Join(getAppDir(), videosDir)
	}

	s, err := storage.NewStorage(videosDir)
	if err != nil {
		log.Fatalf("failed to initialize storage: %v", err)
	}

	e := ffmpeg.NewEncoder(&cfg.FFmpeg)
	p := processor.NewProcessor(s, e)
	srv := server.NewServer(p, s, cfg)

	log.Printf("Starting server on %s...", cfg.Server.Address())
	if err := http.ListenAndServe(cfg.Server.Address(), srv.Router()); err != nil {
		log.Fatalf("failed to start server: %v", err)
	}
}

func isAbsolutePath(path string) bool {
	return len(path) > 0 && path[0] == '/'
}

func getAppDir() string {
	exePath, err := os.Executable()
	if err != nil {
		log.Fatalf("failed to get executable path: %v", err)
	}
	dir := filepath.Dir(exePath)
	if filepath.Base(dir) == "tmp" {
		dir = filepath.Dir(dir)
	}
	return dir
}

func loadConfig() (*config.Config, error) {
	appDir := getAppDir()
	cfg, err := config.LoadFromDir(appDir)
	if err != nil {
		cwd, _ := os.Getwd()
		if cwd != appDir {
			cfg, err = config.LoadFromDir(cwd)
		}
	}
	return cfg, err
}
