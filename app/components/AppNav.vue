<template>
  <AppSidebar />
  <header class="stitch-topbar">
    <NuxtLink to="/explore" class="stitch-search"
      ><Search :size="20" /><span>Search for stacks, developers or projects...</span></NuxtLink
    >
    <NuxtLink
      v-if="auth.token"
      to="/notifications"
      class="stitch-topbar__icon"
      aria-label="Notifications"
      ><Bell :size="20" /><i v-if="notifications.unreadCount"
    /></NuxtLink>
    <NuxtLink :to="auth.token ? '/profile' : '/login'"
      ><UserAvatar :user="auth.user || {}" :size="38"
    /></NuxtLink>
  </header>
</template>
<script setup>
import { Bell, Search } from "lucide-vue-next";
const auth = useAuthStore();
const notifications = useNotificationsStore();
if (auth.token) notifications.fetchUnreadCount();
</script>
<style scoped>
.stitch-topbar {
  position: fixed;
  z-index: 40;
  left: var(--sidebar-width);
  right: 0;
  top: 0;
  height: 110px;
  padding: 28px 32px;
  display: flex;
  align-items: center;
  gap: 18px;
  background: rgba(10, 14, 24, 0.82);
  border-bottom: 1px solid rgba(65, 71, 85, 0.16);
  backdrop-filter: blur(18px);
}
.stitch-search {
  display: flex;
  align-items: center;
  gap: 13px;
  width: min(514px, calc(100% - 100px));
  padding: 12px 17px;
  border: 1px solid rgba(65, 71, 85, 0.48);
  border-radius: 999px;
  color: #8b90a0;
  background: rgba(28, 32, 40, 0.62);
  font-size: 14px;
}
.stitch-topbar__icon {
  position: relative;
  margin-left: auto;
  color: #c1c6d7;
}
.stitch-topbar__icon i {
  position: absolute;
  right: -1px;
  top: -1px;
  width: 7px;
  height: 7px;
  border-radius: 50%;
  background: #ff453a;
}
.stitch-avatar {
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  border: 1px solid rgba(173, 198, 255, 0.42);
  border-radius: 50%;
  color: #adc6ff;
  background: #1c2028;
  font:
    500 11px "JetBrains Mono",
    monospace;
}
@media (max-width: 900px) {
  .stitch-topbar {
    left: 0;
    height: 72px;
    padding: 15px 16px 15px 68px;
  }
  .stitch-search {
    width: 100%;
  }
  .stitch-search span {
    white-space: nowrap;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .stitch-topbar__icon,
  .stitch-avatar {
    display: none;
  }
}
</style>
