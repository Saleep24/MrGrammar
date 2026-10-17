#!/bin/sh
# Renders the store screenshots from src/ with headless Chrome. Run from anywhere.
set -e
here=$(cd "$(dirname "$0")" && pwd)
root=$(cd "$here/../.." && pwd)
chrome="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
build=$(mktemp -d)
cp "$here"/src/* "$build"/
cp "$root/icons/icon-128.png" "$build"/
mkdir "$build/ext"
cp "$root"/popup.* "$root"/options.* "$root/shared.js" "$build/ext/"
cp "$here/src/chrome-stub.js" "$build/ext/"
sed -i '' 's#<script src="shared.js"></script>#<script src="chrome-stub.js"></script><script src="shared.js"></script>#' "$build"/ext/*.html
sed -i '' 's/prefers-color-scheme: dark/prefers-color-scheme: never-dark/' "$build"/ext/*.css
shoot() {
  "$chrome" --headless=new --disable-gpu --hide-scrollbars --force-device-scale-factor=1 \
    --allow-file-access-from-files --user-data-dir="$build/profile-$1" --window-size="$2" \
    --virtual-time-budget=4000 --screenshot="$here/$1.png" "file://$build/$1.html" 2>/dev/null
}
for n in 01-hero 02-before-after 03-popup-sites 04-options; do shoot "$n" 1280,800; done
shoot 05-promo-tile 440,280
rm -rf "$build"
ls -la "$here"/*.png
