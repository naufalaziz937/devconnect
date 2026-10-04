<template>
  <section class="management-placeholder"
    ><p>PLATFORM MANAGEMENT</p><h1>{{ title }}</h1
    ><span
      >This module is prepared for its dedicated management workflow. No placeholder statistics or
      records are displayed.</span
    ></section
  >
</template>
<script setup>
defineProps({ title: { type: String, required: true } });
</script>
<style scoped>
.management-placeholder {
  max-width: 760px;
  padding: 42px;
  border: 1px solid #2c2c2e;
  background: #141415;
}
.management-placeholder p {
  color: #adc6ff;
  font:
    600 10px "JetBrains Mono",
    monospace;
  letter-spacing: 0.14em;
}
.management-placeholder h1 {
  margin: 8px 0 12px;
  font:
    700 32px Geist,
    sans-serif;
}
.management-placeholder span {
  display: block;
  color: #9da3b4;
  line-height: 1.6;
}
</style>
