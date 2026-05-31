import { useEffect, useState, useRef, useMemo } from "react";
import api from "../services/api";
import { io } from "socket.io-client";
import ConsumptionCard from "../components/ConsumptionCard";
import "../styles/dashboard.css";
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

    const chartData = useMemo(() => {
        const lastDate = historyData.length
            ? new Date(historyData[historyData.length - 1].date)
            : new Date();

        const predictionLabels = predictionData.map((_, i) => {
            const nextDate = new Date(lastDate);
            nextDate.setDate(nextDate.getDate() + (i + 1));

            return nextDate.toLocaleDateString("pt-BR", {
                day: "2-digit",
                month: "2-digit"
            });
        });

        return {
            labels: [
                ...historyData.map(d => new Date(d.date).toLocaleDateString()),
                ...predictionLabels
            ],
            datasets: [
                {
                    label: "Histórico",
                    data: historyData.map(d => Number(d.avg_watts)),

                    borderColor: "#4f46e5",
                    backgroundColor: "rgba(79, 70, 229, 0.15)",

                    tension: 0.4,
                    fill: true,

                    pointRadius: 3,
                    pointBackgroundColor: "#4f46e5",

                    borderWidth: 2,
                },
                {
                    label: "Previsão",
                    data: [
                        ...Array(historyData.length).fill(null),
                        ...predictionData
                    ],

                    borderColor: "#22c55e",
                    backgroundColor: "rgba(34, 197, 94, 0.1)",

                    tension: 0.4,
                    fill: true,

                    borderDash: [6, 6],
                    pointRadius: 2,

                    borderWidth: 2,
                }
            ]
        };
    }, [historyData, predictionData]);

    const periodChartData = useMemo(() => ({
        labels: chartDataState?.map(item => item.label) || [],
        datasets: [
            {
                label: "Consumo (W)",
                data: chartDataState?.map(item => Number(item.total_watts)) || [],

                borderColor: "#4f46e5",
                backgroundColor: "rgba(79, 70, 229, 0.15)",

                tension: 0.4,
                fill: true,

                pointRadius: 3,
                pointBackgroundColor: "#4f46e5",

                borderWidth: 2,
            }
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
        maintainAspectRatio: false,
        plugins: {
            legend: {
                labels: {
                    color: "#555",
                    font: {
                        size: 12
                    }
                }
            }
        },
        scales: {
            x: {
                grid: {
                    display: false
                },
                ticks: {
                    color: "#888"
                }
            },
            y: {
                grid: {
                    color: "rgba(0,0,0,0.05)"
                },
                ticks: {
                    color: "#888"
                }
            }
        }
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
        <div className="dashboard">

            <header className="dashboard-header">
                <h2>⚡ EnergyTrack</h2>
                <div>
                    <span>{user.name}</span>
                    <button onClick={logout}>Sair</button>
                </div>
            </header>

            {/* MÉTRICAS */}
            <section className="metrics-grid">
                <div className="card">
                    <h4>Consumo Atual</h4>
                    <p>{totalWattsRealtime.toFixed(2)} W</p>
                </div>
                <div className="card">
                    <h4>Total (kWh)</h4>
                    <p>{metrics.totalKwh || 0}</p>
                </div>
                <div className="card">
                    <h4>Custo Estimado</h4>
                    <p>R$ {metrics.estimatedCost || 0}</p>
                </div>
                <div className="card">
                    <h4>Maior Consumo</h4>
                    <p>{metrics.highestDevice?.device_name || "-"}</p>
                </div>
            </section>

            {/* ALERTAS */}
            <section className="alerts">
                <h3> Alertas</h3>
                {metrics.alerts?.length ? (
                    metrics.alerts.map((alert, i) => (
                        <p key={i} className="alert">
                            {alert.message}
                        </p>
                    ))
                ) : (
                    <p>Nenhum alerta</p>
                )}
            </section>

            {/* DISPOSITIVOS */}
            <section>
                <div className="devices-header">
                    <h3>Dispositivos</h3>
                    <button onClick={() => window.location.href = "/devices/create"}>
                        + Novo
                    </button>
                </div>
                <div className="devices-grid">
                    {deviceList.map((d) => (
                        <ConsumptionCard
                            key={d.device_name}
                            device={d.device_name}
                            watts={d.watts}
                        />
                    ))}
                </div>
            </section>

            {/* PREVISÃO */}
            <div className="prediction-info">
                <div>
                    <span>Consumo previsto</span>
                    <strong>{kwh.toFixed(2)} kWh</strong>
                </div>

                <div>
                    <span>Conta estimada</span>
                    <strong>R$ {cost.toFixed(2)}</strong>
                </div>
            </div>

            <div className="chart-container">
                <Line data={chartData} options={options} />
            </div>

            {/* CONSUMO POR PERÍODO */}
            <div className="filters">
                <button
                    className={period === "day" ? "active" : ""}
                    onClick={() => setPeriod("day")}
                >
                    Dia
                </button>

                <button
                    className={period === "week" ? "active" : ""}
                    onClick={() => setPeriod("week")}
                >
                    Semana
                </button>

                <button
                    className={period === "month" ? "active" : ""}
                    onClick={() => setPeriod("month")}
                >
                    Mês
                </button>
            </div>

            <p className="peak">
                Pico de consumo: <strong>{peak?.label || "-"}</strong>
            </p>

            <div className="chart-container">
                <Line data={periodChartData} options={options} />
            </div>

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