<template>
  <div class="school-modules-overview">
    <div v-if="loading" class="school-modules-overview__skeletons" aria-label="Chargement des modules">
      <div v-for="index in 3" :key="index" class="school-modules-overview__skeleton" />
    </div>

    <div v-else-if="errorMessage" class="school-modules-overview__notice" role="status">
      <strong>Modules momentanement indisponibles</strong>
      <p>{{ errorMessage }}</p>
    </div>

    <div v-else-if="cards.length === 0" class="school-modules-overview__notice">
      <strong>Aucun module actif</strong>
      <p>Cette ecole ne dispose encore d'aucun module actif.</p>
    </div>

    <div v-else class="school-modules-overview__grid">
      <article v-for="card in cards" :key="card.code" class="school-modules-overview__card">
        <div class="school-modules-overview__heading">
          <strong>{{ card.label }}</strong>
          <span>Actif</span>
        </div>
        <p>{{ card.description }}</p>
      </article>
    </div>
  </div>
</template>

<script setup lang="ts">
export interface SchoolModuleOverviewCard {
  code: string;
  label: string;
  description: string;
}

withDefaults(defineProps<{
  cards: readonly SchoolModuleOverviewCard[];
  loading?: boolean;
  errorMessage?: string | null;
}>(), {
  loading: false,
  errorMessage: null,
});
</script>

<style scoped>
.school-modules-overview{display:grid;gap:1rem}
.school-modules-overview__grid,.school-modules-overview__skeletons{display:grid;grid-template-columns:repeat(auto-fit,minmax(220px,1fr));gap:1rem}
.school-modules-overview__card,.school-modules-overview__notice{padding:1rem 1.05rem;border:1px solid rgba(17,40,63,.08);border-radius:22px;background:linear-gradient(180deg,#fbfdff,#fff);box-shadow:0 16px 36px rgba(15,23,42,.05)}
.school-modules-overview__heading{display:flex;align-items:center;justify-content:space-between;gap:.75rem}
.school-modules-overview__heading strong,.school-modules-overview__notice strong{color:#11283f}
.school-modules-overview__heading span{display:inline-flex;padding:.25rem .65rem;border-radius:999px;background:#eaf8ef;color:#166534;font-size:.8rem;font-weight:750}
.school-modules-overview__card p,.school-modules-overview__notice p{margin:.5rem 0 0;color:#587083;line-height:1.55}
.school-modules-overview__skeleton{min-height:110px;border-radius:22px;background:linear-gradient(90deg,#eef3f8 25%,#f8fafc 50%,#eef3f8 75%);background-size:200% 100%;animation:school-modules-pulse 1.2s ease-in-out infinite}
@keyframes school-modules-pulse{to{background-position:-200% 0}}
</style>
