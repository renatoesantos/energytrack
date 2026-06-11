import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { useEffect, useState } from "react";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CreateDevice from "./pages/CreateDevice";

function App() {
  const [token, setToken] = useState(undefined);

  useEffect(() => {
    const storedToken = localStorage.getItem("token");
    setToken(storedToken);
  }, []);

  if (token === undefined) {
    return <div>Loading...</div>;
  }

  return (
    <BrowserRouter>
      <Routes>

        <Route
          path="/login"
          element={!token ? <Login /> : <Navigate to="/" replace />}
        />

        <Route
          path="/register"
          element={!token ? <Register /> : <Navigate to="/" replace />}
        />

        <Route
          path="/"
          element={token ? <Dashboard /> : <Navigate to="/login" replace />}
        />

        <Route
          path="/devices/create"
          element={token ? <CreateDevice /> : <Navigate to="/login" replace />}
        />

        <Route
          path="*"
          element={<Navigate to={token ? "/" : "/login"} replace />}
        />

      </Routes>
    </BrowserRouter>
  );
}

export default App;