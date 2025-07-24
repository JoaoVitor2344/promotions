const fs = require("fs");
const path = require("path");
const { execSync } = require("child_process");

// Script de configuração inicial para o projeto bot-promocoes
// Verifica dependências, arquivos de configuração e prepara o ambiente
console.log("Configuração inicial do Bot de Promoções\n");

// Verificar se o arquivo .env existe
console.log("Verificando arquivos de configuração...");
const envPath = path.join(__dirname, ".env");
const envExamplePath = path.join(__dirname, ".env.example");

if (!fs.existsSync(envPath)) {
  if (fs.existsSync(envExamplePath)) {
    console.log("Arquivo .env não encontrado. Copiando .env.example...");
    fs.copyFileSync(envExamplePath, envPath);
    console.log(
      "Arquivo .env criado. IMPORTANTE: Configure suas variáveis de ambiente!"
    );
  } else {
    console.log("Arquivo .env.example não encontrado!");
    process.exit(1);
  }
} else {
  console.log("Arquivo .env encontrado");
}

// Verificar dependências principais
console.log("\nVerificando dependências...");
const packageJsonPath = path.join(__dirname, "package.json");

if (!fs.existsSync(packageJsonPath)) {
  console.log('package.json não encontrado! Execute "npm init" primeiro.');
  process.exit(1);
}

const packageJson = JSON.parse(fs.readFileSync(packageJsonPath, "utf8"));
const requiredDeps = ["dotenv", "playwright", "node-telegram-bot-api"];

const missingDeps = requiredDeps.filter(
  (dep) =>
    !packageJson.dependencies?.[dep] && !packageJson.devDependencies?.[dep]
);

if (missingDeps.length > 0) {
  console.log(`Dependências ausentes: ${missingDeps.join(", ")}`);
  console.log("Instalando dependências...");

  try {
    execSync(`npm install ${missingDeps.join(" ")}`, { stdio: "inherit" });
    console.log("Dependências instaladas com sucesso!");
  } catch (error) {
    console.log("Erro ao instalar dependências:", error.message);
    process.exit(1);
  }
} else {
  console.log("Todas as dependências principais estão instaladas");
}

// Verificar se o Playwright está configurado
console.log("\nVerificando Playwright...");
try {
  execSync("npx playwright install chromium --with-deps", { stdio: "inherit" });
  console.log("Playwright configurado com sucesso!");
} catch (error) {
  console.log(
    "Aviso: Erro ao configurar Playwright. Execute manualmente: npx playwright install chromium"
  );
}

// Criar diretórios necessários
console.log("\nCriando diretórios...");
const dirs = ["logs", "screenshots"];

dirs.forEach((dir) => {
  const dirPath = path.join(__dirname, dir);
  if (!fs.existsSync(dirPath)) {
    fs.mkdirSync(dirPath, { recursive: true });
    console.log(`Diretório ${dir} criado`);
  } else {
    console.log(`Diretório ${dir} já existe`);
  }
});

// Verificar configurações críticas do .env
console.log("\nVerificando configurações críticas...");
require("dotenv").config();

const criticalVars = [
  "TELEGRAM_BOT_TOKEN",
  "TELEGRAM_CHANNEL_ID",
  "PELANDO_URL",
];

const missingVars = criticalVars.filter((varName) => !process.env[varName]);

if (missingVars.length > 0) {
  console.log(
    "ATENÇÃO: As seguintes variáveis críticas não estão configuradas no .env:"
  );
  missingVars.forEach((varName) => console.log(`   - ${varName}`));
  console.log("\nEdite o arquivo .env antes de executar o bot!");
} else {
  console.log("Todas as variáveis críticas estão configuradas");
}

console.log("\nConfiguração inicial concluída!");
console.log("\nPróximos passos:");
console.log("1. Configure suas variáveis de ambiente no arquivo .env");
console.log("2. Teste o fluxo com: node test-flow.js");
console.log(
  "3. Teste apenas a formatação com: node test-flow.js --format-only"
);
console.log("\nBoa sorte com seu bot de promoções!");
