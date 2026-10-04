import { buildQueryParams } from "~/utils/queryParams";
import { defineStore } from "pinia";
export const useAdminProjectsStore = defineStore("adminProjects", () => {
  const items = ref([]),
    summary = ref({}),
    pagination = ref({}),
    loading = ref(false),
    current = ref(null);
  const api = useApi();
  async function fetch(params = {}) {
    loading.value = true;
    try {
      const q = buildQueryParams(params);
      const data = await api(`/admin/projects?${q}`);
      items.value = data.items;
      summary.value = data.summary;
      pagination.value = data.pagination;
    } finally {
      loading.value = false;
    }
  }
  async function detail(id) {
    current.value = await api(`/admin/projects/${id}`);
    return current.value;
  }
  async function moderate(id, action, reason) {
    return api(`/admin/projects/${id}/${action}`, { method: "PATCH", body: { reason } });
  }
  return { items, summary, pagination, loading, current, fetch, detail, moderate };
});
