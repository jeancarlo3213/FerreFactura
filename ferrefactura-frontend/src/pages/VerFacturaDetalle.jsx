import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";

function VerFacturaDetalle() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [factura, setFactura] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchFactura = async () => {
      try {
        const response = await fetch(`http://127.0.0.1:8000/api/facturas/${id}/`, {
          headers: { Authorization: `Token ${token}` },
        });

        if (!response.ok) throw new Error("Error al obtener la factura.");

        const data = await response.json();
        setFactura(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchFactura();
  }, [id, token]);

  if (loading) return <p className="text-yellow-500 text-center">Cargando factura...</p>;
  if (error) return <p className="text-red-500 text-center">{error}</p>;
  if (!factura) return <p className="text-red-500 text-center">Factura no encontrada.</p>;

  const totalProductos = factura.productos.reduce((sum, p) => sum + p.cantidad * p.precio_unitario, 0);
  const totalFinal = totalProductos + factura.costo_envio - factura.descuento_total;

  return (
    <div className="p-8 bg-gray-900 text-white min-h-screen flex flex-col items-center">
      {/* Título de la ferretería */}
      <h1 className="text-3xl font-bold mb-2">Ferretería El Campesino</h1>
      <p className="text-lg mb-6">Factura de Compra</p>

      {/* Información general de la factura */}
      <div className="bg-gray-800 p-6 rounded-lg shadow-lg w-full max-w-2xl">
        <p><strong>Factura ID:</strong> {factura.id}</p>
        <p><strong>Fecha:</strong> {new Date(factura.fecha_creacion).toLocaleString()}</p>
        <p><strong>Cliente:</strong> {factura.nombre_cliente}</p>
        <p><strong>Fecha de Entrega:</strong> {factura.fecha_entrega || "No especificada"}</p>
        <p><strong>Vendedor:</strong> {factura.usuario}</p>

        {/* Tabla de productos */}
        <h3 className="text-xl font-bold mt-4">Productos Comprados</h3>
        <table className="w-full mt-2 border border-gray-600">
          <thead>
            <tr className="bg-gray-700">
              <th className="p-2">Producto</th>
              <th className="p-2">Cantidad</th>
              <th className="p-2">Precio Unitario</th>
              <th className="p-2">Subtotal</th>
            </tr>
          </thead>
          <tbody>
            {factura.productos.map((p) => (
              <tr key={p.producto_id} className="text-center border-t border-gray-600">
                <td className="p-2">{p.nombre_producto}</td>
                <td className="p-2">{p.cantidad}</td>
                <td className="p-2">Q{Number(p.precio_unitario).toFixed(2)}</td>
                <td className="p-2">Q{(p.cantidad * p.precio_unitario).toFixed(2)}</td>
              </tr>
            ))}
          </tbody>
        </table>

        {/* Totales */}
        <div className="mt-4 text-right">
          <p><strong>Total Productos:</strong> Q{totalProductos.toFixed(2)}</p>
          <p><strong>Costo de Envío:</strong> Q{factura.costo_envio.toFixed(2)}</p>
          <p><strong>Descuento Total:</strong> -Q{factura.descuento_total.toFixed(2)}</p>
          <p className="text-2xl font-bold mt-2">Total Final: Q{totalFinal.toFixed(2)}</p>
        </div>
      </div>

      {/* Botón para volver */}
      <button
        onClick={() => navigate("/facturas")}
        className="mt-6 bg-blue-500 p-3 rounded text-white hover:bg-blue-600"
      >
        Volver a Facturas
      </button>
    </div>
  );
}

export default VerFacturaDetalle;
