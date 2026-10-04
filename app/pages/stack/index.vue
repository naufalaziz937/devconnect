<template>
  <div class="admin-page"
    ><AppSidebar /><main
      ><header
        ><div
          ><p>MANAGEMENT</p><h1>Stacks</h1
          ><span>Manage technologies used across DevConnect.</span></div
        ><button @click="editing = { name: '', slug: '', category: '', isActive: true }"
          >+ Add Stack</button
        ></header
      ><section class="metrics"
        ><article
          ><small>Total Stacks</small><strong>{{ store.summary.total ?? "—" }}</strong></article
        ><article
          ><small>Active Stacks</small><strong>{{ store.summary.active ?? "—" }}</strong></article
        ><article
          ><small>Projects Using Stacks</small
          ><strong>{{ store.summary.projects ?? "—" }}</strong></article
        ></section
      ><section class="tools"
        ><input v-model="filters.search" placeholder="Search stacks" @input="debounced" /><select
          v-model="filters.status"
          @change="load"
          ><option value="active">Active</option
          ><option value="inactive">Inactive</option
          ><option value="all">All</option></select
        ></section
      ><p v-if="store.loading">Loading stacks…</p
      ><p v-else-if="!store.items.length">No stacks yet.</p
      ><table v-else
        ><thead
          ><tr><th>Stack</th><th>Category</th><th>Projects</th><th>Status</th><th /></tr></thead
        ><tbody
          ><tr v-for="item in store.items" :key="item.id"
            ><td
              ><strong>{{ item.name }}</strong
              ><small>{{ item.slug }}</small></td
            ><td>{{ item.category || "—" }}</td
            ><td>{{ item.projects }}</td
            ><td>{{ item.isActive ? "Active" : "Inactive" }}</td
            ><td><button @click="editing = { ...item }">Edit</button></td></tr
          ></tbody
        ></table
      ><div v-if="editing" class="modal"
        ><form @submit.prevent="save"
          ><h2>{{ editing.id ? "Edit" : "Add" }} Stack</h2
          ><input v-model.trim="editing.name" placeholder="Name" required /><input
            v-model.trim="editing.slug"
            placeholder="Slug (optional)"
          /><input v-model.trim="editing.category" placeholder="Category" /><label
            ><input v-model="editing.isActive" type="checkbox" /> Active and selectable</label
          ><button>Save</button><button type="button" @click="editing = null">Cancel</button></form
        ></div
      ></main
    ></div
  >
</template>
<script setup>
const store = useAdminStacksStore(),
  toast = useToastStore(),
  editing = ref(null),
  filters = reactive({ page: 1, limit: 30, search: "", status: "active", sort: "name" });
let timer;
const load = () => store.fetch(filters);
const debounced = () => {
  clearTimeout(timer);
  timer = setTimeout(load, 300);
};
await load();
async function save() {
  if (editing.value.id) await store.update(editing.value.id, editing.value);
  else await store.create(editing.value);
  editing.value = null;
  await load();
  toast.success("Stack saved");
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
  max-width: 1100px;
  margin: auto;
  padding: 34px 28px;
}
header {
  display: flex;
  justify-content: space-between;
  gap: 20px;
}
header p {
  color: #adc6ff;
  font: 600 10px monospace;
  letter-spacing: 0.14em;
}
h1 {
  font-size: 32px;
}
header span,
small {
  color: #969cac;
}
button {
  padding: 9px 12px;
  border: 1px solid #414755;
  border-radius: 8px;
  color: #adc6ff;
}
.metrics {
  display: grid;
  grid-template-columns: repeat(3, 1fr);
  gap: 12px;
  margin: 28px 0;
}
.metrics article {
  padding: 16px;
  border: 1px solid #303642;
  border-radius: 12px;
  background: #151923;
}
.metrics strong {
  display: block;
  margin-top: 8px;
  font-size: 27px;
}
.tools {
  display: flex;
  gap: 10px;
  margin-bottom: 16px;
}
.tools input,
.tools select,
input {
  padding: 10px;
  border: 1px solid #414755;
  border-radius: 8px;
  background: #10131b;
  color: #e0e2ed;
}
.tools input {
  flex: 1;
}
table {
  width: 100%;
  border-collapse: collapse;
  background: #151923;
}
th,
td {
  padding: 13px;
  text-align: left;
  border-bottom: 1px solid #303642;
}
td small {
  display: block;
  margin-top: 4px;
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
@media (max-width: 900px) {
  .admin-page {
    padding-left: 0;
  }
  .admin-page main {
    padding: 78px 16px;
  }
  .metrics {
    grid-template-columns: 1fr;
  }
  .tools {
    flex-wrap: wrap;
  }
}
</style>
