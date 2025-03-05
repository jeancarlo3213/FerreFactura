import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { Plus, Search, Trash2, Eye } from "lucide-react"; // ✅ Iconos de Lucide
import { format } from "date-fns"; // ✅ Para formatear fechas

function Facturas() {
  const [facturas, setFacturas] = useState([]);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchFacturas = async () => {
      try {
        const token = localStorage.getItem("token");
        const response = await fetch("http://127.0.0.1:8000/api/facturas-completas/", {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
          },
        });

        if (!response.ok) {
          throw new Error("No se pudieron obtener las facturas.");
        }

        const data = await response.json();
        setFacturas(data);
      } catch (error) {
        setError(error.message);
      }
    };

    fetchFacturas();
  }, []);

  return (
    <div className="min-h-screen bg-gray-900 text-white p-6">
      <h2 className="text-3xl font-bold text-center mb-4">Gestión de Facturas</h2>

      {/* ⚠️ Error al obtener facturas */}
      {error && <p className="text-red-500 text-center mb-4">{error}</p>}

      {/* 🟢 Botones de Acciones */}
      <div className="flex flex-wrap gap-4 justify-center mb-6">
        <Link to="/crear-factura" className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded flex items-center gap-2">
          <Plus size={20} /> Crear Factura
        </Link>
        <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded flex items-center gap-2">
          <Search size={20} /> Buscar Factura
        </button>
        <button className="bg-yellow-600 hover:bg-yellow-700 text-white px-4 py-2 rounded flex items-center gap-2">
          <Eye size={20} /> Ver Facturas
        </button>
        <button className="bg-red-600 hover:bg-red-700 text-white px-4 py-2 rounded flex items-center gap-2">
          <Trash2 size={20} /> Eliminar Factura
        </button>
      </div>

      {/* 📜 Tabla de Facturas */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border border-gray-700 rounded-lg overflow-hidden">
          <thead className="bg-gray-800 text-white uppercase">
            <tr>
              <th className="p-3">ID</th>
              <th className="p-3">Fecha</th>
              <th className="p-3">Vendedor</th>
              <th className="p-3">Cliente</th>
              <th className="p-3">Costo Envío</th>
              <th className="p-3">Descuento</th>
              <th className="p-3">Producto</th>
              <th className="p-3">Cantidad</th>
              <th className="p-3">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {facturas.length > 0 ? (
              facturas.map((factura) => (
                <tr key={factura.factura_id} className="border-b border-gray-700 hover:bg-gray-800 transition">
                  <td className="p-3">{factura.factura_id}</td>
                  <td className="p-3">{format(new Date(factura.fecha_creacion), "dd/MM/yyyy, p")}</td>
                  <td className="p-3">{factura.vendedor}</td>
                  <td className="p-3">{factura.nombre_cliente}</td>
                  <td className="p-3">Q{factura.costo_envio.toFixed(2)}</td>
                  <td className="p-3">Q{factura.descuento_total.toFixed(2)}</td>
                  <td className="p-3">{factura.producto}</td>
                  <td className="p-3">{factura.cantidad}</td>
                  <td className="p-3">Q{factura.subtotal.toFixed(2)}</td>
                </tr>
              ))
            ) : (
              <tr>
                <td colSpan="9" className="p-3 text-center text-gray-400">No hay facturas registradas</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}

export default Facturas;
