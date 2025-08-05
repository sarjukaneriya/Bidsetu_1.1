import axios from 'axios';
import { getValidToken } from '../../utils/auth';

const API_URL = 'http://localhost:8000/api/v1';

const getAuthConfig = () => ({
  headers: {
    Authorization: `Bearer ${getValidToken()}`,
  },
});

const register = async (user) => {
  const response = await axios.post(`${API_URL}/users/register`, user);
  return response.data;
};

const login = async (user) => {
  const response = await axios.post(`${API_URL}/users/login`, user);
  if (response.data.data.user) {
    localStorage.setItem("user", JSON.stringify(response.data.data.user));
  }
  if (response.data.data.JwtToken) {
    const token = response.data.data.JwtToken;
    if (typeof token === 'string' && token.length > 10 && token.includes('.')) {
      localStorage.setItem("token", token);
    }
  }
  return response.data;
};

const logout = async () => {
  const response = await axios.post(`${API_URL}/users/logout`, {}, getAuthConfig());
  localStorage.removeItem('user');
  localStorage.removeItem('token');
  window.location.href = '/';
  return response.data;
};

const getCurrentUser = async () => {
  const response = await axios.get(`${API_URL}/users/current-user`, getAuthConfig());
  if (response.data.data.user) {
    localStorage.setItem("user", JSON.stringify(response.data.data.user));
  }
  return response.data;
};

const updateProfile = async (data) => {
  const response = await axios.put(`${API_URL}/users/update-user-profile`, data, getAuthConfig());
  return response.data;
};

export default {
  register,
  login,
  logout,
  getCurrentUser,
  updateProfile,
};