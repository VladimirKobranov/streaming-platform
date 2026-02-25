# Suggestions for Improvements

## Backend

### 1. Raw video files not cleaned up after processing
After FFmpeg processing, the raw `.mp4` file stays in `raw/` directory.
- **Impact**: Wastes disk space
- **Suggestion**: Delete raw file after successful HLS conversion

### 2. No graceful shutdown
Server doesn't handle SIGTERM/SIGINT for clean shutdown.
- **Impact**: In-flight uploads may be corrupted
- **Suggestion**: Add graceful shutdown with context cancellation

### 3. No input validation on video ID
`handleGetVideo` doesn't validate if ID is a valid UUID.
- **Impact**: Could pass invalid IDs to storage/processor
- **Suggestion**: Validate UUID format before processing

### 4. Hardcoded stream URL prefix
Stream URL is built with `fmt.Sprintf("/streams/%s/master.m3u8", id)` in multiple places.
- **Impact**: Code duplication, harder to change
- **Suggestion**: Add helper method in Server or use constant

### 5. No HTTP caching headers for HLS files
Static files served without cache headers.
- **Impact**: Poor performance, unnecessary bandwidth
- **Suggestion**: Add Cache-Control headers for `.m3u8` and `.ts` files

### 6. Video status check returns 404 for processing videos
If video is being processed but not in memory yet (after restart), returns 404.
- **Impact**: Confusing error for users
- **Suggestion**: Return "processing" status even if video is not in memory but exists in filesystem

### 7. No request timeout on upload
Long uploads could block server.
- **Suggestion**: Add read timeout to HTTP server

## Frontend

### 8. No loading state for upload button
Button is disabled but no visual feedback during upload.
- **Suggestion**: Already has spinner, but could show progress
- **Status**: Implemented progress bar with percentage and cancel button

### 9. No video list page
Frontend has no way to see all uploaded videos.
- **Impact**: Users can't browse previously uploaded videos
- **Note**: Backend had this endpoint but removed as unused

### 10. No error boundaries
React error boundary not implemented.
- **Impact**: App crashes entirely on JS error

## Both

### 11. No health check endpoint
No way to verify if server is running.
- **Suggestion**: Add `GET /health` returning `{"status": "ok"}`

---

## Priority Suggestions

**High:**
- 1. Clean up raw files (disk space)
- 2. Graceful shutdown (data integrity)
- 3. Health check endpoint (ops)

**Medium:**
- 4. Input validation (security)
- 5. Caching headers (performance)

**Low:**
- 6-10 (nice to have)
