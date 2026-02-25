# LabStream: Private Video Streaming Service

A minimal private video streaming service built with Go, React, and FFmpeg. Supports HLS streaming with "play while processing" capability.

## Features
- **Anonymous Upload**: No authentication required.
- **HLS Streaming**: Instant video processing to HLS format.
- **Background Processing**: Video conversion happens in the background.
- **Modern UI**: Clean, responsive interface with animations.
- **1GB Limit**: Large file support up to 1GB.

## Tech Stack
- **Backend**: Go (standard library + uuid)
- **Frontend**: React (Vite + TS), HLS.js, Lucide Icons
- **Processing**: FFmpeg

## Prerequisites
- [Go](https://golang.org/dl/) (1.18+)
- [Node.js](https://nodejs.org/) (20+)
- [FFmpeg](https://ffmpeg.org/download.html) (must be in system PATH)

## How to Run

### 1. Start the Backend
```bash
cd backend
go run main.go
```
The server will start on `http://localhost:8080`.

### 2. Start the Frontend
```bash
cd frontend
npm install
npm run dev
```
The application will be available at `http://localhost:3000`.

## Architecture
- `/backend`: Go API and processor logic.
- `/frontend`: React client code.
- `/videos/raw`: Stores original uploaded files.
- `/videos/hls`: Stores generated HLS segments and playlists.
