import axios from 'axios';

const API_URL = 'http://127.0.0.1:8000/api-token-auth/';

export const login = async (username, password) => {
  try {
    const response = await axios.post(API_URL, {
      username: username.trim(),
      password: password
    }, {
      headers: { 'Content-Type': 'application/json' }
    });

    console.log("Token recibido:", response.data.token);
    localStorage.setItem('token', response.data.token);
    return response.data;
  } catch (error) {
    console.error("Error en la autenticación:", error.response?.data || error.message);
    throw error.response?.data || { error: 'Error en la autenticación' };
  }
};

export const getToken = () => {
  return localStorage.getItem('token');
};

export const isAuthenticated = () => {
  return !!localStorage.getItem('token');
};

export const logout = () => {
  localStorage.removeItem('token');
};
