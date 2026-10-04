import { buildQueryParams } from "~/utils/queryParams";
import { defineStore } from "pinia";
export const useAuditLogsStore = defineStore("auditLogs", () => {
  const items = ref([]),
    summary = ref(null),
    pagination = ref(null),
    selected = ref(null),
    loading = ref(false),
    error = ref("");
  const api = useApi();
  async function fetch(params = {}) {
    loading.value = true;
    error.value = "";
    try {
      const q = buildQueryParams(params);
      const data = await api(`/admin/audit-logs?${q}`);
      items.value = data.items;
      summary.value = data.summary;
      pagination.value = data.pagination;
      return data;
    } catch (e) {
      error.value = e?.data?.message || "Unable to load audit logs.";
      throw e;
    } finally {
      loading.value = false;
    }
  }
  async function detail(id) {
    selected.value = await api(`/admin/audit-logs/${id}`);
    return selected.value;
  }
  return { items, summary, pagination, selected, loading, error, fetch, detail };
});
