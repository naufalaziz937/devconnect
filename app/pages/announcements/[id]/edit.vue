<template>
  <div class="page"
    ><AppSidebar /><main
      ><NuxtLink :to="`/announcements/${route.params.id}`">← Announcement</NuxtLink
      ><h1>Edit Announcement</h1><p v-if="loading">Loading…</p
      ><AnnouncementForm
        v-else-if="s.current"
        :model-value="form"
        :saving="s.saving"
        @submit="save" /></main
  ></div>
</template>
<script setup>
const s = useAnnouncementsStore(),
  route = useRoute(),
  toast = useToastStore(),
  loading = ref(true);
try {
  await s.detail(route.params.id);
} catch {
} finally {
  loading.value = false;
}
const local = (v) => (v ? new Date(v).toISOString().slice(0, 16) : "");
const form = computed(() => ({
  ...s.current,
  startsAt: local(s.current?.startsAt),
  expiresAt: local(s.current?.expiresAt),
}));
async function save(data) {
  try {
    delete data.mode;
    await s.update(route.params.id, data);
    toast.success("Announcement updated.");
    navigateTo(`/announcements/${route.params.id}`);
  } catch (e) {
    toast.error(e?.data?.message || "Failed to update announcement.");
  }
}
</script>
<style scoped>
.page {
  min-height: 100vh;
  padding-left: 264px;
  background: #10131b;
  color: #e0e2ed;
}
.page main {
  max-width: 900px;
  margin: auto;
  padding: 34px 28px;
}
.page > a {
  color: #adc6ff;
}
h1 {
  font-size: 30px;
  margin: 18px 0;
}
@media (max-width: 900px) {
  .page {
    padding-left: 0;
  }
  .page main {
    padding: 78px 16px;
  }
}
</style>
