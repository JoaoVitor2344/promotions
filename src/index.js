const express = require('express');
const dotenv = require('dotenv');

// Configura variáveis de ambiente
dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());

const promotionRoutes = require('./routes/promotionRoutes');
const affiliateRoutes = require('./routes/affiliateRoutes');
const scheduleRoutes = require('./routes/scheduleRoutes');
const sendLogRoutes = require('./routes/sendLogRoutes');
const amazonRoutes = require('./routes/amazonRoutes');
const shopeeRoutes = require('./routes/shopeeRoutes');
const mercadoLivreRoutes = require('./routes/mercadoLivreRoutes');
const aliexpressRoutes = require('./routes/aliexpressRoutes');
const scrapingRoutes = require('./routes/scrapingRoutes');
const { scheduleAll } = require('./services/schedulerService');
const { scheduleAffiliateImports } = require('./services/affiliateAutoImportService');

scheduleAll();
scheduleAffiliateImports();

app.use('/promotions', promotionRoutes);
app.use('/affiliates', affiliateRoutes);
app.use('/schedules', scheduleRoutes);
app.use('/send-logs', sendLogRoutes);
app.use('/amazon', amazonRoutes);
app.use('/shopee', shopeeRoutes);
app.use('/mercadolivre', mercadoLivreRoutes);
app.use('/aliexpress', aliexpressRoutes);
app.use('/scraping', scrapingRoutes);

// Endpoint de teste
app.get('/', (req, res) => {
  res.send('API de Promoções rodando!');
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
}); 