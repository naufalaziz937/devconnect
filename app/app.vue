<template>
  <NuxtLoadingIndicator color="#4b8eff" :height="2" :throttle="120" />
  <div id="authenticated-app-content">
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
  </div>
  <GlobalComposerModal v-if="auth.user?.role !== 'admin'" />
  <AppToasts />
</template>
<script setup>
const auth = useAuthStore();
</script>
