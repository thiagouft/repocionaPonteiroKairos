@echo off
setlocal
chcp 65001 > nul

echo ==============================================
echo       AUTOMAÇÃO DIMEP KAIROS
echo ==============================================
echo [1] Reposição de Ponteiro
echo [2] Atualizar Data e Hora dos Relógios
echo ==============================================
set /p OPC=Escolha uma opção (1 ou 2): 

if "%OPC%"=="2" goto ATUALIZAR_DATA_HORA
goto REPOSICAO_PONTEIRO

:ATUALIZAR_DATA_HORA
echo.
echo Iniciando atualização de data e hora...
node login.js datahora
goto FIM

:REPOSICAO_PONTEIRO
echo.
set /p DATA=Digite a data para o script (formato dd/mm/aaaa): 
node login.js %DATA%
goto FIM

:FIM
pause
