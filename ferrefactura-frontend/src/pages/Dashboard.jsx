import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";

function Dashboard() {
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) {
      navigate("/login"); // ✅ Redirige si no hay token
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token"); // ✅ Elimina el token
    navigate("/login"); // ✅ Redirige a login
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-4">
      <h2 className="text-3xl font-bold mb-6">Panel de Control</h2>
      <button onClick={handleLogout} className="px-6 py-3 bg-red-500 rounded-lg text-white font-semibold hover:bg-red-600">
        Cerrar Sesión
      </button>
    </div>
  );
}

export default Dashboard;
