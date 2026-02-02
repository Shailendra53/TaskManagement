#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT_DIR"

PORT="${PORT:-5174}"
PID_FILE="$ROOT_DIR/.devserver.pid"
LOG_FILE="$ROOT_DIR/.devserver.log"

if [[ -f "$PID_FILE" ]]; then
  PID="$(cat "$PID_FILE")"
  if kill -0 "$PID" 2>/dev/null; then
    echo "Dev server already running (pid $PID). Stop it with ./stop-dev.sh" >&2
    exit 0
  else
    echo "Removing stale pid file" >&2
    rm -f "$PID_FILE"
  fi
fi

echo "Starting Vite dev server on port $PORT..."
npm run dev -- --host --port "$PORT" >"$LOG_FILE" 2>&1 &
echo $! > "$PID_FILE"
echo "Started (pid $(cat "$PID_FILE")). Logs: $LOG_FILE"
