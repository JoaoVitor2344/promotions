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
const { scheduleAll } = require('./services/schedulerService');

scheduleAll();

app.use('/promotions', promotionRoutes);
app.use('/affiliates', affiliateRoutes);
app.use('/schedules', scheduleRoutes);
app.use('/send-logs', sendLogRoutes);
app.use('/amazon', amazonRoutes);
app.use('/shopee', shopeeRoutes);
app.use('/mercadolivre', mercadoLivreRoutes);

// Endpoint de teste
app.get('/', (req, res) => {
  res.send('API de Promoções rodando!');
});

app.listen(PORT, () => {
  console.log(`Servidor rodando na porta ${PORT}`);
}); 