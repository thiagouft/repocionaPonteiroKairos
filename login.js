import puppeteer from 'puppeteer';
import dotenv from 'dotenv';

dotenv.config();

const LOGIN_URL = 'https://www.dimepkairos.com.br';
const ADVANCED_PAGE_BASE_URL = 'https://www.dimepkairos.com.br/Dimep/Relogios/Advanced/';
const username = process.env.LOGIN;
const password = process.env.SENHA;

const getPreviousDate = () => {
    const date = new Date();
    date.setDate(date.getDate() - 1);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
};

const DATA_PERSONALIZADA = process.argv[2] || getPreviousDate();

// Função de espera (delay)
const sleep = (ms) => new Promise(resolve => setTimeout(resolve, ms));

const runAutomation = async () => {
    console.log('🔄 Iniciando automação...');

    const browser = await puppeteer.launch({ headless: false, defaultViewport: null });
    const page = await browser.newPage();

    try {
        // Login
        await page.goto(LOGIN_URL, { waitUntil: 'networkidle2' });
        console.log('✅ Página de login carregada.');

        await page.waitForSelector('#LogOnModel_UserName');
        await page.type('#LogOnModel_UserName', username, { delay: 100 });
        await sleep(300); // 🕒 pequeno delay
        await page.type('#LogOnModel_Password', password, { delay: 100 });

        await page.waitForSelector('#btnFormLogin');
        await page.click('#btnFormLogin');
        console.log('🔐 Dados de login enviados.');

        await page.waitForNavigation({ waitUntil: 'networkidle2' });
        console.log('✅ Login realizado com sucesso.');

        // 1. Iterar por todos os relógios para fazer a reposição do ponteiro
        for (let i = 1; i <= 28; i++) {
            const ADVANCED_PAGE_URL = `${ADVANCED_PAGE_BASE_URL}${i}`;
            console.log(`\n🔄 Processando reposição do ponteiro para o relógio ${i}...`);

            try {
                await page.goto(ADVANCED_PAGE_URL, { waitUntil: 'networkidle2' });
                await sleep(500); // 🕒 delay
                console.log(`✅ Acessou o relógio ${i}`);

                await page.waitForSelector('#TabReposicaoPonteiro');
                await page.click('#TabReposicaoPonteiro');
                await sleep(500); // 🕒 delay
                console.log('✅ Aba "Reposição do Ponteiro" selecionada.');

                await page.waitForSelector('label[for="radioAPartirDeData"]');
                await page.click('label[for="radioAPartirDeData"]');
                await sleep(300); // 🕒 delay

                await page.waitForSelector('#textboxData');
                await page.evaluate((data) => {
                    const dateInput = document.querySelector('#textboxData');
                    dateInput.value = '';
                    dateInput.value = data;
                }, DATA_PERSONALIZADA);
                console.log(`📅 Data "${DATA_PERSONALIZADA}" inserida.`);

                await sleep(300); // 🕒 delay
                await page.waitForSelector('.questionReposicaoPonteiro');
                await page.click('.questionReposicaoPonteiro');
                console.log('🚀 Requisição enviada.');

                // Confirmação (botão "Sim")
                await page.waitForSelector('#bReposicaoPonteiro', { visible: true, timeout: 5000 });
                await sleep(300); // 🕒 delay
                await page.click('#bReposicaoPonteiro');
                console.log('✔️ Confirmação da reposição executada.');

            } catch (innerErr) {
                console.error(`❌ Erro na reposição do ponteiro para o relógio ${i}: ${innerErr.message}`);
                continue;
            }
        }

        // 2. Iterar por todos os relógios para fazer a 1ª importação (Status Completo e Status Imediato)
        for (let i = 1; i <= 28; i++) {
            const ADVANCED_PAGE_URL = `${ADVANCED_PAGE_BASE_URL}${i}`;
            console.log(`\n🔄 Processando 1ª importação para o relógio ${i}...`);

            try {
                await page.goto(ADVANCED_PAGE_URL, { waitUntil: 'networkidle2' });
                await sleep(500); // 🕒 delay

                await page.waitForSelector('#TabExportarDados', { visible: true, timeout: 5000 });

                await page.evaluate(() => {
                    const exportTab = document.querySelector('#TabExportarDados');
                    if (exportTab) exportTab.scrollIntoView({ behavior: "smooth", block: "center" });
                });
                await sleep(500);

                await page.waitForFunction(() => {
                    const el = document.querySelector('#TabExportarDados');
                    return el && el.offsetParent !== null;
                }, { timeout: 3000 });

                await page.click('#TabExportarDados');
                await sleep(500);
                console.log('📁 Aba "Comandos do Relógio" aberta.');

                // Seleciona "Importar"
                await page.waitForSelector('label[for="radioFunctionImportar"]');
                await page.click('label[for="radioFunctionImportar"]');
                await sleep(300);
                console.log('☑️ Opção "Importar" selecionada para "Status Completo" e "Status Imediato".');

                // Marca "Status Completo"
                await page.waitForSelector('label[for="checkboxImportarStatusCompleto"]');
                await page.click('label[for="checkboxImportarStatusCompleto"]');
                await sleep(300);
                console.log('🔘 "Status Completo" marcado.');

                // Marca "Status Imediato"
                await page.waitForSelector('label[for="checkboxImportarStatusImediato"]');
                await page.click('label[for="checkboxImportarStatusImediato"]');
                await sleep(300);
                console.log('🔘 "Status Imediato" marcado.');

                // Clica em "Importar"
                await page.waitForSelector('.buttonImportar');
                await page.click('.buttonImportar');
                await sleep(1000);
                console.log('📨 Importação de "Status Completo" e "Status Imediato" concluída.');

            } catch (innerErr) {
                console.error(`❌ Erro na 1ª importação para o relógio ${i}: ${innerErr.message}`);
                continue;
            }
        }

        // 3. Iterar por todos os relógios para fazer a 2ª importação (Marcações)
        for (let i = 1; i <= 28; i++) {
            const ADVANCED_PAGE_URL = `${ADVANCED_PAGE_BASE_URL}${i}`;
            console.log(`\n🔄 Processando 2ª importação para o relógio ${i}...`);

            try {
                await page.goto(ADVANCED_PAGE_URL, { waitUntil: 'networkidle2' });
                await sleep(500); // 🕒 delay

                await page.waitForSelector('#TabExportarDados', { visible: true, timeout: 5000 });

                await page.evaluate(() => {
                    const exportTab = document.querySelector('#TabExportarDados');
                    if (exportTab) exportTab.scrollIntoView({ behavior: "smooth", block: "center" });
                });
                await sleep(500);

                await page.waitForFunction(() => {
                    const el = document.querySelector('#TabExportarDados');
                    return el && el.offsetParent !== null;
                }, { timeout: 3000 });

                await page.click('#TabExportarDados');
                await sleep(500);
                console.log('📁 Aba "Comandos do Relógio" aberta.');

                // Seleciona "Importar"
                await page.waitForSelector('label[for="radioFunctionImportar"]');
                await page.click('label[for="radioFunctionImportar"]');
                await sleep(300);
                console.log('☑️ Opção "Importar" selecionada novamente para "Marcações".');

                // Marca "Marcações"
                await page.waitForSelector('label[for="checkImportarMarcacoes"]');
                await page.click('label[for="checkImportarMarcacoes"]');
                await sleep(300);
                console.log('🔘 "Marcações" marcado.');

                // Clica em "Importar"
                await page.waitForSelector('.buttonImportar');
                await page.click('.buttonImportar');
                await sleep(1000);
                console.log('📨 Importação de "Marcações" concluída.');

            } catch (innerErr) {
                console.error(`❌ Erro na 2ª importação para o relógio ${i}: ${innerErr.message}`);
                continue;
            }
        }

        // 4. Iterar por todos os relógios para fazer a 3ª importação (Status Completo e Status Imediato novamente)
        for (let i = 1; i <= 28; i++) {
            const ADVANCED_PAGE_URL = `${ADVANCED_PAGE_BASE_URL}${i}`;
            console.log(`\n🔄 Processando 3ª importação para o relógio ${i}...`);

            try {
                await page.goto(ADVANCED_PAGE_URL, { waitUntil: 'networkidle2' });
                await sleep(500); // 🕒 delay

                await page.waitForSelector('#TabExportarDados', { visible: true, timeout: 5000 });

                await page.evaluate(() => {
                    const exportTab = document.querySelector('#TabExportarDados');
                    if (exportTab) exportTab.scrollIntoView({ behavior: "smooth", block: "center" });
                });
                await sleep(500);

                await page.waitForFunction(() => {
                    const el = document.querySelector('#TabExportarDados');
                    return el && el.offsetParent !== null;
                }, { timeout: 3000 });

                await page.click('#TabExportarDados');
                await sleep(500);
                console.log('📁 Aba "Comandos do Relógio" aberta.');

                // Seleciona "Importar"
                await page.waitForSelector('label[for="radioFunctionImportar"]');
                await page.click('label[for="radioFunctionImportar"]');
                await sleep(300);
                console.log('☑️ Opção "Importar" selecionada novamente para "Status Completo" e "Status Imediato".');

                // Marca "Status Completo"
                await page.waitForSelector('label[for="checkboxImportarStatusCompleto"]');
                await page.click('label[for="checkboxImportarStatusCompleto"]');
                await sleep(300);
                console.log('🔘 "Status Completo" marcado.');

                // Marca "Status Imediato"
                await page.waitForSelector('label[for="checkboxImportarStatusImediato"]');
                await page.click('label[for="checkboxImportarStatusImediato"]');
                await sleep(300);
                console.log('🔘 "Status Imediato" marcado.');

                // Clica em "Importar"
                await page.waitForSelector('.buttonImportar');
                await page.click('.buttonImportar');
                await sleep(1000);
                console.log('📨 Importação de "Status Completo" e "Status Imediato" concluída novamente.');

            } catch (innerErr) {
                console.error(`❌ Erro na 3ª importação para o relógio ${i}: ${innerErr.message}`);
                continue;
            }
        }

    } catch (globalErr) {
        console.error('❌ Erro geral na automação:', globalErr.message);
    } finally {
        await browser.close();
        console.log('🔒 Navegador encerrado.');
    }
};

runAutomation();
