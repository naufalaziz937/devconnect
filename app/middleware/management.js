import { canAccessRoute, getDefaultRoute } from "~/utils/roles";

export default defineNuxtRouteMiddleware(async (to) => {
  const auth = useAuthStore();
  await auth.initialize();

  if (!auth.user) {
    return navigateTo({ path: "/login", query: { redirect: to.fullPath } });
  }

  if (!canAccessRoute(auth.user.role, to.path)) {
    return navigateTo(getDefaultRoute(auth.user.role), { replace: true });
  }
});
