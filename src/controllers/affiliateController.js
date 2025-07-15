const prisma = require('../models/affiliate');

// Listar afiliados
exports.getAllAffiliates = async (req, res) => {
  try {
    const affiliates = await prisma.affiliate.findMany();
    res.json(affiliates);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar afiliados.' });
  }
};

// Criar afiliado
exports.createAffiliate = async (req, res) => {
  const { name, baseUrl, params, platform } = req.body;
  try {
    const affiliate = await prisma.affiliate.create({
      data: { name, baseUrl, params, platform },
    });
    res.status(201).json(affiliate);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar afiliado.' });
  }
};

// Editar afiliado
exports.updateAffiliate = async (req, res) => {
  const { id } = req.params;
  const { name, baseUrl, params, platform } = req.body;
  try {
    const affiliate = await prisma.affiliate.update({
      where: { id: Number(id) },
      data: { name, baseUrl, params, platform },
    });
    res.json(affiliate);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar afiliado.' });
  }
};

// Deletar afiliado
exports.deleteAffiliate = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.affiliate.delete({ where: { id: Number(id) } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar afiliado.' });
  }
}; 