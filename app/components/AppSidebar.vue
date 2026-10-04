<template>
  <button
    v-if="adminContext"
    class="drawer-toggle"
    type="button"
    aria-label="Open navigation"
    :aria-expanded="drawerOpen"
    @click="drawerOpen = true"
    ><Menu
  /></button>
  <div
    v-if="adminContext && drawerOpen"
    class="backdrop"
    aria-hidden="true"
    @click="drawerOpen = false"
  />
  <aside
    class="sidebar"
    :class="{ 'sidebar--admin': adminContext, 'drawer-open': drawerOpen }"
    :aria-label="adminContext ? 'Admin navigation' : 'Application navigation'"
  >
    <button
      v-if="adminContext"
      class="drawer-close"
      type="button"
      aria-label="Close navigation"
      @click="drawerOpen = false"
      ><X
    /></button>
    <NuxtLink :to="defaultRoute" class="brand" @click="drawerOpen = false"
      ><span><img src="/DC-logo-v2.png" alt="" /></span
      ><strong>DEVCONNECT<small v-if="adminContext">ADMINISTRATION</small></strong></NuxtLink
    >
    <nav class="nav">
      <template v-for="item in menu" :key="item.name">
        <p v-if="item.type === 'divider'" class="divider">{{ item.label }}</p>
        <NuxtLink
          v-else
          :to="item.path"
          class="nav-item"
          :class="{ active: activeName === item.name }"
          :aria-current="activeName === item.name ? 'page' : undefined"
          @click="drawerOpen = false"
        >
          <span class="icon"
            ><component
              :is="icons[item.icon]"
              :size="adminContext ? 18 : 23"
              :stroke-width="1.8"
            /><i
              v-if="!adminContext && item.name === 'notifications' && notifications.unreadCount"
              class="badge"
              >{{ badge }}</i
            ></span
          ><span class="label">{{ item.label }}</span>
        </NuxtLink>
      </template>
      <button
        v-if="!adminContext && canCreate"
        class="nav-item create"
        type="button"
        @click="composer.openComposer"
        ><span class="icon"><Plus :size="23" /></span><span class="label">Create</span></button
      >
    </nav>
    <div class="footer">
      <NuxtLink v-if="!adminContext" to="/profile" class="nav-item"
        ><span class="icon"><UserAvatar :user="auth.user || {}" :size="34" /></span
        ><span class="label identity"
          ><strong>{{ profileName }}</strong
          ><small>@{{ auth.user?.username || "developer" }}</small></span
        ></NuxtLink
      >
      <div v-else class="admin-identity"
        ><UserAvatar :user="auth.user || {}" :size="38" /><span
          ><strong>{{ profileName }}</strong
          ><small>@{{ auth.user?.username }} · {{ roleLabel }}</small></span
        ></div
      >
      <button class="nav-item" type="button" @click="signOut"
        ><span class="icon"><LogOut :size="adminContext ? 18 : 23" /></span
        ><span class="label">Log out</span></button
      >
    </div>
  </aside>
  <nav v-if="!adminContext" class="mobile-nav" aria-label="Mobile navigation"
    ><NuxtLink v-for="item in mobileMenu.slice(0, 2)" :key="item.name" :to="item.path"
      ><component :is="icons[item.icon]" :size="22" /><span>{{ item.label }}</span></NuxtLink
    ><button @click="composer.openComposer"><Plus :size="22" /><span>Create</span></button
    ><NuxtLink v-for="item in mobileMenu.slice(2)" :key="item.name" :to="item.path"
      ><component :is="icons[item.icon]" :size="22" /><span>{{ item.label }}</span
      ><i
        v-if="item.name === 'notifications' && notifications.unreadCount"
        class="mobile-badge" /></NuxtLink
  ></nav>
</template>
<script setup>
import {
  Bell,
  Compass,
  Files,
  Flag,
  FolderKanban,
  House,
  Layers3,
  LayoutDashboard,
  LogOut,
  Megaphone,
  Menu,
  Plus,
  Rss,
  ScrollText,
  Settings,
  ShieldCheck,
  UserRound,
  UsersRound,
  X,
} from "lucide-vue-next";
import {
  ROLES,
  activeMenuForPath,
  canAccessPage,
  getDefaultRoute,
  getMenuByRole,
  getRoleLabel,
} from "~/utils/roles";
const icons = {
  Bell,
  Compass,
  Files,
  Flag,
  FolderKanban,
  House,
  Layers3,
  LayoutDashboard,
  Megaphone,
  Rss,
  ScrollText,
  Settings,
  ShieldCheck,
  UserRound,
  Users: UsersRound,
};
const auth = useAuthStore();
const route = useRoute();
const notifications = useNotificationsStore();
const composer = useComposerStore();
const drawerOpen = ref(false);
const adminContext = computed(() => auth.user?.role === ROLES.ADMIN);
const menu = computed(() => getMenuByRole(auth.user?.role));
const activeName = computed(() => activeMenuForPath(route.path, auth.user?.role));
const canCreate = computed(() => canAccessPage(auth.user?.role, "post.create"));
const defaultRoute = computed(() => getDefaultRoute(auth.user?.role));
const profileName = computed(() => auth.user?.display_name || auth.user?.username || "Profile");
const roleLabel = computed(() => getRoleLabel(auth.user?.role));
const badge = computed(() => (notifications.unreadCount > 99 ? "99+" : notifications.unreadCount));
const mobileMenu = computed(() =>
  menu.value.filter((i) => ["feed", "explore", "notifications", "profile"].includes(i.name)),
);
watch(
  () => route.path,
  () => {
    drawerOpen.value = false;
  },
);
if (auth.token && auth.user?.role !== ROLES.ADMIN && !notifications.unreadCount)
  notifications.fetchUnreadCount();
async function signOut() {
  await auth.logout();
  await navigateTo("/login");
}
</script>
<style scoped>
.sidebar {
  position: fixed;
  inset: 0 auto 0 0;
  z-index: 60;
  width: var(--sidebar-width);
  height: 100dvh;
  padding: 20px 13px;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  color: #c1c6d7;
  background: #0d1018;
  border-right: 1px solid rgba(65, 71, 85, 0.45);
  transition:
    width 0.21s ease,
    box-shadow 0.21s ease;
}
.sidebar:not(.sidebar--admin):hover,
.sidebar:not(.sidebar--admin):focus-within {
  width: 260px;
  box-shadow: 18px 0 42px rgba(0, 0, 0, 0.42);
}
.brand {
  width: 100%;
  min-width: 0;
  height: 48px;
  display: grid;
  grid-template-columns: 48px minmax(0, 1fr);
  align-items: center;
  flex: 0 0 auto;
  margin-bottom: 20px;
  color: #adc6ff;
}
.brand > span {
  width: 48px;
  display: grid;
  place-items: center;
}
.brand img {
  width: 34px;
  height: 34px;
}
.brand > strong {
  min-width: 0;
  padding-left: 12px;
  overflow: hidden;
  font:
    800 16px Orbitron,
    Geist,
    sans-serif;
  letter-spacing: 0.08em;
  white-space: nowrap;
  opacity: 0;
}
.brand small {
  display: block;
  margin-top: 4px;
  color: #858b9b;
  font:
    600 8px "JetBrains Mono",
    monospace;
  letter-spacing: 0.16em;
}
.nav {
  width: 100%;
  min-width: 0;
  min-height: 0;
  display: grid;
  align-content: start;
  gap: 5px;
  flex: 1 1 auto;
  overflow-x: hidden;
  overflow-y: auto;
  scrollbar-width: thin;
  scrollbar-color: #414755 transparent;
}
.nav::-webkit-scrollbar {
  width: 5px;
  height: 0;
}
.nav::-webkit-scrollbar-track {
  background: transparent;
}
.nav::-webkit-scrollbar-thumb {
  border-radius: 999px;
  background: #414755;
}
.nav::-webkit-scrollbar-thumb:hover {
  background: #5b6272;
}
.nav::-webkit-scrollbar-button {
  display: none;
  width: 0;
  height: 0;
}
.divider {
  padding: 11px 12px 3px;
  color: #6f7584;
  font:
    600 8px "JetBrains Mono",
    monospace;
  letter-spacing: 0.14em;
  text-transform: uppercase;
  opacity: 0;
}
.nav-item {
  width: 100%;
  min-width: 0;
  min-height: 44px;
  display: grid;
  grid-template-columns: 48px minmax(0, 1fr);
  align-items: center;
  padding: 0;
  border: 1px solid transparent;
  border-radius: 10px;
  color: #aeb4c5;
  text-align: left;
}
.nav-item:hover {
  color: #e0e2ed;
  background: #1c2028;
  border-color: #414755;
}
.nav-item:focus-visible {
  outline: 2px solid #adc6ff;
  outline-offset: 2px;
}
.nav-item.active {
  color: #adc6ff;
  background: rgba(75, 142, 255, 0.12);
  border-color: rgba(173, 198, 255, 0.2);
}
.icon {
  position: relative;
  width: 48px;
  height: 44px;
  display: grid;
  place-items: center;
}
.label {
  min-width: 0;
  padding-left: 10px;
  overflow: hidden;
  text-overflow: ellipsis;
  color: inherit;
  font:
    500 12px "JetBrains Mono",
    monospace;
  white-space: nowrap;
  opacity: 0;
}
.sidebar:not(.sidebar--admin):hover .label,
.sidebar:not(.sidebar--admin):hover .divider,
.sidebar:not(.sidebar--admin):hover .brand > strong,
.sidebar:not(.sidebar--admin):focus-within .label,
.sidebar:not(.sidebar--admin):focus-within .divider,
.sidebar:not(.sidebar--admin):focus-within .brand > strong {
  opacity: 1;
}
.create {
  color: #07152a;
  background: #adc6ff;
}
.footer {
  width: 100%;
  min-width: 0;
  flex: 0 0 auto;
  padding-top: 8px;
  overflow-x: hidden;
}
.badge {
  position: absolute;
  right: 4px;
  top: 3px;
  min-width: 17px;
  height: 17px;
  padding: 0 3px;
  display: grid;
  place-items: center;
  border: 2px solid #0d1018;
  border-radius: 9px;
  color: #fff;
  background: #ff453a;
  font: 700 8px Geist;
}
.identity strong,
.identity small {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
}
.identity small {
  color: #858b9b;
  font-size: 9px;
}
.mobile-nav,
.drawer-toggle,
.drawer-close,
.backdrop {
  display: none;
}
.sidebar--admin {
  z-index: 90;
  width: 264px;
  padding: 20px 15px;
  background: #0a0a0b;
}
.sidebar--admin .brand > strong,
.sidebar--admin .label,
.sidebar--admin .divider {
  opacity: 1;
}
.sidebar--admin .nav-item {
  min-height: 38px;
  grid-template-columns: 38px 1fr;
  border-radius: 8px;
}
.sidebar--admin .icon {
  width: 38px;
  height: 38px;
}
.sidebar--admin .label {
  padding-left: 7px;
  font-family: Geist, sans-serif;
}
.admin-identity {
  display: flex;
  gap: 10px;
  align-items: center;
  margin: 10px 7px;
  padding: 10px 0;
  border-top: 1px solid #2c2c2e;
}
.admin-identity span {
  min-width: 0;
}
.admin-identity strong,
.admin-identity small {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.admin-identity strong {
  font-size: 12px;
}
.admin-identity small {
  margin-top: 3px;
  color: #858b9b;
  font:
    9px "JetBrains Mono",
    monospace;
}
@media (max-width: 900px) {
  .sidebar--admin {
    transform: translateX(-100%);
    transition: transform 0.2s;
  }
  .sidebar--admin.drawer-open {
    transform: none;
  }
  .drawer-toggle {
    display: grid;
    place-items: center;
    position: fixed;
    z-index: 80;
    top: 16px;
    left: 16px;
    width: 40px;
    height: 40px;
    border: 1px solid #414755;
    border-radius: 9px;
    color: #e0e2ed;
    background: #1c2028;
  }
  .drawer-close {
    display: grid;
    place-items: center;
    position: absolute;
    right: 10px;
    top: 10px;
    width: 34px;
    height: 34px;
  }
  .backdrop {
    display: block;
    position: fixed;
    z-index: 85;
    inset: 0;
    background: rgba(0, 0, 0, 0.62);
  }
}
@media (max-width: 760px) {
  .sidebar:not(.sidebar--admin) {
    display: none;
  }
  .mobile-nav {
    position: fixed;
    z-index: 70;
    left: 0;
    right: 0;
    bottom: 0;
    height: 66px;
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    padding: 6px 8px calc(6px + env(safe-area-inset-bottom));
    background: rgba(10, 10, 11, 0.96);
    border-top: 1px solid rgba(65, 71, 85, 0.45);
  }
  .mobile-nav a,
  .mobile-nav button {
    position: relative;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 3px;
    color: #9da3b4;
    font:
      500 9px "JetBrains Mono",
      monospace;
  }
  .mobile-nav a.router-link-active {
    color: #adc6ff;
  }
  .mobile-nav button {
    color: #adc6ff;
  }
  .mobile-badge {
    position: absolute;
    top: 3px;
    left: calc(50% + 6px);
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: #ff453a;
  }
}
</style>
