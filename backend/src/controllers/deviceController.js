const { sql } = require("../config/db");

exports.createDevice = async (req, res) => {
  try {
    const { name, voltage, monthly_kwh } = req.body;
    const userId = parseInt(req.userId);

    if (isNaN(userId)) {
      return res.status(401).json({ error: "Usuário inválido ou não autenticado" });
    }

    const result = await sql`
      INSERT INTO devices (name, voltage, monthly_kwh, user_id)
      VALUES (${name}, ${voltage}, ${monthly_kwh}, ${userId})
      RETURNING *
    `;

    const newDevice = result[0];

    const dailyKwh = Number(monthly_kwh) / 30;
    const hourlyKwh = dailyKwh / 24;
    const estimatedBaseWatts = hourlyKwh * 1000;

    await sql`
      INSERT INTO consumption (device_name, watts, user_id, created_at)
      VALUES 
        (${name}, ${estimatedBaseWatts}::numeric, ${userId}, (NOW() - INTERVAL '3 days')),
        (${name}, (${estimatedBaseWatts} * 1.15)::numeric, ${userId}, (NOW() - INTERVAL '2 days')),
        (${name}, (${estimatedBaseWatts} * 0.90)::numeric, ${userId}, (NOW() - INTERVAL '1 day'))
    `;

    console.log(`✨ Histórico de consumo retroativo gerado para o dispositivo: ${name}`);

    res.status(201).json(newDevice);
  } catch (error) {
    console.error("ERRO CRÍTICO NO BANCO DE DADOS:", error.message);
    res.status(500).json({ error: "Erro ao cadastrar dispositivo" });
  }
};

exports.getDevices = async (req, res) => {
  try {
    const userId = req.userId;

    const result = await sql`
      SELECT id, name, voltage, monthly_kwh
      FROM devices
      WHERE user_id = ${userId}
    `;

    res.json(result);
  } catch (error) {
    console.error("Erro ao buscar devices:", error);
    res.status(500).json({
      error: "Erro ao buscar dispositivos",
      details: error.message
    });
  }
};