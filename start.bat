@echo off
setlocal

:: Get the folder where this .bat file is located
set SCRIPT_DIR=%~dp0

:: Run the PowerShell script in the same folder
powershell -ExecutionPolicy Bypass -File "%SCRIPT_DIR%run_server_and_test.ps1"

pause
