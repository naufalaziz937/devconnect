<template>
  <div class="settings-page"
    ><AppSidebar /><main
      ><header
        ><p>PLATFORM</p><h1>Settings</h1
        ><span>Configure platform-wide DevConnect behavior.</span></header
      ><div v-if="store.loading" class="state">Loading platform settings…</div
      ><div v-else-if="store.error" class="state"
        ><p>{{ store.error }}</p
        ><button @click="store.fetchAdmin">Try Again</button></div
      ><div v-else-if="store.settings" class="settings-layout"
        ><nav
          ><button
            v-for="section in sections"
            :class="{ active: selected === section.id }"
            @click="selected = section.id"
            >{{ section.label }}</button
          ></nav
        ><form @submit.prevent="save"
          ><section v-if="selected === 'access'"
            ><h2>Registration & Access</h2
            ><p>Control account creation and temporary platform maintenance.</p
            ><label class="toggle"
              ><span
                ><strong>Allow New Registrations</strong
                ><small
                  >Allow new users to create DevConnect accounts through email or GitHub.</small
                ></span
              ><input
                v-model="store.settings.allowRegistration"
                type="checkbox"
                role="switch" /></label
            ><label class="toggle"
              ><span
                ><strong>Maintenance Mode</strong
                ><small
                  >Temporarily restrict normal user API access while administrators retain
                  access.</small
                ></span
              ><input
                v-model="store.settings.maintenanceMode"
                type="checkbox"
                role="switch" /></label
            ><label v-if="store.settings.maintenanceMode" class="field"
              >Maintenance Message<textarea
                v-model.trim="store.settings.maintenanceMessage"
                maxlength="300"
              /></label></section
          ><section v-if="selected === 'moderation'"
            ><h2>Moderation</h2><p>Control whether users may create new reports.</p
            ><label class="toggle"
              ><span
                ><strong>Allow User Reports</strong
                ><small
                  >Existing reports remain available to administrators when disabled.</small
                ></span
              ><input
                v-model="store.settings.allowReports"
                type="checkbox"
                role="switch" /></label></section
          ><section v-if="selected === 'projects'"
            ><h2>Projects</h2><p>Control creation of new collaboration projects.</p
            ><label class="toggle"
              ><span
                ><strong>Allow Project Creation</strong
                ><small
                  >Existing projects remain visible when new creation is disabled.</small
                ></span
              ><input
                v-model="store.settings.allowProjectCreation"
                type="checkbox"
                role="switch" /></label></section
          ><footer
            ><button type="button" :disabled="!store.dirty || store.saving" @click="store.discard"
              >Discard</button
            ><button :disabled="!store.dirty || store.saving">{{
              store.saving ? "Saving…" : "Save Changes"
            }}</button></footer
          ></form
        ></div
      ></main
    ></div
  >
</template>
<script setup>
const store = usePlatformSettingsStore(),
  toast = useToastStore(),
  selected = ref("access");
const sections = [
  { id: "access", label: "Registration" },
  { id: "moderation", label: "Moderation" },
  { id: "projects", label: "Projects" },
];
await store.fetchAdmin();
async function save() {
  if (
    store.settings.maintenanceMode &&
    !window.confirm(
      "Enable maintenance mode? Normal users will temporarily lose application access.",
    )
  )
    return;
  try {
    await store.save();
    toast.success("Platform settings saved.");
  } catch (e) {
    toast.error(e?.data?.message || "Failed to save platform settings.");
  }
}
</script>
<style scoped>
.settings-page {
  min-height: 100vh;
  padding-left: 264px;
  background: #10131b;
  color: #e0e2ed;
}
.settings-page main {
  max-width: 1050px;
  margin: auto;
  padding: 34px 28px 70px;
}
header p {
  color: #adc6ff;
  font: 600 9px monospace;
  letter-spacing: 0.15em;
}
h1 {
  font-size: 32px;
}
header span,
.state,
form > section > p {
  color: #9198a8;
}
.settings-layout {
  display: grid;
  grid-template-columns: 190px minmax(0, 1fr);
  margin-top: 30px;
  border: 1px solid #303642;
  border-radius: 14px;
  background: #151923;
}
.settings-layout nav {
  padding: 14px;
  border-right: 1px solid #303642;
}
.settings-layout nav button {
  width: 100%;
  padding: 10px;
  border-radius: 8px;
  text-align: left;
  color: #9ca3b3;
}
.settings-layout nav button.active {
  color: #adc6ff;
  background: #1c2028;
}
form {
  padding: 24px;
}
h2 {
  font-size: 20px;
}
.toggle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 20px;
  padding: 18px 0;
  border-bottom: 1px solid #303642;
}
.toggle strong,
.toggle small {
  display: block;
}
.toggle small {
  margin-top: 4px;
  color: #858b9b;
}
.toggle input {
  width: 42px;
  height: 22px;
}
.field {
  display: grid;
  gap: 8px;
  margin-top: 18px;
}
.field textarea {
  min-height: 95px;
  padding: 10px;
  border: 1px solid #414755;
  border-radius: 8px;
  color: #e0e2ed;
  background: #10131b;
}
footer {
  display: flex;
  justify-content: flex-end;
  gap: 9px;
  margin-top: 28px;
}
footer button,
.state button {
  padding: 10px 14px;
  border: 1px solid #414755;
  border-radius: 8px;
  color: #adc6ff;
}
button:disabled {
  opacity: 0.4;
}
.state {
  padding: 70px;
  text-align: center;
}
@media (max-width: 900px) {
  .settings-page {
    padding-left: 0;
  }
  .settings-page main {
    padding: 78px 16px;
  }
  .settings-layout {
    grid-template-columns: 1fr;
  }
  .settings-layout nav {
    display: flex;
    overflow: auto;
    border-right: 0;
    border-bottom: 1px solid #303642;
  }
  .settings-layout nav button {
    width: auto;
    white-space: nowrap;
  }
}
</style>
