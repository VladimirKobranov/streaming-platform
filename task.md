Build a minimal private video streaming service with the following fixed requirements.

Project root structure:

/app
/backend
/frontend
/videos

The /videos directory must be used for all stored media and must contain two subdirectories:

/videos/raw
/videos/hls

Original uploaded files are stored in /videos/raw.
Processed streaming output is stored in /videos/hls.

Each video must have its own folder:

/videos/hls/{video_id}/master.m3u8
/videos/hls/{video_id}/segment files

Backend must be implemented in Go.
Frontend must be implemented in React.
Video processing must use FFmpeg.
Streaming format must be HLS.

The backend runs on port 8080.

The frontend runs on port 3000.

Maximum upload size is 1GB.

Uploads are anonymous and no authentication must be implemented.

Supported formats:

mp4
mov
mkv
webm

When a user uploads a video, the system must:

receive the file through an HTTP endpoint
generate a unique video id
save the original file into /videos/raw/{video_id}.mp4
create /videos/hls/{video_id}
start an FFmpeg process that converts the file to HLS segments
allow playback as soon as the first segments are generated

The upload endpoint:

POST /api/upload

Request type must be multipart/form-data with field name file.

The response must be JSON:

{
"id": "video_id",
"url": "/v/video_id"
}

A video status endpoint must exist:

GET /api/video/{id}

Response:

{
"id": "video_id",
"status": "processing" or "ready"
}

The backend must maintain video metadata in memory using a map structure.

Video model must contain:

id
status
path
createdAt

After upload, the backend must immediately start a background goroutine that runs FFmpeg.

FFmpeg must generate HLS with approximately 4-second segments and an event playlist so playback can begin before encoding finishes.

Output files must be written to:

/videos/hls/{video_id}/

The backend must expose static streaming files through:

/streams/{video_id}/...

This path must map directly to /videos/hls.

Example playback file:

/streams/{video_id}/master.m3u8

The frontend must contain two pages.

Upload page at /.

The page must allow selecting a file and uploading it to /api/upload.
After upload it must display the returned share link.

Video page at /v/:id.

The page must request /api/video/{id} to check status.
If the video is still processing it must poll the endpoint until ready.
Once available it must initialize a video player.

The player must use hls.js and load:

/streams/{id}/master.m3u8

The system must allow the video to start playing before full transcoding is finished.

The backend must be organized with clear separation of responsibilities and include modules for:

HTTP API
video processing
storage
ffmpeg execution

The storage layer must interact with the /videos directory only.

The project must run locally without external services.

Final result must allow a user to:

open the upload page
upload a video
receive a share link
open the link in a browser
start streaming the video shortly after upload begins.
