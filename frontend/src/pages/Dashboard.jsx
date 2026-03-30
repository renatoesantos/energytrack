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
            <h2>Bem-vindo, {user.name}</h2>

            <h1>Consumo de Energia</h1>

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
            device_name: "TV",
            watts: Math.floor(Math.random() * 200)
        });

        fetchData();
    }

    function logout() {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        window.location.href = "/login";
    }


}