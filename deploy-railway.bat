@echo off
echo =============================================
echo 🚀 DEPLOY RAILWAY - EMPRESAS BRASIL BACKEND
echo =============================================

echo.
echo 📁 Navegando para diretório backend...
cd /d "%~dp0backend"

echo.
echo 📦 Verificando package.json...
if not exist package.json (
    echo ❌ package.json não encontrado!
    pause
    exit /b 1
)

echo ✅ package.json encontrado
echo.

echo 🔧 Instalando dependências...
call npm install
if errorlevel 1 (
    echo ❌ Erro ao instalar dependências
    pause
    exit /b 1
)

echo.
echo 🚀 Iniciando deploy no Railway...
echo Tentativa 1: Deploy direto
call railway deploy --detach
if not errorlevel 1 (
    echo ✅ Deploy realizado com sucesso!
    goto :success
)

echo.
echo Tentativa 2: Deploy forçado
call railway deploy . 
if not errorlevel 1 (
    echo ✅ Deploy realizado com sucesso!
    goto :success
)

echo.
echo Tentativa 3: Deploy com verbose
call railway deploy --verbose
if not errorlevel 1 (
    echo ✅ Deploy realizado com sucesso!
    goto :success
)

echo.
echo ❌ Todas as tentativas falharam
echo 💡 Execute manualmente: railway deploy
echo 💡 Se pedir template, escolha: Node.js
pause
exit /b 1

:success
echo.
echo =============================================
echo ✅ DEPLOY CONCLUÍDO COM SUCESSO!
echo =============================================
echo.
echo 🌐 Seu backend está sendo deployado
echo 📊 Verifique o status no Railway Dashboard
echo 🔧 Backend sem sistema de subscription
echo 🎯 Acesso direto ao dashboard garantido
echo.
pause