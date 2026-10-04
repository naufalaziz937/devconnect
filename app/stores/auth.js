import { defineStore } from "pinia";

const authError = (err, fallback) =>
  err?.data?.message || err?.data?.errors?.[0]?.message || fallback;

export const useAuthStore = defineStore("auth", () => {
  const token = useCookie("devconnect_token", { sameSite: "lax", maxAge: 60 * 60 * 24 });
  const user = useState("auth_user", () => null);
  const loading = ref(false);
  const error = ref("");
  const restoreAttempted = ref(false);
  const isInitialized = ref(false);
  const isInitializing = ref(false);
  let initializationPromise = null;
  const hasServerRefreshCookie =
    import.meta.server &&
    /(?:^|;\s*)refreshToken=/.test(useRequestHeaders(["cookie"]).cookie || "");
  const api = useApi();

  async function login(credentials) {
    loading.value = true;
    error.value = "";
    try {
      const data = await api("/auth/login", { method: "POST", body: credentials });
      token.value = data.accessToken;
      user.value = data.user;
      restoreAttempted.value = true;
      isInitialized.value = false;
      await loadUser();
      isInitialized.value = true;
    } catch (err) {
      error.value = authError(err, "Sign in failed");
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function register(details) {
    loading.value = true;
    error.value = "";
    try {
      return await api("/auth/register", { method: "POST", body: details });
    } catch (err) {
      error.value = authError(err, "Registration failed");
      throw err;
    } finally {
      loading.value = false;
    }
  }

  async function verifyEmail(verificationToken) {
    return api(`/auth/verify-email/${encodeURIComponent(verificationToken)}`);
  }

  async function forgotPassword(email) {
    return api("/auth/forgot-password", { method: "POST", body: { email } });
  }

  async function resetPassword(resetToken, password) {
    return api(`/auth/reset-password/${encodeURIComponent(resetToken)}`, {
      method: "POST",
      body: { password },
    });
  }

  async function resendVerification(email) {
    return api("/auth/resend-verification", { method: "POST", body: { email } });
  }

  async function loadUser() {
    if (!token.value) {
      if (restoreAttempted.value || (import.meta.server && !hasServerRefreshCookie)) {
        restoreAttempted.value = true;
        user.value = null;
        return;
      }
      restoreAttempted.value = true;
      try {
        const refreshed = await api("/auth/refresh", { method: "POST" });
        token.value = refreshed.accessToken;
      } catch (err) {
        user.value = null;
        if (err?.response?.status !== 401) throw err;
        return;
      }
    }
    try {
      const profile = await api("/profile/me");
      user.value = { ...profile, uuid: profile.uuid || user.value?.uuid };
    } catch (err) {
      if (err?.response?.status === 401) {
        token.value = null;
        user.value = null;
        restoreAttempted.value = true;
      } else throw err;
    }
  }

  async function initialize() {
    if (isInitialized.value) return user.value;
    if (initializationPromise) return initializationPromise;
    isInitializing.value = true;
    initializationPromise = loadUser()
      .then(() => user.value)
      .finally(() => {
        isInitialized.value = true;
        isInitializing.value = false;
        initializationPromise = null;
      });
    return initializationPromise;
  }

  async function logout() {
    await api("/auth/logout", { method: "POST" });
    token.value = null;
    user.value = null;
    restoreAttempted.value = true;
    isInitialized.value = true;
    useProfileStore().clear();
    useNotificationsStore().clear();
    useFollowStore().clear();
    useFeedStore().clear();
    useTeammatesStore().clear();
  }

  async function completeOAuth(accessToken) {
    token.value = accessToken;
    restoreAttempted.value = true;
    try {
      await loadUser();
    } catch (error) {
      token.value = null;
      user.value = null;
      throw error;
    }
  }

  return {
    token,
    user,
    loading,
    error,
    restoreAttempted,
    isInitialized,
    isInitializing,
    initialize,
    login,
    register,
    verifyEmail,
    forgotPassword,
    resetPassword,
    resendVerification,
    loadUser,
    logout,
    completeOAuth,
  };
});
