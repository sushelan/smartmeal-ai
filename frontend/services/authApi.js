import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5001/api", // Must match your backend URL
  timeout: 10000,
  withCredentials: true,
});

export const login = async (email, password) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const signup = async ({ name, email, password }) => {
  try {
    const response = await api.post('/auth/signup', { name, email, password });
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const startGoogleOAuth = () => {
  window.location.href = `${api.defaults.baseURL}/auth/google`;
};

export const logout = async () => {
  try {
    const response = await api.post('/auth/logout');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getCurrentUser = async () => {
  try {
    const response = await api.get('/auth/me');
    return response.data;
  } catch (error) {
    throw error;
  }
};

export default api;