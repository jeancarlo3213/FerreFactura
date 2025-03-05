// src/pages/Dashboard.jsx
import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { FaUser, FaBox, FaFileInvoice, FaSignOutAlt, FaChartBar, FaClock } from "react-icons/fa";

function Dashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    navigate("/login");
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-6">
      <h2 className="text-4xl font-bold mb-6">Panel de Control</h2>
      
      {/* Reloj */}
      <div className="mb-6 text-xl font-semibold flex items-center">
        <FaClock size={24} className="mr-2" /> {new Date().toLocaleTimeString()}
      </div>
      
      {/* Sección de botones */}
      <div className="grid grid-cols-2 gap-6 mb-6">
        <Link to="/usuarios" className="dashboard-btn">
          <FaUser size={24} /> Gestionar Usuarios
        </Link>
        <Link to="/productos" className="dashboard-btn">
          <FaBox size={24} /> Gestionar Productos
        </Link>
        <Link to="/facturas" className="dashboard-btn">
          <FaFileInvoice size={24} /> Gestionar Facturas
        </Link>
        <button className="dashboard-btn bg-red-500 hover:bg-red-600" onClick={handleLogout}>
          <FaSignOutAlt size={24} /> Cerrar Sesión
        </button>
      </div>
      
      {/* Sección de estadísticas */}
      <div className="w-full max-w-4xl bg-gray-800 p-6 rounded-lg shadow-lg text-center">
        <h3 className="text-2xl font-semibold mb-4 flex items-center justify-center">
          <FaChartBar size={28} className="mr-2" /> Estadísticas
        </h3>
        <p>Próximamente podrás ver gráficos de ventas y gestión.</p>
      </div>
    </div>
  );
}

export default Dashboard;

