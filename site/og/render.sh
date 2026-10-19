#!/bin/sh
# Renders the social share image to assets/og.png with headless Chrome.
set -e
here=$(cd "$(dirname "$0")" && pwd)
chrome="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
[ -x "$chrome" ] || { echo "Google Chrome not found at $chrome" >&2; exit 1; }
profile=$(mktemp -d)
"$chrome" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=1 \
  --allow-file-access-from-files --user-data-dir="$profile" --window-size=1200,630 \
  --virtual-time-budget=5000 --screenshot="$here/../assets/og.png" "file://$here/og.html" 2>/dev/null
rm -rf "$profile"
ls -la "$here/../assets/og.png"
