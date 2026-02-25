package models

import "time"

type VideoStatus string

const (
	StatusProcessing VideoStatus = "processing"
	StatusReady      VideoStatus = "ready"
	StatusError      VideoStatus = "error"
)

// Video model represents the metadata and state of a video being processed or streamed.
type Video struct {
	ID        string      `json:"id"`
	Status    VideoStatus `json:"status"`
	Path      string      `json:"path"` // Path to the HLS directory
	CreatedAt time.Time   `json:"createdAt"`
	Error     string      `json:"error,omitempty"`
}
