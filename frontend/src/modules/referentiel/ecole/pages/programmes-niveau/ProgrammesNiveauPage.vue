<script setup lang="ts">
import BadgeStatut from '../../../commun/composants/BadgeStatut.vue';
import { BookOpenCheck, ClipboardCheck, ListChecks } from 'lucide-vue-next';
</script>

<template>
  <section class="page-referentiel">
    <div class="page-referentiel__hero">
      <div>
        <h2>Programmes niveau</h2>
        <p>Cette page permettra de suivre les programmes locaux initialisés depuis le référentiel officiel.</p>
      </div>
    </div>

    <section class="programmes-kpis" aria-label="Indicateurs programmes">
      <article class="programmes-kpi">
        <div class="programmes-kpi__icone programmes-kpi__icone--bleu"><BookOpenCheck /></div>
        <div><span>Initialisation</span><strong>À lancer</strong></div>
      </article>
      <article class="programmes-kpi">
        <div class="programmes-kpi__icone programmes-kpi__icone--vert"><ClipboardCheck /></div>
        <div><span>Validation</span><strong>En attente</strong></div>
      </article>
      <article class="programmes-kpi">
        <div class="programmes-kpi__icone programmes-kpi__icone--violet"><ListChecks /></div>
        <div><span>État local</span><strong>À produire</strong></div>
      </article>
    </section>

    <section class="bloc-programmes">
      <div class="bloc-programmes__entete">
        <div>
          <BadgeStatut libelle="Pilotage" />
          <h3>Cycle programme niveau</h3>
        </div>
      </div>
      <div class="bloc-programmes__contenu">
        <p>Le module couvrira l’initialisation, la validation et l’archivage des programmes par année active.</p>
      </div>
    </section>
  </section>
</template>

<style scoped>
.page-referentiel {
  gap: 1rem;
}

.programmes-kpis { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 0.72rem; }
.programmes-kpi { display: flex; min-height: 7.5rem; gap: 0.9rem; align-items: flex-start; padding: 1rem; border: 1px solid var(--couleur-bordure); border-radius: var(--rayon-moyen); background: var(--couleur-surface); box-shadow: var(--ombre-carte); transition: transform 140ms ease, box-shadow 140ms ease; }
.programmes-kpi:hover { transform: translateY(-1px); box-shadow: var(--ombre-flottante); }
.programmes-kpi__icone { display: grid; width: 2.75rem; height: 2.75rem; place-items: center; border-radius: var(--rayon-moyen); color: #fff; flex: 0 0 auto; }
.programmes-kpi__icone svg { width: 1.4rem; height: 1.4rem; stroke-width: 2.2; }
.programmes-kpi__icone--bleu { background: var(--couleur-principale); }
.programmes-kpi__icone--vert { background: var(--couleur-succes); }
.programmes-kpi__icone--violet { background: #6f56d9; }
.programmes-kpi span { display: block; color: var(--couleur-texte-douce); font-size: 0.74rem; font-weight: 900; letter-spacing: 0.05em; text-transform: uppercase; }
.programmes-kpi strong { display: block; margin-top: 0.3rem; color: var(--couleur-encre); }
.bloc-programmes { min-height: 13.5rem; border: 1px solid var(--couleur-bordure); border-radius: var(--rayon-moyen); background: var(--couleur-surface); box-shadow: var(--ombre-carte); transition: transform 140ms ease, box-shadow 140ms ease; }
.bloc-programmes:hover { transform: translateY(-1px); box-shadow: var(--ombre-flottante); }
.bloc-programmes__entete { padding: 0.9rem 1rem; border-bottom: 1px solid var(--couleur-bordure); background: #fbfcfe; }
.bloc-programmes__entete h3 { margin: 0.45rem 0 0; color: var(--couleur-encre); }
.bloc-programmes__contenu { padding: 0.95rem 1rem; color: var(--couleur-texte); }
.bloc-programmes__contenu p { margin: 0; }
@media (max-width: 900px) { .programmes-kpis { grid-template-columns: 1fr; } }
</style>
