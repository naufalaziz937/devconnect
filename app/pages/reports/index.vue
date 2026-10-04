<template>
  <div class="admin-page"
    ><AppSidebar /><main
      ><header
        ><div
          ><p>MODERATION</p><h1>Reports</h1
          ><span>Review reports submitted by the DevConnect community.</span></div
        ><button @click="load">Refresh</button></header
      ><section class="metrics"
        ><article v-for="key in ['pending', 'reviewing', 'resolved', 'dismissed']" :key="key"
          ><small>{{ key }}</small
          ><strong>{{ store.summary[key] ?? "—" }}</strong></article
        ></section
      ><nav
        ><button
          v-for="key in ['pending', 'reviewing', 'resolved', 'dismissed', 'all']"
          :key="key"
          :class="{ active: filters.status === key }"
          @click="
            filters.status = key;
            load();
          "
          >{{ key }}</button
        ></nav
      ><section class="tools"
        ><input v-model="filters.search" placeholder="Search reports" @input="debounced" /><select
          v-model="filters.targetType"
          @change="load"
          ><option value="all">All targets</option
          ><option value="devlog">DevLogs</option
          ><option value="comment">Comments</option
          ><option value="project">Projects</option
          ><option value="profile">Profiles</option></select
        ><select v-model="filters.reason" @change="load"
          ><option value="all">All reasons</option
          ><option v-for="reason in reasons" :key="reason" :value="reason">{{
            reason
          }}</option></select
        ></section
      ><p v-if="store.loading">Loading reports…</p
      ><p v-else-if="!store.items.length">No reports in this view.</p
      ><div v-else class="list"
        ><NuxtLink v-for="item in store.items" :key="item.id" :to="`/reports/${item.id}`"
          ><b>{{ item.targetType }}</b
          ><strong>{{ item.preview }}</strong
          ><span
            >Reported @{{ item.owner?.username || "deleted" }} · by @{{ item.reporter.username }} ·
            {{ item.reason }} · {{ item.status }}</span
          ></NuxtLink
        ></div
      ></main
    ></div
  >
</template>
<script setup>
const store = useAdminReportsStore(),
  filters = reactive({
    page: 1,
    limit: 20,
    status: "pending",
    targetType: "all",
    reason: "all",
    search: "",
    sort: "newest",
  });
const reasons = [
  "spam",
  "harassment",
  "hate_abuse",
  "scam",
  "inappropriate",
  "intellectual_property",
  "other",
];
let timer;
const load = () => store.fetch(filters);
const debounced = () => {
  clearTimeout(timer);
  timer = setTimeout(load, 300);
};
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
}
h1 {
  font-size: 32px;
}
header span,
small,
.list span {
  color: #969cac;
}
button {
  padding: 9px 12px;
  border: 1px solid #414755;
  border-radius: 8px;
  color: #adc6ff;
}
.metrics {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin: 28px 0;
}
.metrics article {
  padding: 16px;
  border: 1px solid #303642;
  border-radius: 12px;
  background: #151923;
}
.metrics strong {
  display: block;
  margin-top: 8px;
  font-size: 27px;
  text-transform: capitalize;
}
nav {
  display: flex;
  gap: 5px;
  margin-bottom: 14px;
}
nav .active {
  background: #263c60;
}
.tools {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
}
.tools input,
.tools select {
  padding: 10px;
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
  gap: 9px;
}
.list a {
  display: grid;
  gap: 5px;
  padding: 15px;
  border: 1px solid #303642;
  border-radius: 10px;
  background: #151923;
}
.list b {
  text-transform: uppercase;
  color: #adc6ff;
  font: 500 10px monospace;
}
.list strong {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
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
}
</style>
