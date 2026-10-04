<template><ProfileExperience v-if="auth.user?.uuid" :uuid="auth.user.uuid" /></template>
<script setup>
definePageMeta({ middleware: "auth" });
const auth = useAuthStore();
if (!auth.user) await auth.initialize();
</script>
