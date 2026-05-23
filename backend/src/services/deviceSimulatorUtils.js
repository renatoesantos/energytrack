function calculateWattsFromKwh(device) {
    const monthlyKwh = device.monthly_kwh;

    const dailyKwh = monthlyKwh / 30;
    const hourlyKwh = dailyKwh / 24;

    const baseWatts = hourlyKwh * 1000;

    const variation = baseWatts * 0.2;

    return baseWatts + (Math.random() * variation - variation / 2);
}

function generateRealisticWatts(device, hour) {
  const baseWatts = calculateBaseWatts(device);

  if (!baseWatts || isNaN(baseWatts)) return 0;

  switch (device.name.toLowerCase()) {

    case "geladeira":
      return fridgeBehavior(baseWatts);

    case "ar condicionado":
      return acBehavior(baseWatts, hour);

    case "chuveiro":
      return showerBehavior(baseWatts);

    case "tv":
      return steadyBehavior(baseWatts);

    case "computador":
      return steadyBehavior(baseWatts);

    default:
      return baseWatts;
  }
}

function calculateBaseWatts(device) {
  const monthlyKwh = Number(device.monthly_kwh);

  if (!monthlyKwh || isNaN(monthlyKwh)) {
    console.warn("⚠️ monthly_kwh inválido:", device.name, device.monthly_kwh);
    return 0; // evita NaN
  }

  const dailyKwh = monthlyKwh / 30;
  const hourlyKwh = dailyKwh / 24;

  return hourlyKwh * 1000;
}

function fridgeBehavior(base) {
  const isOn = Math.random() > 0.4; // 60% ligada

  if (!isOn) return 0;

  return base + Math.random() * (base * 0.3);
}

function acBehavior(base, hour) {
  // mais forte à noite
  const factor = (hour >= 22 || hour <= 6) ? 1.2 : 0.6;

  return base * factor + Math.random() * 100;
}

function showerBehavior(base) {
  // picos curtos
  const isOn = Math.random() > 0.7;

  if (!isOn) return 0;

  return base * 5 + Math.random() * 500;
}

function steadyBehavior(base) {
  return base + (Math.random() * 20 - 10);
}

module.exports = {
  generateRealisticWatts
};