<template>
  <div class="detail-shell"
    ><AppSidebar /><main class="detail-main"
      ><ProjectDetailSkeleton v-if="store.loading && !project" /><StateMessage
        v-else-if="store.error"
        :message="store.error"
      /><template v-else-if="project"
        ><section v-if="!editing" class="project-hero"
          ><header
            ><div class="owner"
              ><UserAvatar :user="project" :size="40" /><div
                ><NuxtLink :to="`/developers/${project.owner_uuid}`">{{
                  project.username
                }}</NuxtLink
                ><small
                  >@{{ project.username }} · Updated
                  {{ formatDate(project.updated_at || project.created_at) }}</small
                ></div
              ></div
            ><span class="status">{{ project.status }}</span></header
          ><h1>{{ project.title }}</h1
          ><p class="description">{{ project.description }}</p
          ><div class="skills"
            ><span v-for="skill in project.needed_skills" :key="skill">{{ skill }}</span></div
          ><div class="project-facts"
            ><span
              ><UsersRound :size="17" /> {{ project.total_members }} /
              {{ project.max_members }} members</span
            ><span v-if="project.project_type"
              ><FolderKanban :size="17" /> {{ project.project_type }}</span
            ></div
          ><div class="project-actions"
            ><template v-if="owned"
              ><button @click="editing = true"><Pencil :size="16" /> Edit project</button
              ><button class="danger" @click="removeProject"
                ><Trash2 :size="16" /> Delete</button
              ></template
            ><template v-else
              ><button
                v-if="!project.membership_status"
                :disabled="actionLoading"
                class="primary"
                @click="request"
                ><UserPlus :size="16" /> Request to join</button
              ><button
                v-else-if="project.membership_status === 'pending'"
                :disabled="actionLoading"
                @click="cancel"
                >Cancel request</button
              ><button
                v-else-if="project.membership_status === 'accepted'"
                :disabled="actionLoading"
                class="danger"
                @click="leave"
                >Leave project</button
              ><span v-else>Request declined</span></template
            ></div
          ></section
        ><ProjectForm
          v-else
          ref="projectForm"
          :model="editForm"
          :submitting="actionLoading"
          :error="actionError"
          submit-label="Save changes"
          show-status
          @submit="save"
        /><section class="team-section"
          ><div><span>TEAM / MEMBERS</span><h2>Project team</h2></div
          ><StateMessage
            v-if="!memberList.length"
            message="No accepted members or visible requests yet."
          /><article v-for="member in memberList" :key="member.uuid" class="member-row"
            ><UserAvatar :user="member" :size="40" /><NuxtLink :to="`/developers/${member.uuid}`"
              ><strong>{{ member.username }}</strong
              ><small>{{ member.role || "Project member" }}</small></NuxtLink
            ><span class="member-status">{{ member.status }}</span
            ><div v-if="owned" class="member-actions"
              ><button v-if="member.status === 'pending'" @click="accept(member.uuid)"
                >Accept</button
              ><button
                v-if="member.status === 'pending'"
                class="danger"
                @click="reject(member.uuid)"
                >Reject</button
              ><button
                v-if="member.status === 'accepted'"
                class="danger"
                @click="removeMember(member.uuid)"
                >Remove</button
              ></div
            ></article
          ></section
        ></template
      ><p v-if="actionError && !editing" class="action-error">{{ actionError }}</p></main
    ><AppRightSidebar
      ><section v-if="project" class="owner-card"
        ><UserAvatar :user="project" :size="40" /><h2>Project owner</h2
        ><NuxtLink :to="`/developers/${project.owner_uuid}`"
          >@{{ project.username }}</NuxtLink
        ></section
      ><section class="side-card"
        ><h2>Membership</h2
        ><p
          >Open projects accept join requests until their configured member capacity is reached.</p
        ></section
      ></AppRightSidebar
    ></div
  >
</template>
<script setup>
import { FolderKanban, Pencil, Trash2, UserPlus, UsersRound } from "lucide-vue-next";
definePageMeta({ middleware: "auth" });
const route = useRoute();
const store = useTeammatesStore();
const auth = useAuthStore();
const editing = ref(false);
const actionError = ref("");
const actionLoading = ref(false);
const projectForm = ref(null);
const editForm = reactive({
  title: "",
  description: "",
  needed_skills: [],
  project_type: "",
  max_members: 2,
  status: "open",
});
const project = computed(() => store.current);
const memberList = computed(() => store.members[route.params.id] || []);
const owned = computed(() => String(project.value?.id_user) === String(auth.user?.id_user));
async function refresh() {
  await Promise.all([store.fetchOne(route.params.id), store.loadMembers(route.params.id)]);
  if (project.value)
    Object.assign(editForm, {
      title: project.value.title,
      description: project.value.description,
      needed_skills: [...(project.value.needed_skills || [])],
      project_type: project.value.project_type || "",
      max_members: project.value.max_members,
      status: project.value.status,
    });
}
async function act(fn, fallback) {
  actionLoading.value = true;
  actionError.value = "";
  try {
    await fn();
    await refresh();
  } catch (err) {
    actionError.value = err?.data?.message || fallback;
  } finally {
    actionLoading.value = false;
  }
}
const request = () => act(() => store.request(route.params.id), "Could not request membership");
const cancel = () => act(() => store.cancel(route.params.id), "Could not cancel request");
const leave = () => act(() => store.leave(route.params.id), "Could not leave project");
const accept = (uuid) =>
  act(() => store.acceptUuid(route.params.id, uuid), "Could not accept member");
const reject = (uuid) =>
  act(() => store.rejectUuid(route.params.id, uuid), "Could not reject request");
const removeMember = (uuid) =>
  act(() => store.removeMember(route.params.id, uuid), "Could not remove member");
async function save() {
  projectForm.value?.addSkills();
  await act(() => store.update(route.params.id, { ...editForm }), "Could not update project");
  if (!actionError.value) editing.value = false;
}
async function removeProject() {
  if (!confirm("Delete this project?")) return;
  try {
    await store.remove(route.params.id);
    await navigateTo("/projects");
  } catch (err) {
    actionError.value = err?.data?.message || "Could not delete project";
  }
}
function formatDate(value) {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(
    new Date(value),
  );
}
await refresh();
</script>
<style scoped>
.detail-shell {
  min-height: 100vh;
  padding-left: var(--sidebar-width);
  display: grid;
  grid-template-columns: minmax(560px, 760px) minmax(280px, 330px);
  justify-content: center;
  gap: 28px;
  color: #e0e2ed;
}
.detail-main {
  min-width: 0;
  margin: 0 !important;
  padding: 34px 0 80px !important;
  max-width: none !important;
}
.project-hero {
  padding: 25px 22px;
  border-bottom: 1px solid rgba(65, 71, 85, 0.35);
}
.project-hero > header {
  display: flex;
  justify-content: space-between;
}
.owner {
  display: flex;
  gap: 10px;
  align-items: center;
}
.owner-avatar,
.member-avatar {
  width: 40px;
  height: 40px;
  display: grid;
  place-items: center;
  border: 1px solid rgba(173, 198, 255, 0.28);
  border-radius: 50%;
  color: #adc6ff;
  background: #1c2028;
  font:
    600 9px "JetBrains Mono",
    monospace;
}
.owner a {
  font-size: 13px;
  font-weight: 650;
}
.owner small {
  display: block;
  color: #858b9b;
  font-size: 10px;
}
.status,
.member-status {
  height: max-content;
  padding: 5px 8px;
  border: 1px solid rgba(173, 198, 255, 0.24);
  border-radius: 999px;
  color: #adc6ff;
  font:
    600 8px "JetBrains Mono",
    monospace;
  text-transform: uppercase;
}
.project-hero h1 {
  margin-top: 25px;
  font-size: 34px;
  font-weight: 700;
}
.description {
  margin-top: 12px;
  color: #c1c6d7;
  line-height: 1.7;
  white-space: pre-wrap;
}
.skills {
  display: flex;
  flex-wrap: wrap;
  gap: 7px;
  margin-top: 17px;
}
.skills span {
  padding: 6px 9px;
  border: 1px solid #414755;
  border-radius: 999px;
  color: #adc6ff;
  font:
    500 9px "JetBrains Mono",
    monospace;
}
.project-facts,
.project-actions {
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  margin-top: 19px;
  color: #949aaa;
  font-size: 11px;
}
.project-facts span,
.project-actions button {
  display: flex;
  align-items: center;
  gap: 6px;
}
.project-actions button {
  color: #adc6ff;
}
.project-actions .primary {
  padding: 9px 13px;
  border-radius: 999px;
  color: #062451;
  background: #adc6ff;
}
.danger {
  color: #ff8b86 !important;
}
.team-section {
  padding: 25px 22px;
}
.team-section > div > span {
  color: #adc6ff;
  font:
    600 9px "JetBrains Mono",
    monospace;
}
.team-section h2 {
  margin-top: 4px;
  font-size: 21px;
  font-weight: 650;
}
.member-row {
  display: grid;
  grid-template-columns: 40px minmax(0, 1fr) auto auto;
  gap: 10px;
  align-items: center;
  padding: 13px 0;
  border-bottom: 1px solid rgba(65, 71, 85, 0.28);
}
.member-row strong,
.member-row small {
  display: block;
}
.member-row small {
  color: #858b9b;
  font-size: 9px;
}
.member-actions {
  display: flex;
  gap: 8px;
  font-size: 10px;
}
.member-actions button {
  color: #adc6ff;
}
.action-error {
  padding: 14px 22px;
  color: #ffb595;
}
.owner-card,
.side-card {
  padding: 18px;
  border: 1px solid rgba(65, 71, 85, 0.35);
  border-radius: 16px;
  background: rgba(16, 19, 27, 0.72);
}
.owner-card h2,
.side-card h2 {
  margin-top: 10px;
  font-size: 15px;
  font-weight: 650;
}
.owner-card a {
  color: #adc6ff;
  font-size: 11px;
}
.side-card p {
  margin-top: 6px;
  color: #9298a8;
  font-size: 12px;
  line-height: 1.55;
}
@media (max-width: 1080px) {
  .detail-shell {
    display: block;
  }
  .detail-main {
    width: min(760px, 100%);
    margin: auto !important;
  }
}
@media (max-width: 760px) {
  .detail-shell {
    padding-left: 0;
  }
  .detail-main {
    padding-top: 18px !important;
    padding-bottom: 90px !important;
  }
  .member-row {
    grid-template-columns: 40px 1fr auto;
  }
  .member-actions {
    grid-column: 2/-1;
  }
}
</style>
