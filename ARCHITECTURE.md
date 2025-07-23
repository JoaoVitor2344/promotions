/bot-promocoes/
│
├── 📁 prisma/
│ └── schema.prisma # Define o modelo do seu banco de dados PostgreSQL
│
├── 📁 src/
│ │
│ ├── 📁 config/
│ │ └── index.js # Carrega e exporta as variáveis de ambiente (.env)
│ │
│ ├── 📁 jobs/
│ │ └── promotionScraperJob.js # A lógica que o node-cron irá executar (o "Vigia")
│ │
│ ├── 📁 queue/
│ │ ├── promotionQueue.js # Lógica para adicionar e processar itens na fila do Redis
│ │ └── redisClient.js # Configuração da conexão com o Redis
│ │
│ ├── 📁 services/
│ │ ├── geminiService.js # (Opcional) Lógica para chamar a API do Gemini (o "Analista")
│ │ └── telegramService.js # Lógica para enviar mensagens para o Telegram (o "Carteiro")
│ │
│ ├── 📁 scrapers/
│ │ └── pelandoScraper.js # A implementação específica do scraper para o site Pelando
│ │
│ ├── 📁 workers/
│ │ └── promotionWorker.js # O Worker principal que executa o Cleaner e o Monetizer
│ │
│ └── 📁 utils/
│ ├── linkCleaner.js # Função para limpar e resolver os links (o "Cleaner")
│ └── affiliateMonetizer.js # Função para adicionar o ID de afiliado (o "Monetizer")
│
├── 📜 .env # ARQUIVO SECRETO: Suas chaves de API, tokens e senhas
├── 📜 .env.example # Exemplo de como o .env deve ser preenchido (seguro para o Git)
├── 📜 .gitignore # Ignora arquivos como node_modules e .env
├── 📜 package.json # Lista as dependências e scripts do projeto
├── 📜 README.md # Documentação principal do seu projeto
│
├── 📜 scheduler.js # Ponto de entrada para INICIAR o agendador (node-cron)
└── 📜 worker.js # Ponto de entrada para INICIAR os workers da fila
