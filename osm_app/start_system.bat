@echo off
echo ========================================
echo   Perfect Student Evaluation System
echo   Complete Startup Script
echo ========================================
echo.

echo 🤖 Starting AI Auditing Service...
start "AI Service" cmd /k "cd /d %~dp0 && python ai_auditing_service.py"

echo ⏳ Waiting for AI Service to initialize...
timeout /t 5 /nobreak >nul

echo 🌐 Starting Django Server...
start "Django Server" cmd /k "cd /d %~dp0 && python manage.py runserver 127.0.0.1:8000"

echo.
echo ✅ Services are starting...
echo.
echo 📱 Main Application: http://127.0.0.1:8000
echo 🤖 AI Service: http://localhost:8001
echo.
echo 💡 Close this window to keep services running
echo    Or press any key to stop all services...
pause >nul

echo.
echo ⚠️  Stopping all services...
taskkill /F /IM python.exe >nul 2>&1
echo ✅ All services stopped
timeout /t 2 /nobreak >nul
