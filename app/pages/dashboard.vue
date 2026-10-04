<template>
  <div class="dashboard">
    <header
      ><div
        ><p>ADMIN OVERVIEW</p><h1>Dashboard</h1
        ><span>Platform overview and moderation activity.</span></div
      ><button :disabled="admin.loading" @click="refresh"
        ><RefreshCw :class="{ spin: admin.loading }" :size="17" />Refresh</button
      ></header
    >
    <div v-if="admin.loading && !admin.dashboard" class="skeleton-grid"
      ><i v-for="n in 8" :key="n"
    /></div>
    <section v-else-if="admin.error && !admin.dashboard" class="error-state"
      ><TriangleAlert /><h2>Unable to load dashboard.</h2><p>{{ admin.error }}</p
      ><button @click="load">Try Again</button></section
    >
    <template v-else-if="d">
      <section class="metrics" aria-label="Platform metrics"
        ><article v-for="m in metrics" :key="m.label"
          ><component :is="m.icon" /><div
            ><span>{{ m.label }}</span
            ><strong>{{ number(m.value) }}</strong
            ><small v-if="m.growth !== undefined">+{{ number(m.growth) }} this week</small></div
          ></article
        ></section
      >
      <div class="two-col">
        <section class="panel"
          ><div class="panel-title"
            ><div><p>Last 7 days</p><h2>Platform Growth</h2></div></div
          ><div class="growth"
            ><div v-for="g in growth" :key="g.label"
              ><span>{{ g.label }}</span
              ><strong>+{{ number(g.value) }}</strong></div
            ></div
          ></section
        >
        <section class="panel"
          ><div class="panel-title"
            ><div><p>All time</p><h2>Content Overview</h2></div></div
          ><div class="bars"
            ><div v-for="b in content" :key="b.label"
              ><span
                >{{ b.label }} <b>{{ number(b.value) }}</b></span
              ><i><em :style="{ width: barWidth(b.value) }" /></i></div></div
        ></section>
      </div>
      <div class="two-col two-col--lists">
        <section class="panel"
          ><div class="panel-title"><h2>Recent Activity</h2></div
          ><div v-if="!d.activity.length" class="empty">No platform activity yet.</div
          ><ul class="activity"
            ><li v-for="a in d.activity" :key="`${a.type}-${a.target.id}-${a.createdAt}`"
              ><UserAvatar
                :user="{ username: a.actor.username, avatar_url: a.actor.avatar }"
                :size="34"
              /><div
                ><span
                  ><b>@{{ a.actor.username }}</b> {{ activityText(a) }}</span
                ><small>{{ date(a.createdAt) }}</small></div
              ></li
            ></ul
          ></section
        >
        <section class="panel"
          ><div class="panel-title"><h2>Recent Users</h2></div
          ><div v-if="!d.recentUsers.length" class="empty">No users yet.</div
          ><ul class="users"
            ><li v-for="u in d.recentUsers" :key="u.uuid"
              ><UserAvatar :user="u" :size="34" /><div
                ><strong>{{ u.display_name || u.username }}</strong
                ><small>@{{ u.username }} · {{ u.provider }} · {{ date(u.created_at) }}</small></div
              ><span>{{ u.role }}</span></li
            ></ul
          ></section
        >
      </div>
      <div class="two-col">
        <section class="panel moderation"
          ><div class="panel-title"><h2>Moderation Overview</h2></div
          ><ShieldCheck /><div
            ><strong>Moderation reporting is not configured yet.</strong
            ><span
              >Reports and review queues will appear here when the reporting system is
              implemented.</span
            ></div
          ></section
        >
        <section class="panel"
          ><div class="panel-title"><h2>Platform Status</h2></div
          ><ul class="status"
            ><li
              ><span>Database</span><b>{{ d.status.database }}</b></li
            ><li
              ><span>Dev News</span><b>{{ d.status.devNews }}</b></li
            ><li
              ><span>Cache</span><b>{{ d.status.cache }}</b></li
            ></ul
          ></section
        >
      </div>
    </template>
  </div>
</template>
<script setup>
import {
  RefreshCw,
  TriangleAlert,
  Users,
  FileText,
  FolderKanban,
  MessageSquare,
  ShieldCheck,
} from "lucide-vue-next";
definePageMeta({ layout: "management", middleware: "admin" });
const admin = useAdminStore();
const d = computed(() => admin.dashboard);
const metrics = computed(() => [
  {
    label: "Total Users",
    value: d.value.stats.users,
    growth: d.value.growth.newUsers7d,
    icon: Users,
  },
  {
    label: "DevLogs",
    value: d.value.stats.devlogs,
    growth: d.value.growth.newDevlogs7d,
    icon: FileText,
  },
  {
    label: "Projects",
    value: d.value.stats.projects,
    growth: d.value.growth.newProjects7d,
    icon: FolderKanban,
  },
  { label: "Comments", value: d.value.stats.comments, icon: MessageSquare },
]);
const growth = computed(() => [
  { label: "New users", value: d.value.growth.newUsers7d },
  { label: "New DevLogs", value: d.value.growth.newDevlogs7d },
  { label: "New projects", value: d.value.growth.newProjects7d },
]);
const content = computed(() => [
  { label: "DevLogs", value: d.value.stats.devlogs },
  { label: "Projects", value: d.value.stats.projects },
  { label: "Comments", value: d.value.stats.comments },
  { label: "Likes", value: d.value.stats.likes },
]);
const number = (v) => new Intl.NumberFormat().format(v || 0);
const date = (v) => new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(v));
const barWidth = (v) =>
  `${Math.max(3, (v / Math.max(...content.value.map((x) => x.value), 1)) * 100)}%`;
const activityText = (a) =>
  ({
    "user.joined": "joined DevConnect",
    "devlog.created": "created a DevLog",
    "project.created": `created project ${a.target.title || ""}`,
    "comment.created": "commented on a DevLog",
  })[a.type] || "performed an action";
async function load() {
  try {
    await admin.fetchDashboard();
  } catch {}
}
async function refresh() {
  try {
    await admin.refreshDashboard();
  } catch {}
}
await load();
</script>
<style scoped>
.dashboard {
  max-width: 1420px;
  margin: auto;
}
.dashboard header {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 20px;
  margin-bottom: 25px;
}
.dashboard header p,
.panel-title p {
  margin: 0 0 5px;
  color: #adc6ff;
  font:
    600 9px "JetBrains Mono",
    monospace;
  letter-spacing: 0.14em;
  text-transform: uppercase;
}
.dashboard h1 {
  margin: 0 0 6px;
  font:
    700 30px Geist,
    sans-serif;
}
.dashboard header span {
  color: #8d93a3;
  font-size: 13px;
}
.dashboard header button,
.error-state button {
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 9px 14px;
  border: 1px solid #414755;
  border-radius: 8px;
  color: #e0e2ed;
  background: #1c2028;
  font-weight: 600;
}
.metrics {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  margin-bottom: 14px;
}
.metrics article {
  display: flex;
  gap: 13px;
  align-items: flex-start;
  padding: 18px;
  border: 1px solid #2c2c2e;
  background: #141415;
}
.metrics article > svg {
  padding: 8px;
  width: 38px;
  height: 38px;
  border-radius: 8px;
  color: #adc6ff;
  background: rgba(75, 142, 255, 0.13);
}
.metrics span {
  display: block;
  color: #8e94a3;
  font-size: 11px;
}
.metrics strong {
  display: block;
  margin: 3px 0;
  font:
    700 25px "JetBrains Mono",
    monospace;
}
.metrics small {
  color: #34c759;
  font:
    10px "JetBrains Mono",
    monospace;
}
.two-col {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 14px;
  margin-bottom: 14px;
}
.two-col--lists {
  grid-template-columns: 1.2fr 1fr;
}
.panel {
  min-width: 0;
  padding: 19px;
  border: 1px solid #2c2c2e;
  background: #141415;
}
.panel-title {
  display: flex;
  justify-content: space-between;
  margin-bottom: 17px;
}
.panel h2 {
  margin: 0;
  font:
    650 16px Geist,
    sans-serif;
}
.growth {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 8px;
}
.growth div {
  padding: 13px;
  background: #1c1c1e;
}
.growth span,
.growth strong {
  display: block;
}
.growth span {
  color: #8e94a3;
  font-size: 10px;
}
.growth strong {
  margin-top: 7px;
  color: #adc6ff;
  font:
    700 21px "JetBrains Mono",
    monospace;
}
.bars {
  display: grid;
  gap: 10px;
}
.bars span {
  display: flex;
  justify-content: space-between;
  color: #aeb4c5;
  font-size: 11px;
}
.bars i {
  display: block;
  height: 5px;
  margin-top: 5px;
  background: #272a32;
}
.bars em {
  display: block;
  height: 100%;
  background: #4b8eff;
}
.activity,
.users,
.status {
  padding: 0;
  margin: 0;
  list-style: none;
}
.activity li,
.users li {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 10px 0;
  border-top: 1px solid #25262b;
}
.activity li:first-child,
.users li:first-child {
  border-top: 0;
}
.activity div,
.users div {
  min-width: 0;
}
.activity span,
.users strong {
  display: block;
  font-size: 11px;
}
.activity small,
.users small {
  display: block;
  margin-top: 4px;
  color: #787e8c;
  font:
    9px "JetBrains Mono",
    monospace;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.users li > span {
  margin-left: auto;
  padding: 3px 6px;
  color: #adc6ff;
  background: rgba(75, 142, 255, 0.12);
  font:
    9px "JetBrains Mono",
    monospace;
  text-transform: uppercase;
}
.empty {
  padding: 25px;
  color: #777d8c;
  text-align: center;
}
.moderation {
  display: flex;
  align-items: center;
  gap: 13px;
  flex-wrap: wrap;
}
.moderation .panel-title {
  width: 100%;
}
.moderation > svg {
  color: #ffd60a;
}
.moderation strong,
.moderation span {
  display: block;
}
.moderation strong {
  font-size: 12px;
}
.moderation span {
  max-width: 500px;
  margin-top: 5px;
  color: #858b9b;
  font-size: 10px;
  line-height: 1.5;
}
.status li {
  display: flex;
  justify-content: space-between;
  padding: 9px 0;
  border-top: 1px solid #25262b;
  color: #aeb4c5;
  font-size: 11px;
}
.status li:first-child {
  border-top: 0;
}
.status b {
  color: #34c759;
  font:
    600 10px "JetBrains Mono",
    monospace;
}
.error-state {
  padding: 70px 20px;
  border: 1px solid #2c2c2e;
  text-align: center;
  background: #141415;
}
.error-state svg {
  color: #ff453a;
}
.error-state button {
  margin: 18px auto;
}
.skeleton-grid {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
}
.skeleton-grid i {
  height: 105px;
  background: linear-gradient(90deg, #141415, #25272d, #141415);
  background-size: 200%;
  animation: pulse 1.2s infinite;
}
.skeleton-grid i:nth-child(n + 5) {
  grid-column: span 2;
  height: 250px;
}
.spin {
  animation: spin 1s linear infinite;
}
@keyframes pulse {
  to {
    background-position: -200%;
  }
}
@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
@media (max-width: 1100px) {
  .metrics {
    grid-template-columns: repeat(2, 1fr);
  }
}
@media (max-width: 700px) {
  .dashboard header {
    align-items: flex-start;
  }
  .dashboard header button {
    font-size: 0;
  }
  .two-col,
  .two-col--lists {
    grid-template-columns: 1fr;
  }
  .growth {
    grid-template-columns: 1fr;
  }
  .skeleton-grid {
    grid-template-columns: 1fr 1fr;
  }
  .skeleton-grid i:nth-child(n + 5) {
    grid-column: span 2;
  }
}
@media (max-width: 450px) {
  .metrics {
    grid-template-columns: 1fr;
  }
  .skeleton-grid {
    grid-template-columns: 1fr;
  }
  .skeleton-grid i:nth-child(n + 5) {
    grid-column: span 1;
  }
}
</style>
