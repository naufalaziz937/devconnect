<template>
  <div class="space-y-6" role="status" aria-label="Loading feed"
    ><section class="sk-card p-5"
      ><div class="flex gap-4"
        ><SkeletonBlock class="h-11 w-11 rounded-full" /><div class="flex-1 space-y-3"
          ><SkeletonBlock class="h-4 w-2/3" /><SkeletonBlock class="h-4 w-1/2" /></div></div
      ><SkeletonBlock class="mt-5 h-10 w-full" /></section
    ><section v-for="i in 3" :key="i" class="sk-card p-6 space-y-4"
      ><div class="flex gap-3"
        ><SkeletonBlock class="h-11 w-11 rounded-full" /><div class="flex-1 space-y-2"
          ><SkeletonBlock class="h-4 w-1/3" /><SkeletonBlock class="h-3 w-1/4" /></div></div
      ><SkeletonBlock class="h-4 w-full" /><SkeletonBlock class="h-4 w-5/6" /><SkeletonBlock
        v-if="i === 2"
        class="h-52 w-full" /><div class="flex gap-6"
        ><SkeletonBlock class="h-5 w-16" /><SkeletonBlock class="h-5 w-16" /></div></section
  ></div>
</template>
<style scoped>
.sk-card {
  border: 1px solid rgba(65, 71, 85, 0.38);
  border-radius: 16px;
  background: rgba(15, 23, 42, 0.64);
}
</style>
