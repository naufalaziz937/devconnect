import { defineStore } from "pinia";
export const useDiscoveryStore = defineStore("discovery", () => {
  const news = ref([]);
  const trends = ref([]);
  const newsLoading = ref(false);
  const trendsLoading = ref(false);
  const newsError = ref("");
  const trendsError = ref("");
  const api = useApi();
  async function fetchNews() {
    if (news.value.length) return;
    newsLoading.value = true;
    newsError.value = "";
    try {
      news.value = (await api("/discovery/news")).items;
    } catch (error) {
      newsError.value = error?.data?.message || "Dev News is temporarily unavailable.";
    } finally {
      newsLoading.value = false;
    }
  }
  async function fetchTrends() {
    if (trends.value.length) return;
    trendsLoading.value = true;
    trendsError.value = "";
    try {
      trends.value = (await api("/discovery/trends")).items;
    } catch (error) {
      trendsError.value = error?.data?.message || "Developer trends are temporarily unavailable.";
    } finally {
      trendsLoading.value = false;
    }
  }
  return {
    news,
    trends,
    newsLoading,
    trendsLoading,
    newsError,
    trendsError,
    fetchNews,
    fetchTrends,
  };
});
