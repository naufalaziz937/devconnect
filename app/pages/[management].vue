<template><AdminManagementPlaceholder :title="title" /></template>
<script setup>
definePageMeta({ layout: "management", middleware: "management" });
const route = useRoute();
const labels = {
  users: "Users",
  content: "Content",
  stacks: "Stacks",
  reports: "Reports",
  moderation: "Moderation",
  "audit-logs": "Audit Logs",
  "dev-news": "Dev News",
  announcements: "Announcements",
  settings: "Settings",
};
if (!labels[route.params.management])
  throw createError({ statusCode: 404, statusMessage: "Page not found" });
const title = computed(() => labels[route.params.management]);
</script>
