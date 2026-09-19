@echo off
cd /d "%~dp0backend"
npm install
if errorlevel 1 pause & exit /b 1
npm run seed
pause
