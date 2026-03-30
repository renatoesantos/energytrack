const { sql } = require("../config/db");

// Criar registro de consumo
exports.createConsumption = async (req, res) => {
  try {
    const { device_name, watts } = req.body;
    const userId = req.userId; // vem do token

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