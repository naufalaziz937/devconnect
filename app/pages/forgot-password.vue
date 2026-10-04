<template>
  <div class="auth-screen">
    <NuxtLink to="/" class="auth-brand">DEVCONNECT</NuxtLink>
    <section class="auth-card auth-card--narrow">
      <template v-if="sent">
        <p class="auth-kicker">ACCOUNT SECURITY</p>
        <h1 class="auth-title">Check your email</h1>
        <p class="auth-subtitle">
          If an account exists for that email, we sent password reset instructions. Check your inbox
          and spam folder.
        </p>
        <button class="auth-secondary" :disabled="loading" @click="submit">
          {{ loading ? "Sending..." : "Resend email" }}
        </button>
        <NuxtLink to="/login" class="auth-primary auth-link">Back to sign in</NuxtLink>
      </template>
      <template v-else>
        <p class="auth-kicker">ACCOUNT SECURITY</p>
        <h1 class="auth-title">Reset your password</h1>
        <p class="auth-subtitle">
          Enter your account email and we'll send secure reset instructions.
        </p>
        <form class="auth-form" @submit.prevent="submit">
          <label class="auth-field">
            <span class="auth-label">Email address</span>
            <input
              v-model="email"
              required
              type="email"
              class="auth-input"
              placeholder="developer@example.com"
            />
          </label>
          <p v-if="error" class="auth-error">{{ error }}</p>
          <button class="auth-primary" :disabled="loading">
            {{ loading ? "Sending..." : "Send reset link" }}
          </button>
        </form>
        <p class="auth-footer"><NuxtLink to="/login">Back to sign in</NuxtLink></p>
      </template>
    </section>
  </div>
</template>

<script setup>
definePageMeta({ middleware: "guest" });

const auth = useAuthStore();
const toast = useToastStore();
const email = ref("");
const loading = ref(false);
const sent = ref(false);
const error = ref("");

async function submit() {
  loading.value = true;
  error.value = "";

  try {
    await auth.forgotPassword(email.value);
    sent.value = true;
    toast.success("Password reset email sent.");
  } catch (requestError) {
    error.value = requestError?.data?.message || "Could not send reset instructions.";
  } finally {
    loading.value = false;
  }
}
</script>

<style scoped>
.auth-kicker {
  margin-bottom: 12px;
  color: #adc6ff;
  font:
    600 11px "JetBrains Mono",
    monospace;
  letter-spacing: 0.12em;
}
.auth-link {
  display: block;
  margin-top: 12px;
  text-align: center;
}
</style>
