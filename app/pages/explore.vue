<template>
  <div class="explore-shell text-white">
    <AppSidebar />
    <main class="explore-main">
      <header class="explore-header">
        <div ref="searchRoot" class="search-wrap">
          <Search class="search-icon" :size="19" />
          <input
            ref="searchInput"
            v-model="query"
            type="search"
            autocomplete="off"
            placeholder="Search developers, projects, or technologies..."
            aria-label="Search DevConnect"
            aria-controls="explore-search-results"
            :aria-expanded="panelOpen"
            @focus="openPanel"
            @keydown="handleKeys"
          />
          <button v-if="query" aria-label="Clear search" @click="clearSearch"
            ><X :size="17"
          /></button>
          <section v-if="panelOpen" id="explore-search-results" class="search-panel" role="listbox">
            <p v-if="!query.trim()" class="search-hint"
              >Try searching for developers, projects, or technologies.</p
            >
            <div v-else-if="search.loading" class="search-loading"
              ><div v-for="n in 3" :key="n" class="result-skeleton"
                ><SkeletonBlock class="h-10 w-10 rounded-full" /><div
                  ><SkeletonBlock class="h-3 w-36" /><SkeletonBlock
                    class="mt-2 h-3 w-52" /></div></div
            ></div>
            <StateMessage v-else-if="search.error" :message="search.error" />
            <template v-else-if="searchResults.length">
              <div v-if="search.developers?.items.length" class="result-group"
                ><h2>Developers</h2
                ><NuxtLink
                  v-for="entry in developerResults"
                  :key="entry.key"
                  :to="entry.to"
                  :class="['result-row', { selected: selectedIndex === entry.index }]"
                  role="option"
                  :aria-selected="selectedIndex === entry.index"
                  @click="closePanel"
                  ><UserAvatar :user="entry.item" :size="40" /><span
                    ><strong>{{ entry.item.display_name || entry.item.username }}</strong
                    ><small
                      >@{{ entry.item.username }} ·
                      {{ entry.item.favorite_tech || "Technology not listed" }}</small
                    ></span
                  ></NuxtLink
                ></div
              >
              <div v-if="search.projects?.items.length" class="result-group"
                ><h2>Projects</h2
                ><NuxtLink
                  v-for="entry in projectResults"
                  :key="entry.key"
                  :to="entry.to"
                  :class="['result-row', { selected: selectedIndex === entry.index }]"
                  role="option"
                  :aria-selected="selectedIndex === entry.index"
                  @click="closePanel"
                  ><span class="result-project"><FolderKanban :size="18" /></span
                  ><span
                    ><strong>{{ entry.item.title }}</strong
                    ><small>{{ entry.item.description }}</small></span
                  ></NuxtLink
                ></div
              >
              <button class="view-all" @click="commitSearch"
                >View all results for “{{ query.trim() }}”</button
              >
            </template>
            <p v-else class="search-hint">No developers or projects match “{{ query.trim() }}”.</p>
          </section>
        </div>

        <nav class="explore-tabs" aria-label="Explore sections">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            :class="{ active: activeTab === tab.id }"
            @click="activeTab = tab.id"
            >{{ tab.label }}</button
          >
        </nav>
      </header>

      <div class="explore-content">
        <template v-if="activeTab === 'explore'">
          <section v-if="committedQuery" class="discovery-section"
            ><div class="section-heading"
              ><div
                ><span>SEARCH RESULTS</span><h1>Results for “{{ committedQuery }}”</h1></div
              ><button @click="resetCommittedSearch">Clear</button></div
            ><div v-if="search.loading" class="row-list"
              ><DeveloperCardSkeleton v-for="n in 3" :key="n" /></div
            ><StateMessage v-else-if="search.error" :message="search.error" /><StateMessage
              v-else-if="!searchResults.length"
              message="No matching developers or projects."
            /><div v-else class="full-results"
              ><NuxtLink
                v-for="entry in searchResults"
                :key="entry.key"
                :to="entry.to"
                class="discovery-row"
                ><UserAvatar v-if="entry.kind === 'developer'" :user="entry.item" :size="42" /><span
                  v-else
                  class="result-avatar"
                  >PR</span
                ><span
                  ><strong>{{
                    entry.kind === "developer"
                      ? entry.item.display_name || entry.item.username
                      : entry.item.title
                  }}</strong
                  ><small>{{
                    entry.kind === "developer"
                      ? `@${entry.item.username} · ${entry.item.favorite_tech || "Technology not listed"}`
                      : entry.item.description
                  }}</small></span
                ></NuxtLink
              ></div
            ></section
          >
          <template v-else>
            <section class="discovery-section"
              ><div class="section-heading"
                ><div><span>PEOPLE / DISCOVER</span><h1>Developers to discover</h1></div
                ><NuxtLink to="/network">View network</NuxtLink></div
              ><div v-if="developers.loading && !developers.items.length" class="row-list"
                ><DeveloperCardSkeleton v-for="n in 3" :key="n" /></div
              ><div v-else class="row-list"
                ><NuxtLink
                  v-for="person in developers.items.slice(0, 6)"
                  :key="person.uuid"
                  :to="`/developers/${person.uuid}`"
                  class="discovery-row"
                  ><UserAvatar :user="person" :size="42" /><span
                    ><strong>{{ person.display_name || person.username }}</strong
                    ><small
                      >@{{ person.username }} ·
                      {{ person.favorite_tech || "Technology not listed" }}</small
                    ></span
                  ><span class="row-meta">{{ person.follower_count }} followers</span></NuxtLink
                ></div
              ></section
            >
            <section class="discovery-section"
              ><div class="section-heading"
                ><div><span>PROJECTS / RECENT</span><h1>Projects to explore</h1></div
                ><NuxtLink to="/projects">View projects</NuxtLink></div
              ><div v-if="projects.loading && !projects.posts.length" class="project-grid"
                ><ProjectCardSkeleton v-for="n in 4" :key="n" /></div
              ><div v-else class="project-grid"
                ><NuxtLink
                  v-for="project in projects.posts.slice(0, 4)"
                  :key="project.id"
                  :to="`/projects/${project.id}`"
                  class="project-card"
                  ><strong>{{ project.title }}</strong
                  ><p>{{ project.description }}</p
                  ><small>{{
                    project.needed_skills?.slice(0, 4).join(" · ") ||
                    project.project_type ||
                    "Open project"
                  }}</small></NuxtLink
                ></div
              ></section
            >
            <section class="discovery-section"
              ><div class="section-heading"
                ><div><span>DEVLOGS / RECENT</span><h1>Recent developer activity</h1></div
                ><NuxtLink to="/feed">Open feed</NuxtLink></div
              ><div v-if="feed.loading && !feed.items.length"
                ><DevlogSkeleton v-for="n in 2" :key="n" /></div
              ><div v-else class="devlog-list"
                ><NuxtLink
                  v-for="item in feed.items.slice(0, 5)"
                  :key="item.id"
                  :to="`/devlogs/${item.id}`"
                  class="devlog-row"
                  ><span
                    ><strong>{{ item.username }}</strong
                    ><small>{{ formatDate(item.created_at) }}</small></span
                  ><p>{{ item.content }}</p
                  ><small
                    >{{ item.total_likes }} likes · {{ item.total_comments }} comments</small
                  ></NuxtLink
                ></div
              ></section
            >
          </template>
        </template>

        <section v-else-if="activeTab === 'trending'" class="external-list"
          ><div class="section-heading"
            ><div><span>EXTERNAL / DEV ECOSYSTEM</span><h1>Trending in Dev</h1></div></div
          ><div v-if="discovery.trendsLoading" class="row-list"
            ><SkeletonBlock v-for="n in 6" :key="n" class="h-16" /></div
          ><StateMessage
            v-else-if="discovery.trendsError"
            :message="discovery.trendsError"
          /><NuxtLink
            v-for="item in discovery.trends"
            v-else
            :key="item.id"
            :to="{ path: '/explore', query: { q: item.topic } }"
            class="external-row"
            ><span
              ><strong>#{{ item.topic }}</strong
              ><small>{{ item.category }}</small></span
            ><em>Rank {{ item.rank }} · {{ item.stories }} stories</em></NuxtLink
          ></section
        >
        <section v-else class="external-list"
          ><div class="section-heading"
            ><div><span>EXTERNAL / DEVELOPER NEWS</span><h1>Dev News</h1></div></div
          ><div v-if="discovery.newsLoading" class="row-list"
            ><SkeletonBlock v-for="n in 6" :key="n" class="h-24" /></div
          ><StateMessage
            v-else-if="discovery.newsError"
            :message="discovery.newsError"
          /><StateMessage
            v-else-if="!discovery.news.length"
            message="Dev News is temporarily unavailable."
          /><a
            v-for="item in discovery.news"
            v-else
            :key="item.id"
            :href="safeLink(item.url)"
            target="_blank"
            rel="noopener noreferrer"
            class="external-row news-row"
            ><span
              ><strong>{{ item.title }}</strong
              ><small
                >{{ item.source?.name }} · {{ formatDate(item.publishedAt) }} ·
                {{ item.category }}</small
              ><p v-if="item.summary">{{ item.summary }}</p></span
            ></a
          ></section
        >
      </div>
    </main>
    <AppRightSidebar>
      <section class="context-card"
        ><div class="context-heading"
          ><h2>Who to follow</h2><NuxtLink to="/network">See all</NuxtLink></div
        ><div v-if="developers.loading && !developers.items.length" class="context-loading"
          ><SkeletonBlock v-for="n in 3" :key="n" class="h-14" /></div
        ><div v-else
          ><div
            v-for="person in developers.items.slice(0, 3)"
            :key="person.uuid"
            class="context-person"
            ><UserAvatar :user="person" :size="40" /><NuxtLink :to="`/developers/${person.uuid}`"
              ><strong>{{ person.display_name || person.username }}</strong
              ><small
                >@{{ person.username }} · {{ person.favorite_tech || "Developer" }}</small
              ></NuxtLink
            ><button :disabled="person.followed_by_me" @click="followPerson(person)">{{
              person.followed_by_me ? "Following" : "Follow"
            }}</button></div
          ></div
        ></section
      >
      <DevDiscoveryModules :news-limit="3" :trends-limit="4" />
    </AppRightSidebar>
  </div>
</template>

<script setup>
import { FolderKanban, Search, X } from "lucide-vue-next";
definePageMeta({ middleware: "auth" });
const route = useRoute();
const router = useRouter();
const search = useSearchStore();
const developers = useDevelopersStore();
const projects = useTeammatesStore();
const feed = useFeedStore();
const follow = useFollowStore();
const toast = useToastStore();
const discovery = useDiscoveryStore();
const tabs = [
  { id: "explore", label: "Explore" },
  { id: "trending", label: "Trending" },
  { id: "news", label: "Dev News" },
];
const activeTab = ref("explore");
const query = ref(String(route.query.q || ""));
const committedQuery = ref(String(route.query.q || ""));
const panelOpen = ref(false);
const selectedIndex = ref(-1);
const searchRoot = ref(null);
const searchInput = ref(null);
let timer;
const rawDevelopers = computed(() => search.developers?.items || []);
const rawProjects = computed(() => search.projects?.items || []);
const developerResults = computed(() =>
  rawDevelopers.value.map((item, index) => ({
    kind: "developer",
    item,
    index,
    key: `developer-${item.uuid}`,
    to: `/developers/${item.uuid}`,
  })),
);
const projectResults = computed(() =>
  rawProjects.value.map((item, offset) => ({
    kind: "project",
    item,
    index: rawDevelopers.value.length + offset,
    key: `project-${item.id}`,
    to: `/projects/${item.id}`,
  })),
);
const searchResults = computed(() => [...developerResults.value, ...projectResults.value]);
watch(query, (value) => {
  clearTimeout(timer);
  selectedIndex.value = -1;
  if (!value.trim()) {
    search.clear();
    return;
  }
  timer = setTimeout(() => search.search(value.trim()), 320);
});
watch(
  () => route.query.q,
  (value) => {
    const next = String(value || "");
    committedQuery.value = next;
    if (next && query.value !== next) {
      query.value = next;
      search.search(next);
    }
  },
);
await Promise.allSettled([
  callOnce("explore-developers", () => developers.search({ limit: 6, sort: "newest" }), {
    mode: "navigation",
  }),
  callOnce(
    "explore-projects",
    () => projects.browse({ limit: 4, status: "open", sort: "newest" }),
    { mode: "navigation" },
  ),
  callOnce("explore-devlogs", () => feed.fetchFeed(true, "all"), { mode: "navigation" }),
  discovery.fetchNews(),
  discovery.fetchTrends(),
]);
if (committedQuery.value) await search.search(committedQuery.value);
function openPanel() {
  panelOpen.value = true;
}
function closePanel() {
  panelOpen.value = false;
  selectedIndex.value = -1;
}
function clearSearch() {
  query.value = "";
  committedQuery.value = "";
  search.clear();
  router.replace({ path: "/explore" });
  nextTick(() => searchInput.value?.focus());
}
function commitSearch() {
  const value = query.value.trim();
  if (!value) return;
  committedQuery.value = value;
  activeTab.value = "explore";
  closePanel();
  router.push({ path: "/explore", query: { q: value } });
}
function resetCommittedSearch() {
  committedQuery.value = "";
  query.value = "";
  search.clear();
  router.push("/explore");
}
function handleKeys(event) {
  if (event.key === "Escape") {
    closePanel();
    searchInput.value?.blur();
    return;
  }
  if (event.key === "ArrowDown") {
    event.preventDefault();
    panelOpen.value = true;
    selectedIndex.value = Math.min(selectedIndex.value + 1, searchResults.value.length - 1);
  } else if (event.key === "ArrowUp") {
    event.preventDefault();
    selectedIndex.value = Math.max(selectedIndex.value - 1, 0);
  } else if (event.key === "Enter") {
    event.preventDefault();
    const selected = searchResults.value[selectedIndex.value];
    if (selected) navigateTo(selected.to);
    else commitSearch();
  }
}
function onDocumentPointer(event) {
  if (!searchRoot.value?.contains(event.target)) closePanel();
}
function formatDate(value) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(new Date(value));
}
function safeLink(value) {
  return /^https?:\/\//i.test(value || "") ? value : "#";
}
async function followPerson(person) {
  try {
    await follow.followUuid(person.uuid);
    toast.success("Developer followed.");
  } catch {
    toast.error("Failed to follow developer.");
  }
}
onMounted(() => document.addEventListener("pointerdown", onDocumentPointer));
onBeforeUnmount(() => {
  clearTimeout(timer);
  document.removeEventListener("pointerdown", onDocumentPointer);
});
</script>

<style scoped>
.explore-shell {
  min-height: 100vh;
  padding-left: var(--sidebar-width);
  display: grid;
  grid-template-columns: minmax(560px, 760px) minmax(280px, 340px);
  justify-content: center;
  gap: 28px;
}
.explore-main {
  min-width: 0;
  width: 100%;
  max-width: none !important;
  margin: 0 !important;
  padding: 0 0 80px !important;
}
.explore-header {
  position: sticky;
  top: 0;
  z-index: 35;
  padding-top: 14px;
  background: rgba(5, 8, 22, 0.94);
  border-bottom: 1px solid rgba(65, 71, 85, 0.35);
  backdrop-filter: blur(18px);
}
.search-wrap {
  position: relative;
  margin: 0 20px;
}
.search-wrap > input {
  width: 100%;
  height: 50px;
  padding: 0 48px !important;
  border-radius: 999px !important;
  background: rgba(10, 10, 11, 0.9) !important;
}
.search-icon {
  position: absolute;
  z-index: 2;
  left: 17px;
  top: 15px;
  color: #8b90a0;
}
.search-wrap > button {
  position: absolute;
  z-index: 2;
  right: 15px;
  top: 14px;
  width: 23px;
  height: 23px;
  display: grid;
  place-items: center;
  color: #9da3b4;
}
.search-panel {
  position: absolute;
  left: 0;
  right: 0;
  top: 57px;
  z-index: 70;
  max-height: min(560px, 70vh);
  overflow-y: auto;
  border: 1px solid #414755;
  border-radius: 16px;
  background: #0b0e16;
  box-shadow: 0 18px 48px rgba(0, 0, 0, 0.55);
}
.search-hint {
  min-height: 126px;
  display: grid;
  place-items: center;
  padding: 24px;
  color: #8b90a0;
  text-align: center;
}
.search-loading {
  padding: 10px;
}
.result-skeleton {
  display: flex;
  gap: 12px;
  padding: 10px;
}
.result-group {
  padding: 9px 0;
  border-bottom: 1px solid rgba(65, 71, 85, 0.3);
}
.result-group h2 {
  padding: 7px 16px;
  color: #adc6ff;
  font:
    600 10px "JetBrains Mono",
    monospace;
  letter-spacing: 0.1em;
  text-transform: uppercase;
}
.result-row,
.discovery-row {
  display: grid;
  grid-template-columns: 42px minmax(0, 1fr);
  align-items: center;
  gap: 11px;
  padding: 11px 16px;
}
.result-row:hover,
.result-row.selected,
.discovery-row:hover {
  background: #1c2028;
}
.result-avatar,
.result-project {
  width: 40px;
  height: 40px;
  display: grid;
  place-items: center;
  border: 1px solid rgba(173, 198, 255, 0.28);
  border-radius: 50%;
  color: #adc6ff;
  background: #181c23;
  font:
    600 10px "JetBrains Mono",
    monospace;
}
.result-project {
  border-radius: 10px;
}
.result-row strong,
.result-row small,
.discovery-row strong,
.discovery-row small {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.result-row strong,
.discovery-row strong {
  font-size: 13px;
}
.result-row small,
.discovery-row small {
  margin-top: 3px;
  color: #8b90a0;
  font-size: 11px;
}
.view-all {
  width: 100%;
  padding: 15px;
  color: #adc6ff;
  text-align: left;
  font:
    500 11px "JetBrains Mono",
    monospace;
}
.explore-tabs {
  height: 58px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  margin-top: 10px;
}
.explore-tabs button {
  position: relative;
  color: #858b9b;
  font-weight: 600;
}
.explore-tabs button:hover {
  color: #c1c6d7;
  background: rgba(28, 32, 40, 0.25);
}
.explore-tabs button.active {
  color: #e0e2ed;
}
.explore-tabs button.active::after {
  content: "";
  position: absolute;
  left: 25%;
  right: 25%;
  bottom: 0;
  height: 3px;
  border-radius: 3px;
  background: #4b8eff;
}
.explore-content {
  padding-bottom: 50px;
}
.discovery-section {
  border-bottom: 1px solid rgba(65, 71, 85, 0.35);
  padding: 26px 20px;
}
.section-heading {
  display: flex;
  align-items: end;
  justify-content: space-between;
  margin-bottom: 15px;
}
.section-heading span,
.blocked-state > span {
  color: #adc6ff;
  font:
    600 9px "JetBrains Mono",
    monospace;
  letter-spacing: 0.14em;
}
.section-heading h1 {
  margin-top: 4px;
  font-size: 22px;
  font-weight: 650;
}
.section-heading > a,
.section-heading > button {
  color: #adc6ff;
  font:
    500 10px "JetBrains Mono",
    monospace;
}
.row-list,
.full-results {
  display: grid;
}
.discovery-row {
  grid-template-columns: 42px minmax(0, 1fr) auto;
  border-top: 1px solid rgba(65, 71, 85, 0.22);
}
.row-meta {
  color: #858b9b;
  font-size: 11px;
}
.project-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
}
.project-card {
  padding: 16px;
  border: 1px solid rgba(65, 71, 85, 0.4);
  border-radius: 14px;
  background: rgba(16, 19, 27, 0.65);
}
.project-card strong {
  font-size: 14px;
}
.project-card p {
  display: -webkit-box;
  margin: 7px 0;
  color: #c1c6d7;
  font-size: 12px;
  line-height: 1.45;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.project-card small {
  color: #adc6ff;
  font:
    500 9px "JetBrains Mono",
    monospace;
}
.devlog-list {
  border-top: 1px solid rgba(65, 71, 85, 0.22);
}
.devlog-row {
  display: block;
  padding: 15px 4px;
  border-bottom: 1px solid rgba(65, 71, 85, 0.22);
}
.devlog-row > span {
  display: flex;
  justify-content: space-between;
}
.devlog-row small {
  color: #858b9b;
  font-size: 10px;
}
.devlog-row p {
  margin: 7px 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.blocked-state {
  min-height: 430px;
  display: grid;
  place-items: center;
  align-content: center;
  gap: 12px;
  padding: 40px;
  text-align: center;
}
.blocked-state svg {
  color: #adc6ff;
}
.blocked-state h1 {
  font-size: 24px;
  font-weight: 650;
}
.blocked-state p {
  max-width: 520px;
  color: #aeb4c5;
}
.blocked-state code {
  padding: 8px 11px;
  border: 1px solid rgba(255, 181, 149, 0.3);
  border-radius: 8px;
  color: #ffb595;
  background: rgba(255, 181, 149, 0.06);
  font-size: 10px;
}
@media (max-width: 760px) {
  .explore-shell {
    padding-left: 0;
  }
  .explore-main {
    width: 100%;
  }
  .explore-header {
    padding-top: 10px;
  }
  .search-wrap {
    margin: 0 12px;
  }
  .explore-tabs {
    overflow-x: auto;
  }
  .explore-tabs button {
    min-width: 110px;
  }
  .discovery-section {
    padding: 22px 14px;
  }
  .project-grid {
    grid-template-columns: 1fr;
  }
  .row-meta {
    display: none;
  }
  .search-panel {
    position: fixed;
    left: 10px;
    right: 10px;
    top: 67px;
    max-height: 65vh;
  }
  .explore-content {
    padding-bottom: 72px;
  }
}
.context-card {
  overflow: hidden;
  border: 1px solid rgba(65, 71, 85, 0.35);
  border-radius: 16px;
  background: rgba(16, 19, 27, 0.72);
}
.context-heading {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px;
}
.context-heading h2 {
  font-size: 15px;
  font-weight: 650;
}
.context-heading a {
  color: #adc6ff;
  font:
    500 9px "JetBrains Mono",
    monospace;
}
.context-person {
  display: grid;
  grid-template-columns: 40px minmax(0, 1fr) auto;
  align-items: center;
  gap: 9px;
  padding: 11px 14px;
  border-top: 1px solid rgba(65, 71, 85, 0.25);
}
.context-person a {
  min-width: 0;
}
.context-person strong,
.context-person small,
.context-project strong,
.context-project small {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.context-person strong,
.context-project strong {
  font-size: 12px;
}
.context-person small,
.context-project small {
  margin-top: 2px;
  color: #858b9b;
  font-size: 9px;
}
.context-person button {
  color: #adc6ff;
  font:
    600 9px "JetBrains Mono",
    monospace;
}
.context-project {
  display: block;
  padding: 12px 15px;
  border-top: 1px solid rgba(65, 71, 85, 0.25);
}
.context-loading {
  display: grid;
  gap: 8px;
  padding: 12px;
}
@media (max-width: 1080px) {
  .explore-shell {
    display: block;
  }
  .explore-main {
    width: min(800px, 100%);
    margin: 0 auto !important;
  }
}
</style>
<style scoped>
.external-list {
  display: grid;
}
.external-row {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 17px 20px;
  border-bottom: 1px solid rgba(65, 71, 85, 0.3);
}
.external-row strong,
.external-row small {
  display: block;
}
.external-row strong {
  font-size: 15px;
}
.external-row small {
  margin-top: 4px;
  color: #858b9b;
  font-size: 10px;
}
.external-row em {
  color: #858b9b;
  font:
    500 9px "JetBrains Mono",
    monospace;
  white-space: nowrap;
}
.news-row p {
  display: -webkit-box;
  margin-top: 8px;
  color: #adb3c1;
  font-size: 12px;
  line-height: 1.5;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
@media (max-width: 600px) {
  .external-row {
    padding-inline: 14px;
  }
  .external-row em {
    display: none;
  }
}
</style>
