import { buildQueryParams } from "~/utils/queryParams";
import { defineStore } from "pinia";
export const useAdminReportsStore = defineStore("adminReports", () => {
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
      const data = await api(`/admin/reports?${q}`);
      items.value = data.items;
      summary.value = data.summary;
      pagination.value = data.pagination;
    } finally {
      loading.value = false;
    }
  }
  async function detail(id) {
    current.value = await api(`/admin/reports/${id}`);
    return current.value;
  }
  const action = (id, name, note = "") =>
    api(`/admin/reports/${id}/${name}`, { method: "PATCH", body: { note } });
  return { items, summary, pagination, loading, current, fetch, detail, action };
});
