#!/usr/bin/env bash
# ====================================================================
# 经典街机八线机 - 女王蜂 (QUEEN BEE) Linux 启动脚本
# ====================================================================

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
cd "$SCRIPT_DIR"

INDEX_FILE="$SCRIPT_DIR/index.html"

echo "========================================================"
echo "       经典街机 8-LINER - 女王蜂 (QUEEN BEE)"
echo "========================================================"

if command -v xdg-open &>/dev/null; then
    xdg-open "$INDEX_FILE"
elif command -v open &>/dev/null; then
    open "$INDEX_FILE"
elif command -v python3 &>/dev/null; then
    python3 main.py
else
    echo "请在浏览器中直接打开: $INDEX_FILE"
fi
