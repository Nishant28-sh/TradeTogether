@echo off
setlocal

REM --- E-Commerce Backend Startup Script ---
echo Starting E-Commerce Backend Server...
echo.

cd backend

echo Checking if .env file exists...
if not exist .env (
    echo Creating .env file...
    echo PORT=4000 > .env
    echo MONGO_URI=mongodb://localhost:27017/skill-exchange >> .env
    echo NODE_ENV=development >> .env
    echo .env file created successfully!
) else (
    echo .env file already exists.
)

echo.
echo Installing dependencies if needed...
call npm install

echo.
echo Checking for any process using port 4000...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr :4000 ^| findstr LISTENING') do (
    echo Found process on port 4000 with PID %%a
    echo Attempting to kill process %%a ...
    taskkill /PID %%a /F
)

echo.
echo Starting server on port 4000...
echo.
node server.js

pause
endlocal 