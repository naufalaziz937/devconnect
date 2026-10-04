<template>
  <div class="app-loading" role="status" aria-live="polite"
    ><img src="/DC-logo-v2.png" alt="DevConnect" /><span /><p>DEVCONNECT</p></div
  >
</template>
<style scoped>
.app-loading {
  position: fixed;
  inset: 0;
  z-index: 100;
  display: grid;
  place-content: center;
  justify-items: center;
  gap: 18px;
  background: #10131b;
  color: #adc6ff;
  font:
    500 12px "JetBrains Mono",
    monospace;
  letter-spacing: 0.18em;
}
.app-loading img {
  width: 58px;
  height: 58px;
  object-fit: contain;
}
.app-loading span {
  width: 116px;
  height: 2px;
  overflow: hidden;
  border-radius: 99px;
  background: #252b38;
}
.app-loading span:after {
  content: "";
  display: block;
  width: 45%;
  height: 100%;
  background: #4b8eff;
  animation: load 1s ease-in-out infinite;
}
@keyframes load {
  from {
    transform: translateX(-110%);
  }
  to {
    transform: translateX(240%);
  }
}
</style>
