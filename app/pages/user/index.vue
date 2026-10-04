<template>
  <div class="users-page">
    <header
      ><div
        ><p>ACCOUNT MANAGEMENT</p><h1>Users</h1
        ><span>Manage DevConnect accounts, roles, and account status.</span></div
      ><button :disabled="store.loading" @click="load"
        ><RefreshCw :class="{ spin: store.loading }" :size="16" />Refresh</button
      ></header
    >
    <section v-if="initialLoading" class="metrics skeletons"><i v-for="n in 3" :key="n" /></section>
    <section v-else-if="store.summary" class="metrics"
      ><article
        ><Users :size="18" /><span
          >Total Users<strong>{{ number(store.summary.total) }}</strong></span
        ></article
      ><article
        ><BadgeCheck :size="18" /><span
          >Verified Users<strong>{{ number(store.summary.verified) }}</strong></span
        ></article
      ><article
        ><UserPlus :size="18" /><span
          >New Users <small>Last 7 days</small
          ><strong>{{ number(store.summary.newUsers7d) }}</strong></span
        ></article
      ></section
    >
    <section class="panel">
      <div class="tools"
        ><label class="search"
          ><Search :size="16" /><input
            v-model="form.search"
            type="search"
            placeholder="Search users..."
            aria-label="Search users" /></label
        ><select v-model="form.role" aria-label="Filter by role"
          ><option value="">All roles</option
          ><option value="admin">Administrator</option
          ><option value="user">Developer</option></select
        ><select v-model="form.provider" aria-label="Filter by provider"
          ><option value="">All providers</option
          ><option value="email">Email</option
          ><option value="github">GitHub</option></select
        ><select v-model="form.sort" aria-label="Sort users"
          ><option value="newest">Newest</option
          ><option value="oldest">Oldest</option
          ><option value="username">Username A–Z</option></select
        ></div
      >
      <div v-if="store.error && !store.users.length" class="state"
        ><TriangleAlert /><h2>Unable to load users.</h2><p>{{ store.error }}</p
        ><button @click="load">Try Again</button></div
      >
      <div v-else-if="initialLoading" class="table-skeleton"><i v-for="n in 6" :key="n" /></div>
      <template v-else>
        <div class="table-wrap" :class="{ refreshing: store.loading }"
          ><table
            ><thead
              ><tr
                ><th>User</th><th>Username</th><th>Role</th><th>Provider</th><th>Posts</th
                ><th>Projects</th><th>Joined</th><th><span class="sr">Actions</span></th></tr
              ></thead
            ><tbody
              ><tr v-for="u in store.users" :key="u.id"
                ><td
                  ><NuxtLink :to="`/user/${u.id}`" class="identity"
                    ><UserAvatar
                      :user="{
                        username: u.username,
                        display_name: u.displayName,
                        avatar_url: u.avatar,
                      }"
                      :size="38"
                    /><span
                      ><strong>{{ u.displayName || u.username }}</strong
                      ><small>{{ u.email || "No email provided" }}</small></span
                    ></NuxtLink
                  ></td
                ><td>@{{ u.username }}</td
                ><td
                  ><span :class="['badge', `badge--${u.role}`]">{{ roleLabel(u.role) }}</span></td
                ><td>{{ providerLabel(u.provider) }}</td
                ><td>{{ number(u.stats.posts) }}</td
                ><td>{{ number(u.stats.projects) }}</td
                ><td>{{ date(u.createdAt) }}</td
                ><td
                  ><button
                    class="dots"
                    type="button"
                    aria-label="User actions"
                    @click="openMenu = openMenu === u.id ? null : u.id"
                    ><MoreHorizontal :size="18" /></button
                  ><div v-if="openMenu === u.id" class="menu"
                    ><NuxtLink :to="`/user/${u.id}`">View Details</NuxtLink
                    ><NuxtLink :to="`/developers/${u.id}`">View Profile</NuxtLink
                    ><button :disabled="u.id === auth.user?.uuid" @click="editRole(u)"
                      >Change Role</button
                    ></div
                  ></td
                ></tr
              ></tbody
            ></table
          >
          <div v-if="!store.users.length" class="state empty"
            ><Users /><h2>No users found.</h2><p>Try changing your search or filters.</p></div
          >
          <div class="mobile-list"
            ><article v-for="u in store.users" :key="u.id"
              ><NuxtLink :to="`/user/${u.id}`"
                ><UserAvatar
                  :user="{
                    username: u.username,
                    display_name: u.displayName,
                    avatar_url: u.avatar,
                  }"
                  :size="44" /><span
                  ><strong>{{ u.displayName || u.username }}</strong
                  ><small>@{{ u.username }} · {{ providerLabel(u.provider) }}</small></span
                ><ChevronRight /></NuxtLink
              ><footer
                ><span :class="['badge', `badge--${u.role}`]">{{ roleLabel(u.role) }}</span
                ><span>{{ number(u.stats.posts) }} posts</span
                ><span>{{ date(u.createdAt) }}</span></footer
              ></article
            ></div
          ></div
        >
        <footer v-if="store.pagination && store.pagination.total" class="pagination"
          ><span
            >Showing {{ rangeStart }}–{{ rangeEnd }} of {{ number(store.pagination.total) }}</span
          ><div
            ><button :disabled="form.page <= 1 || store.loading" @click="page(form.page - 1)"
              ><ChevronLeft /></button
            ><b>Page {{ form.page }} of {{ store.pagination.totalPages }}</b
            ><button
              :disabled="form.page >= store.pagination.totalPages || store.loading"
              @click="page(form.page + 1)"
              ><ChevronRight /></button></div
        ></footer>
      </template>
    </section>
    <AdminRoleDialog
      v-if="roleTarget"
      :user="roleTarget"
      :pending="rolePending"
      :is-self="roleTarget.id === auth.user?.uuid"
      @close="roleTarget = null"
      @confirm="changeRole"
    />
  </div>
</template>
<script setup>
import {
  BadgeCheck,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  RefreshCw,
  Search,
  TriangleAlert,
  UserPlus,
  Users,
} from "lucide-vue-next";
definePageMeta({ layout: "management", middleware: "admin" });
const route = useRoute();
const router = useRouter();
const store = useAdminUsersStore();
const auth = useAuthStore();
const toast = useToastStore();
const form = reactive({
  search: String(route.query.search || ""),
  role: String(route.query.role || ""),
  provider: String(route.query.provider || ""),
  sort: String(route.query.sort || "newest"),
  page: Math.max(1, Number(route.query.page) || 1),
  limit: 20,
});
const openMenu = ref(null);
const roleTarget = ref(null);
const rolePending = ref(false);
let timer;
const initialLoading = computed(() => store.loading && !store.summary);
const rangeStart = computed(() => (form.page - 1) * form.limit + 1);
const rangeEnd = computed(() => Math.min(form.page * form.limit, store.pagination?.total || 0));
const number = (v) => new Intl.NumberFormat().format(v || 0);
const date = (v) => new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(v));
const roleLabel = (v) => (v === "admin" ? "Administrator" : "Developer");
const providerLabel = (v) => (v === "github" ? "GitHub" : "Email");
const query = () =>
  Object.fromEntries(
    Object.entries(form).filter(([k, v]) => k !== "limit" && v !== "" && (k !== "page" || v !== 1)),
  );
async function load() {
  await router.replace({ query: query() });
  try {
    await store.fetchUsers(form);
  } catch {}
}
function page(value) {
  form.page = value;
  load();
}
function editRole(user) {
  openMenu.value = null;
  roleTarget.value = user;
}
async function changeRole(role) {
  rolePending.value = true;
  try {
    await store.changeRole(roleTarget.value.id, role);
    toast.success("User role updated.");
    roleTarget.value = null;
    await store.fetchUsers(form);
  } catch (err) {
    toast.error(err?.data?.message || "Failed to update user.");
  } finally {
    rolePending.value = false;
  }
}
watch(
  () => [form.role, form.provider, form.sort],
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
.users-page {
  max-width: 1500px;
  margin: auto;
}
.users-page > header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 24px;
}
.users-page > header p {
  margin: 0 0 5px;
  color: #adc6ff;
  font:
    600 9px "JetBrains Mono",
    monospace;
  letter-spacing: 0.14em;
}
.users-page h1 {
  margin: 0 0 6px;
  font-size: 30px;
}
.users-page > header span {
  color: #8d93a3;
  font-size: 13px;
}
.users-page > header button,
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
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 12px;
  margin-bottom: 18px;
}
.metrics article {
  min-height: 86px;
  display: flex;
  align-items: center;
  gap: 13px;
  padding: 16px;
  border: 1px solid rgba(65, 71, 85, 0.55);
  border-radius: 12px;
  background: #141821;
}
.metrics article > svg {
  color: #adc6ff;
}
.metrics span,
.metrics strong,
.metrics small {
  display: block;
}
.metrics span {
  color: #858b9b;
  font-size: 10px;
}
.metrics strong {
  margin-top: 5px;
  color: #e0e2ed;
  font-size: 23px;
}
.metrics small {
  margin-top: 2px;
  color: #656c7c;
  font-size: 8px;
}
.skeletons i,
.table-skeleton i {
  display: block;
  border-radius: 10px;
  background: linear-gradient(90deg, #141821, #202531, #141821);
  background-size: 200%;
  animation: shimmer 1.2s infinite;
}
.skeletons i {
  height: 86px;
}
.panel {
  border: 1px solid rgba(65, 71, 85, 0.55);
  border-radius: 14px;
  background: #0d1018;
}
.tools {
  display: grid;
  grid-template-columns: minmax(260px, 1fr) repeat(3, 155px);
  gap: 10px;
  padding: 14px;
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
.table-wrap {
  position: relative;
  transition: opacity 0.15s;
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
  padding: 12px 13px;
  border-top: 1px solid rgba(65, 71, 85, 0.35);
  color: #aeb4c5;
  font-size: 11px;
}
tbody tr:hover {
  background: rgba(28, 32, 40, 0.55);
}
.identity {
  display: flex;
  align-items: center;
  gap: 10px;
  min-width: 210px;
}
.identity span {
  min-width: 0;
}
.identity strong,
.identity small {
  display: block;
  max-width: 230px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.identity strong {
  color: #e0e2ed;
  font-size: 12px;
}
.identity small {
  margin-top: 3px;
  color: #777e8e;
  font-size: 9px;
}
.badge {
  display: inline-block;
  padding: 4px 7px;
  border: 1px solid #414755;
  border-radius: 999px;
  font:
    600 8px "JetBrains Mono",
    monospace;
}
.badge--admin {
  border-color: rgba(173, 198, 255, 0.28);
  color: #adc6ff;
  background: rgba(75, 142, 255, 0.1);
}
.badge--user {
  color: #aeb4c5;
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
  top: 45px;
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
.menu button:disabled {
  opacity: 0.4;
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
.pagination svg {
  width: 15px;
}
.pagination button:disabled {
  opacity: 0.35;
}
.state {
  display: grid;
  justify-items: center;
  padding: 65px 20px;
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
.table-skeleton {
  display: grid;
  gap: 8px;
  padding: 14px;
}
.table-skeleton i {
  height: 54px;
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
@media (max-width: 1150px) {
  .tools {
    grid-template-columns: 1fr repeat(3, 135px);
  }
  th:nth-child(5),
  td:nth-child(5),
  th:nth-child(6),
  td:nth-child(6) {
    display: none;
  }
}
@media (max-width: 760px) {
  .users-page > header {
    align-items: flex-start;
  }
  .users-page > header span {
    display: block;
    max-width: 260px;
  }
  .metrics {
    grid-template-columns: 1fr;
  }
  .tools {
    grid-template-columns: 1fr 1fr;
  }
  .search {
    grid-column: 1/-1;
  }
  .tools select:last-child {
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
  .mobile-list > a {
  }
  .mobile-list article > a {
    display: grid;
    grid-template-columns: 44px minmax(0, 1fr) 20px;
    gap: 10px;
    align-items: center;
  }
  .mobile-list strong,
  .mobile-list small {
    display: block;
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
  }
  .mobile-list strong {
    font-size: 12px;
  }
  .mobile-list small {
    margin-top: 3px;
    color: #777e8e;
    font-size: 9px;
  }
  .mobile-list footer {
    display: flex;
    gap: 10px;
    align-items: center;
    margin: 10px 0 0 54px;
    color: #777e8e;
    font-size: 9px;
  }
  .pagination {
    align-items: flex-start;
    gap: 12px;
    flex-direction: column;
  }
  .users-page > header button {
    padding: 8px;
  }
  .users-page > header button svg {
    margin: 0;
  }
  .users-page > header button {
    font-size: 0;
  }
}
</style>
