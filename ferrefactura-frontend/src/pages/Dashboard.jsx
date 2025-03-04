import { Link, useNavigate } from 'react-router-dom';
import { logout } from '../api/auth';

function Dashboard() {
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-900 text-white p-6">
      {/* Navbar */}
      <nav className="w-full flex justify-between items-center p-4 bg-gray-800 shadow-md">
        <h2 className="text-xl font-bold">FerreFactura</h2>
        <button
          onClick={handleLogout}
          className="bg-red-600 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        >
          Cerrar Sesión
        </button>
      </nav>
      
      {/* Panel de Control */}
      <div className="mt-10 text-center">
        <h1 className="text-4xl font-bold mb-6">Panel de Control</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Link to="/usuarios" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded shadow flex items-center justify-center">
            👤 Gestionar Usuarios
          </Link>
          <Link to="/facturas" className="bg-blue-600 hover:bg-blue-700 text-white font-bold py-3 px-6 rounded shadow flex items-center justify-center">
            📜 Gestionar Facturas
          </Link>
        </div>
      </div>
    </div>
  );
}

export default Dashboard;
