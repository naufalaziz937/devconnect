<template>
  <div class="profile-skeleton" role="status" aria-label="Loading profile"
    ><section
      ><div class="identity"
        ><SkeletonBlock class="avatar" /><div
          ><SkeletonBlock class="name" /><SkeletonBlock class="handle" /></div></div
      ><div class="stats"><SkeletonBlock v-for="i in 3" :key="i" class="stat" /></div
      ><SkeletonBlock class="bio" /><div class="chips"
        ><SkeletonBlock v-for="i in 4" :key="i" class="chip" /></div></section
    ><div class="tabs"><SkeletonBlock v-for="i in 4" :key="i" class="tab" /></div
    ><div class="items"><SkeletonBlock v-for="i in 3" :key="i" class="item" /></div
  ></div>
</template>
<style scoped>
.profile-skeleton {
  display: grid;
}
.profile-skeleton > section {
  padding: 24px;
}
.identity {
  display: flex;
  align-items: center;
  gap: 20px;
}
.avatar {
  width: 104px;
  height: 104px;
  border-radius: 50%;
}
.identity > div {
  width: 50%;
  display: grid;
  gap: 10px;
}
.name {
  height: 28px;
  width: 75%;
}
.handle {
  height: 14px;
  width: 45%;
}
.stats {
  display: flex;
  gap: 18px;
  margin: 22px 0;
}
.stat {
  width: 92px;
  height: 38px;
}
.bio {
  height: 52px;
  width: 82%;
}
.chips {
  display: flex;
  gap: 8px;
  margin-top: 14px;
}
.chip {
  width: 72px;
  height: 25px;
  border-radius: 999px;
}
.tabs {
  display: grid;
  grid-template-columns: repeat(4, 1fr);
  gap: 12px;
  padding: 16px 20px;
  border-block: 1px solid rgba(65, 71, 85, 0.3);
}
.tab {
  height: 26px;
}
.items {
  display: grid;
  gap: 12px;
  padding: 18px;
}
.item {
  height: 140px;
}
@media (max-width: 600px) {
  .avatar {
    width: 82px;
    height: 82px;
  }
  .stats {
    justify-content: space-between;
  }
  .stat {
    width: 28%;
  }
  .bio {
    width: 100%;
  }
}
</style>
