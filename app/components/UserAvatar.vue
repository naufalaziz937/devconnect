<template>
  <span class="user-avatar" :style="sizeStyle"
    ><img
      v-if="validSource && !failed"
      :src="validSource"
      :alt="alt"
      loading="lazy"
      referrerpolicy="no-referrer"
      @error="failed = true"
    /><span v-else class="user-avatar__fallback" aria-hidden="true">{{ initials }}</span></span
  >
</template>
<script setup>
const props = defineProps({
  user: { type: Object, default: () => ({}) },
  size: { type: [Number, String], default: 40 },
  alt: { type: String, default: "" },
});
const failed = ref(false);
const validSource = computed(() => {
  const value = props.user?.avatar_url || props.user?.avatar || props.user?.actor_avatar_url;
  if (!value) return "";
  try {
    const url = new URL(value);
    return ["http:", "https:"].includes(url.protocol) ? url.toString() : "";
  } catch {
    return "";
  }
});
const initials = computed(() =>
  String(
    props.user?.display_name ||
      props.user?.actor_display_name ||
      props.user?.username ||
      props.user?.actor_username ||
      "DC",
  )
    .trim()
    .split(/\s+/)
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase(),
);
const sizeStyle = computed(() => ({ "--avatar-size": `${Number(props.size) || 40}px` }));
watch(validSource, () => {
  failed.value = false;
});
</script>
<style scoped>
.user-avatar {
  width: var(--avatar-size);
  height: var(--avatar-size);
  aspect-ratio: 1/1;
  display: flex;
  align-items: center;
  justify-content: center;
  flex: 0 0 var(--avatar-size);
  overflow: hidden;
  border: 1px solid rgba(173, 198, 255, 0.3);
  border-radius: 50%;
  color: #adc6ff;
  background: #1c2028;
  font:
    600 calc(var(--avatar-size) * 0.23) / 1 "JetBrains Mono",
    monospace;
}
.user-avatar img,
.user-avatar__fallback {
  width: 100%;
  height: 100%;
  border-radius: inherit;
}
.user-avatar img {
  display: block;
  object-fit: cover;
  object-position: center;
}
.user-avatar__fallback {
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: center;
}
</style>
