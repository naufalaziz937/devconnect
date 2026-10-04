import { canAccessPage } from "~/utils/roles";

export default defineNuxtRouteMiddleware(async () => {
  const auth = useAuthStore();
  await auth.initialize();
  if (!auth.user) return navigateTo("/login");
  if (!canAccessPage(auth.user.role, "dashboard")) return navigateTo("/feed");
});
