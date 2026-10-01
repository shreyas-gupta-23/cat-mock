@echo off
cd /d "%~dp0app"
if not exist node_modules (
  echo Installing the exam room...
  call npm install
  if errorlevel 1 exit /b 1
)
echo Exam room: http://127.0.0.1:5173
call npm start
