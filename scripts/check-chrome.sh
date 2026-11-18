#!/bin/sh
# Fails when a page is missing the shared header chrome or names a forbidden place.
# Every HTML page needs the About link and the mobile nav-menu inside its <nav>,
# and the favicon link. Place names that must never appear (site rule: no location) are read
# from .forbidden-terms, one per line; that file is gitignored so the names never ship with the site.
# Run from the repo root: sh scripts/check-chrome.sh
fail=0
list=$(find . \( -path './.git' -o -path './.worktrees' -o -path './node_modules' \) -prune -o -name '*.html' -print | sort)
[ -f .forbidden-terms ] || echo "WARN: no .forbidden-terms file, place-name check skipped"
while IFS= read -r f; do
  nav=$(sed -n '/<nav>/,/<\/nav>/p' "$f")
  printf '%s\n' "$nav" | grep -q 'href="/about/"' || { echo "FAIL $f: no About link in nav (href=\"/about/\")"; fail=1; }
  printf '%s\n' "$nav" | grep -q 'class="nav-menu"' || { echo "FAIL $f: no mobile nav-menu in nav"; fail=1; }
  grep -q 'rel="icon" href="/favicon.svg"' "$f" || { echo "FAIL $f: no favicon.svg link"; fail=1; }
  grep -q 'rel="icon" href="/favicon.ico"' "$f" || { echo "FAIL $f: no favicon.ico link"; fail=1; }
  grep -q 'rel="apple-touch-icon" href="/apple-touch-icon.png"' "$f" || { echo "FAIL $f: no apple-touch-icon link"; fail=1; }
  if [ -f .forbidden-terms ] && grep -qiFf .forbidden-terms "$f"; then echo "FAIL $f: contains a forbidden place name"; fail=1; fi
done <<EOF
$list
EOF
[ "$fail" -eq 0 ] && echo "OK: all pages have the About link, nav-menu and favicon link, none name a forbidden place"
exit "$fail"
