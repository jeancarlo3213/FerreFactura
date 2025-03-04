import { useState } from 'react';
import { login } from '../api/auth';
import { useNavigate } from 'react-router-dom';

function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleLogin = async (e) => {
    e.preventDefault();
    try {
      const response = await login(username.trim(), password);

      // Si el usuario es superadmin, guardarlo en localStorage
      localStorage.setItem('is_superuser', response.is_superuser ? 'true' : 'false');

      navigate('/dashboard'); // 🔹 Redirigir al Dashboard en lugar de facturas
    } catch (err) {
      console.error("Error de autenticación:", err);
      setError('Credenciales incorrectas');
    }
  };

  return (
    <div>
      <h2>Iniciar Sesión</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <form onSubmit={handleLogin}>
        <input
          type="text"
          placeholder="Usuario"
          value={username}
          onChange={(e) => setUsername(e.target.value)}
        />
        <input
          type="password"
          placeholder="Contraseña"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <button type="submit">Ingresar</button>
      </form>
    </div>
  );
}

export default Login;
