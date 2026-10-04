import { defineStore } from "pinia";

export const useDevelopersStore = defineStore("developers", () => {
  const items = ref([]);
  const pagination = ref(null);
  const current = ref(null);
  const devlogs = ref([]);
  const loading = ref(false);
  const error = ref("");
  const api = useApi();
  async function search(filters = {}) {
    loading.value = true;
    error.value = "";
    try {
      const query = new URLSearchParams(
        Object.entries(filters).filter(([, value]) => value !== "" && value != null),
      );
      const data = await api(`/profiles?${query}`);
      const ownUuid = useAuthStore().user?.uuid;
      items.value = data.items.filter((item) => item.uuid !== ownUuid);
      pagination.value = data.pagination;
    } catch (err) {
      error.value = err?.data?.message || "Could not load developers";
      throw err;
    } finally {
      loading.value = false;
    }
  }
  async function fetchOne(uuid) {
    loading.value = true;
    error.value = "";
    try {
      current.value = await api(`/profiles/${uuid}`);
      return current.value;
    } catch (err) {
      current.value = null;
      error.value = err?.data?.message || "Could not load developer";
      throw err;
    } finally {
      loading.value = false;
    }
  }
  async function fetchDevlogs(uuid, page = 1) {
    const data = await api(`/profiles/${uuid}/devlogs?page=${page}&limit=10`);
    devlogs.value = data.items;
    return data;
  }
  function clearCurrent() {
    current.value = null;
    devlogs.value = [];
  }
  return {
    items,
    pagination,
    current,
    devlogs,
    loading,
    error,
    search,
    fetchOne,
    fetchDevlogs,
    clearCurrent,
  };
});
