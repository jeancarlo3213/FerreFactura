import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";

function CrearFactura() {
  const navigate = useNavigate();
  const [nombreCliente, setNombreCliente] = useState("");
  const [fechaEntrega, setFechaEntrega] = useState("");
  const [costoEnvio, setCostoEnvio] = useState(0);
  const [descuentoTotal, setDescuentoTotal] = useState(0);
  const [productos, setProductos] = useState([]);
  const [productosSeleccionados, setProductosSeleccionados] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const token = localStorage.getItem("token");

  // Obtener lista de productos
  useEffect(() => {
    const fetchProductos = async () => {
      try {
        if (!token) throw new Error("No hay token de autenticación. Inicia sesión.");

        const response = await fetch("http://127.0.0.1:8000/api/productos/", {
          headers: { Authorization: `Token ${token}` },
        });

        if (!response.ok) throw new Error("Error al obtener productos.");

        const data = await response.json();
        console.log("Productos recibidos:", data);
        setProductos(data);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProductos();
  }, [token]);

  // Agregar productos a la factura
  const agregarProducto = (producto) => {
    const cantidad = parseInt(prompt(`¿Cuántas unidades de ${producto.nombre} deseas agregar?`), 10);
    if (!isNaN(cantidad) && cantidad > 0) {
      setProductosSeleccionados([...productosSeleccionados, { ...producto, cantidad }]);
    }
  };

  // Eliminar producto de la factura
  const eliminarProducto = (index) => {
    setProductosSeleccionados(productosSeleccionados.filter((_, i) => i !== index));
  };

  // Crear factura
  const crearFactura = async () => {
    if (productosSeleccionados.length === 0) {
      alert("Debes agregar al menos un producto.");
      return;
    }

    const facturaData = {
      usuario_id: 1, // Ajustar según el usuario autenticado
      nombre_cliente: nombreCliente,
      fecha_entrega: fechaEntrega,
      costo_envio: parseFloat(costoEnvio) || 0,
      descuento_total: parseFloat(descuentoTotal) || 0,
      productos: productosSeleccionados.map((p) => ({
        producto_id: p.id,
        cantidad: p.cantidad,
        precio_unitario: parseFloat(p.precio) || 0,
      })),
    };

    try {
      const response = await fetch("http://127.0.0.1:8000/api/facturas/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify(facturaData),
      });

      if (response.ok) {
        alert("Factura creada con éxito!");
        navigate("/facturas");
      } else {
        const errorData = await response.json();
        alert("Error al crear factura: " + JSON.stringify(errorData));
      }
    } catch {
      alert("Error en la conexión con el servidor.");
    }
  };

  return (
    <div className="p-6 bg-gray-900 text-white min-h-screen">
      <h2 className="text-2xl font-bold text-center mb-4">Crear Nueva Factura</h2>

      {loading ? (
        <p className="text-yellow-500 text-center">Cargando productos...</p>
      ) : error ? (
        <p className="text-red-500 text-center">{error}</p>
      ) : (
        <>
          {/* Datos de la factura */}
          <div className="mb-4">
            <label className="block">Nombre del Cliente:</label>
            <input
              type="text"
              className="p-2 bg-gray-800 rounded w-full"
              value={nombreCliente}
              onChange={(e) => setNombreCliente(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <label className="block">Fecha de Entrega:</label>
            <input
              type="date"
              className="p-2 bg-gray-800 rounded w-full"
              value={fechaEntrega}
              onChange={(e) => setFechaEntrega(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <label className="block">Costo de Envío:</label>
            <input
              type="number"
              className="p-2 bg-gray-800 rounded w-full"
              value={costoEnvio}
              onChange={(e) => setCostoEnvio(e.target.value)}
            />
          </div>

          <div className="mb-4">
            <label className="block">Descuento Total:</label>
            <input
              type="number"
              className="p-2 bg-gray-800 rounded w-full"
              value={descuentoTotal}
              onChange={(e) => setDescuentoTotal(e.target.value)}
            />
          </div>

          {/* Lista de productos */}
          <h3 className="text-xl font-bold my-4">Seleccionar Productos</h3>
          <ul>
            {productos.map((producto) => (
              <li key={producto.id} className="flex justify-between p-2 border-b border-gray-700">
                {producto.nombre} - Q{parseFloat(producto.precio).toFixed(2)}
                <button onClick={() => agregarProducto(producto)} className="ml-2 bg-blue-500 p-1 rounded">+</button>
              </li>
            ))}
          </ul>

          {/* Productos seleccionados */}
          <h3 className="text-xl font-bold my-4">Productos Seleccionados</h3>
          <ul>
            {productosSeleccionados.map((p, index) => (
              <li key={index} className="flex justify-between">
                {p.nombre} - {p.cantidad} unidades - Q{(parseFloat(p.precio) * p.cantidad).toFixed(2)}
                <button onClick={() => eliminarProducto(index)} className="ml-2 bg-red-500 p-1 rounded">X</button>
              </li>
            ))}
          </ul>

          {/* Botón para confirmar factura */}
          <button onClick={crearFactura} className="bg-green-500 p-3 rounded mt-4">
            Confirmar Factura
          </button>
        </>
      )}
    </div>
  );
}

export default CrearFactura;
