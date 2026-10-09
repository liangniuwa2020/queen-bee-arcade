@echo off
chcp 65001 >nul
title 经典街机八线机 - 女王蜂 (QUEEN BEE / SUBSINO)
cd /d "%~dp0"

echo ========================================================
echo        经典街机 8-LINER - 女王蜂 (QUEEN BEE)
echo ========================================================
echo.

if exist "..\cross-transfer\.venv\Scripts\python.exe" (
    echo [*] 正在启动桌面独立窗口...
    "..\cross-transfer\.venv\Scripts\python.exe" main.py
) else (
    echo [*] 正在打开游戏界面...
    start "" index.html
)
