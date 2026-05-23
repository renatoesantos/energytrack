const { sql } = require("../config/db");

exports.createDevice = async (req, res) => {
  try {
    const { name, voltage, monthly_kwh } = req.body;
    const userId = req.userId;

    const result = await sql`
      INSERT INTO devices (name, voltage, monthly_kwh, user_id)
      VALUES (${name}, ${voltage}, ${monthly_kwh}, ${userId})
      RETURNING *
    `;

    res.status(201).json(result[0]);
  } catch (error) {
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