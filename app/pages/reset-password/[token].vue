<template>
  <div class="auth-screen reset-screen"
    ><NuxtLink to="/" class="auth-brand">DEVCONNECT</NuxtLink
    ><section class="auth-card auth-card--narrow"
      ><h1 class="auth-title">Reset<br />Password</h1
      ><p class="auth-subtitle"
        >Create a new secure password for your account.<br />Ensure it meets the security protocol
        requirements.</p
      ><form class="auth-form" @submit.prevent="submit"
        ><label class="auth-field"
          ><span class="auth-label">♙ New password</span
          ><input
            v-model="password"
            required
            type="password"
            minlength="8"
            class="auth-input"
            placeholder="••••••••••••"
          /><span class="security-meter"><i :style="{ width: `${strength}%` }" /></span
          ><small class="security-copy">Security level: {{ strengthLabel }}</small></label
        ><label class="auth-field"
          ><span class="auth-label">♢ Confirm password</span
          ><input
            v-model="confirmation"
            required
            type="password"
            class="auth-input"
            placeholder="••••••••••••" /></label
        ><p v-if="message" :class="['auth-error', { success: success }]">{{ message }}</p
        ><button class="auth-primary">Reset password ▷</button></form
      ><div class="reset-meta"><span>ENC_MODE: AES-256</span><span>SEC_VER: 4.0.1</span></div
      ><NuxtLink v-if="success" to="/login" class="auth-secondary mt-5"
        >Return to login</NuxtLink
      ></section
    ><footer>© 2142 DEVCONNECT. PROTOCOL SECURE.</footer></div
  >
</template>
<script setup>
const auth = useAuthStore();
const route = useRoute();
const password = ref("");
const confirmation = ref("");
const message = ref("");
const success = ref(false);
const strength = computed(() =>
  Math.min(
    100,
    password.value.length * 8 +
      (/[A-Z]/.test(password.value) ? 12 : 0) +
      (/\d/.test(password.value) ? 12 : 0) +
      (/[^A-Za-z0-9]/.test(password.value) ? 12 : 0),
  ),
);
const strengthLabel = computed(() =>
  strength.value >= 80
    ? "MAXIMUM"
    : strength.value >= 50
      ? "ENCRYPTED"
      : strength.value
        ? "VULNERABLE"
        : "INITIALIZING...",
);
async function submit() {
  message.value = "";
  success.value = false;
  if (password.value !== confirmation.value) {
    message.value = "Protocol mismatch: passwords do not align.";
    return;
  }
  try {
    await auth.resetPassword(route.params.token, password.value);
    success.value = true;
    message.value = "Password reset. You can sign in now.";
  } catch (err) {
    message.value = err?.data?.message || "Could not reset password";
  }
}
</script>
<style scoped>
.reset-screen::before {
  content: "";
  position: absolute;
  inset: 0;
  opacity: 0.32;
  background-image: radial-gradient(circle, #adc6ff 1px, transparent 1px);
  background-size: 120px 100px;
}
.security-meter {
  height: 3px;
  background: #31353d;
  overflow: hidden;
}
.security-meter i {
  display: block;
  height: 100%;
  background: #adc6ff;
  transition: width 0.2s;
}
.security-copy,
.reset-meta,
.reset-screen footer {
  color: #9ca2b2;
  font:
    400 10px "JetBrains Mono",
    monospace;
  text-transform: uppercase;
}
.success {
  color: #34c759;
}
.reset-meta {
  display: flex;
  justify-content: space-between;
  margin-top: 28px;
}
.reset-screen footer {
  position: absolute;
  bottom: 28px;
}
</style>
