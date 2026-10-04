<template>
  <div class="admin-page"
    ><AppSidebar /><main
      ><header
        ><div
          ><p>MANAGEMENT</p><h1>Projects</h1
          ><span>Review projects created by the DevConnect community.</span></div
        ><button @click="load">Refresh</button></header
      ><section class="metrics"
        ><article
          ><small>Total Projects</small><strong>{{ store.summary.total ?? "—" }}</strong></article
        ><article
          ><small>Active Projects</small><strong>{{ store.summary.active ?? "—" }}</strong></article
        ><article
          ><small>Open for Collaboration</small
          ><strong>{{ store.summary.open ?? "—" }}</strong></article
        ><article
          ><small>Reported Projects</small
          ><strong>{{ store.summary.reported ?? "—" }}</strong></article
        ></section
      ><section class="tools"
        ><input v-model="filters.search" placeholder="Search projects" @input="debounced" /><select
          v-model="filters.status"
          @change="load"
          ><option value="visible">Visible</option
          ><option value="hidden">Hidden</option
          ><option value="all">All states</option></select
        ><select v-model="filters.collaboration" @change="load"
          ><option value="all">All collaboration</option
          ><option value="open">Open</option
          ><option value="closed">Closed</option
          ><option value="completed">Completed</option></select
        ></section
      ><p v-if="store.loading">Loading projects…</p
      ><p v-else-if="!store.items.length">No projects match these filters.</p
      ><div v-else class="list"
        ><article v-for="item in store.items" :key="item.id"
          ><NuxtLink :to="`/project/${item.id}`"
            ><strong>{{ item.title }}</strong
            ><p>{{ item.description }}</p></NuxtLink
          ><span
            >@{{ item.owner.username }} · {{ item.members }} members ·
            {{ item.reports }} reports</span
          ><div
            ><b v-for="stack in item.stacks.slice(0, 3)" :key="stack.id">{{ stack.name }}</b
            ><em :class="item.moderationStatus">{{ item.moderationStatus }}</em></div
          ></article
        ></div
      ></main
    ></div
  >
</template>
<script setup>
const store = useAdminProjectsStore();
const route = useRoute();
const router = useRouter();
const filters = reactive({
  page: Number(route.query.page) || 1,
  limit: 20,
  search: String(route.query.search || ""),
  status: String(route.query.status || "visible"),
  collaboration: String(route.query.collaboration || "all"),
  sort: String(route.query.sort || "newest"),
});
let timer;
const debounced = () => {
  clearTimeout(timer);
  timer = setTimeout(load, 300);
};
async function load() {
  const query = Object.fromEntries(
    Object.entries(filters).filter(
      ([key, value]) =>
        !(
          (key === "page" && value === 1) ||
          (key === "status" && value === "visible") ||
          (key === "collaboration" && value === "all") ||
          (key === "sort" && value === "newest") ||
          value === ""
        ),
    ),
  );
  await router.replace({ path: "/project", query });
  return store.fetch(filters);
}
await load();
</script>
<style scoped>
.admin-page {
  min-height: 100vh;
  padding-left: 264px;
  background: #10131b;
  color: #e0e2ed;
}
.admin-page main {
  max-width: 1200px;
  margin: auto;
  padding: 34px 28px;
}
header {
  display: flex;
  justify-content: space-between;
  gap: 20px;
}
header p {
  color: #adc6ff;
  font: 600 10px monospace;
  letter-spacing: 0.14em;
}
h1 {
  font-size: 32px;
}
header span,
article p {
  color: #969cac;
}
button {
  height: max-content;
  padding: 10px 14px;
  border: 1px solid #414755;
  border-radius: 9px;
  color: #adc6ff;
}
.metrics {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin: 28px 0;
}
.metrics article,
.list article {
  padding: 16px;
  border: 1px solid #303642;
  border-radius: 12px;
  background: #151923;
}
.metrics small,
.list span {
  color: #8e95a5;
}
.metrics strong {
  display: block;
  margin-top: 8px;
  font-size: 27px;
}
.tools {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
}
.tools input,
.tools select {
  height: 42px;
  padding: 0 12px;
  border: 1px solid #414755;
  border-radius: 8px;
  background: #10131b;
  color: #e0e2ed;
}
.tools input {
  flex: 1;
}
.list {
  display: grid;
  gap: 10px;
}
.list article {
  display: grid;
  gap: 8px;
}
.list a strong {
  font-size: 18px;
}
.list p {
  margin-top: 5px;
}
.list b,
.list em {
  display: inline-block;
  margin: 4px 6px 0 0;
  padding: 4px 7px;
  border-radius: 99px;
  background: #202735;
  color: #adc6ff;
  font: 500 10px monospace;
}
.list em.hidden {
  color: #ffb595;
}
@media (max-width: 900px) {
  .admin-page {
    padding-left: 0;
  }
  .admin-page main {
    padding: 78px 16px;
  }
  .metrics {
    grid-template-columns: repeat(2, 1fr);
  }
  .tools {
    flex-wrap: wrap;
  }
  .tools input {
    width: 100%;
    flex-basis: 100%;
  }
}
</style>
