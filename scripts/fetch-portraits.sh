#!/usr/bin/env bash
# Downloads N unique AI-generated portraits into the local image cache.
#
# Why this is a separate, manual script and not part of `db:seed`:
# its output is committed to the repo, so seeding never touches the network.
# Run it once; re-runs resume from whatever is already cached.
#
# thispersondoesnotexist serves a NEW face roughly once per second and caches
# hard in front of that — parallel requests and cache-busting query params both
# return duplicates (measured: 12 parallel fetches → 4-5 unique). So this loops
# sequentially and dedupes by content hash. Expect ~1 image/second.
set -euo pipefail

TARGET="${1:-520}"
CACHE_DIR="${2:-.image-cache/portraits}"
URL='https://thispersondoesnotexist.com/random-person.jpeg'

mkdir -p "$CACHE_DIR"
tmp="$(mktemp)"
trap 'rm -f "$tmp"' EXIT

have() { find "$CACHE_DIR" -name '*.jpg' | wc -l | tr -d ' '; }

echo "Target: $TARGET unique portraits in $CACHE_DIR (have $(have))"
attempts=0
max_attempts=$((TARGET * 6))

while [ "$(have)" -lt "$TARGET" ] && [ "$attempts" -lt "$max_attempts" ]; do
  attempts=$((attempts + 1))
  if ! curl -sL "$URL" -o "$tmp" --max-time 30; then
    sleep 2
    continue
  fi
  # Guard against the bot-protection HTML page being served instead of a JPEG.
  case "$(file -b --mime-type "$tmp")" in
    image/jpeg) ;;
    *) sleep 2; continue ;;
  esac

  hash="$(md5sum "$tmp" | cut -d' ' -f1)"
  dest="$CACHE_DIR/$hash.jpg"
  if [ ! -f "$dest" ]; then
    cp "$tmp" "$dest"
    n="$(have)"
    [ $((n % 25)) -eq 0 ] && echo "  $n/$TARGET"
  fi
done

echo "Done: $(have) unique portraits after $attempts requests."
