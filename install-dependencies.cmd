@echo off
setlocal
cd /d "%~dp0"
echo Installing root dependencies...
call npm install
if errorlevel 1 goto fail
echo Installing server dependencies...
call npm install --prefix server
if errorlevel 1 goto fail
echo Installing client dependencies...
call npm install --prefix client
if errorlevel 1 goto fail
echo.
echo Dependencies installed. Start the app with: npm run dev
exit /b 0
:fail
echo.
echo An installation failed. Check the messages above.
exit /b 1
