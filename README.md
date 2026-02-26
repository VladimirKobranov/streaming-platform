# LabStream: Private Video Streaming Service

A minimal private video streaming service built with Go, React, and FFmpeg. Supports HLS streaming with "play while processing" capability.

## Features
- **Anonymous Upload**: No authentication required.
- **HLS Streaming**: Instant video processing to HLS format.
- **Background Processing**: Video conversion happens in the background.
- **Modern UI**: Clean, responsive interface with animations.
- **1GB Limit**: Large file support up to 1GB.

## Tech Stack
- **Backend**: Go 1.24+ (Chi Router, Google UUID, YAML v3)
- **Frontend**: React 19 (Vite, TypeScript, Tailwind CSS 4)
- **Libraries**: HLS.js, Lucide Icons, React Router 7, i18next
- **Processing**: FFmpeg

## Prerequisites
- [Go](https://golang.org/dl/) (1.24+)
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

## Documentation
- [Architecture Overview](ARCHITECTURE.md) - Core logic and system design.
- [Backend Details](BACKEND.md) - API endpoints and server structure.
- [Frontend Details](FRONTEND.md) - UI components and client logic.

## Project Structure
- `/backend`: Go API and processor logic.
- `/frontend`: React client code.
- `/backend/@videos/raw`: Temporary storage for original uploads (cleared after processing).
- `/backend/@videos/hls`: Stores generated HLS segments and playlists.
- `/backend/@videos/thumbs`: Video thumbnails.
