#!/usr/bin/env bash
# Install a nightly cron entry that runs the MindGuard SQLite backup
# (Remediation P2-5). Idempotent: re-running updates/replaces the entry.
#
# Usage:
#   BACKUP_DIR=/var/backups/mindguard ./scripts/install_backup_cron.sh
#
# Env:
#   BACKUP_DIR       destination directory (default: /var/backups/mindguard)
#   CRON_SCHEDULE    cron expression (default: "17 3 * * *" = 03:17 daily)
#   BACKUP_S3_BUCKET (optional) passed through for S3 offload
#
# On Railway, skip this and use a cron job instead (see RUNBOOK "Backups"):
#   [[cronJobs]]
#   schedule = "0 3 * * *"
#   command  = "cd /app/backend && PYTHONPATH=..:. python3 scripts/backup_db.py /var/backups/mindguard"

set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-/var/backups/mindguard}"
CRON_SCHEDULE="${CRON_SCHEDULE:-17 3 * * *}"

REPO_ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/../.." && pwd)"
BACKEND_DIR="$REPO_ROOT/backend"
PYTHON_BIN="${PYTHON_BIN:-python3}"

mkdir -p "$BACKUP_DIR"

CRON_LINE="$CRON_SCHEDULE cd $BACKEND_DIR && PYTHONPATH=..:${PYTHONPATH:-} $PYTHON_BIN scripts/backup_db.py $BACKUP_DIR"
CRON_MARK="mindguard-backup"

# Keep an existing crontab, drop any previous mindguard entry, re-add.
(crontab -l 2>/dev/null || true) | grep -v "MindGuard\|$CRON_MARK" > /tmp/mindguard_cron.$$
printf '%s # %s\n' "$CRON_LINE" "$CRON_MARK" >> /tmp/mindguard_cron.$$
crontab /tmp/mindguard_cron.$$
rm -f /tmp/mindguard_cron.$$

echo "Installed backup cron: $CRON_LINE"
crontab -l | grep mindguard
