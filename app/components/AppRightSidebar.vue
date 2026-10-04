<template>
  <aside class="right-sidebar"
    ><div class="right-sidebar__inner"><slot /><AppSidebarFooter /></div
  ></aside>
</template>
<style scoped>
.right-sidebar {
  min-width: 0;
  align-self: stretch;
  padding: 18px 0 72px;
}
.right-sidebar__inner {
  position: sticky;
  bottom: 18px;
  display: grid;
  gap: 16px;
}
@media (max-width: 1080px) {
  .right-sidebar {
    display: none;
  }
}
</style>
