#!/bin/bash

# Configuration
PROJECT_ROOT=$(cd "$(dirname "$0")" && pwd)
PYTHONPATH="$PROJECT_ROOT/src"
PID_FILE="$PROJECT_ROOT/editor.pid"
PORT=8080
LOG_FILE="$PROJECT_ROOT/editor.log"

start() {
    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        if ps -p $PID > /dev/null; then
            echo "SBS Editor is already running (PID: $PID)"
            return
        fi
        rm "$PID_FILE"
    fi

    echo "Starting SBS Editor on http://127.0.0.1:$PORT..."
    cd "$PROJECT_ROOT"
    nohup env PYTHONPATH="$PYTHONPATH" python3 src/sbs_editor/main.py > "$LOG_FILE" 2>&1 &
    echo $! > "$PID_FILE"
    echo "Started (PID: $(cat "$PID_FILE"))"
}

stop() {
    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        echo "Stopping SBS Editor (PID: $PID)..."
        kill $PID
        rm "$PID_FILE"
        echo "Stopped"
    else
        echo "SBS Editor is not running"
    fi
}

status() {
    if [ -f "$PID_FILE" ]; then
        PID=$(cat "$PID_FILE")
        if ps -p $PID > /dev/null; then
            echo "SBS Editor is running (PID: $PID)"
            return
        fi
    fi
    echo "SBS Editor is not running"
}

case "$1" in
    start)
        start
        ;;
    stop)
        stop
        ;;
    status)
        status
        ;;
    restart)
        stop
        sleep 1
        start
        ;;
    *)
        echo "Usage: $0 {start|stop|status|restart}"
        exit 1
esac
