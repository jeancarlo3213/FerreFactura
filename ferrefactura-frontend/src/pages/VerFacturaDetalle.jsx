import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Spin, Card, Descriptions, Divider, Alert } from "antd";
import { FaArrowLeft, FaPrint } from "react-icons/fa";

function VerFacturaDetalle() {
  const { id } = useParams(); // /verfactura/:id
  const navigate = useNavigate();

  const [factura, setFactura] = useState(null);
  const [detalles, setDetalles] = useState([]); // aquí guardamos los detalles
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  // Al montar el componente, cargamos la factura y sus detalles
  useEffect(() => {
    const fetchData = async () => {
      try {
        // 1) Traer la factura principal: /api/facturas/:id
        const resFactura = await fetch(
          `http://127.0.0.1:8000/api/facturas/${id}/`,
          {
            headers: { Authorization: `Token ${token}` },
          }
        );
        if (!resFactura.ok) {
          throw new Error("Error al obtener la factura.");
        }
        const dataFactura = await resFactura.json();

        // 2) Traer TODOS los detalles: /api/facturas-detalle/
        const resDetalles = await fetch(
          "http://127.0.0.1:8000/api/facturas-detalle/",
          {
            headers: { Authorization: `Token ${token}` },
          }
        );
        if (!resDetalles.ok) {
          throw new Error("Error al obtener los detalles de factura.");
        }
        const dataDetalles = await resDetalles.json();

        // Filtramos sólo aquellos que pertenezcan a esta factura
        const detallesFiltrados = dataDetalles.filter(
          (d) => parseInt(d.factura, 10) === parseInt(id, 10)
        );

        // Guardamos todo en el estado
        setFactura(dataFactura);
        setDetalles(detallesFiltrados);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [id, token]);

  // Manejo de estados
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

  // Extraer datos principales
  const {
    nombre_cliente,
    fecha_creacion,
    fecha_entrega,
    costo_envio,
    descuento_total,
  } = factura;

  // Función para imprimir
  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-6 max-w-4xl mx-auto bg-gray-900 text-white rounded-lg shadow-lg">
      {/* Título general */}
      <h1 className="text-3xl font-bold text-center mb-6">Ferretería El Campesino</h1>

      <Card bordered={false} className="bg-gray-800 text-white">
        <h2 className="text-2xl font-bold mb-4">Detalle de Factura #{id}</h2>

        {/* Datos generales */}
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

        {/* Productos */}
        <h2 className="text-xl font-semibold mb-2">Productos</h2>
        {detalles.length === 0 ? (
          <p>No hay detalles registrados</p>
        ) : (
          detalles.map((detalle, idx) => {
            // Podrías llamar a /api/productos/:detalle.producto
            // y guardar "detalle.producto_nombre" o "detalle.precio"
            // si tu backend no lo trae directo.
            const subtotal = Number(detalle.cantidad) * Number(detalle.precio_unitario || 0);

            return (
              <div
                key={idx}
                className="flex justify-between items-center p-2 mb-2 bg-gray-700 rounded"
              >
                {/* Muestra: Prod ID, Cantidad, Tipo, Precio, Subtotal */}
                <span>Prod ID {detalle.producto}</span>
                <span>Cantidad: {detalle.cantidad}</span>
                <span>Tipo: {detalle.tipo_venta || "Unidad"}</span>
                <span>Precio: Q{detalle.precio_unitario}</span>
                <span>Subtotal: Q{subtotal.toFixed(2)}</span>
              </div>
            );
          })
        )}

        <Divider />

        {/* Botones de acción */}
        <div className="flex gap-2">
          <button
            onClick={() => navigate("/facturas")}
            className="bg-blue-500 px-3 py-2 rounded flex items-center gap-2"
          >
            <FaArrowLeft />
            Volver a Facturas
          </button>

          <button
            onClick={handlePrint}
            className="bg-green-500 px-3 py-2 rounded flex items-center gap-2"
          >
            <FaPrint />
            Imprimir Factura
          </button>
        </div>
      </Card>
    </div>
  );
}

export default VerFacturaDetalle;
