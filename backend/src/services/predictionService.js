function linearRegression(data) {
  const n = data.length;

  if (n === 0) return null;

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

  const slope =
    (n * sumXY - sumX * sumY) /
    (n * sumX2 - sumX * sumX);

  const intercept = (sumY - slope * sumX) / n;

  return { slope, intercept };
}

function predictNext(data, steps = 5) {
  const model = linearRegression(data);

  if (!model) return [];

  const predictions = [];

  const start = data.length;

  for (let i = 0; i < steps; i++) {
    const x = start + i;
    const y = model.slope * x + model.intercept;

    predictions.push(Math.max(0, y));
  }

  return predictions;
}

module.exports = { predictNext };