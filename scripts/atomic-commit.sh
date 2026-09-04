#!/usr/bin/env bash
set -e
MSG="$1"
if [ -z "$MSG" ]; then echo "usage: atomic-commit.sh 'feat(scope): message'"; exit 1; fi
BRANCH=$(git branch --show-current)
git add -A
git commit -m "$MSG

Co-authored-by: vibe-engine
Branch: $BRANCH
Graph: graphify-out/graph.json"
echo "✅ committed: $MSG — revert with git reset --hard HEAD~1"
echo "[$(date -Iseconds)] COMMIT $MSG branch=$BRANCH" >> logs/dev.log
