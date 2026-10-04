import { defineStore } from "pinia";

export const useToastStore = defineStore("toast", () => {
  const items = ref([]);
  let sequence = 0;
  function show(message, type = "success") {
    const id = ++sequence;
    items.value.push({ id, message, type });
    setTimeout(() => dismiss(id), 3500);
    return id;
  }
  function success(message) {
    return show(message, "success");
  }
  function error(message) {
    return show(message, "error");
  }
  function dismiss(id) {
    items.value = items.value.filter((item) => item.id !== id);
  }
  return { items, success, error, dismiss };
});
