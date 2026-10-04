<template>
  <form @submit.prevent="submit(mode)"
    ><label>Title *<input v-model="f.title" maxlength="180" required /></label
    ><label>Message *<textarea v-model="f.content" maxlength="2000" required /></label
    ><div class="grid"
      ><label
        >Type<select v-model="f.type"
          ><option v-for="x in types">{{ x }}</option></select
        ></label
      ><label
        >Priority<select v-model="f.priority"
          ><option v-for="x in priorities">{{ x }}</option></select
        ></label
      ></div
    ><label
      >Audience<select v-model="f.audience"
        ><option value="user">Users</option
        ><option value="admin">Administrators</option
        ><option value="all_users">Everyone</option></select
      ></label
    ><fieldset
      ><legend>Publishing</legend
      ><label><input v-model="mode" type="radio" value="publish" /> Publish now</label
      ><label><input v-model="mode" type="radio" value="schedule" /> Schedule</label
      ><input
        v-if="mode === 'schedule'"
        v-model="f.startsAt"
        type="datetime-local"
        required /></fieldset
    ><label><input v-model="expire" type="checkbox" /> Set expiration</label
    ><input v-if="expire" v-model="f.expiresAt" type="datetime-local" /><fieldset
      ><legend>Optional action</legend><label>CTA label<input v-model="f.ctaLabel" /></label
      ><label
        >CTA URL<input v-model="f.ctaUrl" placeholder="/projects or https://…" /></label></fieldset
    ><p v-if="error" class="error">{{ error }}</p
    ><footer
      ><button type="button" :disabled="saving" @click="submit('draft')">Save Draft</button
      ><button :disabled="saving">{{
        saving ? "Saving…" : mode === "schedule" ? "Schedule" : "Publish"
      }}</button></footer
    ></form
  >
</template>
<script setup>
const p = defineProps({ modelValue: { type: Object, default: () => ({}) }, saving: Boolean });
const emit = defineEmits(["submit"]);
const types = ["general", "feature", "maintenance", "warning"],
  priorities = ["normal", "important", "critical"];
const f = reactive({
  title: "",
  content: "",
  type: "general",
  priority: "normal",
  audience: "user",
  startsAt: "",
  expiresAt: "",
  ctaLabel: "",
  ctaUrl: "",
  ...p.modelValue,
});
const mode = ref(f.status === "scheduled" ? "schedule" : "publish"),
  expire = ref(!!f.expiresAt),
  error = ref("");
function iso(v) {
  return v ? new Date(v).toISOString() : null;
}
function submit(next) {
  error.value = "";
  if (next === "schedule" && !f.startsAt) {
    error.value = "Choose a future start time.";
    return;
  }
  if (
    expire.value &&
    f.expiresAt &&
    new Date(f.expiresAt) <= new Date(next === "schedule" ? f.startsAt : Date.now())
  ) {
    error.value = "Expiration must be after the start time.";
    return;
  }
  emit("submit", {
    ...f,
    startsAt: next === "schedule" ? iso(f.startsAt) : null,
    expiresAt: expire.value ? iso(f.expiresAt) : null,
    mode: next,
  });
}
</script>
<style scoped>
form {
  display: grid;
  gap: 16px;
  max-width: 760px;
  padding: 22px;
  border: 1px solid #303642;
  border-radius: 14px;
  background: #151923;
}
label {
  display: grid;
  gap: 7px;
  font-size: 12px;
}
input,
textarea,
select {
  padding: 10px;
  border: 1px solid #414755;
  border-radius: 8px;
  color: #e0e2ed;
  background: #10131b;
}
textarea {
  min-height: 160px;
  resize: vertical;
}
.grid {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
}
fieldset {
  display: grid;
  gap: 10px;
  border: 0;
  border-top: 1px solid #303642;
  padding-top: 14px;
}
fieldset label {
  display: flex;
  align-items: center;
  gap: 8px;
}
.error {
  color: #ffb595;
}
footer {
  display: flex;
  justify-content: flex-end;
  gap: 10px;
}
button {
  padding: 10px 14px;
  border: 1px solid #414755;
  border-radius: 8px;
  color: #adc6ff;
}
@media (max-width: 600px) {
  .grid {
    grid-template-columns: 1fr;
  }
}
</style>
