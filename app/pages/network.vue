<template>
  <div class="network-shell"
    ><AppSidebar /><main class="network-main"
      ><header class="network-header"
        ><span>PEOPLE / NETWORK</span><h1>Network</h1
        ><p>Discover developers, build connections, and find people to collaborate with.</p></header
      ><nav class="network-tabs" aria-label="Network views"
        ><button
          v-for="tab in tabs"
          :key="tab.id"
          :class="{ active: activeTab === tab.id }"
          role="tab"
          :aria-selected="activeTab === tab.id"
          @click="selectTab(tab.id)"
          >{{ tab.label }}</button
        ></nav
      ><section class="network-tools"
        ><div
          ><Search :size="17" /><input
            v-model="query"
            type="search"
            placeholder="Search developers..."
            aria-label="Search developers" /></div
        ><input
          v-if="activeTab === 'forYou'"
          v-model="tech"
          placeholder="Filter by technology"
          aria-label="Filter developers by technology" /></section
      ><p v-if="activeTab !== 'forYou' && query" class="filter-note"
        >Filtering the currently loaded {{ activeTab }} list.</p
      ><div v-if="network.loading && !visiblePeople.length" class="developer-list"
        ><DeveloperCardSkeleton v-for="n in 6" :key="n" /></div
      ><StateMessage v-else-if="network.error" :message="network.error" /><StateMessage
        v-else-if="!visiblePeople.length"
        :message="emptyMessage"
      /><section v-else class="developer-list"
        ><article v-for="person in visiblePeople" :key="person.uuid" class="developer-row"
          ><NuxtLink :to="`/developers/${person.uuid}`"
            ><UserAvatar :user="person" :size="48" /></NuxtLink
          ><div class="developer-copy"
            ><NuxtLink :to="`/developers/${person.uuid}`"
              ><strong>{{ person.display_name || person.username }}</strong
              ><small>@{{ person.username }}</small></NuxtLink
            ><p v-if="person.bio">{{ person.bio }}</p
            ><div class="developer-meta"
              ><span v-for="stack in stacks(person.favorite_tech)" :key="stack">{{ stack }}</span
              ><em v-if="person.collaboration_status">{{ person.collaboration_status }}</em></div
            ></div
          ><button
            :disabled="pendingUuid === person.uuid"
            :class="{ following: person.followed_by_me }"
            :aria-label="`${person.followed_by_me ? 'Unfollow' : 'Follow'} ${person.username}`"
            @click="toggleFollow(person)"
            >{{
              pendingUuid === person.uuid
                ? "Working…"
                : person.followed_by_me
                  ? "Following"
                  : "Follow"
            }}</button
          ></article
        ></section
      ><button v-if="hasMore" :disabled="network.loading" class="load-more" @click="loadMore">{{
        network.loading ? "Loading…" : "Load more developers"
      }}</button></main
    ><AppRightSidebar
      ><section class="context-card"
        ><div class="context-heading"
          ><h2>Active projects</h2><NuxtLink to="/projects">See all</NuxtLink></div
        ><div v-if="projects.loading" class="context-loading"
          ><SkeletonBlock v-for="n in 3" :key="n" class="h-14" /></div
        ><NuxtLink
          v-for="project in projects.posts.slice(0, 4)"
          v-else
          :key="project.id"
          :to="`/projects/${project.id}`"
          class="project-row"
          ><strong>{{ project.title }}</strong
          ><small>{{
            project.needed_skills?.slice(0, 3).join(" · ") || project.project_type || "Open project"
          }}</small></NuxtLink
        ></section
      ><DevDiscoveryModules :news-limit="3" :trends-limit="4" /></AppRightSidebar
  ></div>
</template>
<script setup>
import { Search } from "lucide-vue-next";
definePageMeta({ middleware: "auth" });
const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const network = useNetworkStore();
const follow = useFollowStore();
const projects = useTeammatesStore();
const toast = useToastStore();
const validTabs = ["forYou", "following", "followers"];
const activeTab = ref(
  validTabs.includes(String(route.query.tab)) ? String(route.query.tab) : "forYou",
);
const query = ref("");
const tech = ref("");
const pendingUuid = ref(null);
let timer;
const tabs = [
  { id: "forYou", label: "For You" },
  { id: "following", label: "Following" },
  { id: "followers", label: "Followers" },
];
const basePeople = computed(() =>
  network.lists[activeTab.value].filter((person) => person.uuid !== auth.user?.uuid),
);
const visiblePeople = computed(() => {
  if (activeTab.value === "forYou" || !query.value.trim()) return basePeople.value;
  const needle = query.value.trim().toLowerCase();
  return basePeople.value.filter((person) =>
    [person.display_name, person.username, person.bio, person.favorite_tech].some((value) =>
      String(value || "")
        .toLowerCase()
        .includes(needle),
    ),
  );
});
const currentPagination = computed(() => network.pagination[activeTab.value]);
const hasMore = computed(
  () => currentPagination.value && currentPagination.value.page < currentPagination.value.pages,
);
const emptyMessage = computed(() =>
  activeTab.value === "following"
    ? "You're not following anyone yet."
    : activeTab.value === "followers"
      ? "No followers yet."
      : "No developers found.",
);
function stacks(value) {
  return String(value || "")
    .split(/[,·|]/)
    .map((item) => item.trim())
    .filter(Boolean)
    .slice(0, 4);
}
async function loadTab(force = false) {
  const tab = activeTab.value;
  if (!force && network.loaded[tab]) return;
  if (tab === "forYou")
    await network.fetchForYou({ q: query.value.trim(), tech: tech.value.trim() });
  else await network.fetchConnections(tab, auth.user.uuid);
}
function selectTab(tab) {
  activeTab.value = tab;
  network.cancelPending();
  router.push({ path: "/network", query: tab === "forYou" ? {} : { tab } });
  loadTab();
}
watch([query, tech], () => {
  if (activeTab.value !== "forYou") return;
  clearTimeout(timer);
  timer = setTimeout(
    () => network.fetchForYou({ q: query.value.trim(), tech: tech.value.trim() }),
    350,
  );
});
watch(
  () => route.query.tab,
  (value) => {
    const tab = validTabs.includes(String(value)) ? String(value) : "forYou";
    if (tab !== activeTab.value) {
      activeTab.value = tab;
      loadTab();
    }
  },
);
async function toggleFollow(person) {
  if (pendingUuid.value) return;
  const wasFollowing = person.followed_by_me;
  pendingUuid.value = person.uuid;
  try {
    if (wasFollowing) await follow.unfollowUuid(person.uuid);
    else await follow.followUuid(person.uuid);
    toast.success(wasFollowing ? "Developer unfollowed." : "Developer followed.");
  } catch {
    person.followed_by_me = wasFollowing;
    toast.error(wasFollowing ? "Failed to unfollow developer." : "Failed to follow developer.");
  } finally {
    pendingUuid.value = null;
  }
}
async function loadMore() {
  const page = currentPagination.value.page + 1;
  if (activeTab.value === "forYou")
    await network.fetchForYou({ q: query.value.trim(), tech: tech.value.trim(), page }, true);
  else await network.fetchConnections(activeTab.value, auth.user.uuid, page, true);
}
await Promise.allSettled([
  loadTab(),
  callOnce(
    "network-projects",
    () => projects.browse({ limit: 4, status: "open", sort: "newest" }),
    { mode: "navigation" },
  ),
]);
onBeforeUnmount(() => clearTimeout(timer));
</script>
<style scoped>
.network-shell {
  min-height: 100vh;
  padding-left: var(--sidebar-width);
  display: grid;
  grid-template-columns: minmax(560px, 760px) minmax(280px, 340px);
  justify-content: center;
  gap: 28px;
  color: #e0e2ed;
}
.network-main {
  min-width: 0;
  margin: 0 !important;
  padding: 32px 0 80px !important;
  max-width: none !important;
}
.network-header {
  padding: 0 20px 22px;
}
.network-header > span {
  color: #adc6ff;
  font:
    600 9px "JetBrains Mono",
    monospace;
  letter-spacing: 0.14em;
}
.network-header h1 {
  margin-top: 4px;
  font-size: 32px;
  font-weight: 680;
}
.network-header p {
  margin-top: 6px;
  color: #969cac;
}
.network-tabs {
  height: 56px;
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  border-block: 1px solid rgba(65, 71, 85, 0.32);
}
.network-tabs button {
  position: relative;
  color: #858b9b;
  font-weight: 600;
}
.network-tabs button.active {
  color: #e0e2ed;
}
.network-tabs button.active::after {
  content: "";
  position: absolute;
  left: 27%;
  right: 27%;
  bottom: 0;
  height: 3px;
  border-radius: 3px;
  background: #4b8eff;
}
.network-tools {
  display: grid;
  grid-template-columns: 1fr 230px;
  gap: 10px;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(65, 71, 85, 0.3);
}
.network-tools > div {
  position: relative;
}
.network-tools svg {
  position: absolute;
  left: 13px;
  top: 13px;
  color: #858b9b;
}
.network-tools input {
  width: 100%;
  height: 43px;
  padding: 0 13px;
}
.network-tools > div input {
  padding-left: 40px;
}
.filter-note {
  padding: 8px 20px;
  color: #777d8d;
  font-size: 10px;
}
.developer-list {
  display: grid;
}
.developer-row {
  display: grid;
  grid-template-columns: 50px minmax(0, 1fr) auto;
  gap: 12px;
  padding: 18px 20px;
  border-bottom: 1px solid rgba(65, 71, 85, 0.3);
}
.developer-avatar {
  width: 48px;
  height: 48px;
  display: grid;
  place-items: center;
  overflow: hidden;
  border: 1px solid rgba(173, 198, 255, 0.28);
  border-radius: 50%;
  color: #adc6ff;
  background: #1c2028;
  font:
    600 10px "JetBrains Mono",
    monospace;
}
.developer-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.developer-copy > a strong,
.developer-copy > a small {
  display: block;
}
.developer-copy > a strong {
  font-size: 14px;
}
.developer-copy > a small {
  margin-top: 2px;
  color: #858b9b;
  font-size: 10px;
}
.developer-copy > p {
  display: -webkit-box;
  margin-top: 8px;
  color: #c1c6d7;
  font-size: 12px;
  line-height: 1.45;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}
.developer-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 10px;
}
.developer-meta span,
.developer-meta em {
  padding: 4px 7px;
  border: 1px solid rgba(65, 71, 85, 0.5);
  border-radius: 999px;
  color: #adc6ff;
  font:
    500 8px "JetBrains Mono",
    monospace;
}
.developer-meta em {
  color: #ffb595;
  font-style: normal;
}
.developer-row > button {
  height: 32px;
  padding: 0 12px;
  border-radius: 999px;
  color: #062451;
  background: #adc6ff;
  font:
    600 9px "JetBrains Mono",
    monospace;
}
.developer-row > button.following {
  color: #adc6ff;
  background: transparent;
  border: 1px solid rgba(173, 198, 255, 0.35);
}
.developer-row > button:disabled {
  opacity: 0.55;
}
.load-more {
  display: block;
  margin: 22px auto;
  padding: 10px 16px;
  border: 1px solid #414755;
  border-radius: 999px;
  color: #adc6ff;
}
.context-card {
  overflow: hidden;
  border: 1px solid rgba(65, 71, 85, 0.35);
  border-radius: 16px;
  background: rgba(16, 19, 27, 0.72);
}
.context-heading {
  display: flex;
  justify-content: space-between;
  padding: 15px;
}
.context-heading h2 {
  font-size: 14px;
  font-weight: 650;
}
.context-heading a,
.context-link {
  color: #adc6ff;
  font:
    500 9px "JetBrains Mono",
    monospace;
}
.project-row {
  display: block;
  padding: 12px 15px;
  border-top: 1px solid rgba(65, 71, 85, 0.25);
}
.project-row strong,
.project-row small {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.project-row strong {
  font-size: 12px;
}
.project-row small {
  margin-top: 3px;
  color: #858b9b;
  font-size: 9px;
}
.context-copy {
  padding: 0 15px 12px;
  color: #9298a8;
  font-size: 11px;
  line-height: 1.5;
}
.context-link {
  display: block;
  padding: 0 15px 15px;
}
.context-loading {
  display: grid;
  gap: 8px;
  padding: 12px;
}
@media (max-width: 1080px) {
  .network-shell {
    display: block;
  }
  .network-main {
    width: min(800px, 100%);
    margin: auto !important;
  }
}
@media (max-width: 760px) {
  .network-shell {
    padding-left: 0;
  }
  .network-main {
    padding-top: 20px !important;
    padding-bottom: 90px !important;
  }
  .network-tools {
    grid-template-columns: 1fr;
  }
  .developer-row {
    padding-inline: 14px;
  }
  .developer-row > button {
    grid-column: 2/-1;
    width: max-content;
  }
  .network-tabs {
    overflow-x: auto;
  }
  .network-tabs button {
    min-width: 110px;
  }
}
</style>
