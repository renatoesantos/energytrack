const { sql } = require("../config/db");
const { calculateMetrics } = require("../services/energyService");
const { generateAlerts } = require("../services/energyService");
const { getHighestConsumption } = require("../services/energyService");
const { predictNext } = require("../services/predictionService");

// Criar registro de consumo
exports.createConsumption = async (req, res) => {
  try {
    const { device_name, watts, device_id } = req.body;
    const userId = req.userId;

    const result = await sql`
      INSERT INTO consumption (device_name, watts, user_id, device_id)
      VALUES (${device_name}, ${watts}, ${userId}, ${device_id || null})
      RETURNING *
    `;

    const io = req.app.get("io");
    io.to(userId.toString()).emit("update-device", {
      device_name,
      watts,
      device_id,
      updated_at: new Date()
    });

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
      AND created_at >= NOW() - INTERVAL '1 hour'
      ORDER BY created_at DESC
      LIMIT 100
      `;
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
      SELECT id, device_name, watts, user_id, device_id, created_at 
      FROM consumption
      WHERE user_id = ${userId}
      AND DATE(created_at) = CURRENT_DATE
      ORDER BY created_at ASC
    `;

    console.log(`🔍 DEBUG INTERNO: Encontrados ${result.length} registros. Primeiro registro:`, result[0] ? result[0] : "Nenhum");

    const metrics = calculateMetrics(result);
    const alerts = generateAlerts(result);
    const highest = getHighestConsumption(result);

    res.json({ ...metrics, alerts, highestDevice: highest });

  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao calcular métricas" });
  }
};

exports.getConsumptionByPeriod = async (req, res) => {
  try {
    const userId = req.userId;
    const { period } = req.query;

    let query;

    if (period === "day") {
      query = sql`
        SELECT 
          EXTRACT(HOUR FROM created_at) AS label,
          ROUND(AVG(watts)::numeric, 2)::float AS total_watts
        FROM consumption
        WHERE user_id = ${userId}
        AND created_at >= (NOW() AT TIME ZONE 'America/Sao_Paulo' - INTERVAL '1 day')
        GROUP BY label
        ORDER BY label
      `;
    }
    else if (period === "week") {
      query = sql`
        SELECT 
          TO_CHAR(created_at, 'Dy') AS label,
          ROUND(AVG(watts)::numeric, 2)::float AS total_watts
        FROM consumption
        WHERE user_id = ${userId}
        AND created_at >= NOW() - INTERVAL '7 days'
        GROUP BY label, EXTRACT(DOW FROM created_at)
        ORDER BY EXTRACT(DOW FROM created_at) ASC
      `;
    }
    else if (period === "month") {
      query = sql`
        SELECT 
          TO_CHAR(created_at, 'DD/MM') AS label,
          ROUND(AVG(watts)::numeric, 2)::float AS total_watts
        FROM consumption
        WHERE user_id = ${userId}
        AND created_at >= NOW() - INTERVAL '30 days'
        GROUP BY label
        ORDER BY label
      `;
    }
    else {
      return res.status(400).json({ error: "Período inválido" });
    }

    const result = await query;

    res.json(result);
  } catch (error) {
    console.error(error);
    res.status(500).json({ error: "Erro ao gerar gráfico" });
  }
};

exports.getPrediction = async (req, res) => {
  try {
    const userId = req.userId

    const result = await sql`
      SELECT 
        DATE(created_at)::text AS date,
        AVG(watts)::float AS avg_watts
      FROM consumption
      WHERE user_id = ${userId}
      GROUP BY DATE(created_at)
      ORDER BY DATE(created_at) ASC
    `;

    console.log("📊 DEBUG PREDIÇÃO - Histórico formatado:", result);

    const predictions = predictNext(result, 5);

    res.json({
      history: result,
      predictions: predictions.map(p => Number(p) || 0)
    });

  } catch (error) {
    console.error("Erro na rota de predição:", error);
    res.status(500).json({ error: "Erro na previsão" });
  }
};