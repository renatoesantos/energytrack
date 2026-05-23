import { BrowserRouter, Routes, Route } from "react-router-dom";
import Dashboard from "./pages/Dashboard";
import Login from "./pages/Login";
import Register from "./pages/Register";
import CreateDevice from "./pages/CreateDevice";

function App() {
  const token = localStorage.getItem("token");

  return (
    <BrowserRouter>
      <Routes>
        {!token ? (
          <>
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            <Route path="*" element={<Login />} />
          </>
        ) : (
          <><Route path="/" element={<Dashboard />} /><Route path="/devices/create" element={<CreateDevice />} /></>
        )}
      </Routes>
    </BrowserRouter>
  );
}

export default App;