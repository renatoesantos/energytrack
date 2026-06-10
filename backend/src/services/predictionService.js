function linearRegression(data) {
  const n = data.length;

  if (n <= 1) return null;

  let sumX = 0;
  let sumY = 0;
  let sumXY = 0;
  let sumX2 = 0;

  data.forEach((point, index) => {
    const x = index; // tempo
    const y = Number(point.avg_watts);

    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumX2 += x * x;
  });

  const denominator = (n * sumX2 - sumX * sumX);

  if (denominator === 0) return null;

  const slope = (n * sumXY - sumX * sumY) / denominator;
  const intercept = (sumY - slope * sumX) / n;

  return { slope, intercept };
}

function predictNext(data, steps = 5) {
  if (!data || data.length === 0) {
    return Array(steps).fill(0);
  }

  if (data.length === 1) {
    const singleValue = parseFloat(data[0].avg_watts || data[0].AVG_WATTS) || 0;
    return Array(steps).fill(singleValue);
  }

  const n = data.length;
  let sumX = 0, sumY = 0, sumXY = 0, sumX2 = 0;

  data.forEach((point, index) => {
    const x = index;
    const y = parseFloat(point.avg_watts || point.AVG_WATTS) || 0;

    sumX += x;
    sumY += y;
    sumXY += x * y;
    sumX2 += x * x;
  });

  const denominator = (n * sumX2 - sumX * sumX);
  if (denominator === 0) {
    const lastValue = parseFloat(data[data.length - 1].avg_watts || data[data.length - 1].AVG_WATTS) || 0;
    return Array(steps).fill(lastValue);
  }

  const slope = (n * sumXY - sumX * sumY) / denominator;
  const intercept = (sumY - slope * sumX) / n;

  const predictions = [];
  const start = data.length;

  for (let i = 0; i < steps; i++) {
    const x = start + i;
    const y = slope * x + intercept;
    predictions.push(Math.max(0, y));
  }

  return predictions;
}

module.exports = { predictNext };