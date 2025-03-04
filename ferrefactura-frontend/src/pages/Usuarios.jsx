// src/pages/Usuarios.jsx
import { useEffect, useState } from 'react';
import { getToken, isAuthenticated } from '../api/auth';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import '../styles/usuarios.css';

function Usuarios() {
  const navigate = useNavigate();
  const [usuarios, setUsuarios] = useState([]);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login');
      return;
    }

    axios.get('http://127.0.0.1:8000/api/usuarios/', {
      headers: { Authorization: `Token ${getToken()}` },
    })
    .then(response => {
      setUsuarios(response.data);
    })
    .catch(error => {
      console.error('Error al obtener usuarios', error);
    });
  }, [navigate]);

  return (
    <div className="usuarios-container">
      <h2>Gestión de Usuarios</h2>
      <div className="usuarios-buttons">
        <button className="btn-primary" onClick={() => navigate('/usuarios/ver')}>Ver Usuarios</button>
        <button className="btn-secondary" onClick={() => navigate('/usuarios/nuevo')}>Crear Usuario</button>
        <button className="btn-warning" onClick={() => navigate('/usuarios/actualizar')}>Actualizar Usuario</button>
        <button className="btn-danger" onClick={() => navigate('/usuarios/eliminar')}>Eliminar Usuario</button>
      </div>
      <ul className="usuarios-list">
        {usuarios.map((usuario) => (
          <li key={usuario.id} className="usuario-item">
            Usuario: {usuario.username} - Rol: {usuario.rol}
          </li>
        ))}
      </ul>
    </div>
  );
}

export default Usuarios;
