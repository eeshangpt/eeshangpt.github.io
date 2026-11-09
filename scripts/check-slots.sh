#!/bin/sh
# Fails while any unfilled voice slot or client-check note is left in the site.
# Run from the repo root before publishing: sh scripts/check-slots.sh
hits=$(grep -rnE '\[(YOUR DETAIL|CHECK)' --include='*.html' --include='*.md' --include='*.txt' --include='*.xml' . --exclude-dir=.git --exclude-dir=.worktrees --exclude-dir=node_modules)
if [ -n "$hits" ]; then
  echo "$hits"
  echo "FAIL: $(echo "$hits" | wc -l) unfilled slot line(s)"
  exit 1
fi
echo "OK: no unfilled slots"
