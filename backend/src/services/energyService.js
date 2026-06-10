function calculateDailyAverage(consumptions, intervalInSeconds = 3) {
  if (!consumptions || consumptions.length === 0) return 0;

  const sorted = consumptions.sort(
    (a, b) => new Date(a.created_at) - new Date(b.created_at)
  );

  const firstDate = new Date(sorted[0].created_at);
  const lastDate = new Date(sorted[sorted.length - 1].created_at);
  const diffTime = lastDate - firstDate;

  const totalHoursMonitored = (diffTime / (1000 * 60 * 60));

  if (totalHoursMonitored < 0.016) {
    return 0;
  }

  let sumWatts = 0;
  for (let i = 0; i < consumptions.length; i++) {
    sumWatts += parseFloat(consumptions[i].watts) || 0;
  }
  const avgWatts = sumWatts / consumptions.length;

  const kwPerHour = avgWatts / 1000;

  const dailyAverageEstimated = kwPerHour * 24;

  return Number(dailyAverageEstimated) || 0;
}

// Encontrar dispositivo com maior consumo
function getHighestConsumption(consumptions) {
  if (!consumptions || consumptions.length === 0) {
    return null;
  }

  return consumptions.reduce((max, item) => {
    return (parseFloat(item.watts) || 0) > (parseFloat(max.watts) || 0) ? item : max;
  });
}

function calculateMetrics(consumptions) {
  console.log(`🔍 DEBUG METRICAS: Processando ${consumptions?.length || 0} registros.`);

  const tarifa = 0.85; // R$/kWh
  const INTERVAL_SEG = 3;

  if (!consumptions || consumptions.length === 0) {
    return {
      totalWatts: 0,
      totalKwh: "0.00",
      estimatedCost: "0.00",
      averageWatts: "0.00",
      maxWatts: "0.00",
      dailyAvg: "0.00",
      monthlyPrediction: "0.00"
    };
  }

  let totalWattsSum = 0;
  let maxWatts = 0;

  for (let i = 0; i < consumptions.length; i++) {
    const watts = parseFloat(consumptions[i].watts) || 0;
    totalWattsSum += watts;
    if (watts > maxWatts) maxWatts = watts;
  }

  const averageWatts = totalWattsSum / consumptions.length;

  const sorted = [...consumptions].sort(
    (a, b) => new Date(a.created_at) - new Date(b.created_at)
  );
  const firstDate = new Date(sorted[0].created_at);
  const lastDate = new Date(sorted[sorted.length - 1].created_at);
  const totalHoursMonitored = (lastDate - firstDate) / (1000 * 60 * 60) || (INTERVAL_SEG / 3600);


  const totalKwh = (averageWatts / 1000) * totalHoursMonitored;
  const estimatedCost = totalKwh * tarifa;

  const dailyAvg = calculateDailyAverage(consumptions, INTERVAL_SEG);
  const monthlyPrediction = dailyAvg * 30;

  return {
    totalWatts: Math.round(totalWattsSum),
    totalKwh: totalKwh.toFixed(2),
    estimatedCost: estimatedCost.toFixed(2),
    averageWatts: averageWatts.toFixed(2),
    maxWatts: maxWatts.toFixed(2),
    dailyAvg: dailyAvg.toFixed(2),
    monthlyPrediction: monthlyPrediction.toFixed(2)
  };
}

function generateAlerts(consumptions) {
  const alerts = [];
  const now = new Date();

  const recentConsumptions = consumptions.slice(-20);

  recentConsumptions.forEach((item) => {
    const diffMinutes = (now - new Date(item.created_at)) / 60000;
    const watts = parseFloat(item.watts) || 0;

    if (watts > 500 && diffMinutes < 15) {
      alerts.push({
        type: "high_consumption",
        message: `Alto consumo em ${item.device_name}: ${watts.toFixed(0)}W`
      });
    }
  });

  const uniqueAlerts = Array.from(new Map(alerts.map(a => [a.message, a])).values());
  return uniqueAlerts.slice(0, 5);
}

module.exports = { calculateMetrics, generateAlerts, getHighestConsumption };