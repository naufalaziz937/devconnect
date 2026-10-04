<template>
  <div class="min-h-screen bg-[#0B1120] text-white"
    ><AppNav /><main class="mx-auto max-w-3xl px-4 py-8 space-y-5">
      <DevlogSkeleton v-if="loading" /><StateMessage v-else-if="error" :message="error" />
      <article v-else-if="item" class="rounded-2xl border border-white/10 bg-white/5 p-5 space-y-4"
        ><div class="flex items-center gap-3"
          ><UserAvatar :user="item" :size="40" /><NuxtLink
            :to="`/developers/${item.user_uuid}`"
            class="font-semibold hover:text-blue-400"
            >{{ item.username }}</NuxtLink
          ><span class="text-xs text-gray-400">{{
            new Date(item.created_at).toLocaleString()
          }}</span></div
        >
        <form v-if="editing" class="space-y-3" @submit.prevent="save">
          <textarea
            v-model="editContent"
            required
            rows="5"
            class="w-full rounded-xl bg-[#111827] p-3"
          /><button class="rounded-lg bg-blue-600 px-4 py-2">Save</button
          ><button type="button" class="ml-2 text-gray-300" @click="editing = false"
            >Cancel</button
          ></form
        ><p v-else class="whitespace-pre-wrap">{{ item.content }}</p
        ><img
          v-if="item.image_url"
          :src="item.image_url"
          alt="DevLog image"
          class="max-h-[32rem] rounded-xl object-contain"
        />
        <div class="flex flex-wrap gap-4 text-sm"
          ><button :disabled="!auth.token || likePending" @click="toggleLike"
            >♥ {{ item.total_likes }} {{ item.liked_by_me ? "Unlike" : "Like" }}</button
          ><template v-if="owned"
            ><button class="text-blue-400" @click="editing = true">Edit</button
            ><button class="text-red-400" @click="remove">Delete</button></template
          ></div
        >
      </article>
      <section v-if="item" class="space-y-3"
        ><h2 class="text-xl font-semibold">Comments</h2
        ><form v-if="auth.token" class="flex gap-2" @submit.prevent="addComment"
          ><input
            v-model="commentText"
            required
            class="flex-1 rounded-xl bg-[#111827] p-3"
            placeholder="Write a comment"
          /><button class="rounded-xl bg-blue-600 px-4">Send</button></form
        ><StateMessage v-if="!comments.length" message="No comments yet." />
        <article
          v-for="comment in comments"
          :key="comment.id"
          class="rounded-xl border border-white/10 bg-white/5 p-4"
          ><div class="flex gap-2"
            ><strong>{{ comment.username }}</strong
            ><small class="text-gray-500">{{
              new Date(comment.created_at).toLocaleString()
            }}</small></div
          ><form
            v-if="editingComment === comment.id"
            class="mt-2 flex gap-2"
            @submit.prevent="saveComment(comment)"
            ><input v-model="commentDraft" class="flex-1 rounded-lg bg-[#111827] p-2" /><button
              class="text-blue-400"
              >Save</button
            ></form
          ><p v-else class="mt-2">{{ comment.content }}</p
          ><div v-if="auth.user?.uuid === comment.user_uuid" class="mt-2 flex gap-3 text-xs"
            ><button class="text-blue-400" @click="startCommentEdit(comment)">Edit</button
            ><button class="text-red-400" @click="removeComment(comment.id)">Delete</button></div
          ></article
        > </section
      ><p v-if="actionError" class="text-red-400">{{ actionError }}</p>
    </main></div
  >
</template>
<script setup>
definePageMeta({ middleware: "auth" });
const route = useRoute();
const feed = useFeedStore();
const auth = useAuthStore();
const item = ref(null);
const comments = ref([]);
const loading = ref(true);
const error = ref("");
const actionError = ref("");
const editing = ref(false);
const editContent = ref("");
const commentText = ref("");
const editingComment = ref(null);
const commentDraft = ref("");
const likePending = ref(false);
const toast = useToastStore();
const owned = computed(() => String(item.value?.id_user) === String(auth.user?.id_user));
async function load() {
  loading.value = true;
  try {
    item.value = await feed.fetchOne(route.params.id);
    editContent.value = item.value.content;
    comments.value = (await feed.loadCommentsPage(route.params.id)).items;
  } catch (err) {
    error.value = err?.data?.message || "Could not load DevLog";
  } finally {
    loading.value = false;
  }
}
async function save() {
  try {
    item.value = await feed.update(item.value.id, { content: editContent.value });
    editing.value = false;
  } catch (err) {
    actionError.value = err?.data?.message || "Could not update DevLog";
  }
}
async function remove() {
  if (!confirm("Delete this DevLog?")) return;
  try {
    await feed.remove(item.value.id);
    await navigateTo("/feed");
  } catch (err) {
    actionError.value = err?.data?.message || "Could not delete DevLog";
  }
}
async function toggleLike() {
  if (likePending.value) return;
  likePending.value = true;
  try {
    if (item.value.liked_by_me) await feed.unlike(item.value.id);
    else await feed.like(item.value.id);
    item.value = await feed.fetchOne(item.value.id);
  } catch {
    actionError.value = "Could not update like";
    toast.error("Failed to update Like.");
  } finally {
    likePending.value = false;
  }
}
async function addComment() {
  try {
    await feed.addComment(item.value.id, commentText.value);
    commentText.value = "";
    await load();
  } catch (err) {
    actionError.value = err?.data?.message || "Could not comment";
  }
}
function startCommentEdit(comment) {
  editingComment.value = comment.id;
  commentDraft.value = comment.content;
}
async function saveComment(comment) {
  try {
    await feed.updateComment(comment.id, commentDraft.value);
    editingComment.value = null;
    await load();
  } catch (err) {
    actionError.value = err?.data?.message || "Could not update comment";
  }
}
async function removeComment(id) {
  try {
    await feed.deleteComment(id);
    await load();
  } catch (err) {
    actionError.value = err?.data?.message || "Could not delete comment";
  }
}
await load();
</script>
