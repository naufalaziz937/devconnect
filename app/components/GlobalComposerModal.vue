<template>
  <Teleport to="body"
    ><div v-if="composer.open" class="composer-overlay" @mousedown.self="close"
      ><section
        ref="dialog"
        class="composer-dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="global-composer-title"
        tabindex="-1"
        @keydown="trap"
        ><header
          ><button aria-label="Close composer" @click="close"><X :size="22" /></button
          ><div
            ><h1 id="global-composer-title">Create DevLog</h1
            ><small v-if="hasDraft">Local draft restored</small></div
          ></header
        ><PostComposer mode="modal" autofocus @published="published" /></section></div
    ><p v-if="success" class="composer-success" role="status">DevLog published.</p></Teleport
  >
</template>
<script setup>
import { X } from "lucide-vue-next";
const composer = useComposerStore();
const dialog = ref(null);
const hasDraft = ref(false);
const success = ref(false);
let successTimer;
function close() {
  composer.closeComposer();
}
function published() {
  composer.closeComposer();
  success.value = true;
  clearTimeout(successTimer);
  successTimer = setTimeout(() => {
    success.value = false;
  }, 2600);
}
function trap(event) {
  if (event.key === "Escape") {
    event.preventDefault();
    close();
    return;
  }
  if (event.key !== "Tab") return;
  const nodes = [
    ...dialog.value.querySelectorAll(
      'button:not(:disabled),input:not(:disabled),textarea:not(:disabled),[href],[tabindex]:not([tabindex="-1"])',
    ),
  ];
  if (!nodes.length) return;
  const first = nodes[0];
  const last = nodes[nodes.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  } else if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
}
watch(
  () => composer.open,
  (value) => {
    if (!import.meta.client) return;
    document.body.style.overflow = value ? "hidden" : "";
    const app = document.getElementById("authenticated-app-content");
    if (value) app?.setAttribute("inert", "");
    else app?.removeAttribute("inert");
    if (value) {
      hasDraft.value = Boolean(localStorage.getItem("devconnect:composer-draft"));
      nextTick(() => dialog.value?.focus());
    }
  },
);
onBeforeUnmount(() => {
  clearTimeout(successTimer);
  if (import.meta.client) {
    document.body.style.overflow = "";
    document.getElementById("authenticated-app-content")?.removeAttribute("inert");
  }
});
</script>
<style scoped>
.composer-overlay {
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: grid;
  place-items: start center;
  padding: 7vh 18px;
  background: rgba(0, 0, 0, 0.68);
  backdrop-filter: blur(3px);
}
.composer-dialog {
  width: min(680px, 100%);
  max-height: 86vh;
  overflow-y: auto;
  border: 1px solid rgba(173, 198, 255, 0.22);
  border-radius: 20px;
  color: #e0e2ed;
  background: #10131b;
  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.52);
}
.composer-dialog > header {
  display: flex;
  align-items: center;
  gap: 14px;
  padding: 15px 18px;
  border-bottom: 1px solid rgba(65, 71, 85, 0.3);
}
.composer-dialog > header button {
  width: 36px;
  height: 36px;
  display: grid;
  place-items: center;
  border-radius: 50%;
}
.composer-dialog > header button:hover {
  background: #1c2028;
}
.composer-dialog h1 {
  font-size: 14px;
  font-weight: 650;
}
.composer-dialog small {
  display: block;
  margin-top: 2px;
  color: #858b9b;
  font:
    500 8px "JetBrains Mono",
    monospace;
}
.composer-dialog :deep(.post-composer) {
  padding: 20px;
}
@media (max-width: 760px) {
  .composer-overlay {
    padding: 0;
  }
  .composer-dialog {
    width: 100%;
    height: 100dvh;
    max-height: none;
    border: 0;
    border-radius: 0;
  }
  .composer-dialog :deep(.post-composer) {
    min-height: calc(100dvh - 67px);
    display: flex;
    flex-direction: column;
  }
  .composer-dialog :deep(.composer-actions) {
    margin-top: auto;
    position: sticky;
    bottom: 0;
    background: #10131b;
  }
}
.composer-success {
  position: fixed;
  z-index: 1001;
  right: 22px;
  bottom: 22px;
  padding: 12px 16px;
  border: 1px solid rgba(173, 198, 255, 0.3);
  border-radius: 12px;
  color: #adc6ff;
  background: #10131b;
  box-shadow: 0 12px 34px rgba(0, 0, 0, 0.4);
  font:
    600 10px "JetBrains Mono",
    monospace;
}
</style>
