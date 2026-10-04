import { defineStore } from "pinia";

export const useSearchStore = defineStore("search", () => {
  const developers = ref(null);
  const projects = ref(null);
  const loading = ref(false);
  const error = ref("");
  const api = useApi();
  let requestId = 0;
  async function search(q, type = "all", page = 1) {
    const currentRequest = ++requestId;
    loading.value = true;
    error.value = "";
    try {
      const data = await api(
        `/search?q=${encodeURIComponent(q)}&type=${type}&page=${page}&limit=12`,
      );
      if (currentRequest !== requestId) return;
      const ownUuid = useAuthStore().user?.uuid;
      developers.value = data.developers
        ? {
            ...data.developers,
            items: data.developers.items.filter((item) => item.uuid !== ownUuid),
          }
        : null;
      projects.value = data.projects || null;
    } catch (err) {
      if (currentRequest !== requestId) return;
      error.value = err?.data?.message || "Search failed";
      throw err;
    } finally {
      if (currentRequest === requestId) loading.value = false;
    }
  }
  function clear() {
    requestId += 1;
    developers.value = null;
    projects.value = null;
    error.value = "";
    loading.value = false;
  }
  return { developers, projects, loading, error, search, clear };
});
