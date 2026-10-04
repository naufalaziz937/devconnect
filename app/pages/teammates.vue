<template><AppLoadingScreen /></template>
<script setup>
definePageMeta({ middleware: "auth" });
await navigateTo("/projects", { replace: true });
</script>
