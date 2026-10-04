import { defineStore } from "pinia";

export const useAdminStore = defineStore("admin", () => {
  const dashboard = ref(null);
  const loading = ref(false);
  const error = ref("");
  const lastFetched = ref(null);
  const api = useApi();
  async function fetchDashboard(force = false) {
    if (dashboard.value && !force) return dashboard.value;
    loading.value = true;
    error.value = "";
    try {
      dashboard.value = await api("/admin/dashboard");
      lastFetched.value = new Date().toISOString();
      return dashboard.value;
    } catch (err) {
      error.value = err?.data?.message || "Unable to load dashboard.";
      throw err;
    } finally {
      loading.value = false;
    }
  }
  const refreshDashboard = () => fetchDashboard(true);
  return { dashboard, loading, error, lastFetched, fetchDashboard, refreshDashboard };
});
