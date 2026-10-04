<template>
  <Teleport to="body"
    ><div class="toast-region" aria-live="polite" aria-atomic="false"
      ><button
        v-for="item in toast.items"
        :key="item.id"
        :class="['app-toast', `app-toast--${item.type}`]"
        @click="toast.dismiss(item.id)"
        ><CircleCheck v-if="item.type === 'success'" :size="17" /><CircleAlert
          v-else
          :size="17"
        /><span>{{ item.message }}</span></button
      ></div
    ></Teleport
  >
</template>
<script setup>
import { CircleAlert, CircleCheck } from "lucide-vue-next";
const toast = useToastStore();
</script>
<style scoped>
.toast-region {
  position: fixed;
  z-index: 1200;
  right: 20px;
  bottom: 20px;
  display: grid;
  gap: 9px;
  width: min(360px, calc(100vw - 32px));
}
.app-toast {
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  border: 1px solid rgba(173, 198, 255, 0.3);
  border-radius: 12px;
  color: #e0e2ed;
  text-align: left;
  background: #10131b;
  box-shadow: 0 14px 38px rgba(0, 0, 0, 0.45);
  font-size: 12px;
}
.app-toast--success svg {
  color: #73daca;
}
.app-toast--error {
  border-color: rgba(255, 107, 122, 0.35);
}
.app-toast--error svg {
  color: #ff6b7a;
}
@media (max-width: 760px) {
  .toast-region {
    right: 16px;
    bottom: 82px;
  }
}
</style>
