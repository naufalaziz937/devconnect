<template>
  <section
    v-if="announcement"
    class="banner"
    :class="announcement.priority"
    role="region"
    aria-label="Platform announcement"
    ><div
      ><small>{{ label(announcement.type) }}</small
      ><strong>{{ announcement.title }}</strong
      ><p>{{ announcement.content }}</p
      ><a
        v-if="announcement.cta"
        :href="link"
        :target="external ? '_blank' : undefined"
        :rel="external ? 'noopener noreferrer' : undefined"
        >{{ announcement.cta.label }} →</a
      ></div
    ><button
      v-if="announcement.priority !== 'critical'"
      :aria-label="`Dismiss ${announcement.title}`"
      @click="dismiss"
      >×</button
    ></section
  >
</template>
<script setup>
const store = useAnnouncementsStore(),
  auth = useAuthStore();
const announcement = computed(() => store.active[0]);
const label = (v) => String(v || "").replace(/^./, (c) => c.toUpperCase());
const link = computed(() => announcement.value?.cta?.url || "#");
const external = computed(() => /^https?:/.test(link.value));
async function dismiss() {
  try {
    await store.dismiss(announcement.value.id);
  } catch {}
}
onMounted(() => {
  if (auth.user?.role === "user") store.fetchActive();
});
</script>
<style scoped>
.banner {
  display: flex;
  justify-content: space-between;
  gap: 18px;
  max-width: 980px;
  margin: 12px auto 0;
  padding: 13px 16px;
  border: 1px solid #414755;
  border-radius: 12px;
  background: #151923;
  color: #e0e2ed;
}
.banner.important {
  border-color: #90745b;
}
.banner.critical {
  border-color: #b76565;
}
.banner small,
.banner strong {
  display: block;
}
.banner small {
  color: #adc6ff;
  font: 600 9px monospace;
  text-transform: uppercase;
}
.banner strong {
  margin-top: 3px;
}
.banner p {
  margin: 5px 0;
  color: #b5bac7;
  font-size: 12px;
  white-space: pre-wrap;
}
.banner a {
  color: #adc6ff;
  font-size: 12px;
}
.banner button {
  align-self: start;
  font-size: 22px;
  color: #aeb4c5;
}
@media (max-width: 760px) {
  .banner {
    margin: 8px 12px;
    gap: 10px;
  }
}
</style>
