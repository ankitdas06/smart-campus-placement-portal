@echo off
title Smart Campus Placement Preparation Portal - Localhost Server
chcp 65001 >nul
cls

echo ======================================================================
echo   SMART CAMPUS PLACEMENT PREPARATION PORTAL
echo   Localhost Web Server Launcher
echo ======================================================================
echo.

:: Change working directory to the folder containing this batch script
cd /d "%~dp0"

set PORT=8000

echo [*] Initializing local web server for:
echo     %CD%
echo.

:: 1. Check if Python is installed and actually works (not Microsoft Store redirector)
python -c "import http.server" >nul 2>&1
if %errorlevel% equ 0 (
    echo [*] Functional Python 3 environment detected!
    echo [*] Starting Python HTTP Server on http://localhost:%PORT%/ ...
    echo [*] Launching your default web browser...
    start "" "http://localhost:%PORT%/index.html"
    echo.
    echo ======================================================================
    echo  Server is ONLINE at: http://localhost:%PORT%/
    echo  Press Ctrl+C in this command prompt to stop the server.
    echo ======================================================================
    echo.
    python -m http.server %PORT%
    goto finish
)

:: 2. Check if Python Windows Launcher (py) works
py -c "import http.server" >nul 2>&1
if %errorlevel% equ 0 (
    echo [*] Functional Python Launcher (py) detected!
    echo [*] Starting Python HTTP Server on http://localhost:%PORT%/ ...
    echo [*] Launching your default web browser...
    start "" "http://localhost:%PORT%/index.html"
    echo.
    echo ======================================================================
    echo  Server is ONLINE at: http://localhost:%PORT%/
    echo  Press Ctrl+C in this command prompt to stop the server.
    echo ======================================================================
    echo.
    py -m http.server %PORT%
    goto finish
)

:: 3. Check if Node.js / npx works
call npx --version >nul 2>&1
if %errorlevel% equ 0 (
    echo [*] Node.js (npx) detected!
    echo [*] Starting local HTTP server on http://localhost:%PORT%/ ...
    echo [*] Launching your default web browser...
    start "" "http://localhost:%PORT%/index.html"
    echo.
    echo ======================================================================
    echo  Server is ONLINE at: http://localhost:%PORT%/
    echo  Press Ctrl+C in this command prompt to stop the server.
    echo ======================================================================
    echo.
    call npx -y serve -l %PORT% .
    goto finish
)

:: 4. Check if PHP works
php -v >nul 2>&1
if %errorlevel% equ 0 (
    echo [*] PHP runtime detected!
    echo [*] Starting PHP built-in server on http://localhost:%PORT%/ ...
    echo [*] Launching your default web browser...
    start "" "http://localhost:%PORT%/index.html"
    echo.
    echo ======================================================================
    echo  Server is ONLINE at: http://localhost:%PORT%/
    echo  Press Ctrl+C in this command prompt to stop the server.
    echo ======================================================================
    echo.
    php -S localhost:%PORT%
    goto finish
)

:: 5. Universal Windows Native Fallback (Built-in PowerShell Server, 0 Dependencies)
echo [*] No third-party runtime detected.
echo [*] Starting native Windows PowerShell HTTP Server on http://localhost:%PORT%/ ...
echo.

powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0server.ps1" -Port %PORT%

:finish
echo.
echo Server closed. Press any key to exit.
pause >nul
