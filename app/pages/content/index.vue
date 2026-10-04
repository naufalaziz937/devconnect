<template>
  <div class="content-page"
    ><header
      ><div
        ><p>MODERATION</p><h1>Content</h1
        ><span>Review and moderate content across DevConnect.</span></div
      ><button :disabled="store.loading" @click="load"
        ><RefreshCw :class="{ spin: store.loading }" :size="16" />Refresh</button
      ></header
    >
    <section v-if="initialLoading" class="metrics skeleton"><i v-for="n in 4" :key="n" /></section
    ><section v-else-if="store.summary" class="metrics"
      ><article
        ><Files :size="18" /><span
          >Total Content<strong>{{ number(store.summary.total) }}</strong></span
        ></article
      ><article
        ><FileText :size="18" /><span
          >DevLogs<strong>{{ number(store.summary.devlogs) }}</strong></span
        ></article
      ><article
        ><MessageSquare :size="18" /><span
          >Comments<strong>{{ number(store.summary.comments) }}</strong></span
        ></article
      ><article
        ><EyeOff :size="18" /><span
          >Hidden Content<strong>{{ number(store.summary.hidden) }}</strong></span
        ></article
      ></section
    >
    <section class="panel"
      ><nav class="tabs" aria-label="Content type"
        ><button
          v-for="tab in tabs"
          :key="tab.value"
          :class="{ active: form.type === tab.value }"
          @click="form.type = tab.value"
          >{{ tab.label }}</button
        ></nav
      ><div class="tools"
        ><label class="search"
          ><Search :size="16" /><input
            v-model="form.search"
            type="search"
            placeholder="Search content..."
            aria-label="Search content" /></label
        ><select v-model="form.status" aria-label="Filter by status"
          ><option value="visible">Visible</option
          ><option value="hidden">Hidden</option></select
        ><select v-model="form.sort" aria-label="Sort content"
          ><option value="newest">Newest</option
          ><option value="oldest">Oldest</option></select
        ></div
      >
      <div v-if="store.error && !store.items.length" class="state"
        ><TriangleAlert /><h2>Unable to load content.</h2><p>{{ store.error }}</p
        ><button @click="load">Try Again</button></div
      ><div v-else-if="initialLoading" class="rows-skeleton"><i v-for="n in 6" :key="n" /></div
      ><template v-else
        ><div class="table-wrap" :class="{ refreshing: store.loading }"
          ><table
            ><thead
              ><tr
                ><th>Content</th><th>Author</th><th>Type</th><th>Engagement</th><th>Created</th
                ><th>Status</th><th><span class="sr">Actions</span></th></tr
              ></thead
            ><tbody
              ><tr v-for="item in store.items" :key="`${item.type}-${item.id}`"
                ><td
                  ><NuxtLink :to="`/content/${item.type}/${item.id}`" class="preview"
                    ><img v-if="item.media" :src="item.media" alt="" /><span
                      ><strong>{{ clip(item.preview) }}</strong
                      ><small v-if="item.parent"
                        >On @{{ item.parent.authorUsername }}’s DevLog</small
                      ></span
                    ></NuxtLink
                  ></td
                ><td
                  ><NuxtLink :to="`/user/${item.author.id}`" class="author"
                    ><UserAvatar
                      :user="{
                        username: item.author.username,
                        display_name: item.author.displayName,
                        avatar_url: item.author.avatar,
                      }"
                      :size="32"
                    /><span
                      ><strong>{{ item.author.displayName || item.author.username }}</strong
                      ><small>@{{ item.author.username }}</small></span
                    ></NuxtLink
                  ></td
                ><td
                  ><span class="badge">{{ typeLabel(item.type) }}</span></td
                ><td v-if="item.type === 'devlog'"
                  >{{ number(item.engagement.likes) }} likes ·
                  {{ number(item.engagement.comments) }} comments</td
                ><td v-else>—</td><td>{{ date(item.createdAt) }}</td
                ><td
                  ><span :class="['status', `status--${item.status}`]">{{ item.status }}</span></td
                ><td
                  ><button
                    class="dots"
                    aria-label="Content actions"
                    @click="openMenu = openMenu === key(item) ? null : key(item)"
                    ><MoreHorizontal :size="18" /></button
                  ><div v-if="openMenu === key(item)" class="menu"
                    ><NuxtLink :to="`/content/${item.type}/${item.id}`">View Content</NuxtLink
                    ><NuxtLink :to="`/user/${item.author.id}`">View Author</NuxtLink
                    ><button @click="openModeration(item)">{{
                      item.status === "hidden" ? "Restore Content" : "Hide Content"
                    }}</button></div
                  ></td
                ></tr
              ></tbody
            ></table
          ><div v-if="!store.items.length" class="state"
            ><Files /><h2>No content found.</h2
            ><p>Try changing your search, tab, or status filter.</p></div
          ><div class="mobile-list"
            ><article v-for="item in store.items" :key="key(item)"
              ><NuxtLink :to="`/content/${item.type}/${item.id}`"
                ><span
                  ><b>{{ typeLabel(item.type) }}</b
                  ><strong>{{ clip(item.preview, 120) }}</strong
                  ><small>@{{ item.author.username }} · {{ date(item.createdAt) }}</small></span
                ><ChevronRight /></NuxtLink
              ><footer
                ><span :class="['status', `status--${item.status}`]">{{ item.status }}</span
                ><button @click="openModeration(item)">{{
                  item.status === "hidden" ? "Restore" : "Hide"
                }}</button></footer
              ></article
            ></div
          ></div
        ><footer v-if="store.pagination?.total" class="pagination"
          ><span>Showing {{ start }}–{{ end }} of {{ number(store.pagination.total) }}</span
          ><div
            ><button :disabled="form.page === 1 || store.loading" @click="go(form.page - 1)"
              ><ChevronLeft /></button
            ><b>Page {{ form.page }} of {{ store.pagination.totalPages }}</b
            ><button
              :disabled="form.page >= store.pagination.totalPages || store.loading"
              @click="go(form.page + 1)"
              ><ChevronRight /></button></div></footer></template
    ></section>
    <ContentModerationDialog
      v-if="moderationTarget"
      :action="moderationTarget.status === 'hidden' ? 'restore' : 'hide'"
      :pending="moderating"
      @close="moderationTarget = null"
      @confirm="moderate"
  /></div>
</template>
<script setup>
import {
  ChevronLeft,
  ChevronRight,
  EyeOff,
  Files,
  FileText,
  MessageSquare,
  MoreHorizontal,
  RefreshCw,
  Search,
  TriangleAlert,
} from "lucide-vue-next";
definePageMeta({ layout: "management", middleware: "admin" });
const route = useRoute(),
  router = useRouter(),
  store = useAdminContentStore(),
  toast = useToastStore();
const tabs = [
  { value: "all", label: "All" },
  { value: "devlog", label: "DevLogs" },
  { value: "comment", label: "Comments" },
];
const form = reactive({
  type: String(route.query.type || "all"),
  status: String(route.query.status || "visible"),
  search: String(route.query.search || ""),
  sort: String(route.query.sort || "newest"),
  page: Math.max(1, Number(route.query.page) || 1),
  limit: 20,
});
const openMenu = ref(null),
  moderationTarget = ref(null),
  moderating = ref(false);
let timer;
const initialLoading = computed(() => store.loading && !store.summary);
const start = computed(() => (form.page - 1) * form.limit + 1),
  end = computed(() => Math.min(form.page * form.limit, store.pagination?.total || 0));
const key = (x) => `${x.type}-${x.id}`,
  number = (v) => new Intl.NumberFormat().format(v || 0),
  date = (v) => new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(v)),
  typeLabel = (v) => (v === "devlog" ? "DevLog" : "Comment"),
  clip = (v, n = 150) => (v?.length > n ? `${v.slice(0, n - 1)}…` : v);
const query = () =>
  Object.fromEntries(
    Object.entries(form).filter(
      ([k, v]) =>
        k !== "limit" &&
        (k !== "page" || v !== 1) &&
        (k !== "type" || v !== "all") &&
        (k !== "status" || v !== "visible") &&
        v !== "",
    ),
  );
async function load() {
  await router.replace({ query: query() });
  try {
    await store.fetchContent(form);
  } catch {}
}
function go(p) {
  form.page = p;
  load();
}
function openModeration(item) {
  openMenu.value = null;
  moderationTarget.value = item;
}
async function moderate(reason) {
  const item = moderationTarget.value,
    action = item.status === "hidden" ? "restore" : "hide";
  moderating.value = true;
  try {
    await store.moderate(item.type, item.id, action, reason);
    toast.success(action === "hide" ? "Content hidden." : "Content restored.");
    moderationTarget.value = null;
    await store.fetchContent(form);
  } catch (err) {
    toast.error(err?.data?.message || "Failed to moderate content.");
  } finally {
    moderating.value = false;
  }
}
watch(
  () => [form.type, form.status, form.sort],
  () => {
    form.page = 1;
    load();
  },
);
watch(
  () => form.search,
  () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      form.page = 1;
      load();
    }, 320);
  },
);
onBeforeUnmount(() => clearTimeout(timer));
await load();
</script>
<style scoped>
.content-page {
  max-width: 1500px;
  margin: auto;
}
.content-page > header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 24px;
}
.content-page > header p {
  margin: 0 0 5px;
  color: #adc6ff;
  font:
    600 9px "JetBrains Mono",
    monospace;
  letter-spacing: 0.14em;
}
.content-page h1 {
  margin: 0 0 6px;
  font-size: 30px;
}
.content-page > header span {
  color: #8d93a3;
  font-size: 13px;
}
.content-page > header button,
.state button {
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 9px 13px;
  border: 1px solid #414755;
  border-radius: 8px;
  color: #c1c6d7;
}
.metrics {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 18px;
}
.metrics article {
  display: flex;
  align-items: center;
  gap: 12px;
  min-height: 80px;
  padding: 15px;
  border: 1px solid rgba(65, 71, 85, 0.55);
  border-radius: 12px;
  background: #141821;
}
.metrics svg {
  color: #adc6ff;
}
.metrics span,
.metrics strong {
  display: block;
}
.metrics span {
  color: #858b9b;
  font-size: 10px;
}
.metrics strong {
  margin-top: 5px;
  color: #e0e2ed;
  font-size: 22px;
}
.skeleton i,
.rows-skeleton i {
  display: block;
  border-radius: 10px;
  background: linear-gradient(90deg, #141821, #202531, #141821);
  background-size: 200%;
  animation: shimmer 1.2s infinite;
}
.skeleton i {
  height: 80px;
}
.panel {
  border: 1px solid rgba(65, 71, 85, 0.55);
  border-radius: 14px;
  background: #0d1018;
}
.tabs {
  display: flex;
  gap: 4px;
  padding: 12px 14px 0;
}
.tabs button {
  padding: 8px 11px;
  border-radius: 8px;
  color: #858b9b;
  font-size: 11px;
}
.tabs button.active {
  color: #adc6ff;
  background: rgba(75, 142, 255, 0.12);
}
.tools {
  display: grid;
  grid-template-columns: minmax(260px, 1fr) 155px 155px;
  gap: 10px;
  padding: 12px 14px;
  border-bottom: 1px solid rgba(65, 71, 85, 0.45);
}
.search {
  position: relative;
}
.search svg {
  position: absolute;
  left: 12px;
  top: 12px;
  color: #858b9b;
}
.tools input,
.tools select {
  width: 100%;
  height: 40px;
  border: 1px solid #353b49;
  border-radius: 8px;
  color: #d7dae3;
  background: #141821;
  font-size: 12px;
}
.tools input {
  padding: 0 12px 0 38px;
}
.tools select {
  padding: 0 10px;
}
.table-wrap.refreshing {
  opacity: 0.65;
}
table {
  width: 100%;
  border-collapse: collapse;
}
th {
  padding: 11px 13px;
  color: #717889;
  text-align: left;
  font:
    600 9px "JetBrains Mono",
    monospace;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}
td {
  position: relative;
  padding: 11px 13px;
  border-top: 1px solid rgba(65, 71, 85, 0.35);
  color: #aeb4c5;
  font-size: 10px;
}
tbody tr:hover {
  background: rgba(28, 32, 40, 0.55);
}
.preview {
  display: flex;
  align-items: center;
  gap: 9px;
  min-width: 250px;
  max-width: 460px;
}
.preview img {
  width: 34px;
  height: 34px;
  border-radius: 6px;
  object-fit: cover;
}
.preview span,
.author span {
  min-width: 0;
}
.preview strong,
.preview small,
.author strong,
.author small {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.preview strong {
  color: #e0e2ed;
  font-size: 11px;
}
.preview small,
.author small {
  margin-top: 3px;
  color: #777e8e;
  font-size: 9px;
}
.author {
  display: flex;
  align-items: center;
  gap: 8px;
  min-width: 155px;
}
.author strong {
  font-size: 10px;
}
.badge,
.status {
  display: inline-block;
  padding: 4px 7px;
  border: 1px solid #414755;
  border-radius: 999px;
  font:
    600 8px "JetBrains Mono",
    monospace;
}
.badge {
  color: #adc6ff;
}
.status--visible {
  color: #73daca;
  border-color: rgba(115, 218, 202, 0.25);
}
.status--hidden {
  color: #ffd18a;
  border-color: rgba(255, 209, 138, 0.25);
  background: rgba(255, 179, 71, 0.08);
}
.dots {
  width: 32px;
  height: 32px;
  display: grid;
  place-items: center;
  border-radius: 7px;
}
.dots:hover {
  background: #252a35;
}
.menu {
  position: absolute;
  z-index: 10;
  right: 12px;
  top: 43px;
  width: 145px;
  padding: 5px;
  border: 1px solid #414755;
  border-radius: 9px;
  background: #181c25;
  box-shadow: 0 12px 30px rgba(0, 0, 0, 0.45);
}
.menu a,
.menu button {
  display: block;
  width: 100%;
  padding: 8px 9px;
  border-radius: 6px;
  color: #c7cbd6;
  text-align: left;
  font-size: 10px;
}
.menu a:hover,
.menu button:hover {
  background: #252a35;
}
.state {
  display: grid;
  justify-items: center;
  padding: 60px 20px;
  text-align: center;
}
.state svg {
  color: #858b9b;
}
.state h2 {
  margin: 12px 0 5px;
  font-size: 17px;
}
.state p {
  margin: 0 0 15px;
  color: #777e8e;
  font-size: 12px;
}
.rows-skeleton {
  display: grid;
  gap: 8px;
  padding: 14px;
}
.rows-skeleton i {
  height: 53px;
}
.pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 13px 15px;
  border-top: 1px solid rgba(65, 71, 85, 0.45);
  color: #777e8e;
  font-size: 10px;
}
.pagination div {
  display: flex;
  align-items: center;
  gap: 10px;
}
.pagination button {
  width: 32px;
  height: 32px;
  display: grid;
  place-items: center;
  border: 1px solid #353b49;
  border-radius: 7px;
}
.pagination button:disabled {
  opacity: 0.35;
}
.pagination svg {
  width: 15px;
}
.mobile-list {
  display: none;
}
.sr {
  position: absolute;
  width: 1px;
  height: 1px;
  overflow: hidden;
  clip: rect(0, 0, 0, 0);
}
.spin {
  animation: spin 0.8s linear infinite;
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
@keyframes shimmer {
  to {
    background-position: -200%;
  }
}
@media (max-width: 1050px) {
  .metrics {
    grid-template-columns: repeat(2, 1fr);
  }
  th:nth-child(4),
  td:nth-child(4) {
    display: none;
  }
}
@media (max-width: 760px) {
  .content-page > header {
    align-items: flex-start;
  }
  .content-page > header button {
    font-size: 0;
  }
  .tools {
    grid-template-columns: 1fr 1fr;
  }
  .search {
    grid-column: 1/-1;
  }
  table {
    display: none;
  }
  .mobile-list {
    display: grid;
  }
  .mobile-list article {
    padding: 14px;
    border-top: 1px solid rgba(65, 71, 85, 0.35);
  }
  .mobile-list article > a {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 10px;
  }
  .mobile-list b,
  .mobile-list strong,
  .mobile-list small {
    display: block;
  }
  .mobile-list b {
    color: #adc6ff;
    font:
      600 8px "JetBrains Mono",
      monospace;
  }
  .mobile-list strong {
    margin-top: 4px;
    color: #e0e2ed;
    font-size: 11px;
  }
  .mobile-list small {
    margin-top: 4px;
    color: #777e8e;
    font-size: 9px;
  }
  .mobile-list footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-top: 10px;
  }
  .mobile-list footer button {
    padding: 5px 8px;
    border: 1px solid #414755;
    border-radius: 6px;
    color: #c7cbd6;
    font-size: 9px;
  }
  .pagination {
    align-items: flex-start;
    gap: 12px;
    flex-direction: column;
  }
}
</style>
