import { buildQueryParams } from "~/utils/queryParams";
import { defineStore } from "pinia";

export const useAdminUsersStore = defineStore("admin-users", () => {
  const users = ref([]);
  const summary = ref(null);
  const pagination = ref(null);
  const selected = ref(null);
  const loading = ref(false);
  const detailLoading = ref(false);
  const error = ref("");
  const api = useApi();
  const message = (err, fallback) =>
    err?.data?.message || err?.data?.errors?.[0]?.message || fallback;
  async function fetchUsers(params = {}) {
    loading.value = true;
    error.value = "";
    try {
      const query = buildQueryParams(params).toString();
      const data = await api(`/admin/users${query ? `?${query}` : ""}`);
      users.value = data.users;
      summary.value = data.summary;
      pagination.value = data.pagination;
      return data;
    } catch (err) {
      error.value = message(err, "Unable to load users.");
      throw err;
    } finally {
      loading.value = false;
    }
  }
  async function fetchUser(id) {
    detailLoading.value = true;
    error.value = "";
    try {
      selected.value = await api(`/admin/users/${encodeURIComponent(id)}`);
      return selected.value;
    } catch (err) {
      error.value = message(err, "Unable to load user.");
      throw err;
    } finally {
      detailLoading.value = false;
    }
  }
  async function changeRole(id, role) {
    const changed = await api(`/admin/users/${encodeURIComponent(id)}/role`, {
      method: "PATCH",
      body: { role },
    });
    const row = users.value.find((u) => u.id === id);
    if (row) row.role = role;
    if (selected.value?.id === id) selected.value.role = role;
    return changed;
  }
  return {
    users,
    summary,
    pagination,
    selected,
    loading,
    detailLoading,
    error,
    fetchUsers,
    fetchUser,
    changeRole,
  };
});
