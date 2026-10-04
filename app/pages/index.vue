<template><AppLoadingScreen /></template>
<script setup>
const auth = useAuthStore();
await auth.initialize();
await navigateTo(auth.user?.id_user ? "/feed" : "/login", { replace: true });
</script>
