<template>
  <main class="min-h-screen bg-[#0B1120] text-white grid place-items-center p-4"
    ><div class="rounded-2xl border border-white/10 bg-white/5 p-6 text-center"
      ><p>{{ message }}</p
      ><NuxtLink v-if="error" to="/login" class="mt-4 block text-blue-400"
        >Back to sign in</NuxtLink
      ></div
    ></main
  >
</template>
<script setup>
import { getDefaultRoute } from "~/utils/roles";
const auth = useAuthStore();
const message = ref("Signing in with GitHub...");
const error = ref(false);
onMounted(async () => {
  const token = new URLSearchParams(window.location.hash.slice(1)).get("access_token");
  window.history.replaceState(null, "", window.location.pathname);
  if (!token) {
    error.value = true;
    message.value = "GitHub sign in did not return a token.";
    return;
  }
  try {
    await auth.completeOAuth(token);
    await navigateTo(getDefaultRoute(auth.user?.role));
  } catch {
    error.value = true;
    message.value = "GitHub sign in failed.";
  }
});
</script>
