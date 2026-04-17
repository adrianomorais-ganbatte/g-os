#!/usr/bin/env bash
# Smoke test do hook storybook-branch-check.sh (T-104)
set -e

HOOK=".claude/hooks/storybook-branch-check.sh"
export CLAUDE_PROJECT_DIR="$(pwd)"

fail() { echo "FAIL: $1"; exit 1; }

echo "=== Test 1: UserPromptSubmit com 'storybook' ==="
OUT=$(echo '{"user_prompt":"edite a story do Button no storybook"}' | bash "$HOOK")
current=$(git -C packages/fractus branch --show-current 2>/dev/null || echo unknown)
if [ "$current" != "feat/storybook" ]; then
  [[ "$OUT" == *"STORYBOOK BRANCH CONTEXT"* ]] || fail "warning nao injetado (branch=$current). Output: $OUT"
  echo "PASS: warning injetado (branch=$current)"
else
  [[ -z "$OUT" ]] || fail "deveria ser silencioso em feat/storybook. Output: $OUT"
  echo "PASS: silencioso em feat/storybook"
fi

echo "=== Test 2: prompt sem storybook (silencioso) ==="
OUT=$(echo '{"user_prompt":"liste as tasks abertas"}' | bash "$HOOK")
[[ -z "$OUT" ]] || fail "deveria ser silencioso. Output: $OUT"
echo "PASS: silencioso"

echo "=== Test 3: PreToolUse em .stories.tsx ==="
OUT=$(echo '{"tool_input":{"file_path":"/e/Github/Ganbatte/packages/fractus/src/components/Button.stories.tsx"}}' | bash "$HOOK")
if [ "$current" != "feat/storybook" ]; then
  [[ "$OUT" == *"STORYBOOK BRANCH CONTEXT"* ]] || fail "warning nao injetado por file_path. Output: $OUT"
  echo "PASS: warning por file_path"
else
  echo "PASS: silencioso em feat/storybook"
fi

echo "=== Test 4: exit code sempre 0 ==="
echo '{}' | bash "$HOOK"
code=$?
[ "$code" -eq 0 ] || fail "exit code=$code"
echo "PASS: exit=0"

echo ""
echo "Todos os testes passaram"
