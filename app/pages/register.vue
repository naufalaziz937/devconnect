<template>
  <div class="auth-screen"
    ><NuxtLink to="/" class="auth-brand">DEVCONNECT</NuxtLink
    ><section class="auth-card"
      ><template v-if="registered"
        ><p class="verification-kicker">EMAIL VERIFICATION</p
        ><h1 class="auth-title">Verify your email</h1
        ><p class="auth-subtitle"
          >We've sent a verification link to <strong>{{ form.email }}</strong
          >. Open it to finish setting up your DevConnect account.</p
        ><NuxtLink to="/resend-verification" class="auth-secondary verification-link"
          >Resend verification email</NuxtLink
        ><NuxtLink to="/login" class="auth-primary verification-link"
          >Back to sign in</NuxtLink
        ></template
      ><template v-else
        ><h1 class="auth-title">Create your developer identity</h1
        ><p class="auth-subtitle">Join the next-generation developer community.</p>
        <p v-if="config.config && !config.config.registrationEnabled" class="auth-error"
          >Registration is currently unavailable. Existing users can still sign in.</p
        ><form v-else class="auth-form" @submit.prevent="handleRegister"
          ><div class="auth-grid"
            ><label class="auth-field"
              ><span class="auth-label">Username</span
              ><input
                v-model="form.username"
                required
                class="auth-input"
                placeholder="dev_pioneer" /></label
            ><label class="auth-field"
              ><span class="auth-label">Email address</span
              ><input
                v-model="form.email"
                required
                type="email"
                class="auth-input"
                placeholder="protocol@devconnect.io" /></label
          ></div>
          <label class="auth-field"
            ><span class="auth-label">Password</span
            ><input
              v-model="form.password"
              required
              minlength="8"
              type="password"
              class="auth-input"
              placeholder="••••••••••••"
            /><span class="strength-row"
              ><i><b :style="{ width: `${strength}%` }" /></i><em>{{ strengthLabel }}</em></span
            ></label
          >
          <label class="auth-field"
            ><span class="auth-label">Confirm password</span
            ><input
              v-model="confirmPassword"
              required
              type="password"
              class="auth-input"
              placeholder="••••••••••••"
          /></label>
          <label class="terms"
            ><input v-model="accepted" required type="checkbox" />
            <span
              >I acknowledge the <strong>DevConnect Protocol Agreement</strong> and developer data
              policy.</span
            ></label
          >
          <p v-if="localError || errorMessage" class="auth-error">{{
            localError || errorMessage
          }}</p
          ><button type="submit" :disabled="loading" class="auth-primary">{{
            loading ? "Creating identity..." : "Create account →"
          }}</button
          ><div class="auth-divider">Or protocol handshake</div
          ><a :href="useApiUrl('/auth/github')" class="auth-secondary"
            >◉ Sign up with GitHub</a
          > </form
        ><p class="auth-footer"
          >Already have an account? <NuxtLink to="/login">Sign in instead.</NuxtLink></p
        ></template
      ></section
    ></div
  >
</template>

<script setup>
definePageMeta({ middleware: "guest" });
const auth = useAuthStore();
const loading = computed(() => auth.loading);
const errorMessage = computed(() => auth.error);
const toast = useToastStore();
const config = usePlatformSettingsStore();
await config.fetchConfig();

const form = ref({
  username: "",
  email: "",
  password: "",
});
const confirmPassword = ref("");
const accepted = ref(false);
const localError = ref("");
const registered = ref(false);
const strength = computed(() =>
  Math.min(
    100,
    form.value.password.length * 8 +
      (/[A-Z]/.test(form.value.password) ? 12 : 0) +
      (/\d/.test(form.value.password) ? 12 : 0) +
      (/[^A-Za-z0-9]/.test(form.value.password) ? 12 : 0),
  ),
);
const strengthLabel = computed(() =>
  strength.value >= 80 ? "VAULT GRADE" : strength.value >= 50 ? "STANDARD" : "ANALYZING...",
);

const handleRegister = async () => {
  localError.value = "";
  if (form.value.password !== confirmPassword.value) {
    localError.value = "Passwords do not match.";
    return;
  }
  try {
    await auth.register(form.value);
    registered.value = true;
  } catch {
    toast.error("Registration failed. Review your details and try again.");
  }
};
</script>
<style scoped>
.strength-row {
  display: flex;
  align-items: center;
  gap: 14px;
}
.strength-row i {
  height: 4px;
  flex: 1;
  background: #31353d;
  overflow: hidden;
}
.strength-row b {
  display: block;
  height: 100%;
  background: #adc6ff;
  transition: width 0.2s;
}
.strength-row em {
  color: #adc6ff;
  font:
    400 10px "JetBrains Mono",
    monospace;
}
.terms {
  display: flex;
  gap: 10px;
  align-items: flex-start;
  color: #c1c6d7;
}
.terms input {
  width: 20px;
  height: 20px;
  flex: 0 0 auto;
}
.terms strong {
  color: #adc6ff;
  font-weight: 500;
}
.verification-kicker {
  margin-bottom: 12px;
  color: #adc6ff;
  font:
    600 11px "JetBrains Mono",
    monospace;
  letter-spacing: 0.12em;
}
.verification-link {
  display: block;
  margin-top: 12px;
  text-align: center;
}
.auth-subtitle strong {
  color: #e0e2ed;
}
</style>
