import { buildQueryParams } from "~/utils/queryParams";
import { defineStore } from "pinia";
export const useAdminModerationStore = defineStore("adminModeration", () => {
  const items = ref([]),
    summary = ref(null),
    pagination = ref(null),
    loading = ref(false),
    error = ref("");
  const api = useApi();
  async function fetch(params = {}) {
    loading.value = true;
    error.value = "";
    try {
      const q = buildQueryParams(params);
      const data = await api(`/admin/moderation?${q}`);
      items.value = data.items;
      summary.value = data.summary;
      pagination.value = data.pagination;
      return data;
    } catch (e) {
      error.value = e?.data?.message || "Unable to load moderation activity.";
      throw e;
    } finally {
      loading.value = false;
    }
  }
  async function restore(item, reason) {
    const base =
      item.targetType === "project"
        ? `/admin/projects/${item.targetId}`
        : `/admin/content/${item.targetType}/${item.targetId}`;
    await api(`${base}/restore`, { method: "PATCH", body: { reason } });
    items.value = items.value.filter((row) => row !== item);
  }
  return { items, summary, pagination, loading, error, fetch, restore };
});
