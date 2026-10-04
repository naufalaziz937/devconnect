<template>
  <div class="auth-screen"
    ><NuxtLink to="/" class="auth-brand">DEVCONNECT</NuxtLink
    ><section class="auth-card auth-card--narrow verification-card"
      ><p class="verification-kicker">EMAIL VERIFICATION</p
      ><h1 class="auth-title">{{ data ? "Email verified" : "Verification link" }}</h1
      ><p :class="data ? 'verification-success' : 'auth-error'">{{ message }}</p
      ><NuxtLink to="/login" class="auth-primary verification-link"
        >Back to sign in</NuxtLink
      ></section
    ></div
  >
</template>
<script setup>
const auth = useAuthStore();
const route = useRoute();
const { data, error } = await useAsyncData(`verify-${route.params.token}`, async () => {
  await auth.verifyEmail(route.params.token);
  return true;
});
const message = computed(
  () =>
    error.value?.data?.message ||
    (data.value
      ? "Email verified. You can sign in now."
      : "Verification link is invalid or expired."),
);
</script>
<style scoped>
.verification-card {
  text-align: center;
}
.verification-kicker {
  margin-bottom: 12px;
  color: #adc6ff;
  font:
    600 11px "JetBrains Mono",
    monospace;
  letter-spacing: 0.12em;
}
.verification-success {
  color: #34c759;
  line-height: 1.6;
}
.verification-link {
  display: block;
  margin-top: 24px;
}
</style>
