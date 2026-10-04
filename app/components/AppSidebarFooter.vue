<template>
  <footer class="sidebar-footer"
    ><nav aria-label="DevConnect legal"
      ><NuxtLink to="/terms">Terms</NuxtLink><span>·</span><NuxtLink to="/privacy">Privacy</NuxtLink
      ><span>·</span><NuxtLink to="/copyright">Copyright</NuxtLink></nav
    ><p>© 2026 DevConnect</p></footer
  >
</template>
<style scoped>
.sidebar-footer {
  padding: 2px 8px;
  color: #707687;
  font:
    500 9px/1.7 "JetBrains Mono",
    monospace;
}
.sidebar-footer nav {
  display: flex;
  flex-wrap: wrap;
  gap: 5px 7px;
}
.sidebar-footer a:hover,
.sidebar-footer a:focus-visible {
  color: #adc6ff;
}
.sidebar-footer p {
  margin-top: 3px;
}
</style>
