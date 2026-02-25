#!/bin/bash

VIDEOS_DIR="@videos"

if [ ! -d "$VIDEOS_DIR" ]; then
    echo "Directory $VIDEOS_DIR not found"
    exit 1
fi

echo "Cleaning up $VIDEOS_DIR..."

rm -rf "$VIDEOS_DIR"/hls/* 2>/dev/null
rm -rf "$VIDEOS_DIR"/raw/* 2>/dev/null

echo "Done. Cleaned hls/ and raw/ directories."
