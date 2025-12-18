@echo off
echo ================================
echo Restarting backend container...
echo ================================

docker compose restart backend
IF %ERRORLEVEL% NEQ 0 (
    echo Failed to restart backend
    exit /b %ERRORLEVEL%
)

echo.
echo ================================
echo Running Django makemigrations...
echo ================================

docker compose exec backend python manage.py makemigrations tracker
IF %ERRORLEVEL% NEQ 0 (
    echo makemigrations failed
    exit /b %ERRORLEVEL%
)

echo.
echo ================================
echo Running Django migrate...
echo ================================

docker compose exec backend python manage.py migrate
IF %ERRORLEVEL% NEQ 0 (
    echo migrate failed
    exit /b %ERRORLEVEL%
)

echo.
echo Backend restarted and migrations completed successfully
pause
