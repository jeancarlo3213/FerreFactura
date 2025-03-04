// src/pages/Login.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

function Login() {
  const navigate = useNavigate();
  const [user, setUser] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(""); // ✅ Estado para errores

  const handleLogin = async (e) => {
    e.preventDefault();

    try {
      const response = await fetch("http://127.0.0.1:8000/api-token-auth/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ username: user, password }),
      });

      const data = await response.json();

      if (response.ok) {
        localStorage.setItem("token", data.access); // ✅ Guardar token en localStorage
        navigate("/dashboard"); // ✅ Redirigir al dashboard
      } else {
        setError("Usuario o contraseña incorrectos"); // 🔥 Mostrar error si falla
      }
    } catch {
      setError("Error de conexión con el servidor");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <h2 className="text-3xl font-bold mb-6">Iniciar Sesión</h2>
      <form onSubmit={handleLogin} className="bg-gray-800 p-6 rounded-lg shadow-md w-80">
        <input
          type="text"
          placeholder="Usuario"
          className="w-full p-2 mb-4 rounded bg-gray-700 text-white"
          value={user}
          onChange={(e) => setUser(e.target.value)}
        />
        <input
          type="password"
          placeholder="Contraseña"
          className="w-full p-2 mb-4 rounded bg-gray-700 text-white"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        {error && <p className="text-red-500 text-sm mb-2">{error}</p>} {/* ✅ Mensaje de error */}
        <button type="submit" className="w-full bg-blue-500 p-2 rounded hover:bg-blue-600">
          Entrar
        </button>
      </form>
    </div>
  );
}

export default Login;
