@echo off
cd /d "%~dp0backend"
echo Installing backend dependencies if needed...
npm install
if errorlevel 1 goto error
 echo.
echo Starting VROOMY server...
npm start
goto end
:error
echo.
echo npm install failed. Check your internet connection and Node.js installation.
:end
pause
