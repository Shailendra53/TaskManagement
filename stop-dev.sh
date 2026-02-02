#!/usr/bin/env bash
set -euo pipefail

ROOT_DIR="$(cd "$(dirname "$0")" && pwd)"
PID_FILE="$ROOT_DIR/.devserver.pid"

if [[ ! -f "$PID_FILE" ]]; then
  echo "No dev server pid file found. Nothing to stop." >&2
  exit 0
fi

PID="$(cat "$PID_FILE")"
if kill -0 "$PID" 2>/dev/null; then
  echo "Stopping dev server (pid $PID)..."
  kill "$PID"
  rm -f "$PID_FILE"
  echo "Stopped."
else
  echo "Process $PID not running. Cleaning up pid file." >&2
  rm -f "$PID_FILE"
fi
