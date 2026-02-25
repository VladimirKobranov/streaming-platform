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

func (s *Storage) CreateHLSDir(id string) error {
	path := s.GetHLSPath(id)
	return os.MkdirAll(path, 0755)
}

func (s *Storage) GetBaseDir() string {
	return s.baseDir
}
