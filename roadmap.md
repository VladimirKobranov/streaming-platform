# Project Roadmap: Private Video Streaming Service

## Phase 1: Project Setup & Infrastructure
- [x] Initialize project structure (`/backend`, `/frontend`, `/videos`)
- [x] Initialize Go backend module
- [x] Initialize React frontend (Vite/CRA)
- [x] Setup basic folder structure for videos (`/videos/raw`, `/videos/hls`)

## Phase 2: Backend Development (Go)
- [x] Implement Video Metadata Store (In-memory map)
- [x] Implement Storage Layer (Interaction with `/videos`)
- [x] Implement FFmpeg Execution Module
- [x] Implement Video Processing Module (Background goroutine)
- [x] Implement HTTP API:
    - [x] `POST /api/upload` (Multipart, save to raw, start FFmpeg)
    - [x] `GET /api/video/{id}` (Status check)
    - [x] Static file serving for `/streams/{video_id}/` mapping to `/videos/hls`

## Phase 3: Frontend Development (React)
- [x] Setup HLS.js integration
- [x] Implement Upload Page (`/`)
    - [x] File selection and upload to `/api/upload`
    - [x] Share link display
- [x] Implement Video Page (`/v/:id`)
    - [x] Status polling (`/api/video/{id}`)
    - [x] Video player initialization with HLS.js when ready

## Phase 4: Integration & Testing
- [ ] Test end-to-end flow: Upload -> Processing -> Stream
- [ ] Verify 1GB upload limit handling
- [ ] Verify anonymous access
- [ ] Polish UI/UX (modern aesthetics, micro-animations)

## Phase 5: Documentation & Final Polish
- [x] Update README.md with run instructions
- [x] Finalize code structure and comments
