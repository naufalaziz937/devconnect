<template>
  <div class="moderation-page"
    ><AppSidebar /><main
      ><header
        ><div
          ><p>MODERATION CENTER</p><h1>Moderation</h1
          ><span>Review and manage moderation activity across DevConnect.</span></div
        ><button :disabled="store.loading" @click="load">Refresh</button></header
      ><section v-if="!store.summary" class="summary"
        ><article v-for="n in 4" :key="n" class="skeleton" /></section
      ><section v-else class="summary"
        ><article
          ><small>Needs Review</small><strong>{{ store.summary.needs_review }}</strong></article
        ><article
          ><small>Under Review</small><strong>{{ store.summary.under_review }}</strong></article
        ><article
          ><small>Active Actions</small><strong>{{ store.summary.active_actions }}</strong></article
        ><article
          ><small>Resolved Today</small><strong>{{ store.summary.resolved_today }}</strong></article
        ></section
      ><nav
        ><button
          v-for="tab in tabs"
          :key="tab.value"
          :class="{ active: filters.view === tab.value }"
          @click="changeView(tab.value)"
          >{{ tab.label }}</button
        ></nav
      ><section class="filters"
        ><input
          v-model="filters.search"
          placeholder="Search moderation..."
          @input="debounced"
        /><select v-model="filters.targetType" @change="resetLoad"
          ><option value="all">All targets</option
          ><option value="devlog">DevLogs</option
          ><option value="comment">Comments</option
          ><option value="project">Projects</option
          ><option value="profile">Users</option></select
        ><select v-if="filters.view !== 'active'" v-model="filters.reason" @change="resetLoad"
          ><option value="all">All reasons</option
          ><option v-for="reason in reasons" :key="reason" :value="reason">{{
            label(reason)
          }}</option></select
        ><select v-model="filters.sort" @change="resetLoad"
          ><option value="newest">Newest</option
          ><option value="oldest">Oldest</option
          ><option v-if="filters.view === 'review'" value="most_reported"
            >Most reported</option
          ></select
        ></section
      ><div v-if="store.loading && !store.items.length" class="list"
        ><article v-for="n in 5" :key="n" class="row skeleton" /></div
      ><section v-else-if="store.error" class="state"
        ><p>{{ store.error }}</p
        ><button @click="load">Try Again</button></section
      ><section v-else-if="!store.items.length" class="state"
        ><p>No moderation activity in this view.</p></section
      ><section v-else class="list"
        ><article
          v-for="item in store.items"
          :key="`${item.targetType}-${item.targetId}-${item.id}`"
          class="row"
          ><div class="target"
            ><small>{{ label(item.targetType) }}</small
            ><strong>{{ item.preview || "Content no longer available." }}</strong
            ><span v-if="item.owner">@{{ item.owner.username }}</span></div
          ><div
            ><small>{{ filters.view === "active" ? "Action" : "Signal" }}</small
            ><strong>{{ filters.view === "active" ? "Hidden" : label(item.reason) }}</strong
            ><span v-if="item.reportsCount"
              >{{ item.reportsCount }} report{{ item.reportsCount === 1 ? "" : "s" }}</span
            ></div
          ><div
            ><small>Status</small><strong>{{ label(item.status) }}</strong
            ><span>{{ date(item.lastActivity) }}</span></div
          ><div class="actions"
            ><NuxtLink v-if="filters.view === 'review'" :to="`/reports/${item.id}`">Review</NuxtLink
            ><NuxtLink v-else-if="item.targetType === 'project'" :to="`/project/${item.targetId}`"
              >View</NuxtLink
            ><NuxtLink
              v-else-if="item.targetType !== 'profile'"
              :to="`/content/${item.targetType}/${item.targetId}`"
              >View</NuxtLink
            ><button
              v-if="filters.view === 'active' && item.targetType !== 'profile'"
              @click="selected = item"
              >Restore</button
            ></div
          ></article
        ></section
      ><footer v-if="store.pagination?.total"
        ><span>Showing {{ start }}–{{ end }} of {{ store.pagination.total }}</span
        ><button :disabled="filters.page <= 1" @click="page(-1)">Previous</button
        ><span>Page {{ filters.page }} of {{ store.pagination.totalPages }}</span
        ><button :disabled="filters.page >= store.pagination.totalPages" @click="page(1)"
          >Next</button
        ></footer
      ></main
    ><ContentModerationDialog
      v-if="selected"
      action="restore"
      :subject="selected.targetType === 'project' ? 'project' : selected.targetType"
      :pending="acting"
      @close="selected = null"
      @confirm="restore"
  /></div>
</template>
<script setup>
const store = useAdminModerationStore(),
  route = useRoute(),
  router = useRouter(),
  toast = useToastStore();
const tabs = [
    { value: "review", label: "Needs Review" },
    { value: "active", label: "Active Actions" },
    { value: "history", label: "History" },
  ],
  reasons = [
    "spam",
    "harassment",
    "hate_abuse",
    "scam",
    "inappropriate",
    "intellectual_property",
    "other",
  ];
const filters = reactive({
  view: String(route.query.view || "review"),
  targetType: String(route.query.targetType || "all"),
  reason: String(route.query.reason || "all"),
  search: String(route.query.search || ""),
  sort: String(route.query.sort || "newest"),
  page: Number(route.query.page) || 1,
  limit: 20,
});
const selected = ref(null),
  acting = ref(false);
let timer;
const label = (value) =>
  String(value || "—")
    .replaceAll("_", " ")
    .replace(/\b\w/g, (c) => c.toUpperCase());
const date = (value) =>
  value
    ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(
        new Date(value),
      )
    : "—";
const start = computed(() => (store.pagination ? (filters.page - 1) * filters.limit + 1 : 0)),
  end = computed(() => Math.min(filters.page * filters.limit, store.pagination?.total || 0));
async function load() {
  const query = Object.fromEntries(
    Object.entries(filters).filter(
      ([key, value]) =>
        key !== "limit" &&
        value !== "" &&
        !(["targetType", "reason"].includes(key) && value === "all") &&
        !(key === "page" && value === 1) &&
        !(key === "sort" && value === "newest") &&
        !(key === "view" && value === "review"),
    ),
  );
  await router.replace({ path: "/moderation", query });
  await store.fetch(filters);
}
const debounced = () => {
  clearTimeout(timer);
  timer = setTimeout(() => {
    filters.page = 1;
    load();
  }, 300);
};
const resetLoad = () => {
  filters.page = 1;
  load();
};
const changeView = (value) => {
  filters.view = value;
  filters.page = 1;
  filters.sort = "newest";
  load();
};
const page = (delta) => {
  filters.page += delta;
  load();
};
async function restore(reason) {
  acting.value = true;
  try {
    await store.restore(selected.value, reason);
    toast.success(`${label(selected.value.targetType)} restored.`);
    selected.value = null;
    await load();
  } catch (e) {
    toast.error(e?.data?.message || "Failed to restore target.");
  } finally {
    acting.value = false;
  }
}
await load();
</script>
<style scoped>
.moderation-page {
  min-height: 100vh;
  padding-left: 264px;
  color: #e0e2ed;
  background: #10131b;
}
.moderation-page main {
  max-width: 1240px;
  margin: auto;
  padding: 34px 28px 70px;
}
header {
  display: flex;
  justify-content: space-between;
  gap: 20px;
}
header p {
  color: #adc6ff;
  font: 600 9px monospace;
  letter-spacing: 0.15em;
}
h1 {
  font-size: 32px;
}
header span,
.row span {
  color: #8f96a7;
}
button,
.actions a {
  padding: 9px 12px;
  border: 1px solid #414755;
  border-radius: 8px;
  color: #adc6ff;
}
.summary {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin: 28px 0;
}
.summary article {
  min-height: 90px;
  padding: 16px;
  border: 1px solid #303642;
  border-radius: 12px;
  background: #151923;
}
.summary small,
.row small {
  display: block;
  color: #858b9b;
  font: 600 9px monospace;
  text-transform: uppercase;
}
.summary strong {
  display: block;
  margin-top: 8px;
  font-size: 27px;
}
nav {
  display: flex;
  gap: 6px;
  margin-bottom: 14px;
}
nav .active {
  background: #263c60;
}
.filters {
  display: grid;
  grid-template-columns: minmax(240px, 1fr) repeat(3, 180px);
  gap: 10px;
  margin-bottom: 16px;
}
.filters input,
.filters select {
  min-width: 0;
  padding: 10px;
  border: 1px solid #414755;
  border-radius: 8px;
  color: #e0e2ed;
  background: #10131b;
}
.list {
  display: grid;
  gap: 8px;
}
.row {
  display: grid;
  grid-template-columns: minmax(260px, 2fr) minmax(130px, 1fr) minmax(140px, 1fr) auto;
  gap: 18px;
  align-items: center;
  padding: 15px;
  border: 1px solid #303642;
  border-radius: 11px;
  background: #151923;
}
.row strong,
.row span {
  display: block;
  margin-top: 4px;
}
.target strong {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.actions {
  display: flex;
  gap: 7px;
}
.skeleton {
  background: linear-gradient(90deg, #151923, #252b37, #151923);
  background-size: 200% 100%;
  animation: pulse 1.5s infinite;
}
.row.skeleton {
  height: 83px;
}
@keyframes pulse {
  to {
    background-position: -200% 0;
  }
}
.state {
  padding: 50px;
  text-align: center;
  color: #9298a8;
}
footer {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 10px;
  margin-top: 18px;
  color: #9298a8;
  font-size: 12px;
}
footer span:first-child {
  margin-right: auto;
}
@media (max-width: 900px) {
  .moderation-page {
    padding-left: 0;
  }
  .moderation-page main {
    padding: 78px 16px;
  }
  .summary {
    grid-template-columns: repeat(2, 1fr);
  }
  .filters {
    grid-template-columns: 1fr 1fr;
  }
  .filters input {
    grid-column: 1/-1;
  }
  .row {
    grid-template-columns: 1fr 1fr;
  }
  .target {
    grid-column: 1/-1;
  }
  .actions {
    justify-content: flex-end;
  }
}
@media (max-width: 600px) {
  .filters,
  .row {
    grid-template-columns: 1fr;
  }
  .target {
    grid-column: auto;
  }
  nav {
    overflow-x: auto;
  }
  .summary {
    grid-template-columns: 1fr 1fr;
  }
  footer {
    flex-wrap: wrap;
  }
  footer span:first-child {
    width: 100%;
  }
}
</style>
