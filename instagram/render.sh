#!/usr/bin/env bash
# Exports every post in posts.html to posts/NN.png (1080x1350).
set -euo pipefail
cd "$(dirname "$0")"

CHROME="${CHROME:-/Applications/Google Chrome.app/Contents/MacOS/Google Chrome}"
PROFILE="$(mktemp -d)"
trap 'rm -rf "$PROFILE"' EXIT
mkdir -p posts

for n in $(grep -o 'id="p[0-9][0-9]"' posts.html | grep -o '[0-9][0-9]'); do
  "$CHROME" --headless=new --disable-gpu --hide-scrollbars --no-first-run \
    --user-data-dir="$PROFILE" --force-device-scale-factor=1 \
    --window-size=1080,1350 --virtual-time-budget=6000 \
    --screenshot="$PWD/posts/$n.png" "file://$PWD/posts.html?p=$n" >/dev/null 2>&1
  echo "posts/$n.png"
done
