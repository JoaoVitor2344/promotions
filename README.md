# Automatização de Promoções no Telegram

## Documentação da API

### Endpoints Principais

#### Promoções (`/promotions`)

- `GET /promotions` — Lista todas as promoções cadastradas.
- `POST /promotions` — Cria uma nova promoção.
- `PUT /promotions/:id` — Edita uma promoção existente.
- `DELETE /promotions/:id` — Remove uma promoção.
- `POST /promotions/:id/send-telegram` — Envia a promoção para o Telegram.
- `GET /promotions/pending` — Lista promoções pendentes de aprovação.
- `POST /promotions/:id/approve` — Aprova uma promoção manualmente.
- `POST /promotions/auto-approve` — Aprova automaticamente promoções pendentes.

#### Afiliados (`/affiliates`)

- `GET /affiliates` — Lista todos os afiliados cadastrados.
- `POST /affiliates` — Cria um novo afiliado.
- `PUT /affiliates/:id` — Edita um afiliado existente.
- `DELETE /affiliates/:id` — Remove um afiliado.

#### Agendamentos (`/schedules`)

- `GET /schedules` — Lista todos os agendamentos.
- `POST /schedules` — Cria um novo agendamento.
- `PUT /schedules/:id` — Edita um agendamento existente.
- `DELETE /schedules/:id` — Remove um agendamento.

#### Logs de Envio (`/send-logs`)

- `GET /send-logs` — Lista os logs de envios realizados.

#### Scraping Magalu (`/scraping/magalu/import`)

- `POST /scraping/magalu/import` — Importa promoções do Magalu via scraping.

#### Importação de Promoções por Parceiro

- `POST /aliexpress/import` — Importa promoções do AliExpress.
- `POST /amazon/import` — Importa promoções da Amazon.
- `POST /mercadolivre/import` — Importa promoções do Mercado Livre.
- `POST /shopee/import` — Importa promoções da Shopee.
