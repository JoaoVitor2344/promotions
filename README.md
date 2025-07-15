# Automatização de Promoções no Telegram

## Divisão do Projeto em 6 Partes

---

### Parte 1: Cadastro e Gerenciamento de Promoções
- ✔️ Cadastro manual de promoções (título, descrição, link original, imagem, etc.)
- ✔️ Edição e exclusão de promoções
- ✔️ Listagem das promoções cadastradas

---

### Parte 2: Vinculação e Personalização do Link de Afiliado
- ✔️ Cadastro do(s) link(s) de afiliado no sistema
- ✔️ Automatização para transformar o link original em link de afiliado
- ✔️ Validação para garantir que todo link enviado tenha o parâmetro de afiliado

---

### Parte 3: Integração com o Telegram
- ✔️ Criação e configuração do bot do Telegram
- ✔️ Envio manual de promoções para grupos/canais
- ✔️ Testes de envio e recebimento das mensagens

---

### Parte 4: Automatização e Agendamento
- ✔️ Agendamento de envios automáticos (ex: promoções diárias, horários específicos)
- ✔️ Painel para configurar horários e frequência dos envios (via API)
- ✔️ Logs/histórico dos envios realizados

---

### Parte 5: Remover partes manuais e vincular com APIs de promoção
- ✔️ Integrar com APIs de afiliados (ex: Amazon, Shopee, Awin, Magalu, Rakuten, etc.) para buscar promoções automaticamente (iniciado com RSS do Promobit)
- ✔️ Utilizar feeds RSS de sites de promoções (ex: Promobit, Pelando, Cuponomia) para importar ofertas em tempo real
- ✔️ Implementar scraping para buscar promoções em sites que não possuem API ou RSS (Magalu)
- ✔️ Automatizar o envio das promoções para o Telegram sem intervenção manual
- ✔️ Salvar promoções no banco e evitar envios duplicados
- ✔️ (Opcional) Moderar/editar promoções antes do envio automático
- [ ] (Opcional) Integrar algoritmos de IA para monitoramento de preços, seleção de melhores ofertas, etc.

---

### Parte 6: Integração com APIs de Afiliados

#### Amazon Afiliados (Product Advertising API)
- ✔️ Criar estrutura de integração e importação mock
- ✔️ Leitura de credenciais do .env e estrutura para integração real
- ✔️ Criar conta de afiliado e obter credenciais (Access Key, Secret Key, Associate Tag)
  - Instrução: Cadastre-se em https://affiliate-program.amazon.com/ e gere suas credenciais na área de Product Advertising API.
- ✔️ Implementar integração real para buscar produtos e promoções (função pronta para receber dados reais)
- ✔️ Gerar links de afiliado e salvar promoções no banco
- ✔️ Agendar buscas automáticas por categoria/palavra-chave

#### Shopee Partners API
- ✔️ Criar estrutura de integração e importação mock
- ✔️ Leitura de credenciais do .env e estrutura para integração real
- ✔️ Criar conta de afiliado e obter credenciais (Partner ID, Partner Key)
  - Instrução: Cadastre-se em https://affiliate.shopee.com.br/ e gere suas credenciais na área de parceiros.
- ✔️ Implementar integração real para buscar produtos e promoções (função pronta para receber dados reais)
- ✔️ Gerar links de afiliado e salvar promoções no banco
- ✔️ Agendar buscas automáticas por categoria/palavra-chave

#### Mercado Livre (via Lomadee/Awin)
- ✔️ Criar estrutura de integração e importação mock
- ✔️ Leitura de credenciais do .env e estrutura para integração real
- ✔️ Criar conta de afiliado em Lomadee/Awin
  - Instrução: Cadastre-se em https://www.lomadee.com/ ou https://www.awin.com/ e gere suas credenciais.
- ✔️ Usar API pública do Mercado Livre para buscar produtos
- ✔️ Gerar links de afiliado via Lomadee/Awin
- ✔️ Salvar promoções no banco
- ✔️ Agendar buscas automáticas por categoria/palavra-chave

#### AliExpress (via Awin ou Portals)
- ✔️ Criar estrutura de integração e importação mock
- ✔️ Leitura de credenciais do .env e estrutura para integração real
- ✔️ Criar conta de afiliado em Awin ou Portals
  - Instrução: Cadastre-se em https://www.awin.com/ ou https://portals.aliexpress.com/ e gere suas credenciais.
- ✔️ Obter acesso à API ou feed de ofertas
- ✔️ Buscar ofertas e gerar links de afiliado
- ✔️ Salvar promoções no banco
- ✔️ Agendar buscas automáticas por categoria/palavra-chave

---

## Ideias e Fontes para Automação de Promoções

#### Plataformas com API para promoções
- **Amazon Afiliados (Product Advertising API):** Buscar produtos, preços e links com tracking por categoria ou palavra-chave
- **Awin (AliExpress, Booking, etc.):** Acesso a links de ofertas por API ou feed CSV/XML
- **Shopee Partners API:** Links de produtos, comissão, categorias
- **Lomadee / Magalu Parceiro / Rakuten Ads:** APIs privadas, planilhas ou RSS

#### Usar Feeds RSS de Sites de Promoções
- Exemplo: [Promobit RSS](https://www.promobit.com.br/promocoes.rss), Pelando, Cuponomia
- Automatizar leitura e importação das promoções

#### Automatizar envio para o Telegram
- Agendar buscas automáticas (ex: a cada 10 minutos)
- Salvar promoções no banco para evitar duplicidade
- Formatar e enviar mensagens automaticamente para grupos/canais

#### Alternativas avançadas com IA
- [ ] Scraping de sites como Americanas, Submarino, Magalu
- [ ] Monitoramento de preços (ex: camelcamelcamel para Amazon)
- [ ] Algoritmos para selecionar melhores ofertas

#### Painel próprio (opcional)
- ✔️ Receber, moderar e editar promoções importadas (via API)
- ✔️ Publicar manualmente ou aprovar para envio automático (via API)
