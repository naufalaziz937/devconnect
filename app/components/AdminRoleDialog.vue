<template>
  <div class="modal" role="presentation" @click.self="$emit('close')"
    ><section role="dialog" aria-modal="true" aria-labelledby="role-title"
      ><h2 id="role-title">Change role</h2
      ><p
        >Change <strong>@{{ user.username }}</strong> from {{ label(user.role) }} to
        {{ label(nextRole) }}?</p
      ><div v-if="isSelf" class="notice">You cannot change your own administrator role.</div
      ><label
        >Role<select v-model="nextRole" :disabled="isSelf || pending"
          ><option value="user">Developer</option
          ><option value="admin">Administrator</option></select
        ></label
      ><div class="actions"
        ><button type="button" @click="$emit('close')">Cancel</button
        ><button
          class="primary"
          type="button"
          :disabled="isSelf || pending || nextRole === user.role"
          @click="$emit('confirm', nextRole)"
          >{{ pending ? "Updating…" : "Confirm" }}</button
        ></div
      ></section
    ></div
  >
</template>
<script setup>
const props = defineProps({
  user: { type: Object, required: true },
  pending: Boolean,
  isSelf: Boolean,
});
defineEmits(["close", "confirm"]);
const nextRole = ref(props.user.role);
const label = (v) => (v === "admin" ? "Administrator" : "Developer");
</script>
<style scoped>
.modal {
  position: fixed;
  z-index: 500;
  inset: 0;
  display: grid;
  place-items: center;
  padding: 18px;
  background: rgba(0, 0, 0, 0.7);
}
section {
  width: min(440px, 100%);
  padding: 22px;
  border: 1px solid #414755;
  border-radius: 14px;
  background: #141821;
  box-shadow: 0 24px 70px rgba(0, 0, 0, 0.55);
}
h2 {
  margin: 0 0 8px;
  font-size: 20px;
}
p {
  margin: 0 0 18px;
  color: #aeb4c5;
  line-height: 1.55;
}
.notice {
  margin-bottom: 14px;
  padding: 10px;
  border-radius: 8px;
  color: #ffd18a;
  background: rgba(255, 179, 71, 0.1);
  font-size: 12px;
}
label {
  display: grid;
  gap: 7px;
  color: #858b9b;
  font-size: 11px;
}
select {
  height: 42px;
  padding: 0 12px;
  border: 1px solid #414755;
  border-radius: 9px;
  color: #e0e2ed;
  background: #0d1018;
}
.actions {
  display: flex;
  justify-content: flex-end;
  gap: 9px;
  margin-top: 20px;
}
.actions button {
  padding: 9px 14px;
  border: 1px solid #414755;
  border-radius: 8px;
  color: #c1c6d7;
}
.actions .primary {
  border-color: #adc6ff;
  color: #07152a;
  background: #adc6ff;
}
.actions button:disabled {
  opacity: 0.45;
}
</style>
