import { useState } from "react";
import api from "../services/api";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleRegister(e) {
    e.preventDefault();

    try {
      await api.post("/auth/register", {
        name,
        email,
        password,
      });

      alert("Usuário criado com sucesso!");
      window.location.href = "/login";
    } catch (error) {
      console.error(error.response?.data || error);
      alert("Erro ao cadastrar");
    }
  }

  return (
    <form onSubmit={handleRegister}>
      <h2>Cadastrar</h2>

      <input
        placeholder="Nome"
        onChange={(e) => setName(e.target.value)}
      />

      <input
        type="email"
        placeholder="Email"
        onChange={(e) => setEmail(e.target.value)}
      />

      <input
        type="password"
        placeholder="Senha"
        onChange={(e) => setPassword(e.target.value)}
      />

      <button type="submit">Cadastrar</button>

      <p>
        Já tem conta? <a href="/login">Login</a>
      </p>
    </form>
  );
}