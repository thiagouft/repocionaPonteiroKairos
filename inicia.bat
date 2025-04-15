@echo off
setlocal

:: Solicita ao usuário a data
set /p DATA=Digite a data para o script (formato dd/mm/aaaa): 

:: Executa o comando Node com o argumento informado
node login.js %DATA%

pause
