<template><AppLoadingScreen /></template>
<script setup>
definePageMeta({ middleware: "auth" });
const route = useRoute();
await navigateTo(`/projects/${route.params.id}`, { replace: true });
</script>
