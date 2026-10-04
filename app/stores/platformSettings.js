export const usePlatformSettingsStore = defineStore("platformSettings", () => {
  const settings = ref(null),
    original = ref(null),
    config = ref(null),
    loading = ref(false),
    saving = ref(false),
    error = ref("");
  const api = useApi();
  const dirty = computed(
    () =>
      settings.value &&
      original.value &&
      JSON.stringify(settings.value) !== JSON.stringify(original.value),
  );
  async function fetchAdmin() {
    loading.value = true;
    error.value = "";
    try {
      const data = await api("/admin/settings");
      settings.value = { ...data };
      original.value = { ...data };
      return data;
    } catch (e) {
      error.value = e?.data?.message || "Unable to load platform settings.";
      throw e;
    } finally {
      loading.value = false;
    }
  }
  async function save() {
    saving.value = true;
    try {
      const data = await api("/admin/settings", { method: "PATCH", body: settings.value });
      settings.value = { ...data };
      original.value = { ...data };
      config.value = null;
      return data;
    } finally {
      saving.value = false;
    }
  }
  function discard() {
    settings.value = { ...original.value };
  }
  async function fetchConfig() {
    if (config.value) return config.value;
    config.value = await api("/config");
    return config.value;
  }
  return {
    settings,
    original,
    config,
    loading,
    saving,
    error,
    dirty,
    fetchAdmin,
    save,
    discard,
    fetchConfig,
  };
});
