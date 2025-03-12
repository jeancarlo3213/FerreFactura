import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Spin, Card, Descriptions, Divider, Alert } from "antd";

function VerFacturaDetalle() {
  const { id } = useParams();              // 1) Tomar el ID de la URL: /verfactura/:id
  const navigate = useNavigate();
  const [factura, setFactura] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchFactura = async () => {
      try {
        // 2) Hacer fetch a /api/facturas/<id>/ (asumiendo que tu ModelViewSet lo expone)
        const response = await fetch(`http://127.0.0.1:8000/api/facturas/${id}/`, {
          headers: { 
            Authorization: `Token ${token}`
          }
        });
        if (!response.ok) {
          throw new Error("Error al obtener la factura");
        }
        const data = await response.json();
        setFactura(data);          // Guardar la factura en el estado
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    fetchFactura();
  }, [id, token]);

  if (loading) {
    return (
      <div className="flex justify-center items-center min-h-screen bg-gray-900">
        <Spin tip="Cargando factura..." size="large" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <Alert
          message="Error"
          description={error}
          type="error"
          showIcon
          closable
        />
      </div>
    );
  }

  if (!factura) {
    return (
      <div className="p-6 max-w-3xl mx-auto">
        <Alert
          message="Factura no encontrada"
          description={`No se encontró la factura con ID ${id}.`}
          type="warning"
          showIcon
        />
      </div>
    );
  }

  // Extraer los datos principales
  const {
    nombre_cliente,
    fecha_creacion,
    fecha_entrega,
    costo_envio,
    descuento_total,
    // usuario, etc. si lo incluyes en tu serializer
  } = factura;

  // Para el detalle de productos, asumiendo que tu serializer de Factura
  // incluye algo como "detalles": [...]
  // Si no, ajusta a la forma en que tengas tu info
  const detalles = factura.detalles || [];

  return (
    <div className="p-6 max-w-4xl mx-auto bg-gray-900 text-white rounded-lg shadow-lg">
      <Card bordered={false} className="bg-gray-800 text-white">
        <h1 className="text-2xl font-bold mb-4">Detalle de Factura #{id}</h1>

        {/* Datos generales de la factura */}
        <Descriptions
          bordered
          column={1}
          labelStyle={{ color: "#aaa" }}
          contentStyle={{ color: "#fff" }}
        >
          <Descriptions.Item label="Cliente">
            {nombre_cliente || "N/A"}
          </Descriptions.Item>
          <Descriptions.Item label="Fecha Creación">
            {fecha_creacion
              ? new Date(fecha_creacion).toLocaleString()
              : "Desconocida"}
          </Descriptions.Item>
          <Descriptions.Item label="Fecha Entrega">
            {fecha_entrega || "No especificada"}
          </Descriptions.Item>
          <Descriptions.Item label="Costo de Envío">
            Q{costo_envio || 0}
          </Descriptions.Item>
          <Descriptions.Item label="Descuento Total">
            Q{descuento_total || 0}
          </Descriptions.Item>
        </Descriptions>

        <Divider />

        {/* Lista de productos de la factura */}
        <h2 className="text-xl font-semibold mb-2">Productos</h2>
        {detalles.length === 0 ? (
          <p>No hay detalles registrados</p>
        ) : (
          detalles.map((detalle, idx) => (
            <div
              key={idx}
              className="flex justify-between items-center p-2 mb-2 bg-gray-700 rounded"
            >
              <span>
                {detalle.producto_nombre || `Producto ID ${detalle.producto}`}
              </span>
              <span>Cantidad: {detalle.cantidad}</span>
              <span>Tipo: {detalle.tipo_venta || "Unidad"}</span>
              <span>Precio: Q{detalle.precio_unitario}</span>
              <span>
                Subtotal: Q
                {Number(detalle.cantidad * detalle.precio_unitario).toFixed(2)}
              </span>
            </div>
          ))
        )}

        <Divider />

        {/* Botón de Regresar o algo similar */}
        <button
          onClick={() => navigate("/facturas")}
          className="bg-blue-500 p-2 rounded"
        >
          Volver a Facturas
        </button>
      </Card>
    </div>
  );
}

export default VerFacturaDetalle;
