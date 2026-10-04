<template>
  <div class="space-y-5" role="status" aria-label="Loading project"
    ><section class="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4"
      ><SkeletonBlock class="h-8 w-1/2" /><SkeletonBlock class="h-4 w-full" /><SkeletonBlock
        class="h-4 w-4/5" /><SkeletonBlock class="h-9 w-36" /></section
    ><section class="space-y-3"
      ><SkeletonBlock class="h-6 w-48" /><ProjectCardSkeleton v-for="i in 2" :key="i" /></section
  ></div>
</template>
