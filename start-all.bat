@echo off
REM --- Start All Services for E-Commerce Project ---

REM Start backend server using the improved script (handles port 4000 conflicts)
start cmd /k "call start-backend.bat"

REM Wait a few seconds to let backend initialize
ping 127.0.0.1 -n 6 > nul

REM Start frontend React app
start cmd /k "cd Frontend\my-app && npm start" 