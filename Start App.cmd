@echo off
title CommonHands App Preview
cd /d "%~dp0"

if not exist "node_modules" (
  echo Installing app packages for the first time...
  call npm install
  if errorlevel 1 (
    echo.
    echo Installation failed. Press any key to close.
    pause >nul
    exit /b 1
  )
)

echo Starting CommonHands...
echo Your browser should open automatically.
echo Close this window to stop the app.
echo.
call npm run web

if errorlevel 1 (
  echo.
  echo The app stopped with an error. Press any key to close.
  pause >nul
)
