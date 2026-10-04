<template>
  <form class="project-form" @submit.prevent="$emit('submit')"
    ><section
      ><div class="form-heading"
        ><span>01</span
        ><div
          ><h2>Project information</h2
          ><p>Describe what you are building and why it matters.</p></div
        ></div
      ><label
        >Project name *<input
          v-model="model.title"
          required
          maxlength="150"
          placeholder="Project name" /></label
      ><label
        >Description *<textarea
          v-model="model.description"
          required
          maxlength="5000"
          rows="7"
          placeholder="What does the project do?"
        /></label
      ><label
        >Project type<input
          v-model="model.project_type"
          maxlength="80"
          placeholder="Open source, SaaS, mobile app…" /></label></section
    ><section
      ><div class="form-heading"
        ><span>02</span
        ><div><h2>Technology</h2><p>Add the technologies contributors should know.</p></div></div
      ><label
        >Tech stack<input
          v-model="skillsText"
          maxlength="500"
          placeholder="Nuxt, Node.js, PostgreSQL"
          @keydown.enter.prevent="addSkills" /></label
      ><div v-if="skills.length" class="skill-list"
        ><button v-for="skill in skills" :key="skill" type="button" @click="removeSkill(skill)"
          >{{ skill }} <X :size="12" /></button></div
      ><p class="field-note"
        >Separate technologies with commas. Up to 30 skills can be saved.</p
      ></section
    ><section
      ><div class="form-heading"
        ><span>03</span
        ><div><h2>Collaboration</h2><p>Set the project capacity and discovery status.</p></div></div
      ><label
        >Maximum members *<input
          v-model.number="model.max_members"
          required
          type="number"
          min="1"
          max="100" /></label
      ><label v-if="showStatus"
        >Status<select v-model="model.status"
          ><option value="open">Open</option
          ><option value="closed">Closed</option
          ><option value="completed">Completed</option></select
        ></label
      ></section
    ><p v-if="error" class="form-error">{{ error }}</p
    ><div class="form-actions"
      ><NuxtLink to="/projects">Cancel</NuxtLink
      ><button :disabled="submitting">{{
        submitting ? "Saving project…" : submitLabel
      }}</button></div
    ></form
  >
</template>
<script setup>
import { X } from "lucide-vue-next";
const props = defineProps({
  model: { type: Object, required: true },
  submitting: Boolean,
  error: { type: String, default: "" },
  submitLabel: { type: String, default: "Create project" },
  showStatus: Boolean,
});
defineEmits(["submit"]);
const skillsText = ref("");
const skills = computed(() => props.model.needed_skills || []);
function addSkills() {
  const next = skillsText.value
    .split(",")
    .map((value) => value.trim())
    .filter(Boolean);
  props.model.needed_skills = [...new Set([...skills.value, ...next])].slice(0, 30);
  skillsText.value = "";
}
function removeSkill(skill) {
  props.model.needed_skills = skills.value.filter((value) => value !== skill);
}
watch(skillsText, (value) => {
  if (value.includes(",")) addSkills();
});
defineExpose({ addSkills });
</script>
<style scoped>
.project-form {
  display: grid;
  gap: 16px;
}
.project-form section {
  display: grid;
  gap: 14px;
  padding: 22px;
  border: 1px solid rgba(65, 71, 85, 0.4);
  border-radius: 16px;
  background: rgba(16, 19, 27, 0.72);
}
.form-heading {
  display: flex;
  gap: 12px;
  padding-bottom: 14px;
  border-bottom: 1px solid rgba(65, 71, 85, 0.28);
}
.form-heading > span {
  color: #adc6ff;
  font:
    600 10px "JetBrains Mono",
    monospace;
}
.form-heading h2 {
  font-size: 18px;
  font-weight: 650;
}
.form-heading p {
  margin-top: 3px;
  color: #8d93a3;
  font-size: 12px;
}
.project-form label {
  display: grid;
  gap: 7px;
  font:
    500 11px "JetBrains Mono",
    monospace;
}
.project-form input,
.project-form textarea,
.project-form select {
  width: 100%;
  padding: 12px;
}
.skill-list {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
}
.skill-list button {
  display: flex;
  align-items: center;
  gap: 5px;
  padding: 6px 9px;
  border: 1px solid rgba(173, 198, 255, 0.25);
  border-radius: 999px;
  color: #adc6ff;
  background: rgba(75, 142, 255, 0.08);
  font:
    500 9px "JetBrains Mono",
    monospace;
}
.field-note {
  color: #777d8d;
  font-size: 10px;
}
.form-error {
  color: #ffb595;
}
.form-actions {
  display: flex;
  justify-content: flex-end;
  align-items: center;
  gap: 18px;
  padding-top: 8px;
}
.form-actions a {
  color: #9da3b4;
}
.form-actions button {
  padding: 11px 18px;
  border-radius: 999px;
  color: #062451;
  background: #adc6ff;
  font:
    600 11px "JetBrains Mono",
    monospace;
}
.form-actions button:disabled {
  opacity: 0.5;
}
</style>
