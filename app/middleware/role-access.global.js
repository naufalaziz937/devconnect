import { canAccessRoute, getDefaultRoute, isPublicRoute, ROLES } from "~/utils/roles";

export default defineNuxtRouteMiddleware(async (to) => {
  if (isPublicRoute(to.path)) return;
  const auth = useAuthStore();
  try {
    await auth.initialize();
  } catch (error) {
    if (error?.response?.status !== 401) throw error;
  }
  if (!auth.user)
    return navigateTo({ path: "/login", query: { redirect: to.fullPath } }, { replace: true });
  if (canAccessRoute(auth.user.role, to.path)) return;
  const knownRole = auth.user.role === ROLES.ADMIN || auth.user.role === ROLES.USER;
  return navigateTo(knownRole ? getDefaultRoute(auth.user.role) : "/login", { replace: true });
});
