import { defineStore } from "pinia";

export const useTeammatesStore = defineStore("teammates", () => {
  const posts = ref([]);
  const members = ref({});
  const loading = ref(false);
  const error = ref("");
  const current = ref(null);
  const pagination = ref(null);
  const api = useApi();
  async function fetchPosts() {
    loading.value = true;
    error.value = "";
    try {
      posts.value = await api("/teammates");
    } catch (err) {
      error.value = err?.data?.message || "Could not load projects";
    } finally {
      loading.value = false;
    }
  }
  async function create(data) {
    const needed_skills = Array.isArray(data.needed_skills)
      ? data.needed_skills
      : data.needed_skills
          .split(",")
          .map((skill) => skill.trim())
          .filter(Boolean);
    const created = await api("/teammates", { method: "POST", body: { ...data, needed_skills } });
    posts.value = [created, ...posts.value];
    return created;
  }
  async function loadMembers(id) {
    members.value[id] = await api(`/teammates/members/${id}`);
  }
  async function join(id) {
    await api(`/teammates/join/${id}`, { method: "POST" });
    await Promise.all([loadMembers(id), fetchPosts()]);
  }
  async function accept(postId, userId) {
    await api(`/teammates/accept/${postId}/${userId}`, { method: "PATCH" });
    await loadMembers(postId);
    await fetchPosts();
  }
  async function browse(filters = {}) {
    loading.value = true;
    error.value = "";
    try {
      const query = new URLSearchParams(
        Object.entries(filters).filter(([, value]) => value !== "" && value != null),
      );
      const data = await api(`/teammates/browse?${query}`);
      posts.value = data.items;
      pagination.value = data.pagination;
    } catch (err) {
      error.value = err?.data?.message || "Could not load projects";
      throw err;
    } finally {
      loading.value = false;
    }
  }
  async function fetchOne(id) {
    loading.value = true;
    error.value = "";
    try {
      current.value = await api(`/teammates/${id}`);
      return current.value;
    } catch (err) {
      current.value = null;
      error.value = err?.data?.message || "Could not load project";
      throw err;
    } finally {
      loading.value = false;
    }
  }
  async function update(id, changes) {
    current.value = await api(`/teammates/${id}`, { method: "PATCH", body: changes });
    return current.value;
  }
  async function remove(id) {
    await api(`/teammates/${id}`, { method: "DELETE" });
    posts.value = posts.value.filter((post) => post.id !== id);
    current.value = null;
  }
  async function request(id) {
    await api(`/teammates/${id}/requests`, { method: "POST" });
    await fetchOne(id);
  }
  async function cancel(id) {
    await api(`/teammates/${id}/requests/me`, { method: "DELETE" });
    await fetchOne(id);
  }
  async function leave(id) {
    await api(`/teammates/${id}/members/me`, { method: "DELETE" });
    await fetchOne(id);
  }
  async function acceptUuid(id, uuid) {
    await api(`/teammates/${id}/requests/${uuid}/accept`, { method: "PATCH" });
    await Promise.all([loadMembers(id), fetchOne(id)]);
  }
  async function rejectUuid(id, uuid) {
    await api(`/teammates/${id}/requests/${uuid}/reject`, { method: "PATCH" });
    await loadMembers(id);
  }
  async function removeMember(id, uuid) {
    await api(`/teammates/${id}/members/${uuid}`, { method: "DELETE" });
    await Promise.all([loadMembers(id), fetchOne(id)]);
  }
  function clear() {
    posts.value = [];
    members.value = {};
    current.value = null;
    pagination.value = null;
    error.value = "";
  }
  return {
    posts,
    members,
    current,
    pagination,
    loading,
    error,
    fetchPosts,
    browse,
    fetchOne,
    create,
    update,
    remove,
    loadMembers,
    join,
    request,
    cancel,
    leave,
    accept,
    acceptUuid,
    rejectUuid,
    removeMember,
    clear,
  };
});
