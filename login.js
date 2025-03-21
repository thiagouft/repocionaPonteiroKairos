import puppeteer from "puppeteer";
import dotenv from "dotenv";

// Carregar variáveis do arquivo .env
dotenv.config();

const LOGIN_URL = "https://www.dimepkairos.com.br";
const ADVANCED_PAGE_URL =
  "https://www.dimepkairos.com.br/Dimep/Relogios/Advanced/5";

// Pegando credenciais do .env
const username = process.env.LOGIN;
const password = process.env.SENHA;

// 🔹 Função para obter a data do dia anterior
const getPreviousDate = () => {
  const date = new Date();
  date.setDate(date.getDate() - 1);
  const day = String(date.getDate()).padStart(2, "0");
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const year = date.getFullYear();
  return `${day}/${month}/${year}`;
};

// 🔹 Defina a data (ou use a data do dia anterior se não fornecida)
const DATA_PERSONALIZADA = process.argv[2] || getPreviousDate();

const runAutomation = async () => {
  console.log("🔄 Iniciando automação...");

  // 1️⃣ Inicializar o navegador
  const browser = await puppeteer.launch({ headless: false }); // Alterne para true se não precisar ver o navegador
  const page = await browser.newPage();

  try {
    // 2️⃣ Acessar a página de login
    await page.goto(LOGIN_URL, { waitUntil: "networkidle2" });
    console.log("✅ Acessou a página de login");

    // 3️⃣ Preencher o campo de login
    await page.waitForSelector("#LogOnModel_UserName");
    await page.type("#LogOnModel_UserName", username, { delay: 100 });

    // 4️⃣ Preencher o campo de senha
    await page.waitForSelector("#LogOnModel_Password");
    await page.type("#LogOnModel_Password", password, { delay: 100 });

    // 5️⃣ Clicar no botão "Entrar"
    await page.waitForSelector("#btnFormLogin");
    await page.click("#btnFormLogin");

    console.log("🔑 Tentando fazer login...");

    // 6️⃣ Esperar a navegação pós-login
    await page.waitForNavigation({ waitUntil: "networkidle2" });
    console.log("✅ Login realizado com sucesso!");

    // 7️⃣ Acessar a página desejada
    await page.goto(ADVANCED_PAGE_URL, { waitUntil: "networkidle2" });
    console.log('✅ Página de "Reposição de Ponteiro" acessada.');

    // 8️⃣ Clicar na aba "Reposição do Ponteiro"
    await page.waitForSelector("#TabReposicaoPonteiro");
    await page.click("#TabReposicaoPonteiro");
    console.log('✅ Aba "Reposição do Ponteiro" foi selecionada.');

    // 9️⃣ Selecionar "A partir da data"
    await page.waitForSelector('label[for="radioAPartirDeData"]');
    await page.click('label[for="radioAPartirDeData"]');
    console.log('📆 "A partir da data" foi selecionado.');

    // 🔟 Inserir a data personalizada no campo de entrada
    await page.waitForSelector("#textboxData");
    await page.evaluate((data) => {
      const dateInput = document.querySelector("#textboxData");
      dateInput.value = "";
      dateInput.value = data;
    }, DATA_PERSONALIZADA);
    console.log(`📅 Data "${DATA_PERSONALIZADA}" foi inserida.`);

    // 1️⃣1️⃣ Clicar no botão "Enviar"
    await page.waitForSelector(".questionReposicaoPonteiro");
    await page.click(".questionReposicaoPonteiro");
    console.log("🚀 Requisição enviada!");

    // 1️⃣2️⃣ Aguardar o modal de confirmação e clicar no botão "Sim"
    console.log("⏳ Aguardando a caixa de confirmação...");
    await page.waitForSelector("#bReposicaoPonteiro", {
      visible: true,
      timeout: 5000,
    });
    await page.click("#bReposicaoPonteiro");
    console.log('✔️ Clique no botão "Sim" confirmado!');

    // 1️⃣3️⃣ Clicar na aba "Comandos do Relógio"
    await page.waitForSelector("#TabExportarDados");
    await page.click("#TabExportarDados");
    console.log('✅ Aba "Comandos do Relógio" foi selecionada.');

    // 1️⃣4️⃣ Selecionar a opção "Importar"
    await page.waitForSelector('label[for="radioFunctionImportar"]');
    await page.click('label[for="radioFunctionImportar"]');
    console.log('📥 Opção "Importar" foi selecionada.');

    // 1️⃣5️⃣ Marcar o checkbox "Marcações"
    await page.waitForSelector('label[for="checkImportarMarcacoes"]');
    await page.click('label[for="checkImportarMarcacoes"]');
    console.log('✅ Checkbox "Marcações" foi marcado.');

    // 1️⃣6️⃣ Clicar no botão "Importar"
    await page.waitForSelector(".buttonImportar");
    await page.click(".buttonImportar");
    console.log("🚀 Dados importados com sucesso!");

    // 📸 *Opcional: Capturar screenshot após a conclusão*
    await page.screenshot({ path: "importacao_concluida.png" });
    console.log('📸 Screenshot salva como "importacao_concluida.png".');
  } catch (error) {
    console.error("❌ Erro durante a automação:", error);
  } finally {
    // 1️⃣7️⃣ Fechar o navegador
    await browser.close();
    console.log("🔒 Navegador fechado.");
  }
};

// Executar automação
runAutomation();
