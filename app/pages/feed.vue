<template>
  <div class="feed-shell text-white">
    <AppSidebar />
    <main class="timeline" aria-label="Developer activity feed">
      <header class="timeline-tabs">
        <button
          :class="['timeline-tab', { active: feed.scope === 'all' }]"
          :aria-selected="feed.scope === 'all'"
          @click="selectFeed('all')"
          >For You</button
        >
        <button
          :class="['timeline-tab', { active: feed.scope === 'following' }]"
          :aria-selected="feed.scope === 'following'"
          @click="selectFeed('following')"
          >Following</button
        >
      </header>

      <section class="timeline-content">
        <FeedSkeleton v-if="feed.loading && !feed.items.length" />
        <template v-else>
          <PostComposer id="create" mode="inline" />

          <StateMessage v-if="feed.error" :message="feed.error" />
          <StateMessage
            v-else-if="!feed.items.length"
            message="No DevLogs yet. Share the first update."
          />
          <article v-for="item in feed.items" :key="item.id" class="feed-item">
            <UserAvatar :user="item" :size="44" />
            <div class="feed-item__content">
              <header class="feed-item__header"
                ><NuxtLink
                  :to="item.user_uuid ? `/developers/${item.user_uuid}` : '/developers'"
                  class="feed-item__name"
                  >{{ item.username }}</NuxtLink
                ><span>@{{ item.username }}</span
                ><span>·</span
                ><time :datetime="item.created_at">{{ formatDevlogDate(item.created_at) }}</time
                ><button
                  v-if="item.id_user !== auth.user?.id_user"
                  :disabled="pendingFollow === item.id"
                  class="follow-button"
                  @click="followAuthor(item)"
                  >{{
                    pendingFollow === item.id
                      ? "Working…"
                      : item.followed_by_me
                        ? "Unfollow"
                        : "Follow"
                  }}</button
                ></header
              >
              <p class="feed-item__text">{{ item.content }}</p>
              <img
                v-if="item.image_url"
                :src="item.image_url"
                alt="DevLog screenshot"
                class="feed-item__media"
              />
              <div class="feed-actions">
                <button
                  :disabled="pendingLike === item.id"
                  :class="{ active: item.liked_by_me }"
                  :aria-label="item.liked_by_me ? 'Unlike DevLog' : 'Like DevLog'"
                  @click="react(item)"
                  ><Heart :size="18" /> {{ item.total_likes }}</button
                >
                <button aria-label="Show comments" @click="toggleComments(item.id)"
                  ><MessageSquare :size="18" /> {{ item.total_comments }}</button
                >
                <button aria-label="Copy DevLog link" @click="copyLink(item.id)"
                  ><Share2 :size="18" /><span class="action-label">{{
                    copiedId === item.id ? "Copied" : "Share"
                  }}</span></button
                >
                <NuxtLink :to="`/devlogs/${item.id}`" aria-label="Open DevLog"
                  ><ExternalLink :size="18" /><span class="action-label">Open</span></NuxtLink
                ><button
                  v-if="item.id_user !== auth.user?.id_user"
                  aria-label="Report DevLog"
                  @click="reporting = item"
                  ><span class="action-label">Report</span></button
                >
              </div>
              <div v-if="openComments === item.id" class="comments-panel">
                <p v-for="commentItem in feed.comments[item.id] || []" :key="commentItem.id"
                  ><strong>{{ commentItem.username }}</strong> {{ commentItem.content }}</p
                >
                <form class="comment-form" @submit.prevent="comment(item.id)"
                  ><input
                    v-model="commentText"
                    required
                    placeholder="Write a comment"
                    aria-label="Comment"
                  /><button :disabled="commenting">{{
                    commenting ? "Sending…" : "Send"
                  }}</button></form
                >
              </div>
            </div>
          </article>
          <button
            v-if="feed.hasMore && feed.items.length"
            :disabled="feed.loading"
            class="load-more"
            @click="feed.fetchFeed()"
            >{{ feed.loading ? "Loading more…" : "Load more DevLogs" }}</button
          >
        </template>
      </section>
    </main>

    <AppRightSidebar>
      <div class="discovery-sticky">
        <NuxtLink to="/explore" class="discovery-search"
          ><Search :size="18" /><span>Search DevConnect</span></NuxtLink
        >
        <section class="discovery-card"
          ><div class="discovery-title"
            ><h2>Developers to follow</h2><NuxtLink to="/network">See all</NuxtLink></div
          ><div v-if="developers.loading" class="compact-skeleton" /><div
            v-for="person in suggestedDevelopers"
            :key="person.uuid"
            class="developer-row"
            ><UserAvatar :user="person" :size="36" /><NuxtLink :to="`/developers/${person.uuid}`"
              ><strong>{{ person.display_name || person.username }}</strong
              ><span
                >@{{ person.username }} · {{ person.favorite_tech || "Developer" }}</span
              ></NuxtLink
            ><button :disabled="person.followed_by_me" @click="followSuggestion(person)">{{
              person.followed_by_me ? "Following" : "Follow"
            }}</button></div
          ></section
        >
        <DevDiscoveryModules :news-limit="3" :trends-limit="4" />
      </div>
    </AppRightSidebar>
    <ReportDialog
      :open="!!reporting"
      target-type="devlog"
      :target-id="reporting?.id"
      label="this DevLog"
      @close="reporting = null"
    />
  </div>
</template>

<script setup>
import { ExternalLink, Heart, MessageSquare, Search, Share2 } from "lucide-vue-next";
definePageMeta({ middleware: "auth" });
const feed = useFeedStore();
const auth = useAuthStore();
const follow = useFollowStore();
const developers = useDevelopersStore();
const projects = useTeammatesStore();
const toast = useToastStore();
const actionError = ref("");
const openComments = ref(null);
const commentText = ref("");
const commenting = ref(false);
const pendingLike = ref(null);
const pendingFollow = ref(null);
const copiedId = ref(null);
const reporting = ref(null);
const suggestedDevelopers = computed(() =>
  developers.items.filter((person) => person.uuid !== auth.user?.uuid).slice(0, 3),
);
await Promise.allSettled([
  callOnce("feed", () => feed.fetchFeed(true), { mode: "navigation" }),
  callOnce("feed-discovery-developers", () => developers.search({ limit: 4, sort: "newest" }), {
    mode: "navigation",
  }),
  callOnce(
    "feed-discovery-projects",
    () => projects.browse({ limit: 3, status: "open", sort: "newest" }),
    { mode: "navigation" },
  ),
]);
function formatDevlogDate(value) {
  const date = new Date(value);
  const diff = Date.now() - date.getTime();
  if (diff < 3600000) return `${Math.max(1, Math.floor(diff / 60000))}m`;
  if (diff < 86400000) return `${Math.floor(diff / 3600000)}h`;
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric" }).format(date);
}
async function followAuthor(item) {
  pendingFollow.value = item.id;
  actionError.value = "";
  const wasFollowing = item.followed_by_me;
  try {
    if (wasFollowing) await follow.unfollowUuid(item.user_uuid);
    else await follow.followUuid(item.user_uuid);
    item.followed_by_me = !wasFollowing;
    toast.success(wasFollowing ? "Developer unfollowed." : "Developer followed.");
  } catch {
    item.followed_by_me = wasFollowing;
    toast.error(wasFollowing ? "Failed to unfollow developer." : "Failed to follow developer.");
  } finally {
    pendingFollow.value = null;
  }
}
async function followSuggestion(person) {
  try {
    await follow.followUuid(person.uuid);
    person.followed_by_me = true;
    toast.success("Developer followed.");
  } catch {
    toast.error("Failed to follow developer.");
  }
}
async function react(item) {
  if (pendingLike.value === item.id) return;
  pendingLike.value = item.id;
  try {
    if (item.liked_by_me) await feed.unlike(item.id);
    else await feed.like(item.id);
  } catch {
    toast.error("Failed to update Like.");
  } finally {
    pendingLike.value = null;
  }
}
async function selectFeed(scope) {
  if (feed.scope === scope || feed.loading) return;
  await feed.fetchFeed(true, scope);
}
async function toggleComments(id) {
  openComments.value = openComments.value === id ? null : id;
  if (openComments.value && !feed.comments[id])
    try {
      await feed.loadComments(id);
    } catch (err) {
      actionError.value = err?.data?.message || "Could not load comments";
    }
}
async function comment(id) {
  commenting.value = true;
  try {
    await feed.addComment(id, commentText.value);
    commentText.value = "";
  } catch (err) {
    actionError.value = err?.data?.message || "Could not post comment";
  } finally {
    commenting.value = false;
  }
}
async function copyLink(id) {
  await navigator.clipboard.writeText(`${location.origin}/devlogs/${id}`);
  copiedId.value = id;
  setTimeout(() => {
    if (copiedId.value === id) copiedId.value = null;
  }, 1500);
}
</script>

<style scoped>
.feed-shell {
  min-height: 100vh;
  padding-left: var(--sidebar-width);
  display: grid;
  grid-template-columns: minmax(520px, 650px) minmax(280px, 340px);
  justify-content: center;
  gap: 28px;
}
.timeline {
  min-width: 0;
  margin: 0 !important;
  padding: 0 0 80px !important;
  max-width: none !important;
  border-inline: 1px solid rgba(65, 71, 85, 0.3);
}
.timeline-tabs {
  position: sticky;
  top: 0;
  z-index: 35;
  height: 64px;
  display: grid;
  grid-template-columns: 1fr 1fr;
  background: rgba(10, 14, 24, 0.9);
  border-bottom: 1px solid rgba(65, 71, 85, 0.3);
  backdrop-filter: blur(16px);
}
.timeline-tab {
  position: relative;
  color: #9da3b4;
  font:
    600 13px "JetBrains Mono",
    monospace;
}
.timeline-tab.active {
  color: #e0e2ed;
}
.timeline-tab.active::after {
  content: "";
  position: absolute;
  left: 28%;
  right: 28%;
  bottom: 0;
  height: 3px;
  border-radius: 3px;
  background: #4b8eff;
}
.timeline-tab:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}
.timeline-tab small {
  display: block;
  font-size: 8px;
  color: #ffb595;
}
.timeline-content {
  padding: 0;
}
.feed-composer {
  padding: 20px;
  border-bottom: 1px solid rgba(65, 71, 85, 0.3);
  scroll-margin-top: 76px;
  background: rgba(16, 19, 27, 0.56);
}
.composer-body {
  display: flex;
  gap: 13px;
}
.feed-avatar,
.mini-avatar {
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  border: 1px solid rgba(173, 198, 255, 0.3);
  border-radius: 50%;
  color: #adc6ff;
  background: #1c2028;
  font:
    500 10px "JetBrains Mono",
    monospace;
}
.feed-avatar {
  width: 44px;
  height: 44px;
}
.composer-body textarea {
  width: 100%;
  padding: 8px 2px;
  border: 0 !important;
  background: transparent !important;
  box-shadow: none !important;
  resize: none;
  font-size: 17px;
  line-height: 1.55;
}
.composer-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 13px 0 0 57px;
  padding-top: 13px;
  border-top: 1px solid rgba(65, 71, 85, 0.25);
  flex-wrap: wrap;
}
.composer-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 9px;
  border-radius: 999px;
  color: #adc6ff;
  font:
    500 10px "JetBrains Mono",
    monospace;
}
.composer-chip:hover,
.composer-chip--active {
  background: rgba(75, 142, 255, 0.1);
}
.composer-submit {
  margin-left: auto;
  padding: 9px 20px;
  border-radius: 999px;
  color: #062451;
  background: #adc6ff;
  font:
    700 10px "JetBrains Mono",
    monospace;
}
.composer-submit:disabled {
  opacity: 0.45;
}
.composer-preview {
  position: relative;
  margin: 12px 0 0 57px;
}
.composer-preview img {
  max-height: 280px;
  border: 1px solid #414755;
  border-radius: 14px;
}
.composer-preview button {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 30px;
  height: 30px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: #10131b;
}
.composer-notice,
.composer-error {
  display: flex;
  align-items: center;
  gap: 7px;
  margin: 10px 0 0 57px;
  color: #adc6ff;
  font:
    500 10px "JetBrains Mono",
    monospace;
}
.composer-notice--blocked,
.composer-error {
  color: #ffb595;
}
.feed-item {
  display: grid;
  grid-template-columns: 44px minmax(0, 1fr);
  gap: 12px;
  padding: 18px 20px;
  border-bottom: 1px solid rgba(65, 71, 85, 0.3);
  transition: background 0.15s;
}
.feed-item:hover {
  background: rgba(28, 32, 40, 0.2);
}
.feed-item__avatar {
  width: 44px;
  height: 44px;
  overflow: hidden;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: #1c2028;
  color: #adc6ff;
  font:
    500 10px "JetBrains Mono",
    monospace;
}
.feed-item__avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.feed-item__header {
  display: flex;
  align-items: center;
  gap: 5px;
  min-width: 0;
  color: #858b9b;
  font-size: 13px;
}
.feed-item__name {
  color: #e0e2ed;
  font-weight: 650;
}
.follow-button {
  margin-left: auto;
  color: #adc6ff;
  font:
    600 10px "JetBrains Mono",
    monospace;
}
.feed-item__text {
  margin-top: 5px;
  white-space: pre-wrap;
  line-height: 1.55;
  color: #e0e2ed;
}
.feed-item__media {
  width: 100%;
  max-height: 500px;
  margin-top: 13px;
  border: 1px solid rgba(65, 71, 85, 0.55);
  border-radius: 14px;
  object-fit: contain;
  background: #0b0e16;
}
.feed-actions {
  display: flex;
  justify-content: space-between;
  max-width: 430px;
  margin-top: 14px;
}
.feed-actions button,
.feed-actions a {
  display: flex;
  align-items: center;
  gap: 6px;
  color: #9298a8;
  font:
    500 11px "JetBrains Mono",
    monospace;
}
.feed-actions .active {
  color: #ff6b7a;
}
.comments-panel {
  margin-top: 14px;
  padding-top: 12px;
  border-top: 1px solid rgba(65, 71, 85, 0.25);
  display: grid;
  gap: 10px;
  font-size: 13px;
}
.comment-form {
  display: flex;
  gap: 8px;
}
.comment-form input {
  min-width: 0;
  flex: 1;
  padding: 9px 11px;
  border: 1px solid #414755;
  border-radius: 9px;
  background: #111827;
}
.comment-form button {
  color: #adc6ff;
}
.load-more {
  display: block;
  margin: 20px auto;
  padding: 10px 18px;
  border: 1px solid #414755;
  border-radius: 999px;
  color: #adc6ff;
  font:
    500 11px "JetBrains Mono",
    monospace;
}
.discovery-sticky {
  display: grid;
  gap: 16px;
}
.discovery-search {
  height: 46px;
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 0 16px;
  border: 1px solid rgba(65, 71, 85, 0.45);
  border-radius: 999px;
  color: #9298a8;
  background: rgba(28, 32, 40, 0.7);
}
.discovery-card {
  overflow: hidden;
  border: 1px solid rgba(65, 71, 85, 0.35);
  border-radius: 16px;
  background: rgba(16, 19, 27, 0.72);
}
.discovery-title {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 15px;
}
.discovery-title h2 {
  font-size: 15px;
  font-weight: 650;
}
.discovery-title a {
  color: #adc6ff;
  font:
    500 9px "JetBrains Mono",
    monospace;
}
.developer-row {
  display: grid;
  grid-template-columns: 36px minmax(0, 1fr) auto;
  align-items: center;
  gap: 9px;
  padding: 12px 15px;
  border-top: 1px solid rgba(65, 71, 85, 0.25);
}
.mini-avatar {
  width: 36px;
  height: 36px;
}
.developer-row a,
.project-row {
  min-width: 0;
}
.developer-row strong,
.developer-row span,
.project-row strong,
.project-row span {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.developer-row strong,
.project-row strong {
  font-size: 12px;
}
.developer-row span,
.project-row span {
  margin-top: 2px;
  color: #858b9b;
  font-size: 10px;
}
.developer-row button {
  color: #adc6ff;
  font:
    600 9px "JetBrains Mono",
    monospace;
}
.project-row {
  display: block;
  padding: 12px 15px;
  border-top: 1px solid rgba(65, 71, 85, 0.25);
}
.compact-skeleton {
  height: 58px;
  margin: 12px 15px;
  border-radius: 10px;
  background: linear-gradient(90deg, #1c2028, #272a32, #1c2028);
  background-size: 200% 100%;
  animation: pulse 1.6s infinite;
}
@keyframes pulse {
  to {
    background-position: -200% 0;
  }
}
@media (max-width: 1080px) {
  .feed-shell {
    grid-template-columns: minmax(500px, 650px);
  }
}
@media (max-width: 760px) {
  .feed-shell {
    display: block;
    padding-left: 0;
  }
  .timeline {
    border: 0;
  }
  .timeline-tabs {
    height: 56px;
  }
  .timeline-content {
    padding-bottom: 66px;
  }
  .feed-composer,
  .feed-item {
    padding-inline: 14px;
  }
  .composer-actions,
  .composer-preview,
  .composer-notice,
  .composer-error {
    margin-left: 0;
  }
  .action-label {
    display: none;
  }
  .feed-item__header {
    flex-wrap: wrap;
  }
  .follow-button {
    margin-left: 0;
    width: 100%;
    text-align: left;
  }
  .feed-item__media {
    max-height: 420px;
  }
}
</style>
