import React, { useState, useEffect } from "react";

function CrearFactura() {
  const [nombreCliente, setNombreCliente] = useState("");
  const [fechaEntrega, setFechaEntrega] = useState("");
  const [productos, setProductos] = useState([]);
  const [productosSeleccionados, setProductosSeleccionados] = useState([]);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        if (!token) throw new Error("No hay token de autenticación.");

        const response = await fetch("http://127.0.0.1:8000/api/productos/", {
          headers: { Authorization: `Token ${token}` },
        });

        if (!response.ok) throw new Error("Error al obtener productos.");

        const data = await response.json();
        setProductos(data);
      } catch (err) {
        setError(err.message);
      }
    };

    fetchProductos();
  }, [token]);

  const agregarProducto = (producto) => {
    if (producto.stock === 0) {
      alert("Este producto no tiene stock disponible.");
      return;
    }

    const cantidad = parseInt(prompt(`¿Cuántas unidades de ${producto.nombre} deseas agregar?`), 10);
    if (!isNaN(cantidad) && cantidad > 0 && cantidad <= producto.stock) {
      setProductosSeleccionados([...productosSeleccionados, { ...producto, cantidad }]);
    } else {
      alert("Cantidad inválida o superior al stock disponible.");
    }
  };

  return (
    <div className="p-6 bg-gray-900 text-white min-h-screen">
      <h2 className="text-2xl font-bold text-center mb-4">Crear Nueva Factura</h2>

      {error && <p className="text-red-500 text-center">{error}</p>}

      <input
        type="text"
        placeholder="Nombre del Cliente"
        className="p-2 bg-gray-800 rounded w-full mb-4"
        value={nombreCliente}
        onChange={(e) => setNombreCliente(e.target.value)}
      />

      <input
        type="date"
        className="p-2 bg-gray-800 rounded w-full mb-4"
        value={fechaEntrega}
        onChange={(e) => setFechaEntrega(e.target.value)}
      />

      <h3 className="text-xl font-bold my-4">Seleccionar Productos</h3>
      <ul>
        {productos.map((producto) => (
          <li key={producto.id} className="flex justify-between p-2 border-b border-gray-700">
            {producto.nombre} - Q{parseFloat(producto.precio).toFixed(2)} (Stock: {producto.stock})
            <button onClick={() => agregarProducto(producto)} className="ml-2 bg-blue-500 p-1 rounded" disabled={producto.stock === 0}>
              +
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
}

export default CrearFactura;
