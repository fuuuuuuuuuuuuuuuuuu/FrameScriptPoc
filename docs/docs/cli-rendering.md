---
title: CLI Rendering
sidebar_position: 5
---

Render videos from the command line without the GUI.

## Prerequisites

- Node.js
- Rust toolchain (for building binaries)
- FFmpeg
- Chromium

## Build Binaries

First, build the backend and render binaries:

```bash
npm run build:all
npm run build:binaries
```

This creates platform-specific binaries in `bin/<platform>/`:
- `backend` - HTTP server for video/audio processing
- `render` - Headless rendering engine

## Rendering Flow

CLI rendering requires three components running:

1. **Backend Server** - Provides video metadata and audio plan APIs
2. **Render Page** - Serves the React project for frame capture
3. **Render Binary** - Captures frames and encodes video

### Step 1: Start Backend

```bash
# Set project root
export FRAMESCRIPT_PROJECT_ROOT=$(pwd)

# Start backend server (listens on 127.0.0.1:3000)
./bin/linux-x86_64/backend
```

### Step 2: Build and Serve Render Page

```bash
# Build render page
npm run build:render

# Serve the built files (e.g., with any static server)
# The render page should be accessible at http://localhost:5174/render
```

Or use the Vite dev server:

```bash
npm run dev:render
```

### Step 3: Run Render Binary

```bash
export RENDER_PAGE_URL="http://localhost:5174/render"
export RENDER_OUTPUT_PATH="./output.mp4"

./bin/linux-x86_64/render <width>:<height>:<fps>:<total_frames>:<workers>:<codec>:<preset>
```

#### Parameters

| Parameter | Description |
|-----------|-------------|
| `width` | Output width in pixels |
| `height` | Output height in pixels |
| `fps` | Frame rate |
| `total_frames` | Total number of frames to render |
| `workers` | Number of parallel workers (Chromium instances) |
| `codec` | Video codec (`h264` or `h265`) |
| `preset` | Encoding preset (`ultrafast`, `fast`, `medium`, `slow`, `veryslow`) |

#### Example

Render a 1920x1080 video at 60fps, 300 frames (5 seconds), using 4 workers:

```bash
./bin/linux-x86_64/render 1920:1080:60:300:4:h264:medium
```

## Environment Variables

### Backend

| Variable | Description |
|----------|-------------|
| `FRAMESCRIPT_PROJECT_ROOT` | Project root directory |
| `FRAMESCRIPT_FFMPEG_PATH` | Path to FFmpeg binary |
| `FRAMESCRIPT_FFPROBE_PATH` | Path to FFprobe binary |

### Render

| Variable | Description |
|----------|-------------|
| `RENDER_PAGE_URL` | URL of the render page |
| `RENDER_OUTPUT_PATH` | Output file path (default: `output.mp4`) |
| `RENDER_PROGRESS_URL` | Progress callback endpoint |
| `RENDER_CANCEL_URL` | Cancel check endpoint |
| `RENDER_AUDIO_PLAN_URL` | Audio plan endpoint |
| `FRAMESCRIPT_CHROMIUM_PATH` | Path to Chromium executable |
| `FRAMESCRIPT_FFMPEG_PATH` | Path to FFmpeg binary |

## All-in-One Script

For convenience, you can create a shell script:

```bash
#!/bin/bash

# Settings
WIDTH=1920
HEIGHT=1080
FPS=60
TOTAL_FRAMES=300
WORKERS=4
CODEC=h264
PRESET=medium

export FRAMESCRIPT_PROJECT_ROOT=$(pwd)
export RENDER_OUTPUT_PATH="./output.mp4"

# Start backend in background
./bin/linux-x86_64/backend &
BACKEND_PID=$!

# Wait for backend to be ready
sleep 2

# Start render dev server in background
npm run dev:render &
RENDER_PID=$!

# Wait for render server
sleep 3

export RENDER_PAGE_URL="http://localhost:5174/render"

# Run render
./bin/linux-x86_64/render ${WIDTH}:${HEIGHT}:${FPS}:${TOTAL_FRAMES}:${WORKERS}:${CODEC}:${PRESET}

# Cleanup
kill $BACKEND_PID $RENDER_PID 2>/dev/null
```

## Rendering Pipeline

1. **Browser Pool**: Launch N headless Chromium instances
2. **Frame Distribution**: Split total frames among workers
3. **Parallel Capture**: Each worker captures assigned frames
   - Set frame via `window.__frameScript.setFrame(frame)`
   - Wait for canvas render completion
   - Take PNG screenshot
   - Pipe to FFmpeg
4. **Segment Output**: Each worker produces `segment-XXX.mp4`
5. **Concatenation**: FFmpeg concat merges segments
6. **Audio Mix**: Mix audio tracks based on audio plan (48kHz AAC 192kbps)

## Supported Codecs

| Codec | Description |
|-------|-------------|
| `h264` | H.264/AVC - Wide compatibility |
| `h265` | H.265/HEVC - Better compression |

## Presets

Faster presets = larger file size, quicker encoding.
Slower presets = smaller file size, longer encoding.

| Preset | Speed | Quality |
|--------|-------|---------|
| `ultrafast` | Fastest | Lowest |
| `fast` | Fast | Low |
| `medium` | Balanced | Balanced |
| `slow` | Slow | High |
| `veryslow` | Slowest | Highest |
