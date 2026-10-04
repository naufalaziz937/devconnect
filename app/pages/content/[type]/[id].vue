<template>
  <div class="detail"
    ><NuxtLink to="/content" class="back"><ArrowLeft :size="16" />Back to content</NuxtLink
    ><div v-if="store.detailLoading" class="loading"><i /><i /></div
    ><section v-else-if="store.error && !item" class="state"
      ><TriangleAlert /><h1>Unable to load content.</h1><p>{{ store.error }}</p
      ><button @click="load">Try Again</button></section
    ><template v-else-if="item"
      ><header
        ><NuxtLink :to="`/user/${item.author.id}`" class="author"
          ><UserAvatar
            :user="{
              username: item.author.username,
              display_name: item.author.displayName,
              avatar_url: item.author.avatar,
            }"
            :size="48"
          /><span
            ><strong>{{ item.author.displayName || item.author.username }}</strong
            ><small>@{{ item.author.username }} · {{ dateTime(item.createdAt) }}</small></span
          ></NuxtLink
        ><div
          ><b class="badge">{{ typeLabel(item.type) }}</b
          ><b :class="['status', `status--${item.status}`]">{{ item.status }}</b></div
        ></header
      ><section class="content-body"
        ><p>{{ item.preview }}</p
        ><img v-if="item.media" :src="item.media" alt="Attached DevLog image" /><div
          v-if="item.parent"
          class="parent"
          ><small>Comment on @{{ item.parent.authorUsername }}’s DevLog</small
          ><p>{{ item.parent.preview }}</p></div
        ><footer v-if="item.type === 'devlog'"
          ><span><Heart :size="15" />{{ number(item.engagement.likes) }} likes</span
          ><span
            ><MessageSquare :size="15" />{{ number(item.engagement.comments) }} comments</span
          ></footer
        ></section
      ><section v-if="item.reason" class="moderation"
        ><h2>Moderation record</h2
        ><p
          ><b>{{ item.status === "hidden" ? "Hidden" : "Restored" }}</b> · {{ item.reason }}</p
        ></section
      ><div class="actions"
        ><NuxtLink :to="`/user/${item.author.id}`">View User</NuxtLink
        ><button @click="open = true">{{
          item.status === "hidden" ? "Restore Content" : "Hide Content"
        }}</button></div
      ></template
    ><ContentModerationDialog
      v-if="open && item"
      :action="item.status === 'hidden' ? 'restore' : 'hide'"
      :pending="pending"
      @close="open = false"
      @confirm="moderate"
  /></div>
</template>
<script setup>
import { ArrowLeft, Heart, MessageSquare, TriangleAlert } from "lucide-vue-next";
definePageMeta({ layout: "management", middleware: "admin" });
const route = useRoute(),
  store = useAdminContentStore(),
  toast = useToastStore(),
  open = ref(false),
  pending = ref(false);
const item = computed(() => store.selected);
const number = (v) => new Intl.NumberFormat().format(v || 0),
  dateTime = (v) =>
    new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(
      new Date(v),
    ),
  typeLabel = (v) => (v === "devlog" ? "DevLog" : "Comment");
async function load() {
  try {
    await store.fetchDetail(String(route.params.type), String(route.params.id));
  } catch {}
}
async function moderate(reason) {
  pending.value = true;
  const action = item.value.status === "hidden" ? "restore" : "hide";
  try {
    await store.moderate(item.value.type, item.value.id, action, reason);
    toast.success(action === "hide" ? "Content hidden." : "Content restored.");
    open.value = false;
  } catch (err) {
    toast.error(err?.data?.message || "Failed to moderate content.");
  } finally {
    pending.value = false;
  }
}
await load();
</script>
<style scoped>
.detail {
  max-width: 900px;
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
.detail > header,
.content-body,
.moderation {
  border: 1px solid rgba(65, 71, 85, 0.55);
  background: #141821;
}
.detail > header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16px;
  padding: 18px;
  border-radius: 13px 13px 0 0;
}
.author {
  display: flex;
  align-items: center;
  gap: 11px;
}
.author strong,
.author small {
  display: block;
}
.author strong {
  color: #e0e2ed;
  font-size: 13px;
}
.author small {
  margin-top: 4px;
  color: #858b9b;
  font-size: 10px;
}
.detail header > div {
  display: flex;
  gap: 7px;
}
.badge,
.status {
  padding: 4px 7px;
  border: 1px solid #414755;
  border-radius: 999px;
  font:
    600 8px "JetBrains Mono",
    monospace;
}
.badge {
  color: #adc6ff;
}
.status--visible {
  color: #73daca;
}
.status--hidden {
  color: #ffd18a;
  background: rgba(255, 179, 71, 0.08);
}
.content-body {
  padding: 24px;
  border-top: 0;
}
.content-body > p {
  margin: 0;
  white-space: pre-wrap;
  color: #e0e2ed;
  font-size: 14px;
  line-height: 1.7;
}
.content-body > img {
  display: block;
  max-width: 100%;
  max-height: 520px;
  margin-top: 18px;
  border-radius: 10px;
}
.content-body footer {
  display: flex;
  gap: 16px;
  margin-top: 20px;
  color: #9da3b4;
  font-size: 11px;
}
.content-body footer span {
  display: flex;
  align-items: center;
  gap: 5px;
}
.parent {
  margin-top: 20px;
  padding: 13px;
  border-left: 2px solid #4b8eff;
  background: #0d1018;
}
.parent small {
  color: #adc6ff;
  font-size: 9px;
}
.parent p {
  margin: 6px 0 0;
  color: #aeb4c5;
  font-size: 11px;
  line-height: 1.5;
}
.moderation {
  margin-top: 14px;
  padding: 16px;
  border-radius: 12px;
}
.moderation h2 {
  margin: 0 0 7px;
  font-size: 13px;
}
.moderation p {
  margin: 0;
  color: #aeb4c5;
  font-size: 11px;
}
.actions {
  display: flex;
  justify-content: flex-end;
  gap: 9px;
  margin-top: 14px;
}
.actions a,
.actions button,
.state button {
  padding: 9px 12px;
  border: 1px solid #414755;
  border-radius: 8px;
  color: #c7cbd6;
  font-size: 10px;
}
.actions button {
  color: #07152a;
  background: #adc6ff;
}
.loading {
  display: grid;
  gap: 12px;
}
.loading i {
  height: 130px;
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
.state p {
  color: #858b9b;
}
@keyframes shimmer {
  to {
    background-position: -200%;
  }
}
@media (max-width: 600px) {
  .detail > header {
    align-items: flex-start;
    flex-direction: column;
  }
  .detail > header > div {
    align-self: flex-end;
  }
  .content-body {
    padding: 17px;
  }
  .content-body > p {
    font-size: 13px;
  }
}
</style>
