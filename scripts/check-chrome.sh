#!/bin/sh
# Fails when a page is missing the shared header chrome or still names the city.
# Every HTML page needs the About link and the mobile nav-menu inside its <nav>,
# and no HTML page may contain "Bengaluru" anywhere (site rule: no city on the site).
# Run from the repo root: sh scripts/check-chrome.sh
fail=0
list=$(find . \( -path './.git' -o -path './.worktrees' -o -path './node_modules' \) -prune -o -name '*.html' -print | sort)
while IFS= read -r f; do
  nav=$(sed -n '/<nav>/,/<\/nav>/p' "$f")
  printf '%s\n' "$nav" | grep -q 'href="/about/"' || { echo "FAIL $f: no About link in nav (href=\"/about/\")"; fail=1; }
  printf '%s\n' "$nav" | grep -q 'class="nav-menu"' || { echo "FAIL $f: no mobile nav-menu in nav"; fail=1; }
  grep -q 'Bengaluru' "$f" && { echo "FAIL $f: contains Bengaluru"; fail=1; }
done <<EOF
$list
EOF
[ "$fail" -eq 0 ] && echo "OK: all pages have the About link and nav-menu, none name the city"
exit "$fail"
