import { useState } from "react";
import api from "../services/api";

export default function CreateDevice() {
  const [form, setForm] = useState({
    name: "",
    voltage: 220,
    monthly_kwh: ""
  });

  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({
      ...form,
      [e.target.name]: e.target.value
    });
  }

  async function handleSubmit(e) {
    e.preventDefault();

    if (!form.name || !form.monthly_kwh) {
      alert("Preencha todos os campos");
      return;
    }

    try {
      setLoading(true);

      await api.post("/devices", {
        name: form.name,
        voltage: Number(form.voltage),
        monthly_kwh: Number(form.monthly_kwh)
      });

      alert("Dispositivo cadastrado com sucesso!");

      setForm({
        name: "",
        voltage: 220,
        monthly_kwh: ""
      });

    } catch (error) {
      console.error(error);
      alert("Erro ao cadastrar dispositivo");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div style={{ padding: 20 }}>
      <h2>Cadastrar Dispositivo</h2>

      <form onSubmit={handleSubmit}>
        <div>
          <label>Nome do dispositivo</label>
          <input
            type="text"
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Ex: Geladeira"
          />
        </div>

        <div>
          <label>Voltagem</label>
          <select
            name="voltage"
            value={form.voltage}
            onChange={handleChange}
          >
            <option value={110}>110V</option>
            <option value={220}>220V</option>
          </select>
        </div>

        <div>
          <label>Consumo mensal (kWh)</label>
          <input
            type="number"
            name="monthly_kwh"
            value={form.monthly_kwh}
            onChange={handleChange}
            placeholder="Ex: 45"
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Salvando..." : "Cadastrar"}
        </button>
      </form>
    </div>
  );
}