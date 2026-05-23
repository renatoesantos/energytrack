import { useEffect, useState, useRef, useMemo } from "react";
import api from "../services/api";
import { io } from "socket.io-client";
import ConsumptionCard from "../components/ConsumptionCard";
import {
    Chart as ChartJS,
    BarElement,
    CategoryScale,
    LinearScale,
    LineElement,
    PointElement
} from "chart.js";
import { Line } from "react-chartjs-2";

ChartJS.register(LineElement, PointElement, BarElement, CategoryScale, LinearScale);

export default function Dashboard() {
    const user = JSON.parse(localStorage.getItem("user"));

    const [devices, setDevices] = useState({});
    const [metrics, setMetrics] = useState({});
    const [period, setPeriod] = useState("day");
    const [chartDataState, setChartDataState] = useState([]);
    const [predictionData, setPredictionData] = useState([]);
    const [historyData, setHistoryData] = useState([]);

    const socketRef = useRef(null);

    const deviceList = useMemo(() => Object.values(devices), [devices]);

    const totalWattsRealtime = useMemo(() =>
        deviceList.reduce((acc, d) => acc + Number(d.watts || 0), 0),
        [deviceList]
    );

    const { kwh, cost } = useMemo(() => {
        if (!predictionData.length) return { kwh: 0, cost: 0 };

        const avg =
            predictionData.reduce((acc, val) => acc + Number(val), 0) /
            predictionData.length;

        const kwh = (avg * 24 * 30) / 1000;

        return {
            kwh: isFinite(kwh) ? kwh : 0,
            cost: isFinite(kwh) ? kwh * 0.85 : 0
        };
    }, [predictionData]);

    const chartData = useMemo(() => ({
        labels: [
            ...historyData.map(d => new Date(d.date).toLocaleDateString()),
            ...predictionData.map((_, i) => `+${i + 1}d`)
        ],
        datasets: [
            {
                label: "Histórico",
                data: historyData.map(d => Number(d.avg_watts)),
            },
            {
                label: "Previsão",
                data: [
                    ...Array(historyData.length).fill(null),
                    ...predictionData
                ],
            }
        ]
    }), [historyData, predictionData]);

    const periodChartData = useMemo(() => ({
        labels: chartDataState?.map(item => item.label) || [],
        datasets: [
            {
                label: "Consumo (W)",
                data: chartDataState?.map(item => Number(item.total_watts)) || [],
            },
        ],
    }), [chartDataState]);

    const peak = useMemo(() => {
        if (!chartDataState?.length) return null;

        return chartDataState.reduce((a, b) =>
            Number(a.total_watts) > Number(b.total_watts) ? a : b
        );
    }, [chartDataState]);

    const options = {
        animation: false,
        responsive: true,
        plugins: { legend: { display: true } },
    };

    useEffect(() => {
        fetchMetrics();
        fetchPrediction();
        fetchDevices();
    }, []);

    useEffect(() => {
        const interval = setInterval(() => {
            fetchChartData(period);
        }, 10000);

        return () => clearInterval(interval);
    }, [period]);

    useEffect(() => {
        socketRef.current = io("http://localhost:3000");
        socketRef.current.emit("join", user.id);

        socketRef.current.on("update-device", (data) => {
            console.log("🔥 RECEBIDO:", data);
            
            setDevices(prev => ({
                ...prev,
                [data.device_name]: {
                    ...(prev[data.device_name] || {}),
                    ...data,
                    watts: Number(data.watts)
                }
            }));
        });

        socketRef.current.on("new-consumption", (data) => {
            console.log("🔥 RECEBIDO:", data);
            
            if (!data.watts || data.watts < 0) return;

            const now = new Date();

            setChartDataState(prev =>
                [
                    ...prev,
                    {
                        label: now.getHours() + "h",
                        total_watts: data.watts
                    }
                ].slice(-20)
            );
        });

        return () => socketRef.current.disconnect();
    }, []);

    return (
        <div>
            <h2>Bem-vindo, {user.name}</h2>

            <h3>Alertas</h3>
            {metrics.alerts?.map((alert, i) => (
                <p key={i} style={{ color: "red" }}>{alert.message}</p>
            ))}

            <button onClick={() => window.location.href = "/devices/create"}>
                + Novo Dispositivo
            </button>

            <h3>Métricas</h3>
            <p>Total (kWh): {metrics.totalKwh || 0}</p>
            <p>Custo estimado: R$ {metrics.estimatedCost || 0}</p>
            <p>Média: {metrics.averageWatts || 0} W</p>
            <p>Máximo: {metrics.maxWatts || 0} W</p>
            <p>Maior consumo: {metrics.highestDevice?.device_name}</p>
            <p>Consumo atual: {totalWattsRealtime.toFixed(2)} W</p>

            <h3>Dispositivos</h3>
            {deviceList.map((d) => (
                <ConsumptionCard
                    key={d.device_name}
                    device={d.device_name}
                    watts={d.watts}
                />
            ))}

            <h3>Previsão</h3>
            <p>{kwh.toFixed(2)} kWh</p>
            <p>R$ {cost.toFixed(2)}</p>

            <Line data={chartData} options={options} />

            <h3>Consumo por período</h3>
            <button onClick={() => setPeriod("day")}>Dia</button>
            <button onClick={() => setPeriod("week")}>Semana</button>
            <button onClick={() => setPeriod("month")}>Mês</button>

            <p>Pico: {peak?.label}</p>

            <Line data={periodChartData} options={options} />

            <button onClick={logout}>Sair</button>
        </div>
    );

    function logout() {
        localStorage.clear();
        window.location.href = "/login";
    }

    async function fetchMetrics() {
        const res = await api.get("/consumption/metrics");
        setMetrics(res.data);
    }

    async function fetchChartData(p) {
        const res = await api.get(`/consumption/by-period?period=${p}`);
        setChartDataState(res.data.slice(-50));
    }

    async function fetchPrediction() {
        const res = await api.get("/consumption/prediction");
        setHistoryData(res.data.history);
        setPredictionData(res.data.predictions);
    }

    async function fetchDevices() {
        const res = await api.get("/devices");

        const mapped = {};

        res.data.forEach(device => {
            mapped[device.name] = {
                device_name: device.name,
                watts: 0,
                ...device
            };
        });

        setDevices(mapped);
    }
}