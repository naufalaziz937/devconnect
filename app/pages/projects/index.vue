<template>
  <div v-if="isAdmin" class="admin-projects-shell"
    ><AppSidebar /><main><AdminManagementPlaceholder title="Projects" /></main></div
  ><div v-else class="projects-shell"
    ><AppSidebar /><main class="projects-main"
      ><header class="projects-header"
        ><div
          ><span>PROJECTS / DISCOVER</span><h1>Projects</h1
          ><p>Discover what developers are building and find teams worth joining.</p></div
        ><NuxtLink to="/projects/create" aria-label="Create project"
          ><Plus :size="22" /></NuxtLink></header
      ><section class="project-tools"
        ><div class="project-search"
          ><Search :size="17" /><input
            v-model="filters.q"
            placeholder="Search projects"
            aria-label="Search projects" /></div
        ><div class="filter-tabs"
          ><button
            v-for="filter in statusFilters"
            :key="filter.value"
            :class="{ active: filters.status === filter.value }"
            @click="filters.status = filter.value"
            >{{ filter.label }}</button
          ></div
        ><input
          v-model="filters.skill"
          class="skill-filter"
          placeholder="Filter by exact skill"
          aria-label="Filter by technology" /></section
      ><p v-if="store.error" class="page-error">{{ store.error }}</p
      ><div v-if="store.loading && !store.posts.length" class="project-list"
        ><ProjectCardSkeleton v-for="n in 4" :key="n" /></div
      ><StateMessage
        v-else-if="!store.posts.length"
        message="No projects match this discovery view yet."
      /><section v-else class="project-list"
        ><article v-for="project in store.posts" :key="project.id" class="project-item"
          ><UserAvatar :user="project" :size="40" /><div class="project-body"
            ><header
              ><div
                ><NuxtLink :to="`/developers/${project.owner_uuid}`" class="owner-name">{{
                  project.username
                }}</NuxtLink
                ><span
                  >@{{ project.username }} ·
                  {{ formatDate(project.updated_at || project.created_at) }}</span
                ></div
              ><span class="status-badge">{{ project.status }}</span></header
            ><NuxtLink :to="`/projects/${project.id}`" class="project-title">{{
              project.title
            }}</NuxtLink
            ><p>{{ project.description }}</p
            ><div class="stack-list"
              ><span v-for="skill in project.needed_skills?.slice(0, 4)" :key="skill">{{
                skill
              }}</span
              ><span v-if="project.needed_skills?.length > 4"
                >+{{ project.needed_skills.length - 4 }}</span
              ></div
            ><footer
              ><span
                ><UsersRound :size="16" /> {{ project.total_members }} /
                {{ project.max_members }} members</span
              ><span v-if="project.project_type"
                ><FolderKanban :size="16" /> {{ project.project_type }}</span
              ><NuxtLink :to="`/projects/${project.id}`"
                >View project <ArrowRight :size="15" /></NuxtLink></footer></div></article></section
      ><button
        v-if="hasNextPage"
        :disabled="store.loading"
        class="load-more"
        @click="loadPage(store.pagination.page + 1)"
        >{{ store.loading ? "Loading…" : "Load more projects" }}</button
      ></main
    ><AppRightSidebar
      ><section class="context-card"
        ><div class="context-heading"
          ><h2>Developers to discover</h2><NuxtLink to="/network">See all</NuxtLink></div
        ><div v-if="developers.loading" class="context-loading"
          ><SkeletonBlock v-for="n in 3" :key="n" class="h-14" /></div
        ><NuxtLink
          v-for="person in developers.items.slice(0, 3)"
          v-else
          :key="person.uuid"
          :to="`/developers/${person.uuid}`"
          class="developer-row"
          ><UserAvatar :user="person" :size="40" /><span
            ><strong>{{ person.display_name || person.username }}</strong
            ><small>@{{ person.username }} · {{ person.favorite_tech || "Developer" }}</small></span
          ></NuxtLink
        ></section
      ><DevDiscoveryModules :news-limit="3" :trends-limit="4" /></AppRightSidebar
  ></div>
</template>
<script setup>
import { ArrowRight, FolderKanban, Plus, Search, UsersRound } from "lucide-vue-next";
import { ROLES } from "~/utils/roles";
definePageMeta({ middleware: "auth" });
const auth = useAuthStore();
const isAdmin = computed(() => auth.user?.role === ROLES.ADMIN);
const store = useTeammatesStore();
const developers = useDevelopersStore();
const filters = reactive({ q: "", skill: "", status: "", page: 1, limit: 10, sort: "newest" });
let timer;
const statusFilters = [
  { label: "All", value: "" },
  { label: "Open", value: "open" },
  { label: "Closed", value: "closed" },
  { label: "Completed", value: "completed" },
];
const hasNextPage = computed(
  () => store.pagination && store.pagination.page < store.pagination.pages,
);
async function loadPage(page = 1) {
  const previous = page > 1 ? [...store.posts] : [];
  filters.page = page;
  await store.browse({ ...filters });
  if (previous.length) store.posts = [...previous, ...store.posts];
}
watch(
  () => [filters.q, filters.skill, filters.status],
  () => {
    clearTimeout(timer);
    timer = setTimeout(() => loadPage(1), 350);
  },
);
function formatDate(value) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(new Date(value));
}
if (!isAdmin.value)
  await Promise.allSettled([
    callOnce("projects-discovery", () => loadPage(1), { mode: "navigation" }),
    callOnce(
      "projects-developers",
      () => developers.search({ limit: 3, collaboration_status: "open", sort: "newest" }),
      { mode: "navigation" },
    ),
  ]);
onBeforeUnmount(() => clearTimeout(timer));
</script>
<style scoped>
.admin-projects-shell {
  min-height: 100vh;
  color: #e0e2ed;
  background: #10131b;
}
.admin-projects-shell > main {
  min-height: 100vh;
  margin-left: 264px !important;
  padding: 32px !important;
  max-width: none !important;
}
@media (max-width: 900px) {
  .admin-projects-shell > main {
    margin-left: 0 !important;
    padding: 76px 20px !important;
  }
}
.projects-shell {
  min-height: 100vh;
  padding-left: var(--sidebar-width);
  display: grid;
  grid-template-columns: minmax(560px, 760px) minmax(280px, 340px);
  justify-content: center;
  gap: 28px;
  color: #e0e2ed;
}
.projects-main {
  min-width: 0;
  margin: 0 !important;
  padding: 32px 0 80px !important;
  max-width: none !important;
}
.projects-header {
  display: flex;
  justify-content: space-between;
  align-items: start;
  padding: 0 20px 24px;
}
.projects-header span {
  color: #adc6ff;
  font:
    600 9px "JetBrains Mono",
    monospace;
  letter-spacing: 0.14em;
}
.projects-header h1 {
  margin-top: 4px;
  font-size: 32px;
  font-weight: 680;
}
.projects-header p {
  margin-top: 6px;
  color: #969cac;
}
.projects-header > a {
  width: 42px;
  height: 42px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  color: #062451;
  background: #adc6ff;
}
.project-tools {
  display: grid;
  grid-template-columns: 1fr auto;
  gap: 12px;
  padding: 0 20px 20px;
  border-bottom: 1px solid rgba(65, 71, 85, 0.35);
}
.project-search {
  position: relative;
}
.project-search svg {
  position: absolute;
  left: 13px;
  top: 13px;
  color: #858b9b;
}
.project-search input,
.skill-filter {
  width: 100%;
  height: 43px;
  padding: 0 13px 0 40px;
}
.skill-filter {
  grid-column: 1/-1;
  padding-left: 13px;
}
.filter-tabs {
  display: flex;
  gap: 4px;
}
.filter-tabs button {
  padding: 8px 10px;
  border-radius: 999px;
  color: #858b9b;
  font:
    500 9px "JetBrains Mono",
    monospace;
}
.filter-tabs button.active {
  color: #adc6ff;
  background: rgba(75, 142, 255, 0.12);
}
.project-list {
  display: grid;
}
.project-item {
  display: grid;
  grid-template-columns: 44px minmax(0, 1fr);
  gap: 12px;
  padding: 20px;
  border-bottom: 1px solid rgba(65, 71, 85, 0.32);
}
.owner-avatar {
  width: 40px;
  height: 40px;
  display: grid;
  place-items: center;
  border: 1px solid rgba(173, 198, 255, 0.28);
  border-radius: 50%;
  color: #adc6ff;
  background: #1c2028;
  font:
    600 9px "JetBrains Mono",
    monospace;
}
.project-body > header {
  display: flex;
  justify-content: space-between;
  gap: 12px;
}
.owner-name {
  font-size: 13px;
  font-weight: 650;
}
.project-body header div > span {
  display: block;
  margin-top: 2px;
  color: #858b9b;
  font-size: 10px;
}
.status-badge {
  height: max-content;
  padding: 4px 8px;
  border: 1px solid rgba(173, 198, 255, 0.24);
  border-radius: 999px;
  color: #adc6ff;
  font:
    600 8px "JetBrains Mono",
    monospace;
  text-transform: uppercase;
}
.project-title {
  display: block;
  margin-top: 13px;
  font-size: 20px;
  font-weight: 680;
}
.project-body > p {
  margin-top: 7px;
  color: #c1c6d7;
  line-height: 1.55;
}
.stack-list {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  margin-top: 13px;
}
.stack-list span {
  padding: 5px 8px;
  border: 1px solid rgba(65, 71, 85, 0.55);
  border-radius: 999px;
  color: #adc6ff;
  background: #141821;
  font:
    500 8px "JetBrains Mono",
    monospace;
}
.project-body footer {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  gap: 15px;
  margin-top: 15px;
  color: #8d93a3;
  font-size: 10px;
}
.project-body footer span,
.project-body footer a {
  display: flex;
  align-items: center;
  gap: 6px;
}
.project-body footer a {
  margin-left: auto;
  color: #adc6ff;
}
.load-more {
  display: block;
  margin: 22px auto;
  padding: 10px 16px;
  border: 1px solid #414755;
  border-radius: 999px;
  color: #adc6ff;
}
.page-error {
  padding: 14px 20px;
  color: #ffb595;
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
.context-heading a {
  color: #adc6ff;
  font:
    500 9px "JetBrains Mono",
    monospace;
}
.developer-row {
  display: grid;
  grid-template-columns: 40px minmax(0, 1fr);
  gap: 9px;
  align-items: center;
  padding: 11px 14px;
  border-top: 1px solid rgba(65, 71, 85, 0.25);
}
.developer-row strong,
.developer-row small {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.developer-row strong {
  font-size: 12px;
}
.developer-row small {
  color: #858b9b;
  font-size: 9px;
}
.context-loading {
  display: grid;
  gap: 8px;
  padding: 12px;
}
@media (max-width: 1080px) {
  .admin-projects-shell {
    min-height: 100vh;
    color: #e0e2ed;
    background: #10131b;
  }
  .admin-projects-shell > main {
    min-height: 100vh;
    margin-left: 264px !important;
    padding: 32px !important;
    max-width: none !important;
  }
  @media (max-width: 900px) {
    .admin-projects-shell > main {
      margin-left: 0 !important;
      padding: 76px 20px !important;
    }
  }
  .projects-shell {
    display: block;
  }
  .projects-main {
    width: min(800px, 100%);
    margin: auto !important;
  }
}
@media (max-width: 760px) {
  .admin-projects-shell {
    min-height: 100vh;
    color: #e0e2ed;
    background: #10131b;
  }
  .admin-projects-shell > main {
    min-height: 100vh;
    margin-left: 264px !important;
    padding: 32px !important;
    max-width: none !important;
  }
  @media (max-width: 900px) {
    .admin-projects-shell > main {
      margin-left: 0 !important;
      padding: 76px 20px !important;
    }
  }
  .projects-shell {
    padding-left: 0;
  }
  .projects-main {
    padding-top: 20px !important;
  }
  .project-tools {
    grid-template-columns: 1fr;
  }
  .filter-tabs {
    grid-row: 2;
    overflow-x: auto;
  }
  .skill-filter {
    grid-column: auto;
  }
  .project-item {
    padding-inline: 14px;
  }
  .project-body footer a {
    width: 100%;
    margin-left: 0;
  }
}
</style>
