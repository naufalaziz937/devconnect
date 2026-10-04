<script setup>
definePageMeta({ middleware: "auth" });
await navigateTo("/network", { redirectCode: 301, replace: true });
</script>

<template>
  <span class="sr-only">Redirecting to Network…</span>
</template>
