import { defineStore } from "pinia";

export const useComposerStore = defineStore("composer", () => {
  const open = ref(false);
  let trigger = null;
  function openComposer(event) {
    trigger =
      event?.currentTarget instanceof HTMLElement ? event.currentTarget : document.activeElement;
    open.value = true;
  }
  function closeComposer() {
    open.value = false;
    nextTick(() => trigger?.focus?.());
  }
  return { open, openComposer, closeComposer };
});
