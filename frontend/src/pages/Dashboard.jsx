import { useEffect, useState } from "react";
import api from "../services/api";
import ConsumptionCard from "../components/ConsumptionCard";
import {
    Chart as ChartJS,
    BarElement,
    CategoryScale,
    LinearScale
} from "chart.js";
import { Bar } from "react-chartjs-2";

ChartJS.register(BarElement, CategoryScale, LinearScale);

export default function Dashboard() {
    const [data, setData] = useState([]);
    const user = JSON.parse(localStorage.getItem("user"));
    const [metrics, setMetrics] = useState({});

    const chartData = {
        labels: data.map((item) => item.device_name),
        datasets: [
            {
                label: "Consumo (W)",
                data: data.map((item) => item.watts),
            },
        ],
    };
    useEffect(() => {
        fetchData();
        fetchMetrics();
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

            <button onClick={sendData}>Simular Consumo</button>
            <Bar data={chartData} />

            <button onClick={logout}>Sair</button>
        </div>
    );

    async function sendData() {
        await api.post("/consumption", {
            device_name: "Geladeira",
            //watts: Math.floor(Math.random() * 200)
            watts: 610
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

}