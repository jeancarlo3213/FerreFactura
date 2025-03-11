import { Routes, Route, Navigate } from "react-router-dom";
import Navbar from "./components/Navbar";
import Home from "./pages/Home";
import Login from "./pages/Login";
import Dashboard from "./pages/Dashboard";
import Facturas from "./pages/Facturas";
import Usuarios from "./pages/Usuarios";
import Productos from "./pages/Productos";
import VerFacturaDetalle from "./pages/VerFacturaDetalle";
import CrearFactura from "./pages/CrearFactura"; // Asegurar importación correcta
import "./styles/App.css";
import { isAuthenticated } from "./api/auth";
import 'antd/dist/reset.css';



const PrivateRoute = ({ element }) => {
  return isAuthenticated() ? element : <Navigate to="/login" />;
};

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/verfactura/:id" element={<VerFacturaDetalle />} />
        <Route path="/dashboard" element={<PrivateRoute element={<Dashboard />} />} />
        <Route path="/facturas" element={<PrivateRoute element={<Facturas />} />} />
        <Route path="/usuarios" element={<PrivateRoute element={<Usuarios />} />} />
        <Route path="/productos" element={<PrivateRoute element={<Productos />} />} />
        <Route path="/crearfactura" element={<PrivateRoute element={<CrearFactura />} />} />
      </Routes>
    </>
  );
}

export default App;
