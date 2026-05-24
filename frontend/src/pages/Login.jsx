import { useState } from "react";
import api from "../services/api";
import Input from "../components/Input";
import Button from "../components/Button";
import AuthLayout from "../layouts/AuthLayout";
import "../styles/auth.css";


export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [show, setShow] = useState(false);

  async function handleLogin(e) {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const response = await api.post("/auth/login", { email, password });

      localStorage.setItem("token", response.data.token);
      localStorage.setItem("user", JSON.stringify(response.data.user));

      window.location.href = "/";
    } catch (err) {
      setError("Email ou senha inválidos");
    } finally {
      setLoading(false);
    }
  }

  return (
    <AuthLayout>
      <form onSubmit={handleLogin} className="auth-card">
        <h2>Login</h2>

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
          {loading ? "Entrando..." : "Entrar"}
        </Button>

        <p>
          Não tem conta? <a href="/register">Cadastrar</a>
        </p>
      </form>
   </AuthLayout>
  );
}