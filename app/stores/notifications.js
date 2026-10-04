import { defineStore } from "pinia";
export const useNotificationsStore = defineStore("notifications", () => {
  const items = ref([]);
  const unreadCount = ref(0);
  const pagination = ref(null);
  const loading = ref(false);
  const error = ref("");
  const api = useApi();
  async function fetchNotifications() {
    loading.value = true;
    error.value = "";
    try {
      items.value = await api("/notifications");
    } catch (err) {
      items.value = [];
      error.value = err?.data?.message || "Could not load notifications";
    } finally {
      loading.value = false;
    }
  }
  async function fetchPage(page = 1) {
    loading.value = true;
    error.value = "";
    try {
      const data = await api(`/notifications/page?page=${page}&limit=20`);
      items.value = data.items;
      pagination.value = data.pagination;
    } catch (err) {
      error.value = err?.data?.message || "Could not load notifications";
      throw err;
    } finally {
      loading.value = false;
    }
  }
  async function fetchUnreadCount() {
    try {
      unreadCount.value = (await api("/notifications/unread-count")).count;
    } catch {
      unreadCount.value = 0;
    }
  }
  async function markRead(id) {
    const updated = await api(`/notifications/${id}/read`, { method: "PATCH" });
    const index = items.value.findIndex((item) => item.id === id);
    if (index !== -1) items.value[index] = updated;
    unreadCount.value = Math.max(0, unreadCount.value - 1);
  }
  async function markAllRead() {
    await api("/notifications/read-all", { method: "PATCH" });
    items.value = items.value.map((item) => ({
      ...item,
      is_read: true,
      read_at: item.read_at || new Date().toISOString(),
    }));
    unreadCount.value = 0;
  }
  async function remove(id) {
    await api(`/notifications/${id}`, { method: "DELETE" });
    const removed = items.value.find((item) => item.id === id);
    items.value = items.value.filter((item) => item.id !== id);
    if (removed && !removed.is_read) unreadCount.value = Math.max(0, unreadCount.value - 1);
  }
  function clear() {
    items.value = [];
    unreadCount.value = 0;
    pagination.value = null;
    error.value = "";
  }
  return {
    items,
    unreadCount,
    pagination,
    loading,
    error,
    fetchNotifications,
    fetchPage,
    fetchUnreadCount,
    markRead,
    markAllRead,
    remove,
    clear,
  };
});
