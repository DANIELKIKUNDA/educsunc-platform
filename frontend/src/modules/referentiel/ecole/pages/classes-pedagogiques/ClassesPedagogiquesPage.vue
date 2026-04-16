<script setup lang="ts">
import BadgeStatut from '../../../commun/composants/BadgeStatut.vue';
import { Layers, School, Users } from 'lucide-vue-next';
</script>

<template>
  <section class="page-referentiel">
    <div class="page-referentiel__hero">
      <div>
        <h2>Classes pédagogiques</h2>
        <p>Cette page organisera les classes locales exploitées par l’école pour l’année active.</p>
      </div>
    </div>

    <section class="classes-kpis" aria-label="Indicateurs classes">
      <article class="classes-kpi">
        <div class="classes-kpi__icone classes-kpi__icone--bleu"><School /></div>
        <div><span>Année active</span><strong>À connecter</strong></div>
      </article>
      <article class="classes-kpi">
        <div class="classes-kpi__icone classes-kpi__icone--vert"><Users /></div>
        <div><span>Effectifs</span><strong>À charger</strong></div>
      </article>
      <article class="classes-kpi">
        <div class="classes-kpi__icone classes-kpi__icone--violet"><Layers /></div>
        <div><span>Niveaux</span><strong>À structurer</strong></div>
      </article>
    </section>

    <section class="bloc-classes">
      <div class="bloc-classes__entete">
        <div>
          <BadgeStatut libelle="Structure locale" />
          <h3>Préparation des classes</h3>
        </div>
      </div>
      <div class="bloc-classes__contenu">
        <p>Les classes pédagogiques seront synchronisées depuis les données de l’école et alignées avec l’année active.</p>
      </div>
    </section>
  </section>
</template>

<style scoped>
.page-referentiel {
  gap: 1rem;
}

.classes-kpis { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 0.72rem; }
.classes-kpi { display: flex; min-height: 7.5rem; gap: 0.9rem; align-items: flex-start; padding: 1rem; border: 1px solid var(--couleur-bordure); border-radius: var(--rayon-moyen); background: var(--couleur-surface); box-shadow: var(--ombre-carte); transition: transform 140ms ease, box-shadow 140ms ease; }
.classes-kpi:hover { transform: translateY(-1px); box-shadow: var(--ombre-flottante); }
.classes-kpi__icone { display: grid; width: 2.75rem; height: 2.75rem; place-items: center; border-radius: var(--rayon-moyen); color: #fff; flex: 0 0 auto; }
.classes-kpi__icone svg { width: 1.4rem; height: 1.4rem; stroke-width: 2.2; }
.classes-kpi__icone--bleu { background: var(--couleur-principale); }
.classes-kpi__icone--vert { background: var(--couleur-succes); }
.classes-kpi__icone--violet { background: #6f56d9; }
.classes-kpi span { display: block; color: var(--couleur-texte-douce); font-size: 0.74rem; font-weight: 900; letter-spacing: 0.05em; text-transform: uppercase; }
.classes-kpi strong { display: block; margin-top: 0.3rem; color: var(--couleur-encre); }
.bloc-classes { min-height: 13.5rem; border: 1px solid var(--couleur-bordure); border-radius: var(--rayon-moyen); background: var(--couleur-surface); box-shadow: var(--ombre-carte); transition: transform 140ms ease, box-shadow 140ms ease; }
.bloc-classes:hover { transform: translateY(-1px); box-shadow: var(--ombre-flottante); }
.bloc-classes__entete { padding: 0.9rem 1rem; border-bottom: 1px solid var(--couleur-bordure); background: #fbfcfe; }
.bloc-classes__entete h3 { margin: 0.45rem 0 0; color: var(--couleur-encre); }
.bloc-classes__contenu { padding: 0.95rem 1rem; color: var(--couleur-texte); }
.bloc-classes__contenu p { margin: 0; }
@media (max-width: 900px) { .classes-kpis { grid-template-columns: 1fr; } }
</style>
