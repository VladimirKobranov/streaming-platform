#!/bin/bash

VIDEOS_DIR="$(dirname "$0")/@videos"

if [ ! -d "$VIDEOS_DIR" ]; then
    echo "Directory $VIDEOS_DIR not found"
    exit 1
fi

echo "Cleaning up $VIDEOS_DIR..."

rm -rf "$VIDEOS_DIR"/hls/* 2>/dev/null
rm -rf "$VIDEOS_DIR"/raw/* 2>/dev/null
rm -rf "$VIDEOS_DIR"/thumbs/* 2>/dev/null

TMP_DIR="$(dirname "$0")/tmp"
if [ -d "$TMP_DIR" ]; then
    rm -rf "$TMP_DIR"/* 2>/dev/null
fi

echo "Done. Cleaned hls/, raw/, thumbs/ and tmp/ directories."
