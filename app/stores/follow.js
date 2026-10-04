import { defineStore } from "pinia";
export const useFollowStore = defineStore("follow", () => {
  const followers = ref([]);
  const following = ref([]);
  const error = ref("");
  const pending = ref([]);
  const api = useApi();
  async function load(id) {
    error.value = "";
    try {
      [followers.value, following.value] = await Promise.all([
        api(`/follow/followers/${id}`),
        api(`/follow/following/${id}`),
      ]);
    } catch (err) {
      followers.value = [];
      following.value = [];
      error.value = err?.data?.message || "Could not load connections";
    }
  }
  async function follow(id) {
    await api(`/follow/${id}`, { method: "POST" });
  }
  async function unfollow(id) {
    await api(`/follow/${id}`, { method: "DELETE" });
  }
  function syncUuid(uuid, value) {
    const developers = useDevelopersStore();
    const person = developers.items.find((item) => item.uuid === uuid);
    if (person) person.followed_by_me = value;
    if (developers.current?.uuid === uuid) {
      developers.current.followed_by_me = value;
      developers.current.follower_count = Math.max(
        0,
        Number(developers.current.follower_count || 0) + (value ? 1 : -1),
      );
    }
    useNetworkStore().setFollowing(uuid, value);
  }
  async function followUuid(uuid) {
    if (pending.value.includes(uuid)) return;
    pending.value.push(uuid);
    try {
      await api(`/follow/user/${uuid}`, { method: "POST" });
      syncUuid(uuid, true);
    } finally {
      pending.value = pending.value.filter((value) => value !== uuid);
    }
  }
  async function unfollowUuid(uuid) {
    if (pending.value.includes(uuid)) return;
    pending.value.push(uuid);
    try {
      await api(`/follow/user/${uuid}`, { method: "DELETE" });
      syncUuid(uuid, false);
    } finally {
      pending.value = pending.value.filter((value) => value !== uuid);
    }
  }
  async function status(uuid) {
    return api(`/follow/status/${uuid}`);
  }
  async function mutual(uuid, page = 1) {
    return api(`/follow/mutual/${uuid}?page=${page}&limit=20`);
  }
  async function followersByUuid(uuid, page = 1) {
    return api(`/follow/followers/user/${uuid}?page=${page}&limit=20`);
  }
  async function followingByUuid(uuid, page = 1) {
    return api(`/follow/following/user/${uuid}?page=${page}&limit=20`);
  }
  function clear() {
    followers.value = [];
    following.value = [];
    error.value = "";
    pending.value = [];
  }
  return {
    followers,
    following,
    error,
    pending,
    load,
    follow,
    unfollow,
    followUuid,
    unfollowUuid,
    status,
    mutual,
    followersByUuid,
    followingByUuid,
    clear,
  };
});
