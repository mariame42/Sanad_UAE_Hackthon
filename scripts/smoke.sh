#!/bin/sh
# Smoke test: serve the production build and check every route + the LLM API.
# Works without LLM_API_KEY (the API falls back to offline rules).
set -u

PORT="${PORT:-3123}"
BASE="http://localhost:$PORT"
LOG="$(mktemp)"

npx next start -p "$PORT" >"$LOG" 2>&1 &
SERVER=$!
trap 'kill $SERVER 2>/dev/null; rm -f "$LOG"' EXIT INT TERM

i=0
until curl -s -o /dev/null "$BASE/"; do
  i=$((i + 1))
  if [ "$i" -gt 60 ]; then echo "Server did not start:"; cat "$LOG"; exit 1; fi
  sleep 0.5
done

fail=0
check() { # check <expected-status> <path>
  code=$(curl -s -o /dev/null -w '%{http_code}' "$BASE$2")
  if [ "$code" = "$1" ]; then echo "  ok   $code $2"; else echo "  FAIL $code $2 (expected $1)"; fail=1; fi
}

echo "Pages"
for path in / /role /check-in /passport /my-case /concern \
            /cases /cases/case-1001 /dashboard /barriers /principles; do
  check 200 "$path"
done
check 307 /class-insights

echo "LLM API (live or offline fallback)"
out=$(curl -s -X POST "$BASE/api/llm" -H 'Content-Type: application/json' \
  -d '{"action":"language_guard","text":"Seems dyslexic and lazy in the lab","locale":"en"}')
case "$out" in
  *dyslexic*|*'"rewritten":""'*|"") echo "  FAIL language_guard: $out"; fail=1 ;;
  *'"rewritten":"'*) echo "  ok   language_guard rewrote the label" ;;
  *) echo "  FAIL language_guard: $out"; fail=1 ;;
esac

[ "$fail" -eq 0 ] && echo "Smoke test passed." || echo "Smoke test FAILED."
exit "$fail"
