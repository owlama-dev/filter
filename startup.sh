#!/bin/sh
set -eu
ROOT_DIR="$(CDPATH= cd -- "$(dirname -- "$0")" && pwd)"
cd "$ROOT_DIR"

# If a previous dev server is already serving the app, leave it alone.
if curl -sf -o /dev/null --max-time 2 http://127.0.0.1:8080/ >/dev/null 2>&1; then
  exit 0
fi

# Kill stale Vite processes from older runs so the app can restart cleanly.
pkill -f 'vite dev --host 0.0.0.0 --port 8080' >/dev/null 2>&1 || true
npm run dev >> /tmp/filter-app.log 2>&1 &
