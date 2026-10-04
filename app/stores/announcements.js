export const useAnnouncementsStore = defineStore("announcements", () => {
  const items = ref([]),
    current = ref(null),
    active = ref([]),
    pagination = ref(null),
    listLoading = ref(false),
    saving = ref(false),
    userLoading = ref(false),
    error = ref("");
  const api = useApi();
  const qs = (o) => new URLSearchParams(Object.entries(o).filter(([, v]) => v !== "" && v != null));
  async function list(o = {}) {
    listLoading.value = true;
    error.value = "";
    try {
      const d = await api(`/announcements/admin/list?${qs(o)}`);
      items.value = d.items;
      pagination.value = d.pagination;
      return d;
    } catch (e) {
      error.value = e?.data?.message || "Unable to load announcements.";
      throw e;
    } finally {
      listLoading.value = false;
    }
  }
  async function detail(id) {
    current.value = await api(`/announcements/admin/${id}`);
    return current.value;
  }
  async function create(data) {
    saving.value = true;
    try {
      return await api("/announcements/admin", { method: "POST", body: data });
    } finally {
      saving.value = false;
    }
  }
  async function update(id, data) {
    saving.value = true;
    try {
      return await api(`/announcements/admin/${id}`, { method: "PATCH", body: data });
    } finally {
      saving.value = false;
    }
  }
  async function action(id, name) {
    saving.value = true;
    try {
      return await api(`/announcements/admin/${id}/${name}`, { method: "POST" });
    } finally {
      saving.value = false;
    }
  }
  async function fetchActive() {
    userLoading.value = true;
    try {
      active.value = (await api("/announcements")).items;
    } catch {
      active.value = [];
    } finally {
      userLoading.value = false;
    }
  }
  async function dismiss(id) {
    await api(`/announcements/${id}/dismiss`, { method: "POST" });
    active.value = active.value.filter((x) => x.id !== id);
  }
  return {
    items,
    current,
    active,
    pagination,
    listLoading,
    saving,
    userLoading,
    error,
    list,
    detail,
    create,
    update,
    action,
    fetchActive,
    dismiss,
  };
});
