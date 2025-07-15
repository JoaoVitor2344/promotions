const prisma = require('../models/schedule');

// Listar agendamentos
exports.getAllSchedules = async (req, res) => {
  try {
    const schedules = await prisma.schedule.findMany({ include: { promotion: true } });
    res.json(schedules);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao buscar agendamentos.' });
  }
};

// Criar agendamento
exports.createSchedule = async (req, res) => {
  const { promotionId, chatId, cron, active } = req.body;
  try {
    const schedule = await prisma.schedule.create({
      data: { promotionId, chatId, cron, active },
    });
    res.status(201).json(schedule);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao criar agendamento.' });
  }
};

// Editar agendamento
exports.updateSchedule = async (req, res) => {
  const { id } = req.params;
  const { promotionId, chatId, cron, active } = req.body;
  try {
    const schedule = await prisma.schedule.update({
      where: { id: Number(id) },
      data: { promotionId, chatId, cron, active },
    });
    res.json(schedule);
  } catch (error) {
    res.status(500).json({ error: 'Erro ao atualizar agendamento.' });
  }
};

// Deletar agendamento
exports.deleteSchedule = async (req, res) => {
  const { id } = req.params;
  try {
    await prisma.schedule.delete({ where: { id: Number(id) } });
    res.status(204).send();
  } catch (error) {
    res.status(500).json({ error: 'Erro ao deletar agendamento.' });
  }
}; 