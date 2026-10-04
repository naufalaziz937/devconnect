<template>
  <div class="page"
    ><AppSidebar /><main
      ><NuxtLink to="/announcements">← Announcements</NuxtLink><h1>Create Announcement</h1
      ><p>Create an official announcement for DevConnect users.</p
      ><AnnouncementForm :saving="s.saving" @submit="save" /></main
  ></div>
</template>
<script setup>
const s = useAnnouncementsStore(),
  toast = useToastStore();
async function save(data) {
  try {
    const item = await s.create(data);
    toast.success(data.mode === "draft" ? "Announcement saved as draft." : "Announcement created.");
    navigateTo(`/announcements/${item.id}`);
  } catch (e) {
    toast.error(e?.data?.message || "Failed to create announcement.");
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
  margin: 18px 0 4px;
  font-size: 30px;
}
.page p {
  margin-bottom: 24px;
  color: #9198a8;
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
