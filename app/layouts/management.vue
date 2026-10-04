<template>
  <div class="admin-shell">
    <AppSidebar />
    <main class="admin-main"><slot /></main>
  </div>
</template>
<style>
.admin-shell {
  min-height: 100vh;
  color: #e0e2ed;
  background: #10131b;
}
.admin-main {
  min-height: 100vh;
  margin-left: 264px;
  padding: 32px;
  background-image: radial-gradient(circle at 85% 0, rgba(75, 142, 255, 0.09), transparent 32%);
}
@media (max-width: 900px) {
  .admin-main {
    margin-left: 0;
    padding: 76px 20px 28px;
  }
}
@media (max-width: 560px) {
  .admin-main {
    padding: 70px 14px 24px;
  }
}
</style>
