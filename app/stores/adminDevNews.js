export const useAdminDevNewsStore = defineStore("adminDevNews", () => {
  const items = ref([]),
    sources = ref([]),
    summary = ref(null),
    pagination = ref(null),
    loading = ref(false),
    refreshing = ref(false),
    error = ref("");
  const api = useApi();
  async function fetch(params = {}) {
    loading.value = true;
    error.value = "";
    try {
      const q = new URLSearchParams(
        Object.entries(params).filter(([, value]) => value !== "" && value != null),
      );
      const data = await api(`/admin/dev-news?${q}`);
      items.value = data.items;
      sources.value = data.sources;
      summary.value = data.summary;
      pagination.value = data.pagination;
      return data;
    } catch (e) {
      error.value = e?.data?.message || "Unable to load Dev News.";
      throw e;
    } finally {
      loading.value = false;
    }
  }
  async function refresh() {
    refreshing.value = true;
    try {
      return await api("/admin/dev-news/refresh", { method: "POST" });
    } finally {
      refreshing.value = false;
    }
  }
  async function visibility(id, visibility) {
    return api(`/admin/dev-news/articles/${id}/visibility`, {
      method: "PATCH",
      body: { visibility },
    });
  }
  async function sourceEnabled(id, enabled) {
    return api(`/admin/dev-news/sources/${id}`, { method: "PATCH", body: { enabled } });
  }
  return {
    items,
    sources,
    summary,
    pagination,
    loading,
    refreshing,
    error,
    fetch,
    refresh,
    visibility,
    sourceEnabled,
  };
});
