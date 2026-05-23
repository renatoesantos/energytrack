module.exports = {
  API_URL: env => env.API_URL,

  INTERVAL: env => parseInt(env.INTERVAL) || 5000,

  USE_FAKE_TIME: false,

  DEVICES: [
    {
      name: "Geladeira",
      monthly_kwh: 45,
      alwaysOn: true,
    },
    {
      name: "TV",
      monthly_kwh: 15,
      schedule: { start: 18, end: 23 },
    },
    {
      name: "Chuveiro",
      monthly_kwh: 120,
      schedule: [
        { start: 7, end: 8 },
        { start: 19, end: 20 }
      ],
    },
    {
      name: "Ar Condicionado",
      monthly_kwh: 200,
      schedule: { start: 22, end: 6 },
    },
    {
      name: "Computador",
      monthly_kwh: 40,
      schedule: { start: 9, end: 17 },
    }
  ]
};