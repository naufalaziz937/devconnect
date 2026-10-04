export const ROLES = Object.freeze({ ADMIN: "admin", USER: "user" });
export const ROLE_LABELS = Object.freeze({
  [ROLES.ADMIN]: "Administrator",
  [ROLES.USER]: "Developer",
});
const USER_MENU = Object.freeze([
  { name: "main", type: "divider", label: "Main" },
  { name: "feed", path: "/feed", label: "Feed", icon: "House", permission: "feed" },
  { name: "explore", path: "/explore", label: "Explore", icon: "Compass", permission: "explore" },
  {
    name: "projects",
    path: "/projects",
    label: "Projects",
    icon: "FolderKanban",
    permission: "projects",
  },
  { name: "network", path: "/network", label: "Network", icon: "Users", permission: "network" },
  { name: "social", type: "divider", label: "Social" },
  {
    name: "notifications",
    path: "/notifications",
    label: "Notifications",
    icon: "Bell",
    permission: "notifications",
  },
  { name: "account", type: "divider", label: "Account" },
  { name: "profile", path: "/profile", label: "Profile", icon: "UserRound", permission: "profile" },
]);
const ADMIN_MENU = Object.freeze([
  {
    name: "dashboard",
    path: "/dashboard",
    label: "Dashboard",
    icon: "LayoutDashboard",
    permission: "dashboard",
  },
  { name: "management", type: "divider", label: "Management" },
  { name: "users", path: "/user", label: "Users", icon: "Users", permission: "users" },
  { name: "content", path: "/content", label: "Content", icon: "Files", permission: "content" },
  {
    name: "projects",
    path: "/project",
    label: "Projects",
    icon: "FolderKanban",
    permission: "projects",
  },
  { name: "stacks", path: "/stack", label: "Stacks", icon: "Layers3", permission: "stacks" },
  { name: "moderation-section", type: "divider", label: "Moderation" },
  { name: "reports", path: "/reports", label: "Reports", icon: "Flag", permission: "reports" },
  {
    name: "moderation",
    path: "/moderation",
    label: "Moderation",
    icon: "ShieldCheck",
    permission: "moderation",
  },
  {
    name: "audit-logs",
    path: "/audit-logs",
    label: "Audit Logs",
    icon: "ScrollText",
    permission: "audit-logs",
  },
  { name: "platform", type: "divider", label: "Platform" },
  { name: "dev-news", path: "/dev-news", label: "Dev News", icon: "Rss", permission: "dev-news" },
  {
    name: "announcements",
    path: "/announcements",
    label: "Announcements",
    icon: "Megaphone",
    permission: "announcements",
  },
  {
    name: "settings",
    path: "/settings",
    label: "Settings",
    icon: "Settings",
    permission: "settings",
  },
]);
export const ROLE_MENUS = Object.freeze({ [ROLES.USER]: USER_MENU, [ROLES.ADMIN]: ADMIN_MENU });
export const ROLE_PERMISSIONS = Object.freeze({
  [ROLES.USER]: Object.freeze([
    "feed",
    "explore",
    "projects",
    "network",
    "notifications",
    "profile",
    "post.create",
    "post.like",
    "post.comment",
    "project.create",
    "profile.self",
  ]),
  [ROLES.ADMIN]: Object.freeze([
    "dashboard",
    "users",
    "users.read",
    "users.update",
    "users.change-role",
    "users.change-status",
    "content",
    "content.read",
    "content.moderate",
    "content.hide",
    "content.restore",
    "projects",
    "projects.read",
    "projects.moderate",
    "stacks",
    "stacks.read",
    "stacks.create",
    "stacks.update",
    "stacks.delete",
    "reports",
    "reports.read",
    "reports.resolve",
    "moderation",
    "moderation.read",
    "moderation.remove-content",
    "audit-logs",
    "audit-logs.read",
    "dev-news",
    "dev-news.read",
    "dev-news.refresh",
    "announcements",
    "announcements.read",
    "announcements.create",
    "announcements.update",
    "announcements.delete",
    "settings",
    "settings.read",
    "settings.update",
    "profile",
  ]),
});
export const ROLE_DEFAULT_ROUTES = Object.freeze({
  [ROLES.ADMIN]: "/dashboard",
  [ROLES.USER]: "/feed",
});
export const ROLE_ROUTES = Object.freeze({
  [ROLES.USER]: Object.freeze([
    { exact: "/feed" },
    { exact: "/explore" },
    { exact: "/network" },
    { exact: "/notifications" },
    { prefix: "/profile" },
    { prefix: "/projects" },
    { prefix: "/devlogs" },
    { prefix: "/developers" },
    { prefix: "/teammates" },
  ]),
  [ROLES.ADMIN]: Object.freeze([
    { exact: "/dashboard" },
    { prefix: "/project" },
    { prefix: "/stack" },
    { prefix: "/user" },
    { prefix: "/content" },
    { prefix: "/reports" },
    { prefix: "/moderation" },
    { prefix: "/audit-logs" },
    { prefix: "/dev-news" },
    { prefix: "/announcements" },
    { prefix: "/settings" },
  ]),
});
export const PUBLIC_ROUTES = Object.freeze([
  { exact: "/" },
  { exact: "/login" },
  { exact: "/register" },
  { exact: "/forgot-password" },
  { exact: "/resend-verification" },
  { prefix: "/reset-password" },
  { prefix: "/verify-email" },
  { prefix: "/auth/github/callback" },
  { exact: "/terms" },
  { exact: "/privacy" },
  { exact: "/copyright" },
]);
const normalizeRole = (role) => (typeof role === "string" ? role.toLowerCase() : "");
export const getMenuByRole = (role) => [...(ROLE_MENUS[normalizeRole(role)] || [])];
export const getRoleLabel = (role) => ROLE_LABELS[normalizeRole(role)] || "Developer";
export const getPermissionsByRole = (role) => [...(ROLE_PERMISSIONS[normalizeRole(role)] || [])];
export const canAccessPage = (role, permission) => getPermissionsByRole(role).includes(permission);
export const hasAnyPermission = (role, permissions) =>
  permissions.some((p) => canAccessPage(role, p));
export const hasAllPermissions = (role, permissions) =>
  permissions.every((p) => canAccessPage(role, p));
export const getDefaultRoute = (role) => ROLE_DEFAULT_ROUTES[normalizeRole(role)] || "/feed";
export const matchesRoute = (path, rule) =>
  rule.exact ? path === rule.exact : path === rule.prefix || path.startsWith(`${rule.prefix}/`);
export const isPublicRoute = (path) => PUBLIC_ROUTES.some((rule) => matchesRoute(path, rule));
export const canAccessRoute = (role, path) =>
  (ROLE_ROUTES[normalizeRole(role)] || []).some((rule) => matchesRoute(path, rule));
export function activeMenuForPath(path, role) {
  return (
    getMenuByRole(role)
      .filter((item) => item.path && (path === item.path || path.startsWith(`${item.path}/`)))
      .sort((a, b) => b.path.length - a.path.length)[0]?.name || null
  );
}
