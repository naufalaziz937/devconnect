<template>
  <div class="detail-page">
    <NuxtLink to="/user" class="back"><ArrowLeft :size="16" />Back to users</NuxtLink>
    <div v-if="store.detailLoading" class="loading"><i /><i /><i /></div>
    <section v-else-if="store.error && !user" class="state"
      ><TriangleAlert /><h1>Unable to load user.</h1><p>{{ store.error }}</p
      ><button @click="load">Try Again</button></section
    >
    <template v-else-if="user">
      <header class="profile"
        ><UserAvatar
          :user="{
            username: user.username,
            display_name: user.displayName,
            avatar_url: user.avatar,
          }"
          :size="76"
        /><div class="profile-copy"
          ><p>ADMIN USER DETAIL</p><h1>{{ user.displayName || user.username }}</h1
          ><span>@{{ user.username }} · {{ user.email || "No email provided" }}</span
          ><div
            ><b :class="['badge', `badge--${user.role}`]">{{ roleLabel(user.role) }}</b
            ><b>{{ providerLabel(user.provider) }}</b
            ><b>{{ user.verified ? "Verified" : "Unverified" }}</b></div
          ><small>Joined {{ date(user.createdAt) }}</small></div
        ><div class="header-actions"
          ><NuxtLink :to="`/developers/${user.id}`">View Profile</NuxtLink
          ><button
            :disabled="isSelf"
            :title="isSelf ? 'You cannot change your own administrator role.' : ''"
            @click="roleOpen = true"
            >Change Role</button
          ></div
        ></header
      >
      <p v-if="isSelf" class="self-notice"
        >Role changes are disabled for your own administrator account to prevent lockout.</p
      >
      <section class="stats"
        ><article v-for="item in stats" :key="item.label"
          ><span>{{ item.label }}</span
          ><strong>{{ number(item.value) }}</strong></article
        ></section
      >
      <div class="columns"
        ><section class="panel"
          ><header><h2>Account information</h2></header
          ><dl
            ><div
              ><dt>Account ID</dt><dd>{{ user.id }}</dd></div
            ><div
              ><dt>Email</dt><dd>{{ user.email || "Not provided" }}</dd></div
            ><div
              ><dt>Authentication</dt><dd>{{ providerLabel(user.provider) }}</dd></div
            ><div
              ><dt>GitHub username</dt
              ><dd>{{ user.githubUsername ? `@${user.githubUsername}` : "Not linked" }}</dd></div
            ><div
              ><dt>Location</dt><dd>{{ user.location || "Not provided" }}</dd></div
            ><div
              ><dt>Favorite tech</dt><dd>{{ user.favoriteTech || "Not provided" }}</dd></div
            ></dl
          ></section
        >
        <section class="panel"
          ><header><h2>Recent Activity</h2></header
          ><div v-if="!user.activity.length" class="empty">No recent activity.</div
          ><ul v-else
            ><li
              v-for="item in user.activity"
              :key="`${item.type}-${item.targetId}-${item.createdAt}`"
              ><span
                ><FileText v-if="item.type === 'devlog.created'" /><FolderKanban
                  v-else-if="item.type === 'project.created'" /><MessageSquare v-else /></span
              ><div
                ><strong>{{ activityLabel(item.type) }}</strong
                ><p>{{ item.title || "Untitled activity" }}</p
                ><small>{{ dateTime(item.createdAt) }}</small></div
              ></li
            ></ul
          ></section
        ></div
      >
    </template>
    <AdminRoleDialog
      v-if="roleOpen && user"
      :user="user"
      :pending="rolePending"
      :is-self="isSelf"
      @close="roleOpen = false"
      @confirm="changeRole"
    />
  </div>
</template>
<script setup>
import { ArrowLeft, FileText, FolderKanban, MessageSquare, TriangleAlert } from "lucide-vue-next";
definePageMeta({ layout: "management", middleware: "admin" });
const route = useRoute();
const store = useAdminUsersStore();
const auth = useAuthStore();
const toast = useToastStore();
const roleOpen = ref(false);
const rolePending = ref(false);
const user = computed(() => store.selected);
const isSelf = computed(() => user.value?.id === auth.user?.uuid);
const stats = computed(() =>
  user.value
    ? [
        { label: "Posts", value: user.value.stats.posts },
        { label: "Projects", value: user.value.stats.projects },
        { label: "Comments", value: user.value.stats.comments },
        { label: "Followers", value: user.value.stats.followers },
        { label: "Following", value: user.value.stats.following },
        { label: "Likes Received", value: user.value.stats.likesReceived },
      ]
    : [],
);
const number = (v) => new Intl.NumberFormat().format(v || 0);
const date = (v) => new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(v));
const dateTime = (v) =>
  new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(
    new Date(v),
  );
const roleLabel = (v) => (v === "admin" ? "Administrator" : "Developer");
const providerLabel = (v) => (v === "github" ? "GitHub" : "Email");
const activityLabel = (v) =>
  ({
    "devlog.created": "Created a DevLog",
    "project.created": "Created a project",
    "comment.created": "Commented on a DevLog",
  })[v] || "Account activity";
async function load() {
  try {
    await store.fetchUser(String(route.params.id));
  } catch {}
}
async function changeRole(role) {
  rolePending.value = true;
  try {
    await store.changeRole(user.value.id, role);
    toast.success("User role updated.");
    roleOpen.value = false;
  } catch (err) {
    toast.error(err?.data?.message || "Failed to update user.");
  } finally {
    rolePending.value = false;
  }
}
await load();
</script>
<style scoped>
.detail-page {
  max-width: 1280px;
  margin: auto;
}
.back {
  display: inline-flex;
  align-items: center;
  gap: 7px;
  margin-bottom: 20px;
  color: #9da3b4;
  font-size: 11px;
}
.profile {
  display: grid;
  grid-template-columns: 76px minmax(0, 1fr) auto;
  gap: 18px;
  align-items: center;
  padding: 22px;
  border: 1px solid rgba(65, 71, 85, 0.55);
  border-radius: 14px;
  background: #141821;
}
.profile-copy > p {
  margin: 0 0 5px;
  color: #adc6ff;
  font:
    600 8px "JetBrains Mono",
    monospace;
  letter-spacing: 0.13em;
}
.profile h1 {
  margin: 0 0 4px;
  font-size: 27px;
}
.profile-copy > span {
  color: #9198a8;
  font-size: 12px;
}
.profile-copy > div {
  display: flex;
  gap: 7px;
  margin-top: 10px;
}
.profile-copy b {
  padding: 4px 7px;
  border: 1px solid #414755;
  border-radius: 999px;
  color: #aeb4c5;
  font:
    600 8px "JetBrains Mono",
    monospace;
}
.profile-copy .badge--admin {
  color: #adc6ff;
  border-color: rgba(173, 198, 255, 0.3);
  background: rgba(75, 142, 255, 0.1);
}
.profile-copy > small {
  display: block;
  margin-top: 9px;
  color: #6f7584;
  font-size: 9px;
}
.header-actions {
  display: flex;
  gap: 8px;
}
.header-actions a,
.header-actions button,
.state button {
  padding: 9px 12px;
  border: 1px solid #414755;
  border-radius: 8px;
  color: #c7cbd6;
  font-size: 10px;
}
.header-actions button {
  color: #07152a;
  background: #adc6ff;
}
.header-actions button:disabled {
  opacity: 0.38;
}
.self-notice {
  margin: 12px 0 0;
  padding: 10px 12px;
  border: 1px solid rgba(255, 179, 71, 0.2);
  border-radius: 9px;
  color: #ffd18a;
  background: rgba(255, 179, 71, 0.07);
  font-size: 11px;
}
.stats {
  display: grid;
  grid-template-columns: repeat(6, 1fr);
  gap: 10px;
  margin: 16px 0;
}
.stats article {
  padding: 14px;
  border: 1px solid rgba(65, 71, 85, 0.48);
  border-radius: 11px;
  background: #0d1018;
}
.stats span,
.stats strong {
  display: block;
}
.stats span {
  color: #7e8595;
  font-size: 9px;
}
.stats strong {
  margin-top: 6px;
  font-size: 20px;
}
.columns {
  display: grid;
  grid-template-columns: minmax(0, 0.9fr) minmax(0, 1.1fr);
  gap: 14px;
}
.panel {
  border: 1px solid rgba(65, 71, 85, 0.5);
  border-radius: 13px;
  background: #0d1018;
}
.panel > header {
  padding: 14px 16px;
  border-bottom: 1px solid rgba(65, 71, 85, 0.4);
}
.panel h2 {
  margin: 0;
  font-size: 14px;
}
.panel dl {
  margin: 0;
}
.panel dl > div {
  display: grid;
  grid-template-columns: 130px minmax(0, 1fr);
  gap: 12px;
  padding: 12px 16px;
  border-top: 1px solid rgba(65, 71, 85, 0.25);
}
.panel dl > div:first-child {
  border-top: 0;
}
.panel dt {
  color: #737a8a;
  font-size: 10px;
}
.panel dd {
  min-width: 0;
  margin: 0;
  overflow-wrap: anywhere;
  color: #c7cbd6;
  font-size: 11px;
}
.panel ul {
  margin: 0;
  padding: 0;
  list-style: none;
}
.panel li {
  display: grid;
  grid-template-columns: 32px 1fr;
  gap: 10px;
  padding: 12px 16px;
  border-top: 1px solid rgba(65, 71, 85, 0.25);
}
.panel li:first-child {
  border-top: 0;
}
.panel li > span {
  width: 30px;
  height: 30px;
  display: grid;
  place-items: center;
  border-radius: 8px;
  color: #adc6ff;
  background: #1c2028;
}
.panel li svg {
  width: 15px;
}
.panel li strong {
  font-size: 11px;
}
.panel li p {
  margin: 3px 0;
  color: #8f96a5;
  font-size: 10px;
}
.panel li small {
  color: #656c7c;
  font-size: 8px;
}
.empty {
  padding: 35px;
  text-align: center;
  color: #747b8b;
  font-size: 11px;
}
.loading {
  display: grid;
  gap: 12px;
}
.loading i {
  height: 100px;
  border-radius: 12px;
  background: linear-gradient(90deg, #141821, #202531, #141821);
  background-size: 200%;
  animation: shimmer 1.2s infinite;
}
.state {
  display: grid;
  justify-items: center;
  padding: 90px 20px;
  text-align: center;
}
.state h1 {
  margin: 12px 0 5px;
}
.state p {
  color: #858b9b;
}
@keyframes shimmer {
  to {
    background-position: -200%;
  }
}
@media (max-width: 1050px) {
  .stats {
    grid-template-columns: repeat(3, 1fr);
  }
}
@media (max-width: 760px) {
  .profile {
    grid-template-columns: 64px 1fr;
    padding: 16px;
  }
  .profile :deep(.user-avatar) {
    --avatar-size: 64px !important;
  }
  .header-actions {
    grid-column: 1/-1;
  }
  .header-actions a,
  .header-actions button {
    flex: 1;
    text-align: center;
  }
  .stats {
    grid-template-columns: repeat(2, 1fr);
  }
  .columns {
    grid-template-columns: 1fr;
  }
  .profile h1 {
    font-size: 21px;
  }
  .profile-copy > span {
    display: block;
    overflow-wrap: anywhere;
  }
  .panel dl > div {
    grid-template-columns: 105px 1fr;
  }
}
</style>
