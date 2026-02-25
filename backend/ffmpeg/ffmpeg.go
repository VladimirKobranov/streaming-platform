package ffmpeg

import (
	"context"
	"fmt"
	"os/exec"
	"path/filepath"
	"strconv"
	"time"

	"labbase-streaming/backend/config"
)

type Encoder struct {
	cfg *config.FFmpegConfig
}

func NewEncoder(cfg *config.FFmpegConfig) *Encoder {
	return &Encoder{cfg: cfg}
}

func (e *Encoder) ConvertToHLS(inputPath, outputDir string) error {
	masterPlaylist := filepath.Join(outputDir, "master.m3u8")
	segmentPattern := filepath.Join(outputDir, "segment_%03d.ts")

	args := []string{
		"-i", inputPath,
		"-c:v", e.cfg.VideoCodec,
		"-c:a", e.cfg.AudioCodec,
		"-hls_time", strconv.Itoa(e.cfg.HLSTime),
		"-hls_playlist_type", "event",
		"-hls_segment_filename", segmentPattern,
		masterPlaylist,
	}

	ctx, cancel := context.WithTimeout(context.Background(), 10*time.Minute)
	defer cancel()

	cmd := exec.CommandContext(ctx, "ffmpeg", args...)
	output, err := cmd.CombinedOutput()
	if err != nil {
		return fmt.Errorf("ffmpeg error: %v, output: %s", err, string(output))
	}

	return nil
}

func (e *Encoder) GenerateThumbnail(inputPath, outputPath string) error {
	// Use 2 seconds to get past most loading screens/intros.
	// Placing -ss before -i is faster for local files.
	args := []string{
		"-ss", "2",
		"-i", inputPath,
		"-frames:v", "1",
		"-q:v", "2",
		"-an",
		"-y",
		outputPath,
	}

	ctx, cancel := context.WithTimeout(context.Background(), 1*time.Minute)
	defer cancel()

	cmd := exec.CommandContext(ctx, "ffmpeg", args...)
	output, err := cmd.CombinedOutput()
	if err != nil {
		return fmt.Errorf("ffmpeg thumbnail error: %v, output: %s", err, string(output))
	}

	return nil
}
