package ffmpeg

import (
	"fmt"
	"os/exec"
	"path/filepath"
	"strconv"

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

	cmd := exec.Command("ffmpeg", args...)
	output, err := cmd.CombinedOutput()
	if err != nil {
		return fmt.Errorf("ffmpeg error: %v, output: %s", err, string(output))
	}

	return nil
}
