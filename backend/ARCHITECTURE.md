# Backend Architecture

## Overview
Video streaming backend that processes uploaded videos into HLS format for streaming.

## Tech Stack
- **Go** 1.24+
- **Chi** - HTTP router
- **FFmpeg** - video encoding
- **YAML** - configuration

## Project Structure
```
backend/
├── main.go              # Entry point, dependency injection
├── config/
│   ├── config.go        # Config loading
│   └── config.yaml      # Configuration file
├── server/
│   ├── server.go        # Server struct
│   ├── router.go        # Routes + middleware
│   └── handlers.go      # HTTP handlers
├── processor/
│   └── processor.go     # Video processing orchestration
├── storage/
│   └── storage.go      # File system operations
├── ffmpeg/
│   └── ffmpeg.go        # FFmpeg wrapper
└── models/
    └── video.go         # Data models
```

## Dependency Flow
```
main.go
  ├── config.Load()
  ├── storage.NewStorage()
  ├── ffmpeg.NewEncoder()
  ├── processor.NewProcessor()
  └── server.NewServer()
       └── server.Router()
            ├── handlers (upload, list, get)
            └── static file server (HLS)
```

## API Endpoints

### POST /api/upload
Upload and process video.

**Request:**
- `Content-Type: multipart/form-data`
- Body: `file` (video file)

**Response:**
```json
{
  "id": "uuid",
  "url": "/v/{id}"
}
```

### GET /api/videos
List all videos.

**Response:**
```json
[
  {
    "id": "uuid",
    "status": "ready" | "processing" | "error",
    "streamUrl": "/streams/{id}/master.m3u8",
    "createdAt": "2024-01-01 15:04:05"
  }
]
```

### GET /api/video/:id
Get video info and status.

**Response:**
```json
{
  "id": "uuid",
  "status": "ready" | "processing" | "error",
  "streamUrl": "/streams/{id}/master.m3u8",
  "createdAt": "2024-01-01T00:00:00Z",
  "error": "optional error description"
}
```

### GET /streams/:id/*
HLS static files (master.m3u8, segments).

## Video Processing Flow
1. Upload saves raw file to `{videos_dir}/raw/{id}.mp4`
2. Processor creates video entry with status "processing"
3. FFmpeg converts to HLS in `{videos_dir}/hls/{id}/`
4. On success, status changes to "ready"
5. Frontend polls `/api/video/:id` until ready

## Configuration (config.yaml)
```yaml
server:
  host: "0.0.0.0"
  port: "8080"

storage:
  videos_dir: "@videos"   # relative to app or absolute
  raw_dir: "raw"
  hls_dir: "hls"

upload:
  max_size_mb: 1024
  allowed_extensions:
    - ".mp4"
    - ".avi"
    - ".mov"
    - ".mkv"

ffmpeg:
  hls_time: 4
  video_codec: "libx264"
  audio_codec: "aac"
```

## Data Models

### Video
```go
type Video struct {
    ID        string      // UUID
    Status    VideoStatus // "processing" | "ready"
    Path      string      // HLS directory path
    CreatedAt time.Time
}
```

## Notes
- Videos are stored in memory (map), not persisted to DB
- On restart, videos are reloaded from filesystem
- No authentication/authorization
- CORS enabled for all origins
