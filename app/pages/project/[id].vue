<template>
  <div class="admin-page"
    ><AppSidebar /><main
      ><NuxtLink to="/project">← Projects</NuxtLink><p v-if="!item">Loading…</p
      ><article v-else
        ><header
          ><div
            ><p>PROJECT</p><h1>{{ item.title }}</h1
            ><span :class="item.moderationStatus">{{ item.moderationStatus }}</span></div
          ><button @click="open = true"
            >{{ item.moderationStatus === "hidden" ? "Restore" : "Hide" }} Project</button
          ></header
        ><p class="description">{{ item.description }}</p
        ><dl
          ><dt>Owner</dt
          ><dd
            ><NuxtLink :to="`/user/${item.owner.id}`">@{{ item.owner.username }}</NuxtLink></dd
          ><dt>Collaboration</dt><dd>{{ item.status }}</dd
          ><dt>Members</dt><dd>{{ item.members }}</dd
          ><dt>Stacks</dt
          ><dd>{{ item.stacks.map((s) => s.name).join(", ") || "None specified" }}</dd></dl
        ></article
      ><div v-if="open" class="modal"
        ><form @submit.prevent="moderate"
          ><h2>{{ item.moderationStatus === "hidden" ? "Restore" : "Hide" }} project?</h2
          ><textarea v-model.trim="reason" minlength="3" placeholder="Reason" /><button
            :disabled="reason.length < 3"
            >Confirm</button
          ><button type="button" @click="open = false">Cancel</button></form
        ></div
      ></main
    ></div
  >
</template>
<script setup>
const route = useRoute(),
  store = useAdminProjectsStore(),
  item = ref(null),
  open = ref(false),
  reason = ref("");
const toast = useToastStore();
item.value = await store.detail(route.params.id);
async function moderate() {
  await store.moderate(
    item.value.id,
    item.value.moderationStatus === "hidden" ? "restore" : "hide",
    reason.value,
  );
  item.value = await store.detail(route.params.id);
  open.value = false;
  reason.value = "";
  toast.success("Project moderation updated");
}
</script>
<style scoped>
.admin-page {
  min-height: 100vh;
  padding-left: 264px;
  background: #10131b;
  color: #e0e2ed;
}
.admin-page main {
  max-width: 880px;
  margin: auto;
  padding: 34px 28px;
}
article {
  margin-top: 24px;
  padding: 24px;
  border: 1px solid #303642;
  border-radius: 14px;
  background: #151923;
}
header {
  display: flex;
  justify-content: space-between;
  gap: 15px;
}
header p {
  color: #adc6ff;
  font: 600 10px monospace;
}
h1 {
  font-size: 30px;
}
.description {
  margin: 24px 0;
  white-space: pre-wrap;
  line-height: 1.6;
  color: #c1c6d7;
}
dl {
  display: grid;
  grid-template-columns: 150px 1fr;
  gap: 14px;
}
dt {
  color: #8e95a5;
}
button {
  padding: 10px 13px;
  border-radius: 8px;
  background: #adc6ff;
  color: #07152a;
}
.hidden {
  color: #ffb595;
}
.modal {
  position: fixed;
  inset: 0;
  display: grid;
  place-items: center;
  background: #0009;
}
.modal form {
  display: grid;
  gap: 12px;
  width: min(420px, calc(100% - 32px));
  padding: 22px;
  border-radius: 14px;
  background: #171a21;
}
.modal textarea {
  min-height: 110px;
  padding: 10px;
  background: #10131b;
  color: #e0e2ed;
}
@media (max-width: 900px) {
  .admin-page {
    padding-left: 0;
  }
  .admin-page main {
    padding: 78px 16px;
  }
}
</style>
