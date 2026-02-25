package storage

import (
	"fmt"
	"os"
	"path/filepath"
)

type Storage struct {
	baseDir string
}

func NewStorage(baseDir string) (*Storage, error) {
	s := &Storage{baseDir: baseDir}

	// Create required directories
	dirs := []string{
		filepath.Join(baseDir, "raw"),
		filepath.Join(baseDir, "hls"),
		filepath.Join(baseDir, "thumbs"),
	}

	for _, dir := range dirs {
		if err := os.MkdirAll(dir, 0755); err != nil {
			return nil, fmt.Errorf("failed to create directory %s: %w", dir, err)
		}
	}

	return s, nil
}

func (s *Storage) GetRawPath(id string) string {
	return filepath.Join(s.baseDir, "raw", id+".mp4")
}

func (s *Storage) GetHLSPath(id string) string {
	return filepath.Join(s.baseDir, "hls", id)
}

func (s *Storage) GetThumbnailPath(id string) string {
	return filepath.Join(s.baseDir, "thumbs", id+".jpg")
}

func (s *Storage) CreateHLSDir(id string) error {
	path := s.GetHLSPath(id)
	return os.MkdirAll(path, 0755)
}

func (s *Storage) GetBaseDir() string {
	return s.baseDir
}

// List all videos in the storage (dev purpose)
func (s *Storage) ListVideos() ([]string, error) {
	hlsPath := filepath.Join(s.baseDir, "hls")
	entries, err := os.ReadDir(hlsPath)
	if err != nil {
		return nil, err
	}

	var ids []string
	for _, entry := range entries {
		if entry.IsDir() {
			ids = append(ids, entry.Name())
		}
	}
	return ids, nil
}
