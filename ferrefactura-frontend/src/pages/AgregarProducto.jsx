// src/pages/AgregarProducto.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { createProducto, createUsuario, createFactura } from "../api/api";

function AgregarProducto() {
  const [producto, setProducto] = useState({ nombre: "", precio: "", categoria: "", stock: "" });
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const handleChange = (e) => {
    setProducto({ ...producto, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createProducto(producto, token);
      navigate("/productos");
    } catch  {
      alert("Error al agregar producto");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-6">
      <h2 className="text-3xl font-bold mb-6">Agregar Producto</h2>
      <form className="w-full max-w-md bg-gray-800 p-6 rounded-lg" onSubmit={handleSubmit}>
        <input className="form-input" type="text" name="nombre" placeholder="Nombre" onChange={handleChange} required />
        <input className="form-input" type="number" name="precio" placeholder="Precio" onChange={handleChange} required />
        <input className="form-input" type="text" name="categoria" placeholder="Categoría" onChange={handleChange} required />
        <input className="form-input" type="number" name="stock" placeholder="Stock" onChange={handleChange} required />
        <button type="submit" className="btn-primary mt-4">Agregar</button>
      </form>
    </div>
  );
}

function AgregarUsuario() {
  const [usuario, setUsuario] = useState({ username: "", password: "", email: "" });
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const handleChange = (e) => {
    setUsuario({ ...usuario, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createUsuario(usuario, token);
      navigate("/usuarios");
    } catch  {
      alert("Error al agregar usuario");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-6">
      <h2 className="text-3xl font-bold mb-6">Agregar Usuario</h2>
      <form className="w-full max-w-md bg-gray-800 p-6 rounded-lg" onSubmit={handleSubmit}>
        <input className="form-input" type="text" name="username" placeholder="Nombre de usuario" onChange={handleChange} required />
        <input className="form-input" type="password" name="password" placeholder="Contraseña" onChange={handleChange} required />
        <input className="form-input" type="email" name="email" placeholder="Correo electrónico" onChange={handleChange} required />
        <button type="submit" className="btn-primary mt-4">Agregar</button>
      </form>
    </div>
  );
}

function CrearFactura() {
  const [factura, setFactura] = useState({ nombre_cliente: "", costo_envio: "", fecha_entrega: "" });
  const navigate = useNavigate();
  const token = localStorage.getItem("token");

  const handleChange = (e) => {
    setFactura({ ...factura, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await createFactura(factura, token);
      navigate("/facturas");
    } catch  {
      alert("Error al crear factura");
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-6">
      <h2 className="text-3xl font-bold mb-6">Crear Factura</h2>
      <form className="w-full max-w-md bg-gray-800 p-6 rounded-lg" onSubmit={handleSubmit}>
        <input className="form-input" type="text" name="nombre_cliente" placeholder="Nombre del Cliente" onChange={handleChange} required />
        <input className="form-input" type="number" name="costo_envio" placeholder="Costo de Envío" onChange={handleChange} required />
        <input className="form-input" type="date" name="fecha_entrega" placeholder="Fecha de Entrega" onChange={handleChange} required />
        <button type="submit" className="btn-primary mt-4">Crear</button>
      </form>
    </div>
  );
}

export { AgregarProducto, AgregarUsuario, CrearFactura };

// Estilos adicionales