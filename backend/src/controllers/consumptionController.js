const { sql } = require("../config/db");
const { calculateMetrics } = require("../services/energyService");
const { generateAlerts } = require("../services/energyService");
const { getHighestConsumption } = require("../services/energyService");

// Criar registro de consumo
exports.createConsumption = async (req, res) => {
  try {
    const { device_name, watts } = req.body;
    const userId = req.userId;

    const result = await sql`
      INSERT INTO consumption (device_name, watts, user_id)
      VALUES (${device_name}, ${watts}, ${userId})
      RETURNING *
    `;

    res.status(201).json(result[0]);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao registrar consumo" });
  }
};

// Listar consumos
exports.getConsumptions = async (req, res) => {
  try {
    const result = await sql`
      SELECT * FROM consumption
      WHERE user_id = ${req.userId} 
      ORDER BY created_at DESC`;
    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao buscar dados" });
  }
};

// Calcular métricas de consumo
exports.getMetrics = async (req, res) => {
  try {
    const userId = req.userId;

    const result = await sql`
      SELECT * FROM consumption
      WHERE user_id = ${userId}
    `;

    const metrics = calculateMetrics(result);
    const alerts = generateAlerts(result);
    const highest = getHighestConsumption(result);

    res.json({ ...metrics, alerts, highestDevice: highest });
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao calcular métricas" });
  }
};

exports.getConsumptionByHour = async (req, res) => {
  try {
    const userId = req.userId;

    const result = await sql`
      SELECT 
        EXTRACT(HOUR FROM created_at) AS hour,
        SUM(watts) AS total_watts
      FROM consumption
      WHERE user_id = ${userId}
      GROUP BY hour
      ORDER BY hour
    `;

    res.json(result);
  } catch (error) {
    res.status(500).json({ error: "Erro ao gerar gráfico por horário" });
  }
};