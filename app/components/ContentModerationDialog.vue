<template>
  <div class="modal" @click.self="$emit('close')"
    ><section role="dialog" aria-modal="true" :aria-labelledby="'moderation-title'"
      ><h2 id="moderation-title">{{ action === "hide" ? "Hide" : "Restore" }} {{ subject }}?</h2
      ><p v-if="action === 'hide'">The {{ subject }} will no longer be visible to normal users.</p
      ><p v-else>The {{ subject }} will become visible to normal users again.</p
      ><label
        >Reason<textarea
          v-model.trim="reason"
          rows="3"
          placeholder="Explain this moderation action"
          :disabled="pending"
        /></label
      ><div class="actions"
        ><button type="button" @click="$emit('close')">Cancel</button
        ><button
          type="button"
          :disabled="pending || reason.length < 3"
          class="primary"
          @click="$emit('confirm', reason)"
          >{{ pending ? "Saving…" : action === "hide" ? "Hide" : "Restore" }} {{ subject }}</button
        ></div
      ></section
    ></div
  >
</template>
<script setup>
defineProps({
  action: { type: String, required: true },
  subject: { type: String, default: "content" },
  pending: Boolean,
});
defineEmits(["close", "confirm"]);
const reason = ref("");
</script>
<style scoped>
.modal {
  position: fixed;
  z-index: 500;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 18px;
  background: rgba(0, 0, 0, 0.72);
}
section {
  width: min(440px, 100%);
  padding: 22px;
  border: 1px solid #414755;
  border-radius: 14px;
  background: #141821;
}
h2 {
  margin: 0 0 8px;
  font-size: 20px;
}
p {
  margin: 0 0 16px;
  color: #aeb4c5;
  font-size: 12px;
  line-height: 1.55;
}
label {
  display: grid;
  gap: 7px;
  color: #858b9b;
  font-size: 10px;
}
textarea {
  resize: vertical;
  padding: 10px;
  border: 1px solid #414755;
  border-radius: 8px;
  color: #e0e2ed;
  background: #0d1018;
}
.actions {
  display: flex;
  justify-content: flex-end;
  gap: 9px;
  margin-top: 18px;
}
.actions button {
  padding: 9px 13px;
  border: 1px solid #414755;
  border-radius: 8px;
  color: #c1c6d7;
}
.actions .primary {
  color: #07152a;
  background: #adc6ff;
  border-color: #adc6ff;
}
.actions button:disabled {
  opacity: 0.45;
}
</style>
