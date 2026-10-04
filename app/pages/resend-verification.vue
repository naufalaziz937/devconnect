<template>
  <div class="auth-screen"
    ><NuxtLink to="/" class="auth-brand">DEVCONNECT</NuxtLink
    ><form class="auth-card auth-card--narrow auth-form" @submit.prevent="submit"
      ><p class="verification-kicker">EMAIL VERIFICATION</p
      ><h1 class="auth-title">Resend verification</h1
      ><p class="auth-subtitle">Enter your account email to receive a new verification link.</p
      ><input
        v-model="email"
        required
        type="email"
        class="auth-input"
        placeholder="developer@example.com"
      /><button :disabled="loading" class="auth-primary">{{
        loading ? "Sending..." : "Send verification"
      }}</button
      ><p v-if="message" :class="success ? 'verification-success' : 'auth-error'">{{ message }}</p
      ><p class="auth-footer"><NuxtLink to="/login">Back to sign in</NuxtLink></p></form
    ></div
  >
</template>
<script setup>
definePageMeta({ middleware: "guest" });
const auth = useAuthStore();
const toast = useToastStore();
const email = ref("");
const loading = ref(false);
const message = ref("");
const success = ref(false);
async function submit() {
  loading.value = true;
  message.value = "";
  success.value = false;
  try {
    await auth.resendVerification(email.value);
    message.value = "If the account exists and is unverified, a new link has been sent.";
    success.value = true;
    toast.success("Verification email resent.");
  } catch (err) {
    message.value = err?.data?.message || "Could not resend verification";
  } finally {
    loading.value = false;
  }
}
</script>
<style scoped>
.verification-kicker {
  color: #adc6ff;
  font:
    600 11px "JetBrains Mono",
    monospace;
  letter-spacing: 0.12em;
}
.verification-success {
  color: #34c759;
  line-height: 1.5;
}
</style>
