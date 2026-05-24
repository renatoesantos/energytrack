require("dotenv").config();

const axios = require("axios");
const config = require("./config");
const { generateRealisticWatts } = require("../backend/src/services/deviceSimulatorUtils");

const BASE_URL = config.API_URL(process.env);
let TOKEN = null;
const INTERVAL = config.INTERVAL(process.env);

let fakeHour = 0;

let devices = [];

async function login() {
    try {
        const response = await axios.post(`${BASE_URL}/auth/login`, {
            email: process.env.SIMULATOR_EMAIL,
            password: process.env.SIMULATOR_PASSWORD
        });

        const token = response.data.token;

        console.log("🔐 Token obtido com sucesso");

        return token;
    } catch (error) {
        console.error("❌ Erro ao fazer login:", error.message);
        process.exit(1);
    }
}

async function startSimulator() {
    TOKEN = await login(); // 🔥 pega token automaticamente

    console.log("TOKEN:", TOKEN);
    await fetchDevices();

    setInterval(() => {
        devices.forEach(sendData);
    }, INTERVAL);

    setInterval(fetchDevices, 30000);
}

async function fetchDevices() {
    try {
        const response = await axios.get(`${BASE_URL}/devices`, {
            headers: {
                Authorization: `Bearer ${TOKEN}`
            }
        });

        const mapped = {};

        response.data.forEach(device => {
            const key = device.name.toLowerCase();

            mapped[key] = {
                device_name: device.name,
                watts: 0,
                ...device
            };
        });

        devices = response.data;

        console.log("📦 Dispositivos carregados:", devices.length);
    } catch (error) {
        console.error("Erro ao buscar dispositivos:", error.message);
    }
}

function getHour() {
    if (config.USE_FAKE_TIME) {
        fakeHour = (fakeHour + 1) % 24;
        return fakeHour;
    }
    return new Date().getHours();
}

startSimulator();


async function sendData(device) {
    const hour = getHour();

    const watts = generateRealisticWatts(device, hour);

    if (!watts || isNaN(watts)) {
        console.log("❌ Valor inválido ignorado:", device.name);
        return;
    }

    try {
        await axios.post(`${BASE_URL}/consumption`, {
            device_name: device.name,
            watts: watts.toFixed(2),
            device_id: device.id || null
        }, {
            headers: {
                Authorization: `Bearer ${TOKEN}`
            }
        });

        console.log(`📡 ${device.name}: ${watts.toFixed(2)}W`);
    } catch (error) {
        console.error("Erro ao enviar:", error.message);
    }
}

console.log("🚀 Simulador iniciado...");