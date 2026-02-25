# Frontend Architecture

## Overview

Video streaming platform for uploading and viewing videos in HLS format.

## Tech Stack

- **React** 18+ with TypeScript
- **React Router** - routing
- **Hls.js** - HLS video playback
- **Tailwind CSS** - styling
- **i18next** - internationalization
- **Vite** - build tool

## Routes

| Path     | Component  | Description       |
| -------- | ---------- | ----------------- |
| `/`      | UploadPage | Video upload page |
| `/v/:id` | VideoPage  | Video player page |

## API Endpoints (used by frontend)

### POST /api/upload

Upload video file.

**Request:**

- `Content-Type: multipart/form-data`
- Body: `file` (video file, max 1GB)
- Allowed: `.mp4`, `.mov`, `.mkv`, `.webm`

**Response:**

```json
{
  "id": "uuid",
  "url": "/v/{id}"
}
```

### GET /api/video/:id

Get video status and info. Polls every 2 seconds until status is either `ready` or `error`.

**Response:**

```json
{
  "id": "uuid",
  "status": "processing" | "ready" | "error",
  "streamUrl": "/streams/{id}/master.m3u8",
  "createdAt": "2024-01-01T00:00:00Z",
  "error": "optional error description"
}
```

### GET /streams/:id/master.m3u8

HLS playlist for video playback (handled by static file server).

## Components Structure

```
src/
├── App.tsx              # Main app with Router
├── main.tsx            # Entry point
├── components/
│   └── Navbar.tsx      # Navigation + language selector
├── pages/
│   ├── UploadPage.tsx  # Upload page
│   └── VideoPage.tsx   # Video player
├── etc/
│   └── utils.ts        # Logger utility
├── i18n/
│   ├── config.ts       # i18n configuration
│   └── locales/        # Translation files (en, ru, ja, ko, es, zh, fr, de, pt)
```

## Features

- **Upload**: Drag & drop or click to select video, max 1GB
- **Processing**: Polls status until video is ready
- **Playback**: HLS streaming with Hls.js (native on Safari)
- **i18n**: 9 languages supported
- **Copy link**: Share video URL after upload

## Environment Variables

```
VITE_APP_API_URL=http://localhost:8080
VITE_APP_DEBUG=true
```
