import { useEffect, useState } from "react";
import api from "../services/api";
import ConsumptionCard from "../components/ConsumptionCard";
import {
    Chart as ChartJS,
    BarElement,
    CategoryScale,
    LinearScale,
    LineElement,
    PointElement
} from "chart.js";
import { Bar, Line } from "react-chartjs-2";

ChartJS.register(LineElement, PointElement, BarElement, CategoryScale, LinearScale);

export default function Dashboard() {
    const [data, setData] = useState([]);
    const user = JSON.parse(localStorage.getItem("user"));
    const [metrics, setMetrics] = useState({});
    const [hourData, setHourData] = useState([]);

    const chartData = {
        labels: data.map((item) => item.device_name),
        datasets: [
            {
                label: "Consumo (W)",
                data: data.map((item) => item.watts),
            },
        ],
    };

    const hourChartData = {
        labels: hourData.map(item => `${item.hour}h`),
        datasets: [
            {
                label: "Consumo por Hora (W)",
                data: hourData.map(item => item.total_watts),
            },
        ],
    };

    const peakHour = hourData.length > 0
        ? hourData.reduce((prev, current) =>
            prev.total_watts > current.total_watts ? prev : current
        )
        : null;

    const options = {
        responsive: true,
        plugins: {
            legend: {
                display: true,
            },
        },
    };

    useEffect(() => {
        fetchData();
        fetchMetrics();
        fetchHourData();
    }, []);

    async function fetchData() {
        try {
            const response = await api.get("/consumption");
            setData(Array.isArray(response.data) ? response.data : []);
        } catch (error) {
            console.error("Erro ao buscar dados", error);
        }
    }

    return (
        <div>
            <div>
                <h3>Alertas</h3>
                {metrics.alerts?.map((alert, index) => (
                    <p key={index} style={{ color: "red" }}>
                        {alert}
                    </p>
                ))}
            </div>

            <h2>Bem-vindo, {user.name}</h2>

            <button onClick={sendData}>Simular Consumo</button>

            <h1>Consumo de Energia</h1>

            <div>
                <h3>Métricas</h3>
                <p>Total (kWh): {metrics.totalKwh}</p>
                <p>Custo estimado: R$ {metrics.estimatedCost}</p>
                <p>Média de consumo: {metrics.averageWatts} W</p>
                <p>Máximo consumo: {metrics.maxWatts} W</p>
                <p>Dispositivo que mais consome: {metrics.highestDevice?.device_name}</p>
                <p>Média diária (kWh): {metrics.dailyAvg}</p>
                <p>Previsão mensal (kWh): {metrics.monthlyPrediction}</p>
            </div>

            {Array.isArray(data) && data.map((item) => (
                <ConsumptionCard
                    key={item.id}
                    device={item.device_name}
                    watts={item.watts}
                />
            ))}

            <Bar data={chartData} options={options} />

            <div>
                <h3>Consumo por Horário</h3>
                <p>Pico de consumo: {peakHour?.hour}h</p>
                <Line data={hourChartData} options={options} />
            </div>
            <button onClick={logout}>Sair</button>
        </div>
    );

    async function sendData() {
        await api.post("/consumption", {
            device_name: "Geladeira",
            watts: Math.floor(Math.random() * 200)
        });

        fetchData();
        fetchMetrics();
    }

    function logout() {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
    }

    async function fetchMetrics() {
        const response = await api.get("/consumption/metrics");
        setMetrics(response.data);
    }

    async function fetchHourData() {
        const response = await api.get("/consumption/by-hour");
        setHourData(response.data);
    }

}