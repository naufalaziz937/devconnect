<template>
  <section v-if="showNews" class="discovery-module"
    ><header><h2>Dev News</h2><span>External</span></header
    ><div v-if="store.newsLoading" class="module-loading"
      ><SkeletonBlock v-for="n in 3" :key="n" class="h-12" /></div
    ><p v-else-if="store.newsError" class="module-state">{{ store.newsError }}</p
    ><p v-else-if="!store.news.length" class="module-state">Dev News is temporarily unavailable.</p
    ><div v-else
      ><a
        v-for="item in store.news.slice(0, newsLimit)"
        :key="item.id"
        :href="safeLink(item.url)"
        target="_blank"
        rel="noopener noreferrer"
        class="news-item"
        ><strong>{{ item.title }}</strong
        ><small>{{ item.source?.name }} · {{ relative(item.publishedAt) }}</small></a
      ></div
    ></section
  ><section v-if="showTrends" class="discovery-module"
    ><header><h2>Trending in Dev</h2><span>External</span></header
    ><div v-if="store.trendsLoading" class="module-loading"
      ><SkeletonBlock v-for="n in 3" :key="n" class="h-10" /></div
    ><p v-else-if="store.trendsError" class="module-state">{{ store.trendsError }}</p
    ><div v-else
      ><NuxtLink
        v-for="item in store.trends.slice(0, trendsLimit)"
        :key="item.id"
        :to="{ path: '/explore', query: { q: item.topic } }"
        class="trend-item"
        ><span
          ><strong>#{{ item.topic }}</strong
          ><small>{{ item.category }}</small></span
        ><em>{{ item.stories }} stories</em></NuxtLink
      ></div
    ></section
  >
</template>
<script setup>
const props = defineProps({
  showNews: { type: Boolean, default: true },
  showTrends: { type: Boolean, default: true },
  newsLimit: { type: Number, default: 4 },
  trendsLimit: { type: Number, default: 5 },
});
const store = useDiscoveryStore();
function relative(value) {
  const seconds = Math.max(1, Math.floor((Date.now() - new Date(value).getTime()) / 1000));
  if (seconds < 3600) return `${Math.floor(seconds / 60)}m`;
  if (seconds < 86400) return `${Math.floor(seconds / 3600)}h`;
  return `${Math.floor(seconds / 86400)}d`;
}
const safeLink = (value) => (/^https?:\/\//i.test(value || "") ? value : "#");
await Promise.allSettled([
  props.showNews ? store.fetchNews() : null,
  props.showTrends ? store.fetchTrends() : null,
]);
</script>
<style scoped>
.discovery-module {
  overflow: hidden;
  border: 1px solid rgba(65, 71, 85, 0.35);
  border-radius: 16px;
  background: rgba(16, 19, 27, 0.72);
}
.discovery-module header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 15px;
}
.discovery-module h2 {
  font-size: 14px;
  font-weight: 650;
}
.discovery-module header span {
  color: #858b9b;
  font:
    500 8px "JetBrains Mono",
    monospace;
  text-transform: uppercase;
}
.news-item,
.trend-item {
  display: block;
  padding: 11px 15px;
  border-top: 1px solid rgba(65, 71, 85, 0.25);
}
.news-item strong,
.news-item small,
.trend-item strong,
.trend-item small {
  display: block;
}
.news-item strong {
  display: -webkit-box;
  overflow: hidden;
  font-size: 11px;
  line-height: 1.4;
  -webkit-box-orient: vertical;
  -webkit-line-clamp: 2;
}
.news-item small,
.trend-item small {
  margin-top: 4px;
  color: #858b9b;
  font-size: 8px;
}
.trend-item {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 10px;
}
.trend-item strong {
  font-size: 11px;
}
.trend-item em {
  color: #858b9b;
  font:
    500 8px "JetBrains Mono",
    monospace;
  white-space: nowrap;
}
.module-loading {
  display: grid;
  gap: 7px;
  padding: 10px 14px 14px;
}
.module-state {
  padding: 0 15px 14px;
  color: #9298a8;
  font-size: 10px;
  line-height: 1.45;
}
</style>
