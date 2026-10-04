import { buildQueryParams } from "~/utils/queryParams";
import { defineStore } from "pinia";
export const useAdminStacksStore = defineStore("adminStacks", () => {
  const items = ref([]),
    summary = ref({}),
    pagination = ref({}),
    loading = ref(false);
  const api = useApi();
  async function fetch(params = {}) {
    loading.value = true;
    try {
      const q = buildQueryParams(params);
      const data = await api(`/admin/stacks?${q}`);
      items.value = data.items;
      summary.value = data.summary;
      pagination.value = data.pagination;
    } finally {
      loading.value = false;
    }
  }
  const create = (data) => api("/admin/stacks", { method: "POST", body: data });
  const update = (id, data) => api(`/admin/stacks/${id}`, { method: "PATCH", body: data });
  return { items, summary, pagination, loading, fetch, create, update };
});
