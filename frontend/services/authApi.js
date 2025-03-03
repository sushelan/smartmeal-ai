import api from './axiosInstance';

// Local Login
export const login = async (email, password) => {
  try {
    const response = await api.post('/auth/login', { email, password });
    // On success, you'll get the login response containing user info and token (if applicable)
    return response.data;
  } catch (error) {
    // You could parse error.response.data if needed
    throw error;
  }
};

// Google OAuth Start
// Since this endpoint redirects the user to Google, you don't use Axios to call it.
// Instead, simply redirect the browser:
export const startGoogleOAuth = () => {
  window.location.href = `${api.defaults.baseURL}/auth/google`;
};

// Google OAuth Callback
// Typically, the backend handles this callback and redirects the user.
// You may not need an Axios call here unless you want to validate something on the frontend.

// Logout
export const logout = async () => {
  try {
    const response = await api.post('/auth/logout');
    return response.data;
  } catch (error) {
    throw error;
  }
};

// Get Current User
export const getCurrentUser = async () => {
  try {
    const response = await api.get('/auth/me');
    return response.data;
  } catch (error) {
    throw error;
  }
};