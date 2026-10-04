<template>
  <div class="news-page"
    ><AppSidebar /><main
      ><header
        ><div
          ><p>ADMINISTRATION</p><h1>Dev News</h1
          ><span>Monitor developer news sources and articles shown across DevConnect.</span></div
        ><button :disabled="store.refreshing" @click="refresh">{{
          store.refreshing ? "Refreshing…" : "Refresh News"
        }}</button></header
      ><section v-if="store.summary" class="summary"
        ><article
          ><small>Active Sources</small><strong>{{ store.summary.activeSources }}</strong></article
        ><article
          ><small>Articles Available</small
          ><strong>{{ store.summary.articlesAvailable }}</strong></article
        ><article
          ><small>Last Refresh</small
          ><strong class="time">{{ relative(store.summary.lastRefresh) }}</strong></article
        ><article
          ><small>Source Issues</small><strong>{{ store.summary.sourceIssues }}</strong></article
        ></section
      ><nav class="tabs"
        ><button :class="{ active: tab === 'articles' }" @click="tab = 'articles'">Articles</button
        ><button :class="{ active: tab === 'sources' }" @click="tab = 'sources'"
          >Sources</button
        ></nav
      ><section v-if="tab === 'articles'" class="tab"
        ><div class="filters"
          ><input
            v-model="filters.search"
            placeholder="Search articles..."
            @input="debounced"
          /><select v-model="filters.source" @change="reset"
            ><option value="all">All sources</option
            ><option v-for="source in store.sources" :key="source.id" :value="source.id">{{
              source.name
            }}</option></select
          ><select v-model="filters.category" @change="reset"
            ><option value="all">All categories</option
            ><option v-for="category in categories" :key="category" :value="category">{{
              category
            }}</option></select
          ><select v-model="filters.visibility" @change="reset"
            ><option value="all">All visibility</option
            ><option value="visible">Visible</option
            ><option value="hidden">Hidden</option></select
          ><select v-model="filters.sort" @change="reset"
            ><option value="newest">Newest</option
            ><option value="oldest">Oldest</option></select
          ></div
        ><p v-if="store.loading && !store.items.length">Loading Dev News…</p
        ><section v-else-if="store.error" class="state"
          ><p>{{ store.error }}</p
          ><button @click="load">Try Again</button></section
        ><section v-else-if="!store.items.length" class="state">{{
          hasFilters ? "No articles match your filters." : "No Dev News articles available."
        }}</section
        ><div v-else class="table-wrap"
          ><table
            ><thead
              ><tr
                ><th>Article</th><th>Source</th><th>Category</th><th>Published</th><th>Status</th
                ><th /></tr></thead
            ><tbody
              ><tr v-for="article in store.items" :key="article.id"
                ><td class="article"
                  ><img
                    v-if="article.imageUrl"
                    :src="article.imageUrl"
                    alt=""
                    @error="$event.target.style.display = 'none'"
                  /><span
                    ><strong>{{ article.title }}</strong
                    ><small v-if="article.summary">{{ article.summary }}</small></span
                  ></td
                ><td>{{ article.source.name }}</td
                ><td>{{ article.category }}</td
                ><td>{{ date(article.publishedAt) }}</td
                ><td
                  ><b :class="article.visibility">{{ article.visibility }}</b></td
                ><td class="actions"
                  ><a :href="safeLink(article.url)" target="_blank" rel="noopener noreferrer"
                    >Open</a
                  ><button @click="confirmVisibility(article)">{{
                    article.visibility === "visible" ? "Hide" : "Restore"
                  }}</button></td
                ></tr
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
        ></section
      ><section v-else class="sources"
        ><p v-if="store.loading && !store.sources.length">Loading sources…</p
        ><article v-for="source in store.sources" :key="source.id"
          ><div
            ><h2>{{ source.name }}</h2
            ><p
              >{{ source.type }} · {{ source.category }} · {{ source.articleCount }} stored
              articles</p
            ><a :href="safeLink(source.homepageUrl)" target="_blank" rel="noopener noreferrer">{{
              source.homepageUrl
            }}</a></div
          ><dl
            ><dt>Status</dt
            ><dd
              ><b :class="status(source)">{{ status(source) }}</b></dd
            ><dt>Last success</dt><dd>{{ relative(source.lastSuccessAt) }}</dd
            ><dt v-if="source.lastError">Latest error</dt
            ><dd v-if="source.lastError" class="error">{{ source.lastError }}</dd></dl
          ><button @click="toggleSource(source)">{{
            source.enabled ? "Disable" : "Enable"
          }}</button></article
        ><p v-if="!store.loading && !store.sources.length" class="state"
          >No Dev News sources configured.</p
        ></section
      ></main
    ></div
  >
</template>
<script setup>
const store = useAdminDevNewsStore(),
  route = useRoute(),
  router = useRouter(),
  toast = useToastStore();
const tab = ref("articles");
const filters = reactive({
  page: Number(route.query.page) || 1,
  limit: 20,
  search: String(route.query.search || ""),
  source: String(route.query.source || "all"),
  category: String(route.query.category || "all"),
  visibility: String(route.query.visibility || "all"),
  sort: String(route.query.sort || "newest"),
});
let timer;
const categories = computed(() =>
    [...new Set(store.items.map((item) => item.category).filter(Boolean))].sort(),
  ),
  hasFilters = computed(
    () =>
      filters.search ||
      filters.source !== "all" ||
      filters.category !== "all" ||
      filters.visibility !== "all",
  ),
  start = computed(() => (store.pagination ? (filters.page - 1) * filters.limit + 1 : 0)),
  end = computed(() => Math.min(filters.page * filters.limit, store.pagination?.total || 0));
const date = (value) =>
  value ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(value)) : "—";
const relative = (value) =>
  value
    ? new Intl.RelativeTimeFormat(undefined, { numeric: "auto" }).format(
        Math.round((new Date(value) - Date.now()) / 60000),
        "minute",
      )
    : "Never";
const safeLink = (value) => (/^https?:\/\//i.test(value || "") ? value : "#");
const status = (source) => (!source.enabled ? "Disabled" : source.lastError ? "Issue" : "Healthy");
async function load() {
  const query = Object.fromEntries(
    Object.entries(filters).filter(
      ([key, value]) =>
        key !== "limit" &&
        value !== "" &&
        !(key === "page" && value === 1) &&
        !(["source", "category", "visibility"].includes(key) && value === "all") &&
        !(key === "sort" && value === "newest"),
    ),
  );
  await router.replace({ path: "/dev-news", query });
  await store.fetch(filters);
}
const debounced = () => {
    clearTimeout(timer);
    timer = setTimeout(() => {
      filters.page = 1;
      load();
    }, 300);
  },
  reset = () => {
    filters.page = 1;
    load();
  },
  page = (delta) => {
    filters.page += delta;
    load();
  };
async function refresh() {
  try {
    const result = await store.refresh();
    await load();
    toast.success(
      result.partialFailure
        ? "News refreshed, but some sources could not be reached."
        : `${result.articlesFound} articles refreshed.`,
    );
  } catch (error) {
    toast.error(error?.data?.message || "Failed to refresh Dev News.");
  }
}
async function confirmVisibility(article) {
  const next = article.visibility === "visible" ? "hidden" : "visible";
  if (
    !window.confirm(
      `${next === "hidden" ? "Hide" : "Restore"} this article ${next === "hidden" ? "from" : "on"} DevConnect?`,
    )
  )
    return;
  try {
    await store.visibility(article.id, next);
    article.visibility = next;
    toast.success(
      next === "hidden" ? "Article hidden from DevConnect." : "Article restored to DevConnect.",
    );
  } catch (error) {
    toast.error(error?.data?.message || "Unable to update article.");
  }
}
async function toggleSource(source) {
  try {
    await store.sourceEnabled(source.id, !source.enabled);
    source.enabled = !source.enabled;
    source.lastError = null;
    toast.success(source.enabled ? "Source enabled." : "Source disabled.");
    await load();
  } catch (error) {
    toast.error(error?.data?.message || "Unable to update source.");
  }
}
await load();
</script>
<style scoped>
.news-page {
  min-height: 100vh;
  padding-left: 264px;
  color: #e0e2ed;
  background: #10131b;
}
.news-page main {
  max-width: 1280px;
  margin: auto;
  padding: 34px 28px 70px;
}
header {
  display: flex;
  justify-content: space-between;
  gap: 22px;
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
.state {
  color: #9198a8;
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
  padding: 16px;
  border: 1px solid #303642;
  border-radius: 12px;
  background: #151923;
}
.summary small {
  display: block;
  color: #858b9b;
  font: 600 9px monospace;
}
.summary strong {
  display: block;
  margin-top: 8px;
  font-size: 25px;
}
.summary .time {
  font-size: 15px;
}
.tabs {
  display: flex;
  gap: 22px;
  border-bottom: 1px solid #303642;
}
.tabs button {
  padding: 12px 2px;
  border: 0;
  border-radius: 0;
  color: #939aaa;
}
.tabs button.active {
  border-bottom: 2px solid #adc6ff;
  color: #e0e2ed;
}
.filters {
  display: grid;
  grid-template-columns: minmax(190px, 1fr) repeat(4, 150px);
  gap: 10px;
  margin: 20px 0;
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
.table-wrap::-webkit-scrollbar-thumb {
  background: #414755;
  border-radius: 9px;
}
table {
  width: 100%;
  min-width: 980px;
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
.article {
  display: flex;
  gap: 11px;
  max-width: 480px;
}
.article img {
  width: 52px;
  height: 52px;
  flex: 0 0 auto;
  border-radius: 8px;
  object-fit: cover;
  background: #202530;
}
.article strong,
.article small {
  display: block;
}
.article small {
  display: -webkit-box;
  overflow: hidden;
  margin-top: 4px;
  color: #8e95a5;
  line-height: 1.35;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
.visible {
  color: #88d498;
}
.hidden,
.error {
  color: #ffb595;
}
.actions {
  white-space: nowrap;
}
.actions a {
  display: inline-block;
  margin-right: 7px;
}
.actions button {
  padding: 7px 9px;
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
.state {
  padding: 52px;
  text-align: center;
}
.sources {
  display: grid;
  gap: 12px;
  margin-top: 20px;
}
.sources article {
  display: grid;
  grid-template-columns: minmax(0, 1fr) minmax(220px, 320px) auto;
  gap: 22px;
  align-items: start;
  padding: 18px;
  border: 1px solid #303642;
  border-radius: 12px;
  background: #151923;
}
.sources h2 {
  font-size: 16px;
}
.sources p,
.sources a,
.sources dt {
  margin-top: 6px;
  color: #8d94a4;
  font-size: 11px;
}
.sources a {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.sources dl {
  display: grid;
  grid-template-columns: 100px 1fr;
  gap: 7px;
  font-size: 11px;
}
.sources dd {
  margin: 0;
  overflow: hidden;
  text-overflow: ellipsis;
}
.sources .error {
  white-space: normal;
}
@media (max-width: 900px) {
  .news-page {
    padding-left: 0;
  }
  .news-page main {
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
  .sources article {
    grid-template-columns: 1fr;
  }
}
@media (max-width: 600px) {
  header {
    align-items: start;
    flex-direction: column;
  }
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
