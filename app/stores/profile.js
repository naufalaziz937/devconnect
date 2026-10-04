import { defineStore } from "pinia";

export const useProfileStore = defineStore("profile", () => {
  const profile = ref(null);
  const viewed = ref(null);
  const loading = ref(false);
  const activityLoading = ref(false);
  const error = ref("");
  const activity = reactive({ devlogs: [], projects: [], comments: [], liked: [] });
  const activityPagination = reactive({
    devlogs: null,
    projects: null,
    comments: null,
    liked: null,
  });
  const api = useApi();
  async function fetchProfile() {
    loading.value = true;
    error.value = "";
    try {
      profile.value = await api("/profile/me");
    } catch (err) {
      profile.value = null;
      error.value = err?.data?.message || "Could not load profile";
    } finally {
      loading.value = false;
    }
  }
  async function update(data) {
    error.value = "";
    try {
      await api("/profile/me", { method: "PUT", body: data });
      await fetchProfile();
      const auth = useAuthStore();
      auth.user = { ...auth.user, ...profile.value };
      return profile.value;
    } catch (err) {
      error.value = err?.data?.message || "Could not update profile";
      throw err;
    }
  }
  async function uploadAvatar(file) {
    const body = new FormData();
    body.append("image", file);
    const uploaded = await api("/upload/image?purpose=avatar", { method: "POST", body, raw: true });
    await update({ ...profile.value, avatar_url: uploaded.imageUrl });
  }
  async function fetchView(uuid) {
    loading.value = true;
    error.value = "";
    try {
      viewed.value = await api(`/profiles/${uuid}`);
      return viewed.value;
    } catch (err) {
      viewed.value = null;
      error.value = err?.data?.message || "Could not load developer";
      throw err;
    } finally {
      loading.value = false;
    }
  }
  async function fetchActivity(uuid, type, page = 1, append = false) {
    activityLoading.value = true;
    error.value = "";
    try {
      const data = await api(`/profiles/${uuid}/activity?type=${type}&page=${page}&limit=10`);
      activity[type] = append ? [...activity[type], ...data.items] : data.items;
      activityPagination[type] = data.pagination;
      return data;
    } catch (err) {
      error.value = err?.data?.message || "Could not load profile activity";
      throw err;
    } finally {
      activityLoading.value = false;
    }
  }
  function patchFollow(value) {
    if (!viewed.value) return;
    if (viewed.value.followed_by_me === value) return;
    viewed.value.followed_by_me = value;
    viewed.value.follower_count = Math.max(
      0,
      Number(viewed.value.follower_count || 0) + (value ? 1 : -1),
    );
  }
  function clearView() {
    viewed.value = null;
    for (const key of Object.keys(activity)) {
      activity[key] = [];
      activityPagination[key] = null;
    }
  }
  function clear() {
    profile.value = null;
    clearView();
    error.value = "";
  }
  return {
    profile,
    viewed,
    activity,
    activityPagination,
    loading,
    activityLoading,
    error,
    fetchProfile,
    fetchView,
    fetchActivity,
    update,
    uploadAvatar,
    patchFollow,
    clearView,
    clear,
  };
});
