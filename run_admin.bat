@echo off
title RecipeAdmin

cd /d "%~dp0Admin"

start "" cmd /k npm start

echo Waiting for server to start...

:wait
curl -s http://localhost:3000 >nul 2>&1
if errorlevel 1 (
    timeout /t 1 >nul
    goto wait
)

start "" http://localhost:3000

exit