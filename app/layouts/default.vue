<template>
  <div class="app-frame">
    <div class="app-frame__grid" aria-hidden="true" />
    <div class="app-frame__glow app-frame__glow--one" aria-hidden="true" />
    <div class="app-frame__glow app-frame__glow--two" aria-hidden="true" />
    <div class="app-frame__content"
      ><section v-if="maintenance" class="maintenance"
        ><strong>DEVCONNECT</strong><h1>Maintenance in progress</h1
        ><p>{{ settings.config.maintenanceMessage }}</p
        ><span>Please check back shortly.</span></section
      ><template v-else><AnnouncementBanner /><slot /></template
    ></div>
  </div>
</template>
<script setup>
const settings = usePlatformSettingsStore(),
  auth = useAuthStore();
const maintenance = computed(() => settings.config?.maintenanceMode && auth.user?.role === "user");
onMounted(() => settings.fetchConfig().catch(() => {}));
</script>
<style scoped>
.maintenance {
  min-height: 100vh;
  display: grid;
  place-items: center;
  align-content: center;
  gap: 12px;
  padding: 24px;
  text-align: center;
  color: #e0e2ed;
}
.maintenance > strong {
  color: #adc6ff;
  font:
    800 14px Orbitron,
    sans-serif;
  letter-spacing: 0.12em;
}
.maintenance h1 {
  font-size: 32px;
}
.maintenance p {
  max-width: 600px;
  color: #b7bdca;
  line-height: 1.6;
}
.maintenance span {
  color: #777e8d;
  font-size: 12px;
}
</style>
