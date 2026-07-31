@echo off
title RecipeAdmin

cd /d "%~dp0Admin"

start "" cmd /k npm start

echo Väntar på att servern ska starta...

:wait
curl -s http://localhost:3000 >nul 2>&1
if errorlevel 1 (
    timeout /t 1 >nul
    goto wait
)

start "" http://localhost:3000/recipes/recipe.html

exit