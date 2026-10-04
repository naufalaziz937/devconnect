<template>
  <div class="admin-page"
    ><AppSidebar /><main
      ><NuxtLink to="/reports">← Reports</NuxtLink><p v-if="!report">Loading…</p
      ><article v-else
        ><p>REPORT #{{ report.id }}</p
        ><h1>{{ report.targetType }}</h1
        ><b>{{ report.status }}</b
        ><h2>{{ report.preview }}</h2
        ><dl
          ><dt>Reason</dt><dd>{{ report.reason }}</dd
          ><dt>Details</dt><dd>{{ report.details || "No additional details" }}</dd
          ><dt>Reporter</dt><dd>@{{ report.reporter.username }}</dd
          ><dt>Reported user</dt><dd>@{{ report.owner?.username || "Deleted account" }}</dd
          ><dt>Related reports</dt><dd>{{ report.reportCount }}</dd></dl
        ><div class="actions"
          ><button v-if="report.status === 'pending'" @click="act('review')">Start Review</button
          ><button v-if="['pending', 'reviewing'].includes(report.status)" @click="act('resolve')"
            >Hide target & resolve</button
          ><button v-if="['pending', 'reviewing'].includes(report.status)" @click="act('dismiss')"
            >Dismiss</button
          ></div
        ><p v-if="error">{{ error }}</p></article
      ></main
    ></div
  >
</template>
<script setup>
const route = useRoute(),
  store = useAdminReportsStore(),
  toast = useToastStore(),
  report = ref(null),
  error = ref("");
report.value = await store.detail(route.params.id);
async function act(name) {
  try {
    await store.action(report.value.id, name);
    report.value = await store.detail(route.params.id);
    toast.success("Report updated");
  } catch (e) {
    error.value = e?.data?.message || "Could not update report";
  }
}
</script>
<style scoped>
.admin-page {
  min-height: 100vh;
  padding-left: 264px;
  background: #10131b;
  color: #e0e2ed;
}
.admin-page main {
  max-width: 850px;
  margin: auto;
  padding: 34px 28px;
}
article {
  margin-top: 24px;
  padding: 24px;
  border: 1px solid #303642;
  border-radius: 14px;
  background: #151923;
}
article > p:first-child {
  color: #adc6ff;
  font: 600 10px monospace;
}
h1 {
  text-transform: capitalize;
  font-size: 31px;
}
h2 {
  margin: 25px 0;
  color: #cbd1df;
}
dl {
  display: grid;
  grid-template-columns: 150px 1fr;
  gap: 14px;
}
dt {
  color: #8e95a5;
}
.actions {
  display: flex;
  gap: 10px;
  margin-top: 25px;
  flex-wrap: wrap;
}
.actions button {
  padding: 10px 13px;
  border: 1px solid #414755;
  border-radius: 8px;
  color: #adc6ff;
}
@media (max-width: 900px) {
  .admin-page {
    padding-left: 0;
  }
  .admin-page main {
    padding: 78px 16px;
  }
}
</style>
