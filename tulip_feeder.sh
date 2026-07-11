#!/bin/bash
PID_FILE=~/tulip_setup.pid

if [ "$1" = "start" ]; then
    nohup ./tulip_start.sh > ~/tulip_setup.log 2>&1 &
    echo $! > "$PID_FILE"
else
    kill "$(cat "$PID_FILE")"
fi
