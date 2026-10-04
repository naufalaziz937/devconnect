export default defineNuxtRouteMiddleware(async () => {
  const auth = useAuthStore();
  try {
    await auth.initialize();
  } catch (err) {
    if (err?.response?.status !== 401) throw err;
  }
  if (!auth.user) {
    const route = useRoute();
    const destination =
      route.fullPath.startsWith("/") && !route.fullPath.startsWith("//") ? route.fullPath : "/feed";
    return navigateTo({ path: "/login", query: { redirect: destination } });
  }
});
