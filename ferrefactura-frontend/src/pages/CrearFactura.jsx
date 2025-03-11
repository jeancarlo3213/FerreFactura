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
          const stockQuintales = producto.unidades_por_quintal
            ? Math.floor(producto.stock / unidadesPorQuintal)
            : null;
          const unidadesRestantes = producto.unidades_por_quintal
            ? producto.stock % unidadesPorQuintal
            : producto.stock;

          return {
            ...producto,
            precio: parseFloat(producto.precio) || 0,
            precio_quintal: producto.precio_quintal
              ? parseFloat(producto.precio_quintal)
              : null,
            stockQuintales,
            unidadesRestantes,
            descuentoPorUnidad: 0, // Por si acaso queremos usarlo
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
      const subtotal =
        p.cantidadQuintales * (p.precio_quintal || 0) +
        p.cantidadUnidades * (p.precio || 0) -
        p.descuentoPorUnidad * p.cantidadUnidades;
      return acc + subtotal;
    }, 0);

    setTotalFactura(
      totalProductos +
        (parseFloat(costoEnvio) || 0) -
        (parseFloat(descuentoTotal) || 0)
    );
  }, [productosSeleccionados, costoEnvio, descuentoTotal]);

  useEffect(() => {
    calcularTotal();
  }, [productosSeleccionados, costoEnvio, descuentoTotal, calcularTotal]);

  // 🔸 Modificar cantidad de quintales o unidades
  const modificarCantidad = (id, campo, valor) => {
    setProductosSeleccionados((prev) =>
      prev.map((p) => {
        if (p.id === id) {
          const nuevoValor = parseFloat(valor) || 0;
          if (nuevoValor < 0) return p;

          if (campo === "cantidadUnidades" && nuevoValor > p.unidadesRestantes) {
            return p;
          }
          if (campo === "cantidadQuintales" && nuevoValor > p.stockQuintales) {
            return p;
          }

          return { ...p, [campo]: nuevoValor };
        }
        return p;
      })
    );
    calcularTotal();
  };

  // 🔸 Modificar descuento por unidad
  const modificarDescuento = (id, valor) => {
    setProductosSeleccionados((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, descuentoPorUnidad: parseFloat(valor) || 0 }
          : p
      )
    );
    calcularTotal();
  };

  // 🔸 Agregar producto a la lista de seleccionados
  const agregarProducto = (producto) => {
    // Asegurar que no se agregue dos veces
    setProductosSeleccionados((prev) => {
      const existe = prev.find((p) => p.id === producto.id);
      if (existe) {
        return prev;
      } else {
        return [
          ...prev,
          {
            ...producto,
            cantidadQuintales: 0,
            cantidadUnidades: 0,
            descuentoPorUnidad: 0,
          },
        ];
      }
    });
    calcularTotal();
  };

  if (loading) {
    return <p className="text-center text-white">Cargando productos...</p>;
  }
  if (error) {
    return <p className="text-red-500 text-center">{error}</p>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto bg-gray-900 text-white rounded-lg shadow-lg">
      {/* Título principal */}
      <h1 className="text-3xl font-bold text-center mb-6">
        FERRETERÍA EL CAMPESINO
      </h1>

      {/* Campos para Cliente, Fecha, Costo de Envío, etc. */}
      <div className="space-y-3">
        <label className="block text-sm text-gray-300">Nombre del Cliente</label>
        <input
          type="text"
          value={nombreCliente}
          onChange={(e) => setNombreCliente(e.target.value)}
          className="w-full p-2 border border-gray-600 rounded bg-gray-800 text-white"
          placeholder="Ej: Juan Pérez"
        />

        <label className="block text-sm text-gray-300">Fecha de Entrega</label>
        <input
          type="date"
          value={fechaEntrega}
          onChange={(e) => setFechaEntrega(e.target.value)}
          className="w-full p-2 border border-gray-600 rounded bg-gray-800 text-white"
        />

        <label className="block text-sm text-gray-300">Costo de Envío</label>
        <input
          type="number"
          value={costoEnvio}
          onChange={(e) => setCostoEnvio(Number(e.target.value))}
          className="w-full p-2 border border-gray-600 rounded bg-gray-800 text-white"
          placeholder="Ej: 50"
        />

        <label className="block text-sm text-gray-300">Descuento Total</label>
        <input
          type="number"
          value={descuentoTotal}
          onChange={(e) => setDescuentoTotal(Number(e.target.value))}
          className="w-full p-2 border border-gray-600 rounded bg-gray-800 text-white"
          placeholder="Ej: 10"
        />
      </div>

      {/* Sección de productos seleccionados */}
      <h2 className="text-xl font-semibold mt-6">
        Lista de Productos Seleccionados
      </h2>
      {productosSeleccionados.map((p) => (
        <div
          key={p.id}
          className="flex justify-between items-center p-3 border-b border-gray-700"
        >
          <span>{p.nombre}</span>

          {/* Cantidad por Quintal */}
          {p.precio_quintal !== null && (
            <div className="text-center">
              <span className="block text-sm text-gray-400">
                Cantidad por Quintal
              </span>
              <input
                type="number"
                value={p.cantidadQuintales}
                onChange={(e) =>
                  modificarCantidad(p.id, "cantidadQuintales", e.target.value)
                }
                className="w-16 p-1 border border-gray-600 rounded bg-gray-800 text-white"
                placeholder="0"
              />
            </div>
          )}

          {/* Cantidad por Unidad */}
          <div className="text-center">
            <span className="block text-sm text-gray-400">
              Cantidad por Unidad
            </span>
            <input
              type="number"
              value={p.cantidadUnidades}
              onChange={(e) =>
                modificarCantidad(p.id, "cantidadUnidades", e.target.value)
              }
              className="w-16 p-1 border border-gray-600 rounded bg-gray-800 text-white"
              placeholder="0"
            />
          </div>

          {/* Descuento por Unidad */}
          <div className="text-center">
            <span className="block text-sm text-gray-400">
              Descuento por Unidad
            </span>
            <input
              type="number"
              value={p.descuentoPorUnidad}
              onChange={(e) => modificarDescuento(p.id, e.target.value)}
              className="w-16 p-1 border border-gray-600 rounded bg-gray-800 text-white"
              placeholder="0"
            />
          </div>

          {/* Total por producto */}
          <span className="font-bold">
            Total: Q
            {(
              p.cantidadQuintales * (p.precio_quintal || 0) +
              p.cantidadUnidades * (p.precio || 0) -
              p.descuentoPorUnidad * p.cantidadUnidades
            ).toFixed(2)}
          </span>
        </div>
      ))}

      {/* Lista de Productos Disponibles */}
      <h2 className="text-xl font-semibold mt-6">
        Lista de Productos Disponibles
      </h2>
      {productos.map((producto) => (
        <div
          key={producto.id}
          className="flex justify-between items-center p-3 border-b border-gray-700"
        >
          <span>
            {producto.nombre} - Q
            {producto.precio.toFixed(2)}
          </span>
          {producto.precio_quintal && (
            <span>
              Q
              {producto.precio_quintal.toFixed(2)} por quintal
            </span>
          )}
          <span>
            Stock:{" "}
            {producto.stockQuintales
              ? `${producto.stockQuintales} quintales, ${producto.unidadesRestantes} unidades`
              : `${producto.unidadesRestantes} unidades`}
          </span>
          <button
            onClick={() => {
              agregarProducto(producto); // Usar la función aquí
            }}
            className="bg-blue-500 text-white px-2 py-1 rounded"
          >
            +
          </button>
        </div>
      ))}

      {/* Total Final */}
      <h2 className="text-xl font-semibold mt-6">
        Total: Q{totalFactura.toFixed(2)}
      </h2>
      <button
        className="w-full bg-green-500 text-white p-2 rounded mt-4"
        disabled={productosSeleccionados.length === 0}
      >
        Confirmar Factura
      </button>
    </div>
  );
}

export default CrearFactura;
