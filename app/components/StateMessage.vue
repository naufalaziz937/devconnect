<template>
  <div class="state-panel"
    ><span class="state-panel__pulse" /><p>{{ message }}</p></div
  >
</template>
<script setup>
defineProps({ message: { type: String, required: true } });
</script>
<style scoped>
.state-panel {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 20px;
  border: 1px solid rgba(65, 71, 85, 0.46);
  border-radius: 12px;
  color: #c1c6d7;
  background: rgba(28, 32, 40, 0.58);
  font:
    400 14px/20px Geist,
    sans-serif;
}
.state-panel__pulse {
  width: 7px;
  height: 7px;
  flex: 0 0 auto;
  border-radius: 50%;
  background: #adc6ff;
  box-shadow: 0 0 10px rgba(173, 198, 255, 0.65);
}
</style>
