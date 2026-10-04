<template>
  <div class="notification-shell"
    ><AppSidebar /><main class="notification-main"
      ><header
        ><div><span>ACTIVITY / INBOX</span><h1>Notifications</h1></div
        ><button v-if="store.unreadCount" @click="markAll">Mark all read</button></header
      ><div v-if="store.loading && !store.items.length" class="notification-list"
        ><NotificationSkeleton v-for="n in 5" :key="n" /></div
      ><StateMessage v-else-if="store.error" :message="store.error" /><StateMessage
        v-else-if="!store.items.length"
        message="No notifications yet."
      /><section v-else class="notification-list"
        ><article
          v-for="item in store.items"
          :key="item.id"
          :class="{ unread: !item.is_read }"
          @click="open(item)"
          ><UserAvatar :user="actor(item)" :size="44" /><div
            ><p
              ><strong>{{ actorName(item) }}</strong> {{ item.message }}</p
            ><blockquote v-if="item.metadata?.preview">“{{ item.metadata.preview }}”</blockquote
            ><time>{{ relative(item.created_at) }}</time></div
          ><button aria-label="Delete notification" @click.stop="remove(item.id)"
            ><X :size="16" /></button></article></section
      ><nav v-if="store.pagination?.pages > 1"
        ><button :disabled="store.pagination.page <= 1" @click="load(store.pagination.page - 1)"
          >Previous</button
        ><span>Page {{ store.pagination.page }} of {{ store.pagination.pages }}</span
        ><button
          :disabled="store.pagination.page >= store.pagination.pages"
          @click="load(store.pagination.page + 1)"
          >Next</button
        ></nav
      ></main
    ><AppRightSidebar><DevDiscoveryModules :news-limit="3" :trends-limit="4" /></AppRightSidebar
  ></div>
</template>
<script setup>
import { X } from "lucide-vue-next";
definePageMeta({ middleware: "auth" });
const store = useNotificationsStore();
const toast = useToastStore();
const actor = (item) => ({
  uuid: item.actor_uuid,
  username: item.actor_username,
  display_name: item.actor_display_name,
  avatar_url: item.actor_avatar_url,
});
const actorName = (item) => item.actor_display_name || item.actor_username || "A developer";
function relative(value) {
  const seconds = Math.max(1, Math.floor((Date.now() - new Date(value).getTime()) / 1000));
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  return `${Math.floor(seconds / 86400)}d`;
}
async function load(page = 1) {
  await Promise.all([store.fetchPage(page), store.fetchUnreadCount()]);
}
async function open(item) {
  if (!item.is_read) await store.markRead(item.id);
  if (item.metadata?.devlogId && item.metadata.devlogId !== "profile")
    await navigateTo(
      `/devlogs/${item.metadata.devlogId}${item.metadata.commentId ? `#comment-${item.metadata.commentId}` : ""}`,
    );
  else if (item.actor_uuid) await navigateTo(`/developers/${item.actor_uuid}`);
}
async function markAll() {
  await store.markAllRead();
}
async function remove(id) {
  try {
    await store.remove(id);
    toast.success("Notification deleted.");
  } catch {
    toast.error("Failed to delete notification.");
  }
}
await load();
</script>
<style scoped>
.notification-shell {
  min-height: 100vh;
  padding-left: var(--sidebar-width);
  display: grid;
  grid-template-columns: minmax(560px, 760px) minmax(280px, 340px);
  justify-content: center;
  gap: 28px;
  color: #e0e2ed;
}
.notification-main {
  min-width: 0;
  padding: 32px 0 80px;
}
.notification-main > header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0 20px 22px;
  border-bottom: 1px solid rgba(65, 71, 85, 0.35);
}
header span {
  color: #adc6ff;
  font:
    600 9px "JetBrains Mono",
    monospace;
  letter-spacing: 0.14em;
}
header h1 {
  margin-top: 4px;
  font-size: 30px;
}
header button {
  color: #adc6ff;
  font-size: 10px;
}
.notification-list {
  display: grid;
}
.notification-list article {
  position: relative;
  display: grid;
  grid-template-columns: 44px minmax(0, 1fr) 28px;
  gap: 12px;
  padding: 16px 20px;
  border-bottom: 1px solid rgba(65, 71, 85, 0.3);
  cursor: pointer;
}
.notification-list article.unread {
  background: rgba(75, 142, 255, 0.08);
}
.notification-list article.unread:before {
  content: "";
  position: absolute;
  left: 5px;
  top: 25px;
  width: 5px;
  height: 5px;
  border-radius: 50%;
  background: #4b8eff;
}
.notification-list p {
  line-height: 1.45;
}
.notification-list blockquote {
  margin-top: 7px;
  color: #aeb4c5;
  font-size: 12px;
}
.notification-list time {
  display: block;
  margin-top: 6px;
  color: #707687;
  font-size: 9px;
}
.notification-list article > button {
  color: #858b9b;
}
.notification-main > nav {
  display: flex;
  justify-content: center;
  gap: 16px;
  padding: 20px;
  color: #9298a8;
  font-size: 10px;
}
.notification-main > nav button {
  color: #adc6ff;
}
@media (max-width: 1080px) {
  .notification-shell {
    display: block;
  }
  .notification-main {
    width: min(760px, 100%);
    margin: auto;
  }
}
@media (max-width: 760px) {
  .notification-shell {
    padding-left: 0;
  }
  .notification-main {
    padding-top: 20px;
    padding-bottom: 90px;
  }
  .notification-list article {
    padding-inline: 14px;
  }
}
</style>
