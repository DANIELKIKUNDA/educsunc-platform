<template>
  <div class="org-detail-skeleton">
    <section class="org-detail-skeleton__hero">
      <div class="org-detail-skeleton__pill shimmer" />
      <div class="org-detail-skeleton__title shimmer" />
      <div class="org-detail-skeleton__text shimmer" />
      <div class="org-detail-skeleton__text org-detail-skeleton__text--short shimmer" />
      <div class="org-detail-skeleton__actions">
        <div class="org-detail-skeleton__button shimmer" />
        <div class="org-detail-skeleton__button shimmer" />
      </div>
    </section>

    <section class="org-detail-skeleton__stats">
      <div v-for="index in 4" :key="index" class="org-detail-skeleton__stat shimmer" />
    </section>

    <section class="org-detail-skeleton__tabs">
      <div v-for="index in 4" :key="`tab-${index}`" class="org-detail-skeleton__tab shimmer" />
    </section>

    <section class="org-detail-skeleton__content">
      <div class="org-detail-skeleton__panel">
        <div v-for="index in 6" :key="`info-${index}`" class="org-detail-skeleton__card shimmer" />
      </div>
      <div class="org-detail-skeleton__side">
        <div v-for="index in 4" :key="`quick-${index}`" class="org-detail-skeleton__card shimmer" />
      </div>
    </section>
  </div>
</template>

<style scoped>
.org-detail-skeleton{display:grid;gap:1rem}
.org-detail-skeleton__hero,.org-detail-skeleton__stat,.org-detail-skeleton__card,.org-detail-skeleton__tab{border-radius:24px;background:#fff;border:1px solid rgba(17,40,63,.08)}
.org-detail-skeleton__hero{display:grid;gap:1rem;padding:1.5rem}
.org-detail-skeleton__pill{width:160px;height:34px;border-radius:999px}
.org-detail-skeleton__title{width:min(420px,100%);height:38px}
.org-detail-skeleton__text{width:100%;height:16px}
.org-detail-skeleton__text--short{width:68%}
.org-detail-skeleton__actions{display:flex;flex-wrap:wrap;gap:.75rem}
.org-detail-skeleton__button{width:180px;height:46px;border-radius:999px}
.org-detail-skeleton__stats{display:grid;grid-template-columns:repeat(4,minmax(0,1fr));gap:1rem}
.org-detail-skeleton__stat{height:132px}
.org-detail-skeleton__tabs{display:flex;gap:.75rem;overflow:auto}
.org-detail-skeleton__tab{width:180px;height:52px;flex:0 0 auto}
.org-detail-skeleton__content{display:grid;grid-template-columns:minmax(0,1.55fr) minmax(280px,.8fr);gap:1rem}
.org-detail-skeleton__panel{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1rem}
.org-detail-skeleton__side{display:grid;gap:1rem}
.org-detail-skeleton__card{height:118px}
.shimmer{position:relative;overflow:hidden;background:linear-gradient(90deg,#edf2f7 0%,#f8fbff 50%,#edf2f7 100%);background-size:200% 100%;animation:org-detail-skeleton-shimmer 1.25s linear infinite}

@keyframes org-detail-skeleton-shimmer{
  0%{background-position:200% 0}
  100%{background-position:-200% 0}
}

@media (max-width: 1080px){
  .org-detail-skeleton__stats{grid-template-columns:repeat(2,minmax(0,1fr))}
  .org-detail-skeleton__content{grid-template-columns:1fr}
}

@media (max-width: 720px){
  .org-detail-skeleton__stats,.org-detail-skeleton__panel{grid-template-columns:1fr}
  .org-detail-skeleton__button{width:100%}
}
</style>
