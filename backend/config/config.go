package config

import (
	"fmt"
	"os"
	"path/filepath"

	"gopkg.in/yaml.v3"
)

type Config struct {
	Server  ServerConfig  `yaml:"server"`
	Storage StorageConfig `yaml:"storage"`
	Upload  UploadConfig  `yaml:"upload"`
	FFmpeg  FFmpegConfig  `yaml:"ffmpeg"`
}

type ServerConfig struct {
	Host string `yaml:"host"`
	Port string `yaml:"port"`
}

type StorageConfig struct {
	VideosDir string `yaml:"videos_dir"`
	RawDir    string `yaml:"raw_dir"`
	HLSDir    string `yaml:"hls_dir"`
}

type UploadConfig struct {
	MaxSizeMB         int      `yaml:"max_size_mb"`
	AllowedExtensions []string `yaml:"allowed_extensions"`
}

type FFmpegConfig struct {
	HLSTime    int    `yaml:"hls_time"`
	VideoCodec string `yaml:"video_codec"`
	AudioCodec string `yaml:"audio_codec"`
}

func Load(path string) (*Config, error) {
	if path == "" {
		path = "config.yaml"
	}

	data, err := os.ReadFile(path)
	if err != nil {
		return nil, fmt.Errorf("failed to read config file: %w", err)
	}

	var cfg Config
	if err := yaml.Unmarshal(data, &cfg); err != nil {
		return nil, fmt.Errorf("failed to parse config: %w", err)
	}

	return &cfg, nil
}

func LoadFromDir(dir string) (*Config, error) {
	configPaths := []string{
		filepath.Join(dir, "config.yaml"),
		filepath.Join(dir, "config", "config.yaml"),
	}

	var lastErr error
	for _, configPath := range configPaths {
		cfg, err := Load(configPath)
		if err == nil {
			return cfg, nil
		}
		lastErr = err
	}

	return nil, fmt.Errorf("no config file found: %w", lastErr)
}

func (c *ServerConfig) Address() string {
	return fmt.Sprintf("%s:%s", c.Host, c.Port)
}

func (c *UploadConfig) MaxSizeBytes() int64 {
	return int64(c.MaxSizeMB) * 1024 * 1024
}
