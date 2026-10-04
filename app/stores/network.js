import { defineStore } from "pinia";

export const useNetworkStore = defineStore("network", () => {
  const lists = reactive({ forYou: [], following: [], followers: [] });
  const pagination = reactive({ forYou: null, following: null, followers: null });
  const loaded = reactive({ forYou: false, following: false, followers: false });
  const loading = ref(false);
  const error = ref("");
  const api = useApi();
  let requestId = 0;
  async function fetchForYou(filters = {}, append = false) {
    const id = ++requestId;
    loading.value = true;
    error.value = "";
    try {
      const query = new URLSearchParams(
        Object.entries({ page: 1, limit: 15, sort: "newest", ...filters }).filter(
          ([, value]) => value !== "" && value != null,
        ),
      );
      const data = await api(`/profiles?${query}`);
      if (id !== requestId) return;
      const ownUuid = useAuthStore().user?.uuid;
      const people = data.items.filter((item) => item.uuid !== ownUuid);
      lists.forYou = append ? [...lists.forYou, ...people] : people;
      pagination.forYou = data.pagination;
      loaded.forYou = true;
    } catch (err) {
      if (id === requestId) error.value = err?.data?.message || "Could not load developers";
      throw err;
    } finally {
      if (id === requestId) loading.value = false;
    }
  }
  async function fetchConnections(tab, uuid, page = 1, append = false) {
    const id = ++requestId;
    loading.value = true;
    error.value = "";
    try {
      const data = await api(`/follow/${tab}/user/${uuid}?page=${page}&limit=15`);
      if (id !== requestId) return;
      lists[tab] = append ? [...lists[tab], ...data.items] : data.items;
      pagination[tab] = data.pagination;
      loaded[tab] = true;
    } catch (err) {
      if (id === requestId) error.value = err?.data?.message || `Could not load ${tab}`;
    } finally {
      if (id === requestId) loading.value = false;
    }
  }
  function setFollowing(uuid, value) {
    Object.values(lists).forEach((list) => {
      const person = list.find((item) => item.uuid === uuid);
      if (person) person.followed_by_me = value;
    });
    if (value) loaded.following = false;
    else lists.following = lists.following.filter((item) => item.uuid !== uuid);
  }
  function cancelPending() {
    requestId += 1;
    loading.value = false;
  }
  return {
    lists,
    pagination,
    loaded,
    loading,
    error,
    fetchForYou,
    fetchConnections,
    setFollowing,
    cancelPending,
  };
});
