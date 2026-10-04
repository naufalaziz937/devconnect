<template>
  <div class="audit-page"
    ><AppSidebar /><main
      ><header
        ><div
          ><p>ADMINISTRATION</p><h1>Audit Logs</h1
          ><span>Review administrative actions across DevConnect.</span></div
        ><button :disabled="store.loading" @click="load">Refresh</button></header
      ><section v-if="store.summary" class="summary"
        ><article
          ><small>Actions Today</small><strong>{{ store.summary.actions_today }}</strong></article
        ><article
          ><small>Moderation Actions</small
          ><strong>{{ store.summary.moderation_actions }}</strong></article
        ><article
          ><small>User Actions</small><strong>{{ store.summary.user_actions }}</strong></article
        ></section
      ><section class="filters"
        ><input
          v-model="filters.search"
          placeholder="Search audit logs..."
          @input="debounced"
        /><select v-model="filters.action" @change="resetLoad"
          ><option value="all">All actions</option
          ><option v-for="action in actions" :key="action" :value="action">{{
            label(action)
          }}</option></select
        ><select v-model="filters.targetType" @change="resetLoad"
          ><option value="all">All targets</option
          ><option v-for="type in types" :key="type" :value="type">{{
            label(type)
          }}</option></select
        ><select v-model="filters.sort" @change="resetLoad"
          ><option value="newest">Newest first</option
          ><option value="oldest">Oldest first</option></select
        ></section
      ><p v-if="store.loading && !store.items.length">Loading audit logs…</p
      ><section v-else-if="store.error" class="state"
        ><p>{{ store.error }}</p
        ><button @click="load">Try Again</button></section
      ><section v-else-if="!store.items.length" class="state"
        ><p>No audit logs found.</p><span>Administrative actions will appear here.</span></section
      ><div v-else class="table-wrap"
        ><table
          ><thead
            ><tr
              ><th>Action</th><th>Administrator</th><th>Target</th><th>Reason</th><th>Date</th
              ><th /></tr></thead
          ><tbody
            ><tr v-for="item in store.items" :key="item.id"
              ><td
                ><strong>{{ label(item.action) }}</strong></td
              ><td
                ><span v-if="item.actor"
                  >{{ item.actor.displayName || item.actor.username
                  }}<small>@{{ item.actor.username }}</small></span
                ><span v-else>Deleted User</span></td
              ><td
                ><small>{{ label(item.target.type) }}</small
                ><strong>{{ item.target.label }}</strong></td
              ><td class="reason">{{ item.reason || "—" }}</td
              ><td>{{ date(item.createdAt) }}</td
              ><td><button @click="open(item.id)">View</button></td></tr
            ></tbody
          ></table
        ></div
      ><footer v-if="store.pagination?.total"
        ><span>Showing {{ start }}–{{ end }} of {{ store.pagination.total }}</span
        ><button :disabled="filters.page <= 1" @click="page(-1)">Previous</button
        ><span>Page {{ filters.page }} of {{ store.pagination.totalPages }}</span
        ><button :disabled="filters.page >= store.pagination.totalPages" @click="page(1)"
          >Next</button
        ></footer
      ></main
    ><aside v-if="store.selected" class="drawer"
      ><div class="backdrop" @click="store.selected = null" /><section
        ><button class="close" @click="store.selected = null">×</button><p>AUDIT EVENT</p
        ><h2>{{ label(store.selected.action) }}</h2
        ><dl
          ><dt>Performed By</dt
          ><dd>{{ store.selected.actor ? `@${store.selected.actor.username}` : "Deleted User" }}</dd
          ><dt>Target</dt
          ><dd>{{ label(store.selected.target.type) }} · {{ store.selected.target.label }}</dd
          ><dt>Reason</dt><dd>{{ store.selected.reason || "—" }}</dd
          ><dt>Timestamp</dt><dd>{{ date(store.selected.createdAt) }}</dd
          ><dt v-if="Object.keys(store.selected.metadata || {}).length">Metadata</dt
          ><dd v-if="Object.keys(store.selected.metadata || {}).length"
            ><code>{{ JSON.stringify(store.selected.metadata) }}</code></dd
          ><dt v-if="store.selected.ipAddress">IP address</dt
          ><dd v-if="store.selected.ipAddress">{{ store.selected.ipAddress }}</dd></dl
        ><button @click="copyId">Copy Event ID</button></section
      ></aside
    ></div
  >
</template>
<script setup>
const store = useAuditLogsStore(),
  route = useRoute(),
  router = useRouter(),
  toast = useToastStore();
const actions = [
    "USER_ROLE_CHANGED",
    "CONTENT_HIDDEN",
    "CONTENT_RESTORED",
    "PROJECT_HIDDEN",
    "PROJECT_RESTORED",
    "STACK_CREATED",
    "STACK_UPDATED",
    "STACK_DEACTIVATED",
    "STACK_REACTIVATED",
    "REPORT_REVIEW_STARTED",
    "REPORT_RESOLVED",
    "REPORT_DISMISSED",
  ],
  types = ["user", "devlog", "comment", "project", "stack", "report"];
const filters = reactive({
  page: Number(route.query.page) || 1,
  limit: 20,
  search: String(route.query.search || ""),
  action: String(route.query.action || "all"),
  targetType: String(route.query.targetType || "all"),
  sort: String(route.query.sort || "newest"),
});
let timer;
const label = (v) =>
    String(v || "—")
      .replaceAll("_", " ")
      .replace(/\b\w/g, (c) => c.toUpperCase()),
  date = (v) =>
    new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(
      new Date(v),
    ),
  start = computed(() => (store.pagination ? (filters.page - 1) * filters.limit + 1 : 0)),
  end = computed(() => Math.min(filters.page * filters.limit, store.pagination?.total || 0));
async function load() {
  const query = Object.fromEntries(
    Object.entries(filters).filter(
      ([key, value]) =>
        key !== "limit" &&
        value !== "" &&
        !(key === "page" && value === 1) &&
        !(key === "action" && value === "all") &&
        !(key === "targetType" && value === "all") &&
        !(key === "sort" && value === "newest"),
    ),
  );
  await router.replace({ path: "/audit-logs", query });
  await store.fetch(filters);
}
const debounced = () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      filters.page = 1;
      load();
    }, 300);
  },
  resetLoad = () => {
    filters.page = 1;
    load();
  },
  page = (delta) => {
    filters.page += delta;
    load();
  },
  open = (id) => store.detail(id),
  copyId = async () => {
    await navigator.clipboard.writeText(String(store.selected.id));
    toast.success("Audit log ID copied.");
  };
await load();
</script>
<style scoped>
.audit-page {
  min-height: 100vh;
  padding-left: 264px;
  color: #e0e2ed;
  background: #10131b;
}
.audit-page main {
  max-width: 1240px;
  margin: auto;
  padding: 34px 28px 70px;
}
header {
  display: flex;
  justify-content: space-between;
  gap: 20px;
}
header p,
.drawer p {
  color: #adc6ff;
  font: 600 9px monospace;
  letter-spacing: 0.15em;
}
h1 {
  font-size: 32px;
}
header span,
.state span {
  color: #9198a8;
}
button {
  padding: 9px 12px;
  border: 1px solid #414755;
  border-radius: 8px;
  color: #adc6ff;
}
.summary {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin: 28px 0;
}
.summary article {
  padding: 16px;
  border: 1px solid #303642;
  border-radius: 12px;
  background: #151923;
}
.summary small,
td small {
  display: block;
  color: #858b9b;
  font: 600 9px monospace;
}
.summary strong {
  display: block;
  margin-top: 8px;
  font-size: 26px;
}
.filters {
  display: grid;
  grid-template-columns: minmax(220px, 1fr) repeat(3, 180px);
  gap: 10px;
  margin-bottom: 16px;
}
.filters input,
.filters select {
  padding: 10px;
  border: 1px solid #414755;
  border-radius: 8px;
  color: #e0e2ed;
  background: #10131b;
}
.table-wrap {
  overflow: auto;
  border: 1px solid #303642;
  border-radius: 11px;
}
.table-wrap::-webkit-scrollbar {
  height: 5px;
}
table {
  width: 100%;
  min-width: 780px;
  border-collapse: collapse;
  background: #151923;
}
th,
td {
  padding: 14px;
  text-align: left;
  border-bottom: 1px solid #303642;
  font-size: 12px;
}
td strong,
td small {
  display: block;
  margin-top: 3px;
}
.reason {
  max-width: 220px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.state {
  padding: 52px;
  text-align: center;
  color: #959cad;
}
footer {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-top: 18px;
  color: #939aaa;
  font-size: 12px;
}
footer span:first-child {
  margin-right: auto;
}
.drawer .backdrop {
  position: fixed;
  z-index: 200;
  inset: 0;
  background: #0008;
}
.drawer section {
  position: fixed;
  z-index: 201;
  right: 0;
  top: 0;
  bottom: 0;
  width: min(460px, 100%);
  padding: 28px;
  overflow: auto;
  background: #151923;
  border-left: 1px solid #414755;
}
.drawer h2 {
  margin: 8px 0 25px;
  font-size: 25px;
}
.close {
  float: right;
  font-size: 22px;
}
.drawer dl {
  display: grid;
  grid-template-columns: 120px 1fr;
  gap: 16px;
}
.drawer dt {
  color: #878e9e;
}
.drawer code {
  display: block;
  max-height: 180px;
  overflow: auto;
  padding: 9px;
  white-space: pre-wrap;
  word-break: break-word;
  background: #0d1018;
}
@media (max-width: 900px) {
  .audit-page {
    padding-left: 0;
  }
  .audit-page main {
    padding: 78px 16px;
  }
  .filters {
    grid-template-columns: 1fr 1fr;
  }
  .filters input {
    grid-column: 1/-1;
  }
}
@media (max-width: 600px) {
  .summary,
  .filters {
    grid-template-columns: 1fr;
  }
  .filters input {
    grid-column: auto;
  }
  footer {
    flex-wrap: wrap;
  }
  footer span:first-child {
    width: 100%;
  }
}
</style>
