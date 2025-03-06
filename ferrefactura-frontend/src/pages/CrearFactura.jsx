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
  const [totalFactura, setTotalFactura] = useState(0);
  const [loading, setLoading] = useState(true);
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
      } finally {
        setLoading(false);
      }
    };

    fetchProductos();
  }, [token]);

  useEffect(() => {
    calcularTotal();
  }, [productosSeleccionados, costoEnvio, descuentoTotal]); // 🔹 Se recalcula el total al cambiar costoEnvio o descuentoTotal

  const agregarProducto = (producto) => {
    if (producto.stock === 0) {
      alert("Este producto no tiene stock disponible.");
      return;
    }

    const cantidad = parseInt(prompt(`¿Cuántas unidades de ${producto.nombre} deseas agregar?`), 10);
    if (!isNaN(cantidad) && cantidad > 0 && cantidad <= producto.stock) {
      const nuevosProductos = [...productosSeleccionados, { ...producto, cantidad }];
      setProductosSeleccionados(nuevosProductos);
    } else {
      alert("Cantidad inválida o superior al stock disponible.");
    }
  };

  const actualizarCantidad = (index, nuevaCantidad) => {
    if (nuevaCantidad < 1) return;
    const nuevosProductos = [...productosSeleccionados];
    nuevosProductos[index].cantidad = nuevaCantidad;
    setProductosSeleccionados(nuevosProductos);
  };

  const eliminarProducto = (index) => {
    const nuevosProductos = productosSeleccionados.filter((_, i) => i !== index);
    setProductosSeleccionados(nuevosProductos);
  };

  const calcularTotal = () => {
    const totalProductos = productosSeleccionados.reduce((acc, p) => acc + parseFloat(p.precio) * p.cantidad, 0);
    const totalFinal = totalProductos + parseFloat(costoEnvio) - parseFloat(descuentoTotal);
    setTotalFactura(totalFinal);
  };

  const crearFactura = async () => {
    if (productosSeleccionados.length === 0) {
      alert("Debes agregar al menos un producto.");
      return;
    }

    const facturaData = {
      usuario_id: 1,
      nombre_cliente: nombreCliente,
      fecha_entrega: fechaEntrega,
      costo_envio: parseFloat(costoEnvio),
      descuento_total: parseFloat(descuentoTotal),
      productos: productosSeleccionados.map((p) => ({
        producto_id: p.id,
        cantidad: p.cantidad,
        precio_unitario: parseFloat(p.precio),
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
        const facturaCreada = await response.json();
        alert("Factura creada con éxito!");

        for (let p of productosSeleccionados) {
          await fetch(`http://127.0.0.1:8000/api/productos/${p.id}/`, {
            method: "PATCH",
            headers: {
              "Content-Type": "application/json",
              Authorization: `Token ${token}`,
            },
            body: JSON.stringify({ stock: p.stock - p.cantidad }),
          });
        }

        navigate(`/verfacturadetalle/${facturaCreada.id}`);
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

          <h3 className="text-xl font-bold my-4">Productos Seleccionados</h3>
          <ul>
            {productosSeleccionados.map((p, index) => (
              <li key={index} className="flex justify-between items-center">
                {p.nombre} - Q{parseFloat(p.precio).toFixed(2)} x {p.cantidad} = <strong>Q{(parseFloat(p.precio) * p.cantidad).toFixed(2)}</strong>
                <input
                  type="number"
                  className="p-1 w-12 bg-gray-800 rounded mx-2"
                  value={p.cantidad}
                  onChange={(e) => actualizarCantidad(index, parseInt(e.target.value))}
                />
                <button onClick={() => eliminarProducto(index)} className="bg-red-500 p-1 rounded">X</button>
              </li>
            ))}
          </ul>

          <h3 className="text-lg font-bold mt-4">Costo de Envío</h3>
          <input type="number" className="p-2 bg-gray-800 rounded w-full mb-2" value={costoEnvio} onChange={(e) => setCostoEnvio(e.target.value)} />

          <h3 className="text-lg font-bold">Descuento Total</h3>
          <input type="number" className="p-2 bg-gray-800 rounded w-full mb-4" value={descuentoTotal} onChange={(e) => setDescuentoTotal(e.target.value)} />

          <p className="text-lg font-bold my-4">Total: Q{totalFactura.toFixed(2)}</p>

          <button onClick={crearFactura} className="bg-green-500 p-2 rounded">Confirmar Factura</button>
        </>
      )}
    </div>
  );
}

export default CrearFactura;
