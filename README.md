[![CircleCI](https://circleci.com/gh/JoaoVitor2344/promotions.svg?style=svg)](https://circleci.com/gh/JoaoVitor2344/promotions)

# 🤖 Bot de Promoções Automatizado para Telegram

## 📋 Visão Geral

Este projeto é um sistema automatizado robusto e inteligente para monitorar, analisar, priorizar e publicar promoções de múltiplos varejistas diretamente em um canal do Telegram. O sistema monetiza os links utilizando IDs de afiliado, focando em velocidade e relevância para a audiência.

## 🚀 Principais Funcionalidades

- **Monitoramento Automático**: O robô "Vigia" monitora sites agregadores de promoções (como Pelando, Promobit) 24/7 em busca de novas ofertas
- **Análise e Priorização Inteligente**: Cada promoção é analisada e recebe uma nota de prioridade, garantindo que as ofertas mais quentes ("bugs", erros de preço, descontos agressivos) sejam publicadas primeiro
- **Monetização Automática**: Os links das ofertas são automaticamente convertidos para links de afiliado das lojas suportadas (Amazon, Mercado Livre, Shopee, AliExpress)
- **Fila de Processamento Robusta**: Utiliza uma fila de prioridades com Redis para gerenciar as ofertas, garantindo performance e resiliência
- **Publicação no Telegram**: Envia mensagens formatadas e prontas para o seu canal, de forma totalmente autônoma
- **Arquitetura Modular**: Fácil de manter e estender para suportar novas lojas ou novas fontes de promoções

## 🏗️ Arquitetura do Sistema

O sistema opera através de um pipeline de módulos, cada um com uma responsabilidade clara:

### 1. Vigia

O ponto de partida. Um processo agendado que varre os sites de promoções em busca de novas ofertas e coleta os dados brutos.

### 2. Analisador

Cada oferta coletada é analisada para receber uma nota de prioridade. Esta análise pode ser feita por regras predefinidas ou, futuramente, por uma IA como o Gemini.

### 3. Fila de Prioridade

As ofertas analisadas são colocadas em uma fila no Redis, ordenadas pela sua prioridade.

### 4. Workers

Processos que rodam em background e consomem a fila. Para cada item, eles executam 3 tarefas:

- **Cleaner**: Limpa o link do agregador para obter a URL final do produto
- **Monetizer**: Adiciona o ID de afiliado correto à URL
- **Carteiro**: Formata e envia a mensagem final para o Telegram

## 🛠️ Tecnologias Utilizadas

- **Plataforma/Backend**: Node.js
- **Agendamento de Tarefas**: node-cron
- **Fila de Prioridade e Cache**: Redis
- **Banco de Dados (Histórico e Logs)**: PostgreSQL
- **Interação com Banco de Dados (ORM)**: Prisma
- **Web Scraping**: Playwright / Puppeteer
- **Gestão de Configuração**: Arquivos de ambiente (.env) com a biblioteca dotenv

## 🏁 Como Começar

### Pré-requisitos

- Node.js (versão 18 ou superior)
- PostgreSQL
- Redis
- Uma conta de bot no Telegram e o Token de acesso

### Instalação

1. Clone o repositório:

   ```bash
   git clone https://github.com/seu-usuario/bot-promocoes.git
   cd bot-promocoes
   ```

2. Instale as dependências:

   ```bash
   npm install
   ```

3. Configure o Prisma:

   ```bash
   npx prisma generate
   npx prisma migrate dev --name init
   ```

4. Configure as variáveis de ambiente:
   - Renomeie o arquivo `.env.example` para `.env`
   - Abra o arquivo `.env` e preencha com suas chaves de API, tokens e IDs de afiliado

## ▶️ Como Executar

O sistema é dividido em dois processos principais que devem ser executados em terminais separados:

### 1. Iniciar os Workers

Este processo ficará ativo, esperando por tarefas na fila do Redis:

```bash
npm run start:worker
```

### 2. Iniciar o Agendador (Scraper)

Este processo iniciará o agendador node-cron, que irá disparar o scraper no intervalo definido no seu `.env`:

```bash
npm run start:scheduler
```

Agora o bot está totalmente operacional! O agendador irá encontrar promoções, colocá-las na fila, e os workers irão processá-las e enviá-las para o seu canal do Telegram.

## 📜 Licença

Este projeto está sob a licença MIT. Veja o arquivo LICENSE para mais detalhes.
