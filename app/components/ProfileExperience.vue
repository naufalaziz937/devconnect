<template>
  <div class="profile-shell">
    <AppSidebar />
    <main class="profile-main">
      <ProfileSkeleton v-if="store.loading && !profile" />
      <StateMessage
        v-else-if="store.error && !profile"
        :message="store.error === 'Profile not found' ? 'Developer not found.' : store.error"
      />
      <template v-else-if="profile">
        <section class="profile-identity">
          <div class="identity-top">
            <UserAvatar :user="profile" :size="104" :alt="`${profile.username}'s avatar`" />
            <div class="identity-copy"
              ><span>DEVELOPER PROFILE</span><h1>{{ profile.display_name || profile.username }}</h1
              ><p>@{{ profile.username }}</p></div
            >
            <div class="profile-actions">
              <NuxtLink v-if="isOwner" to="/profile/edit" class="primary-action"
                ><Pencil :size="15" /> Edit Profile</NuxtLink
              >
              <button
                v-else-if="auth.token"
                :disabled="followPending"
                :class="['primary-action', { following: profile.followed_by_me }]"
                @click="toggleFollow"
                ><UserCheck v-if="profile.followed_by_me" :size="15" /><UserPlus
                  v-else
                  :size="15"
                />{{
                  followPending ? "Working…" : profile.followed_by_me ? "Following" : "Follow"
                }}</button
              >
              <button class="secondary-action" @click="share"><Share2 :size="15" /> Share</button>
            </div>
          </div>
          <div class="profile-stats" aria-label="Profile statistics">
            <button @click="showConnections('following')"
              ><strong>{{ profile.following_count }}</strong
              ><span>Following</span></button
            >
            <button @click="showConnections('followers')"
              ><strong>{{ profile.follower_count }}</strong
              ><span>Followers</span></button
            >
            <div
              ><strong>{{ profile.likes_received }}</strong
              ><span>Likes received</span></div
            >
          </div>
          <p v-if="profile.bio" class="profile-bio">{{ profile.bio }}</p>
          <div class="profile-details">
            <span v-if="profile.location"><MapPin :size="14" />{{ profile.location }}</span>
            <span v-if="profile.collaboration_status"
              ><Radio :size="14" />{{ profile.collaboration_status }}</span
            >
            <a
              v-if="profile.github_username"
              :href="`https://github.com/${profile.github_username}`"
              target="_blank"
              rel="noopener"
              ><Github :size="14" />GitHub</a
            >
            <a v-if="profile.website_url" :href="profile.website_url" target="_blank" rel="noopener"
              ><Globe2 :size="14" />Portfolio</a
            >
          </div>
          <div v-if="tech.length" class="tech-list"
            ><span v-for="item in tech" :key="item">{{ item }}</span></div
          >
        </section>

        <section v-if="connectionView" class="connections-panel">
          <header
            ><h2>{{ connectionView === "followers" ? "Followers" : "Following" }}</h2
            ><button @click="connectionView = ''"><X :size="18" /></button
          ></header>
          <div v-if="connectionsLoading" class="connection-loading"
            ><SkeletonBlock v-for="n in 3" :key="n" class="h-14"
          /></div>
          <StateMessage
            v-else-if="!connections.length"
            :message="
              connectionView === 'followers' ? 'No followers yet.' : 'Not following anyone yet.'
            "
          />
          <NuxtLink
            v-for="person in connections"
            v-else
            :key="person.uuid"
            :to="`/developers/${person.uuid}`"
            class="connection-row"
          >
            <UserAvatar :user="person" :size="38" />
            <span
              ><strong>{{ person.display_name || person.username }}</strong
              ><small>@{{ person.username }}</small></span
            >
          </NuxtLink>
        </section>

        <nav class="profile-tabs" aria-label="Profile activity">
          <button
            v-for="tab in tabs"
            :key="tab.id"
            :class="{ active: activeTab === tab.id }"
            @click="selectTab(tab.id)"
            >{{ tab.label }} <span>{{ tab.count }}</span></button
          >
        </nav>
        <section class="activity-list">
          <div v-if="store.activityLoading && !items.length" class="activity-loading"
            ><SkeletonBlock v-for="n in 3" :key="n" class="h-36"
          /></div>
          <StateMessage v-else-if="store.error" :message="store.error" />
          <StateMessage v-else-if="!items.length" :message="emptyMessage" />

          <article
            v-for="item in items"
            v-else
            :key="`${activeTab}-${item.id}`"
            :class="['activity-card', `activity-card--${activeTab}`]"
          >
            <template v-if="activeTab === 'devlogs' || activeTab === 'liked'">
              <header
                ><NuxtLink :to="`/developers/${item.user_uuid}`">@{{ item.username }}</NuxtLink
                ><time>{{ formatDate(item.created_at) }}</time></header
              >
              <NuxtLink :to="`/devlogs/${item.id}`" class="activity-content">{{
                item.content
              }}</NuxtLink>
              <img
                v-if="item.image_url"
                :src="item.image_url"
                alt="DevLog attachment"
                class="activity-media"
              />
              <footer
                ><button :class="{ active: item.liked_by_me }" @click="toggleLike(item)"
                  ><Heart :size="16" />{{ item.total_likes }}</button
                ><NuxtLink :to="`/devlogs/${item.id}`"
                  ><MessageCircle :size="16" />{{ item.total_comments }}</NuxtLink
                ></footer
              >
            </template>
            <template v-else-if="activeTab === 'projects'">
              <header
                ><span>{{ item.status }}</span
                ><time>{{ formatDate(item.updated_at || item.created_at) }}</time></header
              >
              <NuxtLink :to="`/projects/${item.id}`" class="project-title">{{
                item.title
              }}</NuxtLink
              ><p>{{ item.description }}</p>
              <div class="tech-list"
                ><span v-for="skill in item.needed_skills?.slice(0, 5)" :key="skill">{{
                  skill
                }}</span></div
              >
              <footer
                ><span
                  ><UsersRound :size="16" />{{ item.total_members }} /
                  {{ item.max_members }} members</span
                ></footer
              >
            </template>
            <template v-else>
              <header
                ><span
                  >{{ profile.display_name || profile.username }} commented on @{{
                    item.devlog_author_username
                  }}'s DevLog</span
                ><time>{{ formatDate(item.created_at) }}</time></header
              >
              <blockquote>“{{ item.content }}”</blockquote>
              <NuxtLink :to="`/devlogs/${item.devlog_id}`" class="comment-context">{{
                item.devlog_content
              }}</NuxtLink>
            </template>
          </article>
          <button
            v-if="hasMore"
            :disabled="store.activityLoading"
            class="load-more"
            @click="loadMore"
            >{{ store.activityLoading ? "Loading…" : "Load more" }}</button
          >
        </section>
      </template>
    </main>
    <AppRightSidebar>
      <section class="context-card"
        ><header
          ><h2>{{ isOwner ? "Suggested developers" : "Similar developers" }}</h2
          ><NuxtLink to="/network">See all</NuxtLink></header
        ><NuxtLink
          v-for="person in suggestions"
          :key="person.uuid"
          :to="`/developers/${person.uuid}`"
          class="context-person"
          ><UserAvatar :user="person" :size="38" /><span
            ><strong>{{ person.display_name || person.username }}</strong
            ><small>@{{ person.username }}</small></span
          ></NuxtLink
        ></section
      >
      <section class="context-card"
        ><header
          ><h2>{{ isOwner ? "Active projects" : "Related projects" }}</h2
          ><NuxtLink to="/projects">See all</NuxtLink></header
        ><NuxtLink
          v-for="project in projects.posts.slice(0, 4)"
          :key="project.id"
          :to="`/projects/${project.id}`"
          class="context-project"
          ><strong>{{ project.title }}</strong
          ><small>{{
            project.needed_skills?.slice(0, 3).join(" · ") || "Open project"
          }}</small></NuxtLink
        ></section
      >
    </AppRightSidebar>
  </div>
</template>

<script setup>
import {
  Github,
  Globe2,
  Heart,
  MapPin,
  MessageCircle,
  Pencil,
  Radio,
  Share2,
  UserCheck,
  UserPlus,
  UsersRound,
  X,
} from "lucide-vue-next";
const props = defineProps({ uuid: { type: String, required: true } });
const route = useRoute();
const router = useRouter();
const auth = useAuthStore();
const store = useProfileStore();
const follow = useFollowStore();
const feed = useFeedStore();
const toast = useToastStore();
const developers = useDevelopersStore();
const projects = useTeammatesStore();
const profile = computed(() => store.viewed);
const isOwner = computed(() =>
  Boolean(profile.value?.is_owner || auth.user?.uuid === profile.value?.uuid),
);
const allowedTabs = computed(() =>
  isOwner.value
    ? ["devlogs", "projects", "comments", "liked"]
    : ["devlogs", "projects", "comments"],
);
const activeTab = computed(() =>
  allowedTabs.value.includes(String(route.query.tab)) ? String(route.query.tab) : "devlogs",
);
const tabs = computed(() => [
  { id: "devlogs", label: "DevLogs", count: profile.value?.devlog_count },
  { id: "projects", label: "Projects", count: profile.value?.project_count },
  { id: "comments", label: "Comments", count: profile.value?.comment_count },
  ...(isOwner.value ? [{ id: "liked", label: "Liked", count: profile.value?.liked_count }] : []),
]);
const items = computed(() => store.activity[activeTab.value] || []);
const page = computed(() => store.activityPagination[activeTab.value]);
const hasMore = computed(() => page.value && page.value.page < page.value.pages);
const tech = computed(() =>
  String(profile.value?.favorite_tech || "")
    .split(/[,·|]/)
    .map((value) => value.trim())
    .filter(Boolean)
    .slice(0, 6),
);
const followPending = ref(false);
const connectionView = ref("");
const connections = ref([]);
const connectionsLoading = ref(false);
const suggestions = computed(() =>
  developers.items.filter((person) => person.uuid !== props.uuid).slice(0, 4),
);
const emptyMessage = computed(
  () =>
    ({
      devlogs: isOwner.value ? "No DevLogs yet." : "This developer has no DevLogs yet.",
      projects: isOwner.value ? "No projects yet." : "This developer has no projects yet.",
      comments: isOwner.value ? "No comments yet." : "This developer has no comments yet.",
      liked: "No liked posts yet.",
    })[activeTab.value],
);
function formatDate(value) {
  return new Intl.DateTimeFormat(undefined, { dateStyle: "medium" }).format(new Date(value));
}
async function loadActivity() {
  try {
    await store.fetchActivity(props.uuid, activeTab.value);
  } catch {}
}
function selectTab(tab) {
  connectionView.value = "";
  router.push({ path: route.path, query: tab === "devlogs" ? {} : { tab } });
}
async function loadMore() {
  await store.fetchActivity(props.uuid, activeTab.value, page.value.page + 1, true);
}
async function toggleFollow() {
  followPending.value = true;
  const next = !profile.value.followed_by_me;
  try {
    if (next) await follow.followUuid(props.uuid);
    else await follow.unfollowUuid(props.uuid);
    store.patchFollow(next);
    toast.success(next ? "Developer followed." : "Developer unfollowed.");
  } catch {
    toast.error("Could not update Follow.");
  } finally {
    followPending.value = false;
  }
}
async function toggleLike(item) {
  const next = !item.liked_by_me;
  try {
    if (next) await feed.like(item.id);
    else await feed.unlike(item.id);
    item.liked_by_me = next;
    item.total_likes = Math.max(0, Number(item.total_likes || 0) + (next ? 1 : -1));
  } catch {
    toast.error("Could not update Like.");
  }
}
async function showConnections(type) {
  connectionView.value = type;
  connectionsLoading.value = true;
  try {
    const data =
      type === "followers"
        ? await follow.followersByUuid(props.uuid)
        : await follow.followingByUuid(props.uuid);
    connections.value = data.items;
  } catch {
    toast.error("Could not load connections.");
  } finally {
    connectionsLoading.value = false;
  }
}
async function share() {
  const url = `${window.location.origin}/developers/${profile.value.uuid}`;
  try {
    if (navigator.share)
      await navigator.share({
        title: `${profile.value.display_name || profile.value.username} on DevConnect`,
        url,
      });
    else {
      await navigator.clipboard.writeText(url);
      toast.success("Profile link copied.");
    }
  } catch (error) {
    if (error?.name !== "AbortError") toast.error("Could not share profile.");
  }
}
watch(activeTab, loadActivity);
store.clearView();
try {
  await store.fetchView(props.uuid);
  if (!allowedTabs.value.includes(activeTab.value)) await router.replace({ path: route.path });
  await Promise.allSettled([
    loadActivity(),
    developers.search({ limit: 5 }),
    projects.browse({ limit: 4, status: "open", sort: "newest" }),
  ]);
} catch {}
</script>

<style scoped>
.profile-shell {
  min-height: 100vh;
  padding-left: var(--sidebar-width);
  display: grid;
  grid-template-columns: minmax(560px, 760px) minmax(280px, 340px);
  justify-content: center;
  gap: 28px;
  color: #e0e2ed;
}
.profile-main {
  min-width: 0;
  padding: 30px 0 80px;
}
.profile-identity {
  padding: 22px 24px 24px;
  border-bottom: 1px solid rgba(65, 71, 85, 0.35);
}
.identity-top {
  display: grid;
  grid-template-columns: 104px minmax(0, 1fr) auto;
  align-items: center;
  gap: 20px;
}
.profile-avatar {
  width: 104px;
  height: 104px;
  display: grid;
  place-items: center;
  overflow: hidden;
  border: 2px solid rgba(173, 198, 255, 0.35);
  border-radius: 50%;
  color: #adc6ff;
  background: #1c2028;
  font:
    700 20px "JetBrains Mono",
    monospace;
}
.profile-avatar img,
.mini-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.identity-copy > span {
  color: #adc6ff;
  font:
    600 9px "JetBrains Mono",
    monospace;
  letter-spacing: 0.14em;
}
.identity-copy h1 {
  margin-top: 5px;
  font-size: 30px;
  line-height: 1.1;
  font-weight: 700;
}
.identity-copy p {
  margin-top: 5px;
  color: #858b9b;
}
.profile-actions {
  display: flex;
  gap: 8px;
  align-self: start;
}
.primary-action,
.secondary-action {
  height: 38px;
  display: flex;
  align-items: center;
  gap: 7px;
  padding: 0 13px;
  border-radius: 999px;
  font:
    600 9px "JetBrains Mono",
    monospace;
}
.primary-action {
  color: #061a39;
  background: #adc6ff;
}
.primary-action.following,
.secondary-action {
  color: #adc6ff;
  border: 1px solid rgba(173, 198, 255, 0.34);
  background: transparent;
}
.profile-stats {
  display: flex;
  gap: 28px;
  margin: 22px 0 14px 124px;
}
.profile-stats button,
.profile-stats div {
  text-align: left;
}
.profile-stats strong,
.profile-stats span {
  display: block;
}
.profile-stats strong {
  font-size: 18px;
}
.profile-stats span {
  margin-top: 2px;
  color: #858b9b;
  font-size: 10px;
}
.profile-bio {
  max-width: 620px;
  margin-left: 124px;
  color: #cdd1dc;
  line-height: 1.55;
  white-space: pre-wrap;
}
.profile-details,
.tech-list {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  margin: 13px 0 0 124px;
}
.profile-details span,
.profile-details a {
  display: flex;
  align-items: center;
  gap: 5px;
  color: #9da3b4;
  font-size: 11px;
}
.profile-details a {
  color: #adc6ff;
}
.tech-list span {
  padding: 5px 8px;
  border: 1px solid rgba(65, 71, 85, 0.5);
  border-radius: 999px;
  color: #adc6ff;
  background: #141821;
  font:
    500 8px "JetBrains Mono",
    monospace;
}
.profile-tabs {
  position: sticky;
  top: 0;
  z-index: 20;
  height: 58px;
  display: flex;
  overflow-x: auto;
  border-bottom: 1px solid rgba(65, 71, 85, 0.35);
  background: rgba(10, 14, 24, 0.92);
  backdrop-filter: blur(14px);
}
.profile-tabs button {
  position: relative;
  min-width: 120px;
  flex: 1;
  color: #858b9b;
  font-weight: 600;
}
.profile-tabs button span {
  font-size: 9px;
}
.profile-tabs button.active {
  color: #e0e2ed;
}
.profile-tabs button.active:after {
  content: "";
  position: absolute;
  left: 25%;
  right: 25%;
  bottom: 0;
  height: 3px;
  border-radius: 3px;
  background: #4b8eff;
}
.activity-list {
  display: grid;
}
.activity-loading {
  display: grid;
  gap: 12px;
  padding: 18px;
}
.activity-card {
  padding: 18px 20px;
  border-bottom: 1px solid rgba(65, 71, 85, 0.3);
}
.activity-card header,
.activity-card footer {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  color: #858b9b;
  font-size: 10px;
}
.activity-card header a {
  color: #adc6ff;
}
.activity-content {
  display: block;
  margin-top: 9px;
  color: #e0e2ed;
  line-height: 1.55;
  white-space: pre-wrap;
}
.activity-media {
  width: 100%;
  max-height: 440px;
  margin-top: 13px;
  border-radius: 14px;
  object-fit: contain;
  background: #080b12;
}
.activity-card footer {
  justify-content: flex-start;
  margin-top: 13px;
  gap: 28px;
}
.activity-card footer button,
.activity-card footer a,
.activity-card footer span {
  display: flex;
  align-items: center;
  gap: 6px;
}
.activity-card footer .active {
  color: #ff6b7a;
}
.project-title {
  display: block;
  margin-top: 10px;
  font-size: 19px;
  font-weight: 680;
}
.activity-card--projects p {
  margin-top: 6px;
  color: #b4bac8;
  line-height: 1.5;
}
.activity-card--projects .tech-list {
  margin: 12px 0 0;
}
.activity-card blockquote {
  margin-top: 11px;
  color: #e0e2ed;
  font-size: 15px;
  line-height: 1.5;
}
.comment-context {
  display: block;
  margin-top: 12px;
  padding: 11px 13px;
  border-left: 2px solid #4b8eff;
  color: #9298a8;
  background: #10131b;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
}
.load-more {
  display: block;
  margin: 22px auto;
  padding: 10px 17px;
  border: 1px solid #414755;
  border-radius: 999px;
  color: #adc6ff;
}
.connections-panel {
  margin: 0 20px 18px;
  border: 1px solid rgba(65, 71, 85, 0.45);
  border-radius: 14px;
  background: #10131b;
  overflow: hidden;
}
.connections-panel header {
  display: flex;
  justify-content: space-between;
  padding: 14px;
}
.connection-row {
  display: grid;
  grid-template-columns: 38px 1fr;
  gap: 10px;
  align-items: center;
  padding: 11px 14px;
  border-top: 1px solid rgba(65, 71, 85, 0.25);
}
.mini-avatar {
  width: 38px;
  height: 38px;
  display: grid;
  place-items: center;
  overflow: hidden;
  border-radius: 50%;
  color: #adc6ff;
  background: #1c2028;
  font-size: 9px;
}
.connection-row strong,
.connection-row small,
.context-person strong,
.context-person small {
  display: block;
}
.connection-row small,
.context-person small {
  color: #858b9b;
  font-size: 9px;
}
.connection-loading {
  display: grid;
  gap: 8px;
  padding: 12px;
}
.context-card {
  overflow: hidden;
  border: 1px solid rgba(65, 71, 85, 0.35);
  border-radius: 16px;
  background: rgba(16, 19, 27, 0.72);
}
.context-card header {
  display: flex;
  justify-content: space-between;
  padding: 15px;
}
.context-card h2 {
  font-size: 14px;
}
.context-card header a {
  color: #adc6ff;
  font-size: 9px;
}
.context-person {
  display: grid;
  grid-template-columns: 38px 1fr;
  gap: 9px;
  align-items: center;
  padding: 11px 14px;
  border-top: 1px solid rgba(65, 71, 85, 0.25);
}
.context-project {
  display: block;
  padding: 12px 15px;
  border-top: 1px solid rgba(65, 71, 85, 0.25);
}
.context-project strong,
.context-project small {
  display: block;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.context-project small {
  margin-top: 3px;
  color: #858b9b;
  font-size: 9px;
}
@media (max-width: 1080px) {
  .profile-shell {
    display: block;
  }
  .profile-main {
    width: min(800px, 100%);
    margin: auto;
  }
}
@media (max-width: 760px) {
  .profile-shell {
    padding-left: 0;
  }
  .profile-main {
    padding-top: 12px;
    padding-bottom: 90px;
  }
  .profile-identity {
    padding: 18px 14px;
  }
  .identity-top {
    grid-template-columns: 82px 1fr;
  }
  .profile-avatar {
    width: 82px;
    height: 82px;
  }
  .identity-copy h1 {
    font-size: 24px;
  }
  .profile-actions {
    grid-column: 1/-1;
  }
  .profile-stats,
  .profile-bio,
  .profile-details,
  .profile-identity > .tech-list {
    margin-left: 0;
  }
  .profile-stats {
    justify-content: space-between;
    gap: 12px;
  }
  .profile-tabs button {
    min-width: 105px;
  }
  .activity-card {
    padding-inline: 14px;
  }
}
</style>
