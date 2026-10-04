<template><div class="skeleton-block" aria-hidden="true" /></template>
<style scoped>
.skeleton-block {
  border-radius: 8px;
  background: linear-gradient(
    90deg,
    rgba(65, 71, 85, 0.22) 25%,
    rgba(91, 99, 117, 0.34) 45%,
    rgba(65, 71, 85, 0.22) 65%
  );
  background-size: 240% 100%;
  animation: skeleton 1.6s ease-in-out infinite;
}
@keyframes skeleton {
  0% {
    background-position: 100% 0;
  }
  100% {
    background-position: -120% 0;
  }
}
@media (prefers-reduced-motion: reduce) {
  .skeleton-block {
    animation: none;
  }
}
</style>
