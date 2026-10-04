<template>
  <div v-if="open" class="overlay" @click.self="$emit('close')"
    ><form @submit.prevent="submit"
      ><h2>Report {{ label }}</h2
      ><p>Tell us why you're reporting this.</p
      ><label v-for="option in reasons" :key="option.value"
        ><input v-model="reason" type="radio" :value="option.value" /> {{ option.label }}</label
      ><textarea
        v-model.trim="details"
        maxlength="2000"
        placeholder="Additional details (optional)"
      /><p v-if="error" class="error">{{ error }}</p
      ><footer
        ><button type="button" @click="$emit('close')">Cancel</button
        ><button :disabled="loading || !reason">{{
          loading ? "Submitting…" : "Submit Report"
        }}</button></footer
      ></form
    ></div
  >
</template>
<script setup>
const props = defineProps({
  open: Boolean,
  targetType: String,
  targetId: [String, Number],
  label: { type: String, default: "content" },
});
const emit = defineEmits(["close", "submitted"]);
const api = useApi(),
  toast = useToastStore(),
  platform = usePlatformSettingsStore(),
  reason = ref(""),
  details = ref(""),
  loading = ref(false),
  error = ref("");
platform.fetchConfig().catch(() => {});
const reasons = [
  ["spam", "Spam"],
  ["harassment", "Harassment"],
  ["hate_abuse", "Hate or abusive content"],
  ["scam", "Misleading / scam"],
  ["inappropriate", "Inappropriate content"],
  ["intellectual_property", "Intellectual property"],
  ["other", "Other"],
].map(([value, label]) => ({ value, label }));
async function submit() {
  if (platform.config && !platform.config.reportsEnabled) {
    error.value = "User reports are currently unavailable.";
    return;
  }
  if (reason.value === "other" && !details.value) {
    error.value = "Please add details for Other.";
    return;
  }
  loading.value = true;
  error.value = "";
  try {
    await api("/reports", {
      method: "POST",
      body: {
        targetType: props.targetType,
        targetId: props.targetId,
        reason: reason.value,
        details: details.value || undefined,
      },
    });
    toast.success("Report submitted. Thanks for helping keep DevConnect safe.");
    emit("submitted");
    emit("close");
    reason.value = "";
    details.value = "";
  } catch (e) {
    error.value = e?.data?.message || "Could not submit report";
  } finally {
    loading.value = false;
  }
}
</script>
<style scoped>
.overlay {
  position: fixed;
  z-index: 200;
  inset: 0;
  display: grid;
  place-items: center;
  background: #000a;
}
.overlay form {
  display: grid;
  gap: 12px;
  width: min(480px, calc(100% - 32px));
  padding: 24px;
  border: 1px solid #414755;
  border-radius: 15px;
  background: #171a21;
  color: #e0e2ed;
}
.overlay p {
  color: #9da3b4;
}
.overlay label {
  font-size: 14px;
}
.overlay textarea {
  min-height: 100px;
  padding: 10px;
  border: 1px solid #414755;
  border-radius: 8px;
  background: #10131b;
  color: #e0e2ed;
}
.overlay footer {
  display: flex;
  justify-content: flex-end;
  gap: 9px;
}
.overlay button {
  padding: 9px 13px;
  border-radius: 8px;
  color: #adc6ff;
}
.overlay footer button:last-child {
  background: #adc6ff;
  color: #07152a;
}
.error {
  color: #ff9e99 !important;
}
</style>
