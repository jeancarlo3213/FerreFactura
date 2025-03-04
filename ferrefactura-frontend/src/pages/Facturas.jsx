import { useEffect, useState } from 'react';
import { getToken, isAuthenticated } from '../api/auth';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

function Facturas() {
  const navigate = useNavigate();
  const [facturas, setFacturas] = useState([]);

  useEffect(() => {
    if (!isAuthenticated()) {
      navigate('/login'); // 🔹 Redirigir a login si no está autenticado
      return;
    }

    const token = getToken();
    if (!token) {
      navigate('/login');
      return;
    }

    axios.get('http://127.0.0.1:8000/api/facturas/', {
      headers: { Authorization: `Token ${token}` },
    })
    .then(response => {
      setFacturas(response.data);
    })
    .catch(error => {
      console.error('Error al obtener facturas', error);
    });
  }, [navigate]);

  return (
    <div>
      <h2>Facturas</h2>
      {facturas.length === 0 ? (
        <p>No hay facturas registradas.</p>
      ) : (
        <ul>
          {facturas.map((factura) => (
            <li key={factura.id}>
              Factura #{factura.id} - Cliente: {factura.nombre_cliente}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default Facturas;
