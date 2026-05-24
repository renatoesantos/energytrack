import { useState } from "react";
import api from "../services/api";
import Input from "../components/Input";
import Button from "../components/Button";
import AuthLayout from "../layouts/AuthLayout";
import "../styles/auth.css";

export default function Register() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [show, setShow] = useState(false);

  async function handleRegister(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      await api.post("/auth/register", {
        name,
        email,
        password,
      });

      alert("Usuário criado com sucesso!");
      window.location.href = "/login";
    } catch (error) {
      setError("Erro ao cadastrar");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <form className="auth-card" onSubmit={handleRegister}>
        <h2>Cadastrar</h2>

        <Input
          placeholder="Nome"
          onChange={(e) => setName(e.target.value)}
        />

        <Input
          type="email"
          placeholder="Email"
          onChange={(e) => setEmail(e.target.value)}
        />

        <Input
          type={show ? "text" : "password"}
          placeholder="Senha"
          onChange={(e) => setPassword(e.target.value)}
        />

        <span onClick={() => setShow(!show)}>
          {show ? "Ocultar" : "Mostrar"}
        </span>

        {error && <p className="error">{error}</p>}

        <Button disabled={loading} type="submit">
          {loading ? "Cadastrando..." : "Cadastrar"}
        </Button>

        <p>
          Já tem conta? <a href="/login">Login</a>
        </p>
      </form>
    </AuthLayout>
  );
}