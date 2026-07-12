#!/bin/bash
#
# Continuously syncs pcaps from the vulnbox down to a local folder for Tulip.
# Usage: ./sync_pcaps.sh
# Stop it with Ctrl+C (foreground) or `kill` the PID (background).

REMOTE_USER="ctf"
REMOTE_HOST="49.13.205.65"
REMOTE_PORT="2201"
REMOTE_PATH="/home/ctf/pcaps/"
LOCAL_PATH="./traffic"
INTERVAL=10   # seconds between syncs

mkdir -p "$LOCAL_PATH"

echo "Starting pcap sync loop: ${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH} -> ${LOCAL_PATH}"
echo "Press Ctrl+C to stop."

while true; do
    rsync -avz -e "ssh -p ${REMOTE_PORT}" "${REMOTE_USER}@${REMOTE_HOST}:${REMOTE_PATH}" "${LOCAL_PATH}"
    sleep "$INTERVAL"
done
