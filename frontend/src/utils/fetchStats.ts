import api from "./api";

export const fetchStats = async () => {
  const response = await api.get("/clients/stats");
  return response.data;
};
