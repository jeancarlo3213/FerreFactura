import { Link, useNavigate } from 'react-router-dom';
import { isAuthenticated, logout } from '../api/auth';

function Navbar() {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <nav>
      <Link to="/">Inicio</Link>
      {isAuthenticated() ? (
        <>
          <Link to="/facturas">Facturas</Link>
          <button onClick={handleLogout}>Cerrar sesión</button>
        </>
      ) : (
        <Link to="/login">Iniciar sesión</Link>
      )}
    </nav>
  );
}

export default Navbar;
