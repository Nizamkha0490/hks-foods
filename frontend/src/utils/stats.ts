import { fetchStats } from "./fetchStats";

export let statsState = {
  totalCustomers: 0,
  totalBalance: 0
};

export const refreshStats = async () => {
  const stats = await fetchStats();
  statsState = {
    totalCustomers: stats.totalClients,
    totalBalance: stats.totalBalance
  };
  // Add this line to trigger UI updates
  window.dispatchEvent(new Event("stats-updated"));
  return statsState;
};