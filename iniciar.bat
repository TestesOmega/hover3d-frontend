@echo off
title Hover3D - Gerador de Posts
cd /d "%~dp0"

echo ================================================
echo   Hover3D - Iniciando...
echo ================================================
echo.

REM Instala dependencias so na primeira vez (se a pasta node_modules nao existir)
if not exist node_modules (
    echo Primeira execucao - instalando dependencias...
    echo Isso pode levar alguns minutos, aguarde.
    echo.
    call npm install
    echo.
)

echo Iniciando o app...
echo O navegador vai abrir automaticamente em instantes.
echo.
echo Para PARAR o app, feche esta janela.
echo ================================================

REM Abre o navegador apos 4 segundos
start "" cmd /c "timeout /t 4 /nobreak >nul && start http://localhost:5173"

REM Roda o servidor
call npm run dev
pause
