function calculateDailyAverage(consumptions) {
  if (consumptions.length === 0) return 0;

  // ordenar por data
  const sorted = consumptions.sort(
    (a, b) => new Date(a.created_at) - new Date(b.created_at)
  );

  const firstDate = new Date(sorted[0].created_at);
  const lastDate = new Date(sorted[sorted.length - 1].created_at);

  const diffTime = lastDate - firstDate;

  // converter ms → dias
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) || 1;

  // somar consumo total (kWh)
  let totalWatts = 0;
  sorted.forEach((item) => {
    totalWatts += Number(item.watts);
  });

  //const totalKwh = totalWatts / 1000;
  const average = totalWatts / consumptions.length || 0;
  const totalKwh = (average * consumptions.length) / 1000;

  const dailyAverage = totalKwh / diffDays;

  return dailyAverage.toFixed(2);
}

// Encontrar dispositivo com maior consumo
function getHighestConsumption(consumptions) {
  if (!consumptions || consumptions.length === 0) {
    return null;
  }

  return consumptions.reduce((max, item) => {
    return Number(item.watts) > Number(max.watts) ? item : max;
  });
}

function calculateMetrics(consumptions) {
  const tarifa = 0.85; // R$/kWh (ajustável)

  let totalWatts = 0;

  consumptions.forEach((item) => {
    totalWatts += Number(item.watts);
  });

  const average = totalWatts / consumptions.length || 0;
  const totalKwh = (average * consumptions.length) / 1000;
  const estimatedCost = totalKwh * tarifa;
  const max = Math.max(...consumptions.map(c => c.watts));
  const dailyAvg = calculateDailyAverage(consumptions);
  const monthlyPrediction = dailyAvg * 30;

  return {
    totalWatts,
    totalKwh: totalKwh.toFixed(2),
    estimatedCost: estimatedCost.toFixed(2),
    averageWatts: average.toFixed(2),
    maxWatts: max,
    dailyAvg: dailyAvg,
    monthlyPrediction: monthlyPrediction.toFixed(2)
  };
}

// Gerar alertas inteligentes para consumos anormais
function generateAlerts(consumptions) {
  const alerts = [];
  const seenDevices = new Set();
  const now = new Date();

  consumptions.forEach((item) => {
    const diffMinutes = (now - new Date(item.created_at)) / 60000;

    if (item.watts > 500 && diffMinutes < 10) {
      alerts.push({
        type: "high_consumption",
        message: `Alto consumo em ${item.device_name}`
      });

      seenDevices.add(item.device_name);
    }
  });

  return alerts.slice(0, 5);
}

module.exports = { calculateMetrics, generateAlerts, getHighestConsumption };