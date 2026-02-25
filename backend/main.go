package main

import (
	"context"
	"log"
	"net/http"
	"os"
	"os/signal"
	"path/filepath"
	"syscall"
	"time"

	"labbase-streaming/backend/config"
	"labbase-streaming/backend/ffmpeg"
	"labbase-streaming/backend/processor"
	"labbase-streaming/backend/server"
	"labbase-streaming/backend/storage"
)

const Version = "1.0.0"

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

	httpServer := &http.Server{
		Addr:    cfg.Server.Address(),
		Handler: srv.Router(),
	}

	go func() {
		log.Printf("\033[36m" + `
   __        __     __                      
  / /  ___ _/ /  __/ /  ___ ____ ___        
 / /__/ _ '/ _ \/ _  / / _ '(_-</ -_)       
/____/\_,_/_.__/\_,_/  \_,_/___/\__/  v` + Version + "\033[0m")
		log.Printf("Starting server on %s...", cfg.Server.Address())
		if err := httpServer.ListenAndServe(); err != nil && err != http.ErrServerClosed {
			log.Fatalf("failed to start server: %v", err)
		}
	}()

	quit := make(chan os.Signal, 1)
	signal.Notify(quit, syscall.SIGINT, syscall.SIGTERM)
	<-quit

	log.Println("Shutting down server...")

	ctx, cancel := context.WithTimeout(context.Background(), 30*time.Second)
	defer cancel()

	if err := httpServer.Shutdown(ctx); err != nil {
		log.Printf("Server forced to shutdown: %v", err)
	}

	log.Println("Server exited")
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
