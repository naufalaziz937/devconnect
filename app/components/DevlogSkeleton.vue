<template>
  <div class="space-y-5" role="status" aria-label="Loading DevLog"
    ><section class="rounded-2xl border border-white/10 bg-white/5 p-6 space-y-4"
      ><div class="flex gap-3"
        ><SkeletonBlock class="h-11 w-11 rounded-full" /><div class="flex-1 space-y-2"
          ><SkeletonBlock class="h-4 w-1/3" /><SkeletonBlock class="h-3 w-1/4" /></div></div
      ><SkeletonBlock class="h-4 w-full" /><SkeletonBlock class="h-4 w-5/6" /><SkeletonBlock
        class="h-44 w-full" /></section
    ><NotificationSkeleton v-for="i in 2" :key="i"
  /></div>
</template>
