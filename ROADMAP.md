## Fase 1: Fundação e Setup

**Duração Estimada:** 1-2 dias  
**Objetivo:** Montar o esqueleto do projeto, configurar todas as ferramentas essenciais e garantir que as conexões básicas estejam funcionando.

### Milestone 1.1: Estrutura do Projeto

- [x] Iniciar um novo projeto Node.js (`npm init`)
- [x] Criar a estrutura de pastas principal conforme o documento de arquitetura
- [x] Iniciar o repositório Git (`git init`) e criar o primeiro commit

### Milestone 1.2: Configuração dos Bancos de Dados

- [x] Instalar e configurar o PostgreSQL localmente
- [x] Instalar o Prisma (`npm install prisma --save-dev`) e inicializá-lo (`npx prisma init`)
- [x] Definir o modelo de dados inicial no `schema.prisma` (ex: uma tabela Promotion para guardar o histórico)
- [x] Executar a primeira migração para criar a tabela no banco (`npx prisma migrate dev`)
- [ ] Instalar e configurar o Redis localmente

### Milestone 1.3: Configuração do Ambiente

- [x] Instalar o dotenv (`npm install dotenv`)
- [x] Criar o arquivo `.env.example` com todas as variáveis necessárias
- [x] Criar o arquivo `.env` (e adicioná-lo ao `.gitignore`)
- [x] Preencher o `.env` com as credenciais dos bancos de dados e o token do bot do Telegram

### Milestone 1.4: Conexão com Telegram

- [x] Criar o módulo `telegramService.js`
- [x] Implementar uma função simples `enviarMensagemTeste()` que envia um "Olá, Mundo!" para o seu canal, para validar o token e a conexão

---

## Fase 2: Construção do MVP - O Fluxo Central

**Duração Estimada:** 3-5 dias  
**Objetivo:** Criar a primeira versão funcional do bot, capaz de extrair uma promoção e publicá-la, ainda sem a complexidade da fila de prioridade.

### Milestone 2.1: Desenvolvimento do Scraper (Vigia)

- [x] Instalar o Playwright (`npm install playwright`)
- [x] Desenvolver a lógica no `pelandoScrapper.js` para:
  - Abrir a página do Pelando
  - Extrair o título, preço, loja e link da primeira promoção na página
- [x] Criar uma função principal `searchPromotions()` que retorna os dados extraídos

### Milestone 2.2: Implementação dos Processadores (Cleaner & Monetizer)

- [ ] Criar a função `limparLink()` em `linkCleaner.js` que resolve o redirecionamento
- [ ] Criar a função `monetizarLink()` em `affiliateMonetizer.js` que usa uma lógica if/else para adicionar o ID de afiliado correto com base na loja

### Milestone 2.3: Integração do Fluxo Simples

- [ ] Criar um script de teste `test-flow.js` que:
  - Chama `searchPromotions()`
  - Passa o resultado para `limparLink()`
  - Passa o resultado para `monetizarLink()`
  - Usa o `telegramService` para enviar a promoção formatada para o canal
- [ ] Refatorar e garantir que cada módulo funcione em conjunto

---

## Fase 3: Implementação da Inteligência e Resiliência

**Duração Estimada:** 2-4 dias  
**Objetivo:** Transformar o fluxo simples em um sistema robusto, introduzindo a fila de prioridades e a arquitetura de workers.

### Milestone 3.1: Integração com Redis

- [ ] Criar o `redisClient.js` para gerenciar a conexão
- [ ] Desenvolver o `promotionQueue.js` com duas funções principais:
  - `adicionarPromocao(promocao, prioridade)`
  - `buscarProximaPromocao()`

### Milestone 3.2: Refatoração para a Arquitetura de Fila

- [ ] Modificar o Scraper para, em vez de retornar os dados, adicioná-los à fila do Redis usando `adicionarPromocao()`
- [ ] Criar o ponto de entrada `worker.js`, que roda em um loop contínuo, chama `buscarProximaPromocao()` e, se houver uma, executa o fluxo de limpeza, monetização e envio
- [ ] Criar o ponto de entrada `scheduler.js`, que usa node-cron para chamar o Scraper no intervalo definido no `.env`

### Milestone 3.3: Implementação do Analisador de Prioridade

- [ ] Criar a função `analisarPrioridade(promocao)` que implementa as regras de if/else que definimos (baseado em palavras-chave, desconto, etc.)
- [ ] Integrar o analisador no Scraper, para que a prioridade seja calculada antes de adicionar a promoção à fila

---

## 🚀 Fase 4: Otimização e Expansão

**Duração:** Contínuo  
**Objetivo:** Melhorar a qualidade do sistema, adicionar novas funcionalidades e garantir que ele seja fácil de manter.

### Milestone 4.1: Melhorias e Logs

- [ ] Implementar o salvamento de cada promoção postada no banco de dados PostgreSQL para criar um histórico
- [ ] Adicionar um sistema de logs (ex: usando a biblioteca winston) para registrar erros e atividades importantes no banco de dados ou em arquivos
- [ ] Refinar o scraper para ser mais resiliente a pequenas mudanças no layout do site

### Milestone 4.2: Expansão de Funcionalidades

- [ ] (Opcional) Integrar o `geminiService.js` para usar a IA na análise de prioridade
- [ ] Desenvolver um novo scraper para uma segunda fonte (ex: `promobitScraper.js`)
- [ ] Criar um painel de controle simples (dashboard) para visualizar estatísticas básicas a partir dos dados do PostgreSQL
