<template>
  <div class="edit-shell"
    ><AppSidebar /><main class="edit-main">
      <header class="edit-header"
        ><div><span>PROFILE / SETTINGS</span><h1>Edit Profile</h1></div
        ><div
          ><NuxtLink to="/profile">Cancel</NuxtLink
          ><button form="profile-form" :disabled="saving">{{
            saving ? "Saving…" : "Save Changes"
          }}</button></div
        ></header
      >
      <ProfileSkeleton v-if="store.loading && !store.profile" /><StateMessage
        v-else-if="store.error && !store.profile"
        :message="store.error"
      />
      <form v-else-if="store.profile" id="profile-form" class="edit-form" @submit.prevent="save">
        <section class="avatar-section"
          ><UserAvatar
            :user="{ ...store.profile, avatar_url: avatarPreview || store.profile.avatar_url }"
            :size="88"
            alt="Current avatar" /><div
            ><strong>Profile picture</strong><p>PNG, JPEG, or WebP. Maximum 5 MB.</p
            ><label
              >Choose image<input
                type="file"
                accept="image/png,image/jpeg,image/webp"
                @change="chooseAvatar" /></label></div
        ></section>
        <section class="form-section"
          ><h2>Identity</h2
          ><label>Display name<input v-model="form.display_name" maxlength="100" /></label
          ><label class="wide">Bio<textarea v-model="form.bio" maxlength="1000" rows="5" /></label
        ></section>
        <section class="form-section"
          ><h2>Developer profile</h2
          ><label
            >Favorite technology<input
              v-model="form.favorite_tech"
              maxlength="150"
              placeholder="Nuxt, Node.js, PostgreSQL" /></label
          ><label
            >Collaboration status<input
              v-model="form.collaboration_status"
              maxlength="50"
              placeholder="Open to collaborate" /></label
          ><label>Location<input v-model="form.location" maxlength="150" /></label
        ></section>
        <section class="form-section"
          ><h2>Links</h2
          ><label>GitHub username<input v-model="form.github_username" maxlength="100" /></label
          ><label>Portfolio URL<input v-model="form.website_url" type="url" /></label
        ></section>
        <p v-if="message" class="form-error">{{ message }}</p>
      </form> </main
    ><AppRightSidebar
      ><section class="edit-help"
        ><h2>Public profile</h2
        ><p
          >Your display name, bio, technology, location, and links appear on your public developer
          profile.</p
        ></section
      ></AppRightSidebar
    ></div
  >
</template>
<script setup>
definePageMeta({ middleware: "auth" });
const store = useProfileStore();
const toast = useToastStore();
const router = useRouter();
const form = reactive({
  display_name: "",
  bio: "",
  github_username: "",
  favorite_tech: "",
  collaboration_status: "",
  location: "",
  website_url: "",
});
const saving = ref(false);
const message = ref("");
const avatarFile = ref(null);
const avatarPreview = ref("");
await store.fetchProfile();
if (store.profile) for (const key of Object.keys(form)) form[key] = store.profile[key] ?? "";
function chooseAvatar(event) {
  const file = event.target.files?.[0];
  if (!file) return;
  avatarFile.value = file;
  if (avatarPreview.value) URL.revokeObjectURL(avatarPreview.value);
  avatarPreview.value = URL.createObjectURL(file);
}
async function save() {
  saving.value = true;
  message.value = "";
  try {
    await store.update({ ...form });
    if (avatarFile.value) await store.uploadAvatar(avatarFile.value);
    toast.success("Profile updated.");
    await router.push("/profile");
  } catch (error) {
    message.value = error?.data?.message || "Could not save profile";
    toast.error("Failed to update profile.");
  } finally {
    saving.value = false;
  }
}
onBeforeUnmount(() => {
  if (avatarPreview.value) URL.revokeObjectURL(avatarPreview.value);
});
</script>
<style scoped>
.edit-shell {
  min-height: 100vh;
  padding-left: var(--sidebar-width);
  display: grid;
  grid-template-columns: minmax(560px, 760px) minmax(280px, 340px);
  justify-content: center;
  gap: 28px;
  color: #e0e2ed;
}
.edit-main {
  min-width: 0;
  padding: 30px 0 80px;
}
.edit-header {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 0 20px 22px;
  border-bottom: 1px solid rgba(65, 71, 85, 0.35);
}
.edit-header span {
  color: #adc6ff;
  font:
    600 9px "JetBrains Mono",
    monospace;
  letter-spacing: 0.14em;
}
.edit-header h1 {
  margin-top: 4px;
  font-size: 30px;
}
.edit-header > div:last-child {
  display: flex;
  align-items: center;
  gap: 10px;
}
.edit-header a,
.edit-header button {
  padding: 10px 15px;
  border-radius: 999px;
  font:
    600 9px "JetBrains Mono",
    monospace;
}
.edit-header a {
  border: 1px solid #414755;
}
.edit-header button {
  color: #061a39;
  background: #adc6ff;
}
.edit-header button:disabled {
  opacity: 0.55;
}
.edit-form {
  display: grid;
}
.avatar-section,
.form-section {
  padding: 22px 20px;
  border-bottom: 1px solid rgba(65, 71, 85, 0.3);
}
.avatar-section {
  display: flex;
  align-items: center;
  gap: 18px;
}
.edit-avatar {
  width: 88px;
  height: 88px;
  display: grid;
  place-items: center;
  overflow: hidden;
  border: 2px solid rgba(173, 198, 255, 0.35);
  border-radius: 50%;
  color: #adc6ff;
  background: #1c2028;
}
.edit-avatar img {
  width: 100%;
  height: 100%;
  object-fit: cover;
}
.avatar-section p {
  margin: 4px 0 10px;
  color: #858b9b;
  font-size: 10px;
}
.avatar-section label {
  display: inline-block;
  padding: 8px 11px;
  border: 1px solid #414755;
  border-radius: 999px;
  color: #adc6ff;
  font-size: 10px;
  cursor: pointer;
}
.avatar-section input {
  display: none;
}
.form-section {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 15px;
}
.form-section h2,
.form-section .wide {
  grid-column: 1/-1;
}
.form-section h2 {
  font-size: 16px;
}
.form-section label {
  display: grid;
  gap: 6px;
  color: #9da3b4;
  font-size: 10px;
}
.form-section input,
.form-section textarea {
  padding: 11px 12px;
  border: 1px solid rgba(65, 71, 85, 0.55);
  border-radius: 10px;
  color: #e0e2ed;
  background: #11151e;
  font-size: 13px;
}
.form-error {
  padding: 14px 20px;
  color: #ffb595;
}
.edit-help {
  padding: 16px;
  border: 1px solid rgba(65, 71, 85, 0.35);
  border-radius: 16px;
  background: rgba(16, 19, 27, 0.72);
}
.edit-help h2 {
  font-size: 14px;
}
.edit-help p {
  margin-top: 7px;
  color: #9298a8;
  font-size: 11px;
  line-height: 1.55;
}
@media (max-width: 1080px) {
  .edit-shell {
    display: block;
  }
  .edit-main {
    width: min(800px, 100%);
    margin: auto;
  }
}
@media (max-width: 760px) {
  .edit-shell {
    padding-left: 0;
  }
  .edit-main {
    padding-top: 18px;
    padding-bottom: 90px;
  }
  .edit-header {
    align-items: flex-start;
  }
  .edit-header h1 {
    font-size: 25px;
  }
  .form-section {
    grid-template-columns: 1fr;
  }
  .form-section h2,
  .form-section .wide {
    grid-column: auto;
  }
}
</style>
