<template>
  <form :class="['post-composer', `post-composer--${mode}`]" @submit.prevent="publish">
    <div class="composer-body">
      <UserAvatar :user="auth.user || {}" :size="44" />
      <textarea
        ref="composerInput"
        v-model="content"
        required
        maxlength="5000"
        rows="3"
        placeholder="What are you building today?"
        aria-label="DevLog content"
        @input="grow"
      />
    </div>
    <div v-if="imagePreview" class="composer-preview"
      ><img :src="imagePreview" alt="Selected screenshot preview" /><button
        type="button"
        aria-label="Remove screenshot"
        @click="removeImage"
        ><X :size="16" /></button
    ></div>
    <p v-if="devlogNotice" class="composer-notice"
      ><TerminalSquare :size="14" /> This update will be published as a DevLog.</p
    >
    <p v-if="stackNotice" id="stack-support-notice" class="composer-notice composer-notice--blocked"
      ><CircleAlert :size="14" /> Stack tags cannot be saved until DevLog stack support is
      available.</p
    >
    <p v-if="actionError" class="composer-error" role="alert">{{ actionError }}</p>
    <div class="composer-actions">
      <label class="composer-chip"
        ><ImageIcon :size="16" /><span>Screenshot</span
        ><input
          ref="imageInput"
          class="sr-only"
          type="file"
          accept="image/png,image/jpeg,image/webp"
          @change="chooseImage"
      /></label>
      <button
        type="button"
        class="composer-chip composer-chip--active"
        aria-pressed="true"
        @click="selectDevlog"
        ><TerminalSquare :size="16" /><span>DevLog</span></button
      >
      <button
        type="button"
        class="composer-chip"
        :aria-expanded="stackNotice"
        aria-controls="stack-support-notice"
        @click="stackNotice = !stackNotice"
        ><Layers3 :size="16" /><span>Stack</span></button
      >
      <button :disabled="submitting || !content.trim()" class="composer-submit">{{
        submitting ? "Logging…" : "Log It"
      }}</button>
    </div>
  </form>
</template>

<script setup>
import { CircleAlert, ImageIcon, Layers3, TerminalSquare, X } from "lucide-vue-next";
const props = defineProps({ mode: { type: String, default: "inline" }, autofocus: Boolean });
const emit = defineEmits(["published"]);
const feed = useFeedStore();
const auth = useAuthStore();
const toast = useToastStore();
const content = ref("");
const image = ref(null);
const imagePreview = ref("");
const imageInput = ref(null);
const composerInput = ref(null);
const devlogNotice = ref(false);
const stackNotice = ref(false);
const submitting = ref(false);
const actionError = ref("");
const draftKey = "devconnect:composer-draft";
function grow() {
  const input = composerInput.value;
  if (!input) return;
  input.style.height = "auto";
  input.style.height = `${Math.min(input.scrollHeight, props.mode === "modal" ? 360 : 220)}px`;
  if (props.mode === "modal") {
    if (content.value.trim()) localStorage.setItem(draftKey, content.value);
    else localStorage.removeItem(draftKey);
  }
}
function selectDevlog() {
  devlogNotice.value = true;
  stackNotice.value = false;
  nextTick(() => composerInput.value?.focus());
}
function removeImage() {
  if (imagePreview.value) URL.revokeObjectURL(imagePreview.value);
  image.value = null;
  imagePreview.value = "";
  if (imageInput.value) imageInput.value.value = "";
}
function chooseImage(event) {
  actionError.value = "";
  const selected = event.target.files?.[0];
  if (!selected) return;
  if (
    !["image/jpeg", "image/png", "image/webp"].includes(selected.type) ||
    selected.size > 5 * 1024 * 1024
  ) {
    actionError.value = "Use a JPEG, PNG, or WebP screenshot up to 5 MB.";
    event.target.value = "";
    return;
  }
  removeImage();
  image.value = selected;
  imagePreview.value = URL.createObjectURL(selected);
}
async function publish() {
  submitting.value = true;
  actionError.value = "";
  try {
    const url = image.value ? await feed.upload(image.value) : null;
    await feed.create(content.value.trim(), url);
    content.value = "";
    removeImage();
    devlogNotice.value = false;
    if (props.mode === "modal") localStorage.removeItem(draftKey);
    if (props.mode === "inline") toast.success("DevLog published.");
    emit("published");
  } catch {
    actionError.value = "Could not publish DevLog";
    toast.error("Failed to publish DevLog.");
  } finally {
    submitting.value = false;
  }
}
onMounted(() => {
  if (props.mode === "modal") content.value = localStorage.getItem(draftKey) || "";
  nextTick(() => {
    grow();
    if (props.autofocus) composerInput.value?.focus();
  });
});
onBeforeUnmount(() => {
  if (props.mode === "modal" && content.value.trim()) localStorage.setItem(draftKey, content.value);
  removeImage();
});
</script>

<style scoped>
.post-composer {
  background: rgba(16, 19, 27, 0.56);
}
.post-composer--inline {
  padding: 20px;
  border-bottom: 1px solid rgba(65, 71, 85, 0.3);
  scroll-margin-top: 76px;
}
.composer-body {
  display: flex;
  gap: 13px;
}
.composer-avatar {
  width: 44px;
  height: 44px;
  display: grid;
  place-items: center;
  flex: 0 0 auto;
  overflow: hidden;
  border: 1px solid rgba(173, 198, 255, 0.3);
  border-radius: 50%;
  color: #adc6ff;
  background: #1c2028;
  font:
    500 10px "JetBrains Mono",
    monospace;
}
.composer-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.composer-body textarea {
  width: 100%;
  min-height: 88px;
  padding: 8px 2px;
  border: 0 !important;
  background: transparent !important;
  box-shadow: none !important;
  resize: none;
  overflow-y: auto;
  font-size: 17px;
  line-height: 1.55;
}
.post-composer--modal .composer-body textarea {
  min-height: 210px;
  font-size: 20px;
}
.composer-actions {
  display: flex;
  align-items: center;
  gap: 6px;
  margin: 13px 0 0 57px;
  padding-top: 13px;
  border-top: 1px solid rgba(65, 71, 85, 0.25);
  flex-wrap: wrap;
}
.composer-chip {
  display: flex;
  align-items: center;
  gap: 6px;
  padding: 7px 9px;
  border-radius: 999px;
  color: #adc6ff;
  font:
    500 10px "JetBrains Mono",
    monospace;
}
.composer-chip:hover,
.composer-chip--active {
  background: rgba(75, 142, 255, 0.1);
}
.composer-submit {
  margin-left: auto;
  padding: 9px 20px;
  border-radius: 999px;
  color: #062451;
  background: #adc6ff;
  font:
    700 10px "JetBrains Mono",
    monospace;
}
.composer-submit:disabled {
  opacity: 0.45;
}
.composer-preview {
  position: relative;
  margin: 12px 0 0 57px;
}
.composer-preview img {
  max-height: 280px;
  border: 1px solid #414755;
  border-radius: 14px;
}
.composer-preview button {
  position: absolute;
  top: 8px;
  right: 8px;
  width: 30px;
  height: 30px;
  display: grid;
  place-items: center;
  border-radius: 50%;
  background: #10131b;
}
.composer-notice,
.composer-error {
  display: flex;
  align-items: center;
  gap: 7px;
  margin: 10px 0 0 57px;
  color: #adc6ff;
  font:
    500 10px "JetBrains Mono",
    monospace;
}
.composer-notice--blocked,
.composer-error {
  color: #ffb595;
}
@media (max-width: 760px) {
  .post-composer--inline {
    padding-inline: 14px;
  }
  .composer-actions,
  .composer-preview,
  .composer-notice,
  .composer-error {
    margin-left: 0;
  }
  .composer-chip span {
    display: none;
  }
  .post-composer--modal .composer-chip span {
    display: inline;
  }
}
</style>
