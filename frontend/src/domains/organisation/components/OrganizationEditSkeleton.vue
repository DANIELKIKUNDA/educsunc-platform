<template>
  <div class="org-edit-skeleton">
    <section class="org-edit-skeleton__breadcrumb">
      <div class="org-edit-skeleton__crumb shimmer" />
      <div class="org-edit-skeleton__crumb shimmer" />
      <div class="org-edit-skeleton__crumb shimmer" />
      <div class="org-edit-skeleton__crumb org-edit-skeleton__crumb--short shimmer" />
    </section>

    <section class="org-edit-skeleton__hero">
      <div class="org-edit-skeleton__hero-main">
        <div class="org-edit-skeleton__pill shimmer" />
        <div class="org-edit-skeleton__title shimmer" />
        <div class="org-edit-skeleton__text shimmer" />
        <div class="org-edit-skeleton__text org-edit-skeleton__text--short shimmer" />
      </div>
      <div class="org-edit-skeleton__hero-side">
        <div class="org-edit-skeleton__badge shimmer" />
        <div class="org-edit-skeleton__action shimmer" />
        <div class="org-edit-skeleton__action shimmer" />
      </div>
    </section>

    <section class="org-edit-skeleton__panel">
      <div class="org-edit-skeleton__panel-header">
        <div class="org-edit-skeleton__heading shimmer" />
        <div class="org-edit-skeleton__subheading shimmer" />
      </div>

      <div class="org-edit-skeleton__grid">
        <div class="org-edit-skeleton__field org-edit-skeleton__field--wide">
          <div class="org-edit-skeleton__label shimmer" />
          <div class="org-edit-skeleton__input shimmer" />
          <div class="org-edit-skeleton__hint shimmer" />
        </div>
        <div class="org-edit-skeleton__field">
          <div class="org-edit-skeleton__label shimmer" />
          <div class="org-edit-skeleton__input shimmer" />
        </div>
        <div class="org-edit-skeleton__field">
          <div class="org-edit-skeleton__label shimmer" />
          <div class="org-edit-skeleton__input shimmer" />
        </div>
        <div class="org-edit-skeleton__field org-edit-skeleton__field--wide">
          <div class="org-edit-skeleton__label shimmer" />
          <div class="org-edit-skeleton__textarea shimmer" />
        </div>
      </div>

      <div class="org-edit-skeleton__footer">
        <div class="org-edit-skeleton__button shimmer" />
        <div class="org-edit-skeleton__button shimmer" />
      </div>
    </section>
  </div>
</template>

<style scoped>
.org-edit-skeleton{display:grid;gap:1rem}
.org-edit-skeleton__breadcrumb{display:flex;flex-wrap:wrap;gap:.6rem}
.org-edit-skeleton__crumb{width:132px;height:16px;border-radius:999px}
.org-edit-skeleton__crumb--short{width:176px}
.org-edit-skeleton__hero,.org-edit-skeleton__panel{padding:1.5rem;border-radius:28px;background:#fff;border:1px solid rgba(17,40,63,.08);box-shadow:0 24px 60px rgba(15,23,42,.06)}
.org-edit-skeleton__hero{display:grid;grid-template-columns:minmax(0,1.6fr) minmax(220px,.7fr);gap:1rem;align-items:start}
.org-edit-skeleton__hero-main,.org-edit-skeleton__hero-side{display:grid;gap:.85rem}
.org-edit-skeleton__pill{width:148px;height:34px;border-radius:999px}
.org-edit-skeleton__title{width:min(340px,100%);height:34px;border-radius:18px}
.org-edit-skeleton__text{width:100%;height:16px;border-radius:999px}
.org-edit-skeleton__text--short{width:72%}
.org-edit-skeleton__badge{justify-self:end;width:120px;height:34px;border-radius:999px}
.org-edit-skeleton__action{justify-self:end;width:188px;height:46px;border-radius:999px}
.org-edit-skeleton__panel{display:grid;gap:1.25rem}
.org-edit-skeleton__panel-header{display:grid;gap:.55rem}
.org-edit-skeleton__heading{width:220px;height:24px;border-radius:16px}
.org-edit-skeleton__subheading{width:360px;max-width:100%;height:14px;border-radius:999px}
.org-edit-skeleton__grid{display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:1rem}
.org-edit-skeleton__field{display:grid;gap:.55rem}
.org-edit-skeleton__field--wide{grid-column:1/-1}
.org-edit-skeleton__label{width:140px;height:14px;border-radius:999px}
.org-edit-skeleton__input{width:100%;height:54px;border-radius:18px}
.org-edit-skeleton__textarea{width:100%;height:118px;border-radius:22px}
.org-edit-skeleton__hint{width:52%;height:12px;border-radius:999px}
.org-edit-skeleton__footer{display:flex;justify-content:flex-end;gap:.8rem}
.org-edit-skeleton__button{width:190px;height:48px;border-radius:999px}
.shimmer{position:relative;overflow:hidden;background:linear-gradient(90deg,#edf2f7 0%,#f8fbff 50%,#edf2f7 100%);background-size:200% 100%;animation:org-edit-skeleton-shimmer 1.25s linear infinite}
@keyframes org-edit-skeleton-shimmer{
  0%{background-position:200% 0}
  100%{background-position:-200% 0}
}
@media (max-width: 900px){
  .org-edit-skeleton__hero,.org-edit-skeleton__grid{grid-template-columns:1fr}
  .org-edit-skeleton__badge,.org-edit-skeleton__action{justify-self:start}
}
@media (max-width: 720px){
  .org-edit-skeleton__footer{flex-direction:column}
  .org-edit-skeleton__button{width:100%}
}
</style>
