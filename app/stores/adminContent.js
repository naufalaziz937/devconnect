import { buildQueryParams } from "~/utils/queryParams";
import { defineStore } from "pinia";

export const useAdminContentStore = defineStore("admin-content", () => {
  const items = ref([]),
    summary = ref(null),
    pagination = ref(null),
    selected = ref(null),
    loading = ref(false),
    detailLoading = ref(false),
    error = ref("");
  const api = useApi();
  const message = (err, fallback) =>
    err?.data?.message || err?.data?.errors?.[0]?.message || fallback;
  async function fetchContent(params = {}) {
    loading.value = true;
    error.value = "";
    try {
      const q = buildQueryParams(params).toString();
      const data = await api(`/admin/content${q ? `?${q}` : ""}`);
      items.value = data.items;
      summary.value = data.summary;
      pagination.value = data.pagination;
      return data;
    } catch (err) {
      error.value = message(err, "Unable to load content.");
      throw err;
    } finally {
      loading.value = false;
    }
  }
  async function fetchDetail(type, id) {
    detailLoading.value = true;
    error.value = "";
    try {
      selected.value = await api(`/admin/content/${type}/${id}`);
      return selected.value;
    } catch (err) {
      error.value = message(err, "Unable to load content.");
      throw err;
    } finally {
      detailLoading.value = false;
    }
  }
  async function moderate(type, id, action, reason) {
    const changed = await api(`/admin/content/${type}/${id}/${action}`, {
      method: "PATCH",
      body: { reason },
    });
    const row = items.value.find((x) => x.type === type && String(x.id) === String(id));
    if (row) {
      row.status = changed.moderation_status;
      row.reason = changed.moderation_reason;
    }
    if (selected.value?.type === type && String(selected.value.id) === String(id)) {
      selected.value.status = changed.moderation_status;
      selected.value.reason = changed.moderation_reason;
    }
    return changed;
  }
  return {
    items,
    summary,
    pagination,
    selected,
    loading,
    detailLoading,
    error,
    fetchContent,
    fetchDetail,
    moderate,
  };
});
