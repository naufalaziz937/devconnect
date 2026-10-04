<template><ProfileExperience :uuid="String(route.params.uuid)" /></template>
<script setup>
definePageMeta({ middleware: "auth" });
const route = useRoute();
</script>
