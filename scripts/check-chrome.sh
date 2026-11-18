#!/bin/sh
# Fails when a page is missing the shared header chrome or names a forbidden place.
# Every HTML page needs a <nav> with the home link, the Work with me link and the About link.
# Place names that must never appear (site rule: no location) are read from .forbidden-terms,
# one per line; that file is gitignored so the names never ship with the site.
# Run from the repo root: sh scripts/check-chrome.sh
fail=0
list=$(find . \( -path './.git' -o -path './.worktrees' -o -path './node_modules' \) -prune -o -name '*.html' -print | sort)
[ -f .forbidden-terms ] || echo "WARN: no .forbidden-terms file, place-name check skipped"
while IFS= read -r f; do
  nav=$(sed -n '/<nav /,/<\/nav>/p' "$f")
  printf '%s\n' "$nav" | grep -q 'href="/"' || { echo "FAIL $f: no home link in nav (href=\"/\")"; fail=1; }
  printf '%s\n' "$nav" | grep -q 'href="/work/"' || { echo "FAIL $f: no Work with me link in nav (href=\"/work/\")"; fail=1; }
  printf '%s\n' "$nav" | grep -q 'href="/\{0,1\}#about"' || { echo "FAIL $f: no About link in nav (href=\"/#about\")"; fail=1; }
  if [ -f .forbidden-terms ] && grep -qiFf .forbidden-terms "$f"; then echo "FAIL $f: contains a forbidden place name"; fail=1; fi
done <<EOF
$list
EOF
[ "$fail" -eq 0 ] && echo "OK: all pages have the home, Work with me and About links, none name a forbidden place"
exit "$fail"
