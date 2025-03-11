import React, { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
// 🔹 Componentes de Ant Design
import { Input, Button, message } from "antd";
// 🔹 Íconos de react-icons
import { FaPlus, FaCheckCircle, FaSearch } from "react-icons/fa";

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

  // Estado para la búsqueda
  const [busqueda, setBusqueda] = useState("");

  // Para redirigir tras crear la factura
  const navigate = useNavigate();

  const token = localStorage.getItem("token");

  // 🔸 Cargar productos desde el backend
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
            descuentoPorUnidad: 0,
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

  // 🔸 Calcular total de la factura
  const calcularTotal = useCallback(() => {
    const totalProductos = productosSeleccionados.reduce((acc, p) => {
      const subtotal =
        p.cantidadQuintales * (p.precio_quintal || 0) +
        p.cantidadUnidades * (p.precio || 0) -
        p.descuentoPorUnidad * p.cantidadUnidades;
      return acc + subtotal;
    }, 0);

    setTotalFactura(
      totalProductos + (parseFloat(costoEnvio) || 0) - (parseFloat(descuentoTotal) || 0)
    );
  }, [productosSeleccionados, costoEnvio, descuentoTotal]);

  useEffect(() => {
    calcularTotal();
  }, [productosSeleccionados, costoEnvio, descuentoTotal, calcularTotal]);

  // 🔸 Modificar cantidad/quintal
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

  // 🔸 Confirmar Factura (Crear + actualizar stock + redirigir)
  const confirmarFactura = async () => {
    const payload = {
      nombre_cliente: nombreCliente,
      fecha_entrega: fechaEntrega,
      costo_envio: costoEnvio,
      descuento_total: descuentoTotal,
      usuario_id: 1, // Ajusta si tu backend lo requiere
      productos: productosSeleccionados.map((prod) => ({
        producto_id: prod.id,
        cantidad: prod.cantidadUnidades,
        precio_unitario: prod.precio,
      })),
    };

    try {
      // 1) Crear la Factura
      const response = await fetch("http://127.0.0.1:8000/api/facturas/", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Token ${token}`,
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error("Error al crear la factura");
      }
      const data = await response.json();

      // 2) Actualizar stock de cada producto
      // (ejemplo simple restando la cantidadUnidades del p.stock)
      for (const prodSel of productosSeleccionados) {
        const nuevoStock = prodSel.stock - prodSel.cantidadUnidades;
        // PATCH al endpoint de producto
        await fetch(`http://127.0.0.1:8000/api/productos/${prodSel.id}/`, {
          method: "PATCH",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Token ${token}`,
          },
          body: JSON.stringify({ stock: nuevoStock }),
        });
      }

      // 3) Mensaje bonito con Ant Design
      message.success(`¡Factura creada con éxito! ID: ${data.id}`, 3);

      // 4) Redirigir
      navigate(`/verfactura/${data.id}`);
    } catch (error) {
      message.error(`Error: ${error.message}`);
    }
  };

  // 🔸 Agregar producto a la lista
  const agregarProducto = (producto) => {
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
        <Input
          value={nombreCliente}
          onChange={(e) => setNombreCliente(e.target.value)}
          className="border border-gray-600 !bg-gray-800 !text-white"
          placeholder="Ej: Juan Pérez"
        />

        <label className="block text-sm text-gray-300">Fecha de Entrega</label>
        <Input
          type="date"
          value={fechaEntrega}
          onChange={(e) => setFechaEntrega(e.target.value)}
          className="border border-gray-600 !bg-gray-800 !text-white"
        />

        <label className="block text-sm text-gray-300">Costo de Envío</label>
        <Input
          type="number"
          value={costoEnvio}
          onChange={(e) => setCostoEnvio(Number(e.target.value))}
          className="border border-gray-600 !bg-gray-800 !text-white"
          placeholder="Ej: 50"
        />

        <label className="block text-sm text-gray-300">Descuento Total</label>
        <Input
          type="number"
          value={descuentoTotal}
          onChange={(e) => setDescuentoTotal(Number(e.target.value))}
          className="border border-gray-600 !bg-gray-800 !text-white"
          placeholder="Ej: 10"
        />
      </div>

      {/* Lista de Productos Seleccionados */}
      <h2 className="text-xl font-semibold mt-6">
        Lista de Productos Seleccionados
      </h2>
      {productosSeleccionados.map((p) => (
        <div
          key={p.id}
          className="flex justify-between items-center p-3 border-b border-gray-700"
        >
          <span>{p.nombre}</span>

          {p.precio_quintal !== null && (
            <div className="text-center">
              <span className="block text-sm text-gray-400">
                Cantidad por Quintal
              </span>
              <Input
                type="number"
                value={p.cantidadQuintales}
                onChange={(e) =>
                  modificarCantidad(p.id, "cantidadQuintales", e.target.value)
                }
                className="!w-16 !border-gray-600 !bg-gray-800 !text-white text-center"
                placeholder="0"
              />
            </div>
          )}

          <div className="text-center">
            <span className="block text-sm text-gray-400">
              Cantidad por Unidad
            </span>
            <Input
              type="number"
              value={p.cantidadUnidades}
              onChange={(e) =>
                modificarCantidad(p.id, "cantidadUnidades", e.target.value)
              }
              className="!w-16 !border-gray-600 !bg-gray-800 !text-white text-center"
              placeholder="0"
            />
          </div>

          <div className="text-center">
            <span className="block text-sm text-gray-400">
              Descuento por Unidad
            </span>
            <Input
              type="number"
              value={p.descuentoPorUnidad}
              onChange={(e) => modificarDescuento(p.id, e.target.value)}
              className="!w-16 !border-gray-600 !bg-gray-800 !text-white text-center"
              placeholder="0"
            />
          </div>

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

      {/* 🔎 Input de búsqueda de productos */}
      <div className="mt-6">
        <label className="block text-sm text-gray-300">
          <FaSearch className="inline mr-2" />
          Buscar producto (por nombre o ID)
        </label>
        <Input
          type="text"
          className="border border-gray-600 !bg-gray-800 !text-white"
          placeholder="Ej: Pintura o 1"
          onChange={(e) => setBusqueda(e.target.value)}
        />
      </div>

      {/* Lista de Productos Disponibles (filtrados en línea) */}
      <h2 className="text-xl font-semibold mt-4">
        Lista de Productos Disponibles
      </h2>
      {productos
        .filter((prod) => {
          if (!busqueda || !busqueda.trim()) return true;
          const texto = busqueda.toLowerCase();
          return (
            prod.nombre.toLowerCase().includes(texto) ||
            String(prod.id).includes(texto)
          );
        })
        .map((producto) => (
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
            <Button
              type="default"
              icon={<FaPlus />}
              onClick={() => {
                agregarProducto(producto);
              }}
              className="bg-blue-500 text-white border-none hover:bg-blue-600"
            >
              Agregar
            </Button>
          </div>
        ))}

      {/* Total Final */}
      <h2 className="text-xl font-semibold mt-6">
        Total: Q{totalFactura.toFixed(2)}
      </h2>

      <Button
        type="primary"
        icon={<FaCheckCircle />}
        className="w-full !bg-green-500 !border-none hover:!bg-green-600"
        disabled={productosSeleccionados.length === 0}
        onClick={confirmarFactura}
      >
        Confirmar Factura
      </Button>
    </div>
  );
}

export default CrearFactura;
