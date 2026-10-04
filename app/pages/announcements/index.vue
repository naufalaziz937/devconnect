<template>
  <div class="page"
    ><AppSidebar /><main
      ><header
        ><div
          ><p>ADMINISTRATION</p><h1>Announcements</h1
          ><span>Manage official platform announcements.</span></div
        ><NuxtLink to="/announcements/create">+ Create Announcement</NuxtLink></header
      ><div class="filters"
        ><input
          v-model="filters.search"
          placeholder="Search announcements..."
          @input="debounce"
        /><select v-model="filters.status" @change="load"
          ><option v-for="x in statuses" :value="x">{{ x }}</option></select
        ><select v-model="filters.type" @change="load"
          ><option value="all">All types</option
          ><option v-for="x in types" :value="x">{{ x }}</option></select
        ><select v-model="filters.priority" @change="load"
          ><option value="all">All priorities</option
          ><option v-for="x in priorities" :value="x">{{ x }}</option></select
        ></div
      ><p v-if="store.listLoading">Loading announcements…</p
      ><p v-else-if="store.error">{{ store.error }}</p
      ><p v-else-if="store.items.length === 0" class="empty"
        >No announcements yet. <NuxtLink to="/announcements/create">Create one</NuxtLink></p
      ><section v-else class="rows"
        ><article v-for="item in store.items" :key="item.id"
          ><NuxtLink :to="`/announcements/${item.id}`"
            ><strong>{{ item.title }}</strong
            ><p>{{ item.content }}</p></NuxtLink
          ><span>{{ item.type }} · {{ item.audience }}</span
          ><b>{{ item.status }}</b></article
        ></section
      ></main
    ></div
  >
</template>
<script setup>
const store = useAnnouncementsStore(),
  route = useRoute(),
  router = useRouter();
const statuses = ["all", "draft", "scheduled", "published", "archived"],
  types = ["general", "feature", "maintenance", "warning"],
  priorities = ["all", "normal", "important", "critical"];
const filters = reactive({
  page: Number(route.query.page) || 1,
  limit: 20,
  search: String(route.query.search || ""),
  status: String(route.query.status || "all"),
  type: String(route.query.type || "all"),
  audience: "all",
  priority: String(route.query.priority || "all"),
  sort: "newest",
});
let timer;
async function load() {
  await router.replace({ path: "/announcements", query: { ...filters } });
  await store.list(filters);
}
function debounce() {
  clearTimeout(timer);
  timer = setTimeout(load, 300);
}
await load();
</script>
<style scoped>
.page {
  min-height: 100vh;
  padding-left: 264px;
  background: #10131b;
  color: #e0e2ed;
}
.page main {
  max-width: 1100px;
  margin: auto;
  padding: 34px 28px;
}
header {
  display: flex;
  justify-content: space-between;
}
header p {
  color: #adc6ff;
  font: 600 9px monospace;
}
h1 {
  font-size: 32px;
}
header span,
.rows p {
  color: #9198a8;
}
.filters {
  display: grid;
  grid-template-columns: 1fr repeat(3, 150px);
  gap: 10px;
  margin: 24px 0;
}
.filters input,
.filters select {
  padding: 10px;
  border: 1px solid #414755;
  border-radius: 8px;
  background: #151923;
  color: #e0e2ed;
}
header a {
  padding: 10px;
  border: 1px solid #414755;
  border-radius: 8px;
  color: #adc6ff;
}
.rows {
  border: 1px solid #303642;
  border-radius: 12px;
}
.rows article {
  display: grid;
  grid-template-columns: 1fr 180px 100px;
  gap: 14px;
  padding: 15px;
  border-bottom: 1px solid #303642;
}
.rows p {
  margin: 4px 0;
  display: -webkit-box;
  overflow: hidden;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
.empty {
  padding: 55px;
  text-align: center;
}
@media (max-width: 900px) {
  .page {
    padding-left: 0;
  }
  .page main {
    padding: 78px 16px;
  }
  .filters {
    grid-template-columns: 1fr 1fr;
  }
  .filters input {
    grid-column: 1/-1;
  }
  .rows article {
    grid-template-columns: 1fr;
  }
}
</style>
