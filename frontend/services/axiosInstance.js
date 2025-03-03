
import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:5000/api", // Update this to match your backend's base URL
  timeout: 10000, // optional timeout in milliseconds
  withCredentials: true, // sends cookies along with requests if using sessions
});

export default api;
