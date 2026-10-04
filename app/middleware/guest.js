import { getDefaultRoute } from "~/utils/roles";

export default defineNuxtRouteMiddleware(async () => {
  const auth = useAuthStore();
  try {
    await auth.initialize();
  } catch {
    return;
  }
  if (auth.user) return navigateTo(getDefaultRoute(auth.user.role));
});
