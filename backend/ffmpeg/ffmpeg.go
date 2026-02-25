package ffmpeg

import (
	"fmt"
	"os/exec"
	"path/filepath"
)

type Encoder struct{}

func NewEncoder() *Encoder {
	return &Encoder{}
}

// ConvertToHLS runs an FFmpeg process to convert the input video into HLS segments.
// It uses x264 for video and AAC for audio, with 4-second segments.
// The 'event' playlist type allows players to start streaming before the conversion is finished.
func (e *Encoder) ConvertToHLS(inputPath, outputDir string) error {
	// ffmpeg -i input.mp4 -c:v libx264 -c:a aac -hls_time 4 -hls_playlist_type event -hls_segment_filename "segment_%03d.ts" master.m3u8

	masterPlaylist := filepath.Join(outputDir, "master.m3u8")
	segmentPattern := filepath.Join(outputDir, "segment_%03d.ts")

	cmd := exec.Command("ffmpeg",
		"-i", inputPath,
		"-c:v", "libx264",
		"-c:a", "aac",
		"-hls_time", "4",
		"-hls_playlist_type", "event",
		"-hls_segment_filename", segmentPattern,
		masterPlaylist,
	)

	// Since we want to run this in background, we'll return the error if Start fails.
	// But the processor will actually manage the execution.

	output, err := cmd.CombinedOutput()
	if err != nil {
		return fmt.Errorf("ffmpeg error: %v, output: %s", err, string(output))
	}

	return nil
}
