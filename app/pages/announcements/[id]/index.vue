<template>
  <div class="page"
    ><AppSidebar /><main
      ><NuxtLink to="/announcements">← Announcements</NuxtLink><p v-if="loading">Loading…</p
      ><section v-else-if="a"
        ><header
          ><div
            ><h1>{{ a.title }}</h1
            ><span>{{ a.status }} · {{ a.type }} · {{ a.priority }}</span></div
          ><div
            ><NuxtLink :to="`/announcements/${a.id}/edit`">Edit</NuxtLink
            ><button
              v-if="a.status !== 'published' && a.status !== 'archived'"
              @click="act('publish')"
              >Publish</button
            ><button v-if="a.status !== 'archived'" @click="act('archive')">Archive</button></div
          ></header
        ><article
          ><small>MESSAGE</small><p>{{ a.content }}</p
          ><a v-if="a.cta" :href="a.cta.url" target="_blank" rel="noopener noreferrer"
            >{{ a.cta.label }} →</a
          ></article
        ><dl
          ><dt>Audience</dt><dd>{{ a.audience }}</dd
          ><dt>Created by</dt><dd>{{ a.createdBy || "Deleted administrator" }}</dd
          ><dt>Starts</dt><dd>{{ date(a.startsAt) }}</dd
          ><dt>Published</dt><dd>{{ date(a.publishedAt) }}</dd
          ><dt>Expires</dt><dd>{{ date(a.expiresAt) }}</dd></dl
        ></section
      ><p v-else>Announcement not found.</p></main
    ></div
  >
</template>
<script setup>
const s = useAnnouncementsStore(),
  route = useRoute(),
  toast = useToastStore(),
  loading = ref(true),
  a = computed(() => s.current);
const date = (v) =>
  v
    ? new Intl.DateTimeFormat(undefined, { dateStyle: "medium", timeStyle: "short" }).format(
        new Date(v),
      )
    : "—";
try {
  await s.detail(route.params.id);
} catch {
} finally {
  loading.value = false;
}
async function act(x) {
  if (!window.confirm(`${x === "archive" ? "Archive" : "Publish"} this announcement?`)) return;
  try {
    await s.action(a.value.id, x);
    await s.detail(a.value.id);
    toast.success("Announcement updated.");
  } catch (e) {
    toast.error(e?.data?.message || "Action failed.");
  }
}
</script>
<style scoped>
.page {
  min-height: 100vh;
  padding-left: 264px;
  background: #10131b;
  color: #e0e2ed;
}
.page main {
  max-width: 900px;
  margin: auto;
  padding: 34px 28px;
}
.page > a,
article a {
  color: #adc6ff;
}
header {
  display: flex;
  justify-content: space-between;
  gap: 18px;
  margin: 18px 0;
}
h1 {
  font-size: 30px;
}
header span,
small,
dt {
  color: #9198a8;
}
button,
header a {
  margin-left: 8px;
  padding: 9px 12px;
  border: 1px solid #414755;
  border-radius: 8px;
  color: #adc6ff;
}
article,
dl {
  padding: 20px;
  border: 1px solid #303642;
  border-radius: 13px;
  background: #151923;
}
article p {
  white-space: pre-wrap;
  line-height: 1.6;
}
dl {
  display: grid;
  grid-template-columns: 130px 1fr;
  gap: 14px;
  margin-top: 14px;
}
dd {
  margin: 0;
}
@media (max-width: 900px) {
  .page {
    padding-left: 0;
  }
  .page main {
    padding: 78px 16px;
  }
}
</style>
