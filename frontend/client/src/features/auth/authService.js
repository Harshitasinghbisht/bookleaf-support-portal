import api from "../../lib/axios";

const login = async (credentials) => {
  const response = await api.post("/auth/login", credentials);
  return response.data;
};

const getMe = async () => {
  const response = await api.get("/auth/me");
  return response.data;
};

const logout = async () => {
  const response = await api.post("/auth/logout");
  return response.data;
};

const authService = {
  login,
  getMe,
  logout,
};

export default authService;
