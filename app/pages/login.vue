<template>
  <div class="auth-screen"
    ><NuxtLink to="/" class="auth-brand">DEVCONNECT</NuxtLink
    ><section class="auth-card auth-card--narrow"
      ><h1 class="auth-title">Protocol Login</h1
      ><p class="auth-subtitle">Reconnect to your developer network.</p
      ><form class="auth-form" @submit.prevent="handleLogin"
        ><label class="auth-field"
          ><span class="auth-label">Email address</span
          ><input
            v-model="form.email"
            required
            type="email"
            class="auth-input"
            placeholder="protocol@devconnect.io" /></label
        ><label class="auth-field"
          ><span class="auth-label">Password</span
          ><input
            v-model="form.password"
            required
            type="password"
            class="auth-input"
            placeholder="••••••••••••" /></label
        ><div class="flex justify-end"
          ><NuxtLink to="/forgot-password" class="text-xs text-[#adc6ff] font-mono"
            >Forgot password?</NuxtLink
          ></div
        ><p v-if="errorMessage" class="auth-error">{{ errorMessage }}</p
        ><button type="submit" :disabled="loading" class="auth-primary">{{
          loading ? "Authenticating..." : "Sign in →"
        }}</button
        ><div class="auth-divider">Or protocol handshake</div
        ><a :href="useApiUrl('/auth/github')" class="auth-secondary"
          >◉ Continue with GitHub</a
        ></form
      ><p class="auth-footer"
        >No developer identity? <NuxtLink to="/register">Create account.</NuxtLink><br /><NuxtLink
          to="/resend-verification"
          class="text-xs"
          >Resend verification protocol</NuxtLink
        ></p
      ></section
    ></div
  >
</template>

<script setup>
import { getDefaultRoute } from "~/utils/roles";
definePageMeta({ middleware: "guest" });
const auth = useAuthStore();
const route = useRoute();
const loading = computed(() => auth.loading);
const errorMessage = computed(() => auth.error);
const toast = useToastStore();

const form = ref({
  email: "",
  password: "",
});

const handleLogin = async () => {
  try {
    await auth.login(form.value);
    toast.success("Login successful.");
    const requested = typeof route.query.redirect === "string" ? route.query.redirect : "";
    const safeRequested =
      requested.startsWith("/") && !requested.startsWith("//") && !requested.startsWith("/login");
    const destination = safeRequested ? requested : getDefaultRoute(auth.user?.role);
    await navigateTo(destination, { replace: true });
  } catch {
    toast.error("Login failed. Check your credentials and try again.");
  }
};
</script>
