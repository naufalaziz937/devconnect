<template>
  <div class="create-shell"
    ><AppSidebar /><main class="create-main"
      ><header
        ><span>PROJECTS / CREATE</span><h1>Create project</h1
        ><p>Share what you are building and open the door to collaborators.</p></header
      ><StateMessage
        v-if="platform.config && !platform.config.projectCreationEnabled"
        message="Project creation is currently unavailable." /><ProjectForm
        v-else
        ref="projectForm"
        :model="form"
        :submitting="submitting"
        :error="error"
        @submit="createProject" /></main
    ><AppRightSidebar
      ><section class="create-note"
        ><Sparkles :size="22" /><h2>Build in public</h2
        ><p
          >Your project becomes discoverable to other developers as soon as it is created.</p
        ></section
      ><section class="create-note"
        ><UsersRound :size="22" /><h2>Collaboration</h2
        ><p>An open project allows authenticated developers to request membership.</p></section
      ></AppRightSidebar
    ></div
  >
</template>
<script setup>
import { Sparkles, UsersRound } from "lucide-vue-next";
definePageMeta({ middleware: "auth" });
const store = useTeammatesStore();
const toast = useToastStore();
const platform = usePlatformSettingsStore();
const form = reactive({
  title: "",
  description: "",
  needed_skills: [],
  project_type: "",
  max_members: 2,
});
const submitting = ref(false);
const error = ref("");
const projectForm = ref(null);
await platform.fetchConfig().catch(() => {});
async function createProject() {
  if (platform.config && !platform.config.projectCreationEnabled) {
    error.value = "Project creation is currently unavailable.";
    return;
  }
  projectForm.value?.addSkills();
  submitting.value = true;
  error.value = "";
  try {
    const created = await store.create({ ...form });
    toast.success("Project created.");
    await navigateTo(`/projects/${created.id}`);
  } catch (e) {
    error.value = e?.data?.message || "Could not create project";
    toast.error(error.value);
  } finally {
    submitting.value = false;
  }
}
</script>
<style scoped>
.create-shell {
  min-height: 100vh;
  padding-left: var(--sidebar-width);
  display: grid;
  grid-template-columns: minmax(560px, 720px) minmax(280px, 330px);
  justify-content: center;
  gap: 28px;
  color: #e0e2ed;
}
.create-main {
  min-width: 0;
  margin: 0 !important;
  padding: 40px 0 80px !important;
  max-width: none !important;
}
.create-main > header {
  padding: 0 4px 24px;
}
.create-main > header span {
  color: #adc6ff;
  font:
    600 9px "JetBrains Mono",
    monospace;
  letter-spacing: 0.14em;
}
.create-main h1 {
  margin-top: 5px;
  font-size: 31px;
  font-weight: 680;
}
.create-main header p {
  margin-top: 6px;
  color: #979dad;
}
.create-note {
  padding: 18px;
  border: 1px solid rgba(65, 71, 85, 0.35);
  border-radius: 16px;
  background: rgba(16, 19, 27, 0.72);
}
.create-note svg {
  color: #adc6ff;
}
.create-note h2 {
  margin-top: 10px;
  font-size: 15px;
  font-weight: 650;
}
.create-note p {
  margin-top: 6px;
  color: #9298a8;
  font-size: 12px;
  line-height: 1.55;
}
@media (max-width: 1080px) {
  .create-shell {
    display: block;
  }
  .create-main {
    width: min(720px, 100%);
    margin: auto !important;
    padding-inline: 16px !important;
  }
}
@media (max-width: 760px) {
  .create-shell {
    padding-left: 0;
  }
  .create-main {
    padding-top: 24px !important;
    padding-bottom: 90px !important;
  }
}
</style>
