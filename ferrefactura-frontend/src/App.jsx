import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import Home from './pages/Home';
import Login from './pages/Login';
import Facturas from './pages/Facturas';
import Dashboard from './pages/Dashboard'; // 🔹 Agregado para navegación principal
import Navbar from './components/Navbar';

function App() {
  return (
    <Router>
      <Navbar />
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
        <Route path="/dashboard" element={<Dashboard />} /> {/* 🔹 Nueva pantalla de Dashboard */}
        <Route path="/facturas" element={<Facturas />} />
      </Routes>
    </Router>
  );
}

export default App;
