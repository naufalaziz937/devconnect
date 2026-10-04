import { defineStore } from "pinia";

export const useFeedStore = defineStore("feed", () => {
  const items = ref([]);
  const page = ref(0);
  const hasMore = ref(true);
  const loading = ref(false);
  const error = ref("");
  const comments = ref({});
  const scope = ref("all");
  const api = useApi();

  async function fetchFeed(reset = false, nextScope = scope.value) {
    if (loading.value) return;
    if (reset) {
      page.value = 0;
      hasMore.value = true;
      scope.value = nextScope;
    }
    if (!hasMore.value) return;
    loading.value = true;
    error.value = "";
    try {
      const next = page.value + 1;
      const rows = await api(`/devlogs/feed?page=${next}&scope=${scope.value}`);
      items.value = reset ? rows : [...items.value, ...rows];
      page.value = next;
      hasMore.value = rows.length === 10;
    } catch (err) {
      error.value = err?.data?.message || "Could not load feed";
    } finally {
      loading.value = false;
    }
  }

  async function create(content, image_url) {
    const created = await api("/devlogs", { method: "POST", body: { content, image_url } });
    await fetchFeed(true);
    return created;
  }
  async function like(id) {
    await api(`/likes/${id}`, { method: "POST" });
    patchReaction(id, true);
  }
  async function unlike(id) {
    await api(`/likes/${id}`, { method: "DELETE" });
    patchReaction(id, false);
  }
  function patchReaction(id, liked) {
    const item = items.value.find((row) => String(row.id) === String(id));
    if (!item) return;
    item.liked_by_me = liked;
    item.total_likes = Math.max(0, Number(item.total_likes || 0) + (liked ? 1 : -1));
  }
  async function loadComments(id) {
    comments.value[id] = await api(`/comments/${id}`);
  }
  async function addComment(id, content) {
    await api(`/comments/${id}`, { method: "POST", body: { content } });
    await loadComments(id);
    const item = items.value.find((row) => String(row.id) === String(id));
    if (item) item.total_comments = Number(item.total_comments || 0) + 1;
  }
  async function fetchOne(id) {
    return api(`/devlogs/${id}`);
  }
  async function update(id, changes) {
    const updated = await api(`/devlogs/${id}`, { method: "PATCH", body: changes });
    const index = items.value.findIndex((item) => item.id === id);
    if (index !== -1) items.value[index] = { ...items.value[index], ...updated };
    return updated;
  }
  async function remove(id) {
    await api(`/devlogs/${id}`, { method: "DELETE" });
    items.value = items.value.filter((item) => item.id !== id);
    delete comments.value[id];
  }
  async function loadCommentsPage(id, page = 1) {
    return api(`/devlogs/${id}/comments?page=${page}&limit=20`);
  }
  async function updateComment(id, content) {
    return api(`/comments/${id}`, { method: "PATCH", body: { content } });
  }
  async function deleteComment(id) {
    return api(`/comments/${id}`, { method: "DELETE" });
  }
  async function upload(file) {
    const body = new FormData();
    body.append("image", file);
    const result = await api("/upload/image?purpose=devlog", { method: "POST", body, raw: true });
    return result.imageUrl;
  }
  function clear() {
    items.value = [];
    comments.value = {};
    page.value = 0;
    hasMore.value = true;
    error.value = "";
  }
  return {
    items,
    page,
    hasMore,
    loading,
    error,
    comments,
    scope,
    fetchFeed,
    create,
    fetchOne,
    update,
    remove,
    like,
    unlike,
    loadComments,
    loadCommentsPage,
    addComment,
    updateComment,
    deleteComment,
    upload,
    clear,
  };
});
