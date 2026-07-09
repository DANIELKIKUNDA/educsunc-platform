<template>
  <div class="org-school-skeleton">
    <section class="org-school-skeleton__hero">
      <div class="org-school-skeleton__line org-school-skeleton__line--short"></div>
      <div class="org-school-skeleton__line org-school-skeleton__line--title"></div>
      <div class="org-school-skeleton__line org-school-skeleton__line--wide"></div>
    </section>

    <section class="org-school-skeleton__stats">
      <div v-for="index in 4" :key="index" class="org-school-skeleton__stat"></div>
    </section>

    <section class="org-school-skeleton__panel">
      <div class="org-school-skeleton__toolbar">
        <div class="org-school-skeleton__line org-school-skeleton__line--filter"></div>
        <div class="org-school-skeleton__line org-school-skeleton__line--filter"></div>
        <div class="org-school-skeleton__line org-school-skeleton__line--button"></div>
      </div>
      <div class="org-school-skeleton__table">
        <div v-for="index in 6" :key="index" class="org-school-skeleton__row"></div>
      </div>
    </section>
  </div>
</template>

<style scoped>
.org-school-skeleton{display:grid;gap:1.15rem}
.org-school-skeleton__hero,.org-school-skeleton__panel{padding:1.4rem;border-radius:28px;background:#fff;border:1px solid rgba(17,40,63,.08);box-shadow:0 24px 60px rgba(15,23,42,.06)}
.org-school-skeleton__stats{display:grid;grid-template-columns:repeat(auto-fit,minmax(180px,1fr));gap:1rem}
.org-school-skeleton__stat{height:138px;border-radius:24px;background:linear-gradient(90deg,#eef3f8 25%,#f8fbff 37%,#eef3f8 63%);background-size:400% 100%;animation:org-skeleton 1.6s ease infinite}
.org-school-skeleton__toolbar{display:grid;grid-template-columns:minmax(240px,1.6fr) minmax(180px,.9fr) 160px;gap:1rem;align-items:center;margin-bottom:1rem}
.org-school-skeleton__table{display:grid;gap:.75rem}
.org-school-skeleton__row{height:64px;border-radius:18px;background:linear-gradient(90deg,#eef3f8 25%,#f8fbff 37%,#eef3f8 63%);background-size:400% 100%;animation:org-skeleton 1.6s ease infinite}
.org-school-skeleton__line{height:14px;border-radius:999px;background:linear-gradient(90deg,#eef3f8 25%,#f8fbff 37%,#eef3f8 63%);background-size:400% 100%;animation:org-skeleton 1.6s ease infinite}
.org-school-skeleton__line--short{width:140px}
.org-school-skeleton__line--title{width:38%;height:26px;margin-top:.8rem}
.org-school-skeleton__line--wide{width:72%;margin-top:.7rem}
.org-school-skeleton__line--filter{width:100%;height:48px}
.org-school-skeleton__line--button{width:100%;height:48px}
@keyframes org-skeleton{0%{background-position:100% 50%}100%{background-position:0 50%}}
@media (max-width: 900px){
  .org-school-skeleton__toolbar{grid-template-columns:1fr}
}
</style>
