import React, { useState, useEffect, useCallback } from "react";

function CrearFactura() {
  const [productos, setProductos] = useState([]);
  const [productosSeleccionados, setProductosSeleccionados] = useState([]);
  const [nombreCliente, setNombreCliente] = useState("");
  const [fechaEntrega, setFechaEntrega] = useState("");
  const [costoEnvio, setCostoEnvio] = useState(0);
  const [descuentoTotal, setDescuentoTotal] = useState(0);
  const [totalFactura, setTotalFactura] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const token = localStorage.getItem("token");

  useEffect(() => {
    const fetchProductos = async () => {
      try {
        const response = await fetch("http://127.0.0.1:8000/api/productos/", {
          headers: { Authorization: `Token ${token}` },
        });
        if (!response.ok) throw new Error("No autorizado");
        const data = await response.json();

        const productosProcesados = data.map((producto) => {
          const unidadesPorQuintal = producto.unidades_por_quintal || 1;
          const stockQuintales = producto.unidades_por_quintal ? Math.floor(producto.stock / unidadesPorQuintal) : null;
          const unidadesRestantes = producto.unidades_por_quintal ? producto.stock % unidadesPorQuintal : producto.stock;

          return {
            ...producto,
            precio: parseFloat(producto.precio) || 0,
            precio_quintal: producto.precio_quintal ? parseFloat(producto.precio_quintal) : null,
            stockQuintales,
            unidadesRestantes,
          };
        });

        setProductos(productosProcesados);
      } catch {
        setError("Error al obtener los productos");
      } finally {
        setLoading(false);
      }
    };
    fetchProductos();
  }, [token]);

  const calcularTotal = useCallback(() => {
    const totalProductos = productosSeleccionados.reduce((acc, p) => {
      const subtotal = (p.cantidadQuintales * (p.precio_quintal || 0)) + (p.cantidadUnidades * (p.precio || 0));
      return acc + subtotal - (p.descuentoPorUnidad * p.cantidadUnidades);
    }, 0);
    setTotalFactura(totalProductos + (parseFloat(costoEnvio) || 0) - (parseFloat(descuentoTotal) || 0));
  }, [productosSeleccionados, costoEnvio, descuentoTotal]);

  useEffect(() => {
    calcularTotal();
  }, [productosSeleccionados, costoEnvio, descuentoTotal, calcularTotal]);

  const modificarCantidad = (id, campo, valor) => {
    setProductosSeleccionados((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const nuevoValor = parseFloat(valor) || 0;
          if (nuevoValor < 0) return p;
          if (campo === "cantidadUnidades" && nuevoValor > p.unidadesRestantes) return p;
          if (campo === "cantidadQuintales" && nuevoValor > p.stockQuintales) return p;
          return { ...p, [campo]: nuevoValor };
        }
        return p;
      })
    );
    calcularTotal();
  };

  const agregarProducto = (producto) => {
    setProductosSeleccionados((prev) => {
      const existe = prev.find((p) => p.id === producto.id);
      if (existe) {
        return prev;
      } else {
        return [...prev, { ...producto, cantidadQuintales: 0, cantidadUnidades: 0, descuentoPorUnidad: 0 }];
      }
    });
    calcularTotal();
  };

  if (loading) return <p className="text-center text-white">Cargando productos...</p>;
  if (error) return <p className="text-red-500 text-center">{error}</p>;

  return (
    <div className="p-6 max-w-4xl mx-auto bg-gray-900 text-white rounded-lg shadow-lg">
      <h1 className="text-3xl font-bold text-center mb-6">Crear Factura</h1>

      <div className="space-y-3">
        <input
          type="text"
          value={nombreCliente}
          onChange={(e) => setNombreCliente(e.target.value)}
          className="w-full p-2 border border-gray-600 rounded bg-gray-800 text-white"
          placeholder="Nombre del Cliente"
        />

        <input
          type="date"
          value={fechaEntrega}
          onChange={(e) => setFechaEntrega(e.target.value)}
          className="w-full p-2 border border-gray-600 rounded bg-gray-800 text-white"
        />

        <input
          type="number"
          value={costoEnvio}
          onChange={(e) => setCostoEnvio(Number(e.target.value))}
          className="w-full p-2 border border-gray-600 rounded bg-gray-800 text-white"
          placeholder="Costo de Envío"
        />

        <input
          type="number"
          value={descuentoTotal}
          onChange={(e) => setDescuentoTotal(Number(e.target.value))}
          className="w-full p-2 border border-gray-600 rounded bg-gray-800 text-white"
          placeholder="Descuento Total"
        />
      </div>

      <h2 className="text-xl font-semibold mt-6">Lista de Productos Seleccionados</h2>
      {productosSeleccionados.map((p) => (
        <div key={p.id} className="flex justify-between items-center p-3 border-b border-gray-700">
          <span>{p.nombre}</span>
          {p.precio_quintal !== null && (
            <div>
              <span className="block text-sm text-gray-400">Cantidad por Quintal</span>
              <input
                type="number"
                value={p.cantidadQuintales}
                onChange={(e) => modificarCantidad(p.id, "cantidadQuintales", e.target.value)}
                className="w-16 p-1 border border-gray-600 rounded bg-gray-800 text-white text-center"
              />
            </div>
          )}
          <div>
            <span className="block text-sm text-gray-400">Cantidad por Unidad</span>
            <input
              type="number"
              value={p.cantidadUnidades}
              onChange={(e) => modificarCantidad(p.id, "cantidadUnidades", e.target.value)}
              className="w-16 p-1 border border-gray-600 rounded bg-gray-800 text-white text-center"
            />
          </div>
          <span className="font-bold">Total: Q{((p.cantidadQuintales * (p.precio_quintal || 0)) + (p.cantidadUnidades * (p.precio || 0))).toFixed(2)}</span>
        </div>
      ))}

      <h2 className="text-xl font-semibold mt-6">Lista de Productos Disponibles</h2>
      {productos.map((producto) => (
        <div key={producto.id} className="flex justify-between items-center p-3 border-b border-gray-700">
          <span>{producto.nombre} - Q{producto.precio.toFixed(2)}</span>
          {producto.precio_quintal && <span>Q{producto.precio_quintal.toFixed(2)} por quintal</span>}
          <span>Stock: {producto.stockQuintales ? `${producto.stockQuintales} quintales, ${producto.unidadesRestantes} unidades` : `${producto.unidadesRestantes} unidades`}</span>
          <button onClick={() => agregarProducto(producto)} className="bg-blue-500 text-white px-2 py-1 rounded">+</button>
        </div>
      ))}

      <h2 className="text-xl font-semibold mt-6">Total: Q{totalFactura.toFixed(2)}</h2>
      <button className="w-full bg-green-500 text-white p-2 rounded mt-4" disabled={productosSeleccionados.length === 0}>
        Confirmar Factura
      </button>
    </div>
  );
}

export default CrearFactura;
