// src/App.jsx
import { Routes, Route, Navigate } from 'react-router-dom';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Facturas from './pages/Facturas';
import Usuarios from './pages/Usuarios';
import Productos from './pages/Productos';
import './styles/App.css';
import { isAuthenticated } from './api/auth';

const PrivateRoute = ({ element }) => {
  return isAuthenticated() ? element : <Navigate to='/login' />;
};

function App() {
  return (
    <>
      <Navbar />
      <Routes>
        <Route path='/' element={<Home />} />
        <Route path='/login' element={<Login />} />
        <Route path='/dashboard' element={<PrivateRoute element={<Dashboard />} />} />
        <Route path='/facturas' element={<PrivateRoute element={<Facturas />} />} />
        <Route path='/usuarios' element={<PrivateRoute element={<Usuarios />} />} />
        <Route path='/productos' element={<PrivateRoute element={<Productos />} />} />
      </Routes>
    </>
  );
}

export default App;