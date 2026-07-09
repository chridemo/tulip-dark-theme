#!/bin/bash
PCAP_DIR="/root/tulip/traffic"
PORT=4242

mkdir -p "$PCAP_DIR"
cd "$PCAP_DIR" || exit 1

echo "[*] Listening on port $PORT, saving into $PCAP_DIR"
while true; do
    OUT="capture_$(date +%Y%m%d_%H%M%S_%N).pcap"
    nc -l -p "$PORT" > "$OUT"
    SIZE=$(stat -c%s "$OUT" 2>/dev/null || echo 0)
    if [ "$SIZE" -eq 0 ]; then
        echo "[!] $(date '+%H:%M:%S') received empty file, removing"
        rm -f "$OUT"
    else
        echo "[+] $(date '+%H:%M:%S') received $OUT ($SIZE bytes)"
    fi
done
