#!/usr/bin/env bash
# cairn-integrity.sh — install-integrity check for a .cairn/ habitat
# Usage: bash scripts/cairn-integrity.sh [project-root]
# Exits 0 if healthy, 1 if any check fails.
set -euo pipefail

PROJECT_ROOT="${1:-.}"
CAIRN_DIR="$PROJECT_ROOT/.cairn"
CONTEXT_FILE="$PROJECT_ROOT/CLAUDE.md"
PASS=true

check() {
  local desc="$1" result="$2"
  if [ "$result" = "ok" ]; then
    echo "OK:   $desc"
  else
    echo "FAIL: $desc — $result"
    PASS=false
  fi
}

# 1. .cairn/ exists
[ -d "$CAIRN_DIR" ] && check ".cairn/ directory exists" "ok" || check ".cairn/ directory exists" "not found"

# 2. Required files present
for f in "CLAUDE.md" "LAWS.md" "cairn-version" "memory/MEMORY.md"; do
  [ -f "$CAIRN_DIR/$f" ] && check ".cairn/$f present" "ok" || check ".cairn/$f present" "missing"
done

# 3. No file is empty or HTTP error body
find "$CAIRN_DIR" -name "*.md" | while read -r f; do
  first=$(head -1 "$f" 2>/dev/null || echo "")
  if echo "$first" | grep -qE "^404|^Not Found|^<!DOCTYPE|^<html"; then
    check "$f content" "corrupt (first line: $first)"
  elif [ -z "$first" ]; then
    check "$f content" "empty"
  fi
done

# 4. Import line present in context file
if [ -f "$CONTEXT_FILE" ]; then
  grep -q "@./.cairn/CLAUDE.md" "$CONTEXT_FILE" \
    && check "import line in CLAUDE.md" "ok" \
    || check "import line in CLAUDE.md" "MISSING — add: @./.cairn/CLAUDE.md"
else
  # Check AGENTS.md as fallback for Pi/agy habitats
  AGENTS_FILE="$PROJECT_ROOT/AGENTS.md"
  if [ -f "$AGENTS_FILE" ]; then
    grep -q ".cairn/CLAUDE.md" "$AGENTS_FILE" \
      && check "import line in AGENTS.md" "ok" \
      || check "import line in AGENTS.md" "MISSING — add line referencing .cairn/CLAUDE.md"
  else
    check "context file (CLAUDE.md or AGENTS.md)" "neither found — import line cannot be verified"
    PASS=false
  fi
fi

# 5. cairn-version marker (confirms migration or fresh install ran to completion)
if [ -f "$CAIRN_DIR/cairn-version" ]; then
  ver=$(cat "$CAIRN_DIR/cairn-version")
  check "cairn-version marker ($ver)" "ok"
else
  check "cairn-version marker" "missing — run adopt or migration Phase A3"
  PASS=false
fi

if [ "$PASS" = "true" ]; then
  echo ""
  echo "cairn habitat: HEALTHY"
  exit 0
else
  echo ""
  echo "cairn habitat: NEEDS ATTENTION (see FAIL lines above)"
  exit 1
fi
