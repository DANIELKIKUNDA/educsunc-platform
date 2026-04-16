<script setup lang="ts">
import BadgeStatut from '../../../commun/composants/BadgeStatut.vue';
import { DatabaseZap, FileUp, ShieldAlert } from 'lucide-vue-next';
</script>

<template>
  <section class="page-referentiel">
    <div class="page-referentiel__hero">
      <div>
        <h2>Maintenance référentiel</h2>
        <p>Cette zone regroupera les imports, publications de versions et migrations avec confirmations fortes.</p>
      </div>
    </div>

    <section class="maintenance-kpis" aria-label="Indicateurs maintenance">
      <article class="maintenance-kpi">
        <div class="maintenance-kpi__icone maintenance-kpi__icone--bleu"><FileUp /></div>
        <div><span>Imports</span><strong>À contrôler</strong></div>
      </article>
      <article class="maintenance-kpi">
        <div class="maintenance-kpi__icone maintenance-kpi__icone--violet"><DatabaseZap /></div>
        <div><span>Migrations</span><strong>Préparation requise</strong></div>
      </article>
      <article class="maintenance-kpi">
        <div class="maintenance-kpi__icone maintenance-kpi__icone--orange"><ShieldAlert /></div>
        <div><span>Confirmations</span><strong>Renforcées</strong></div>
      </article>
    </section>

    <section class="bloc-maintenance">
      <div class="bloc-maintenance__entete">
        <div>
          <BadgeStatut libelle="Sécurité d’exécution" />
          <h3>Opérations sensibles</h3>
        </div>
      </div>
      <div class="bloc-maintenance__contenu">
        <p>Les actions de maintenance resteront traçables avec validations explicites avant exécution.</p>
      </div>
    </section>
  </section>
</template>

<style scoped>
.page-referentiel {
  gap: 1rem;
}

.maintenance-kpis { display: grid; grid-template-columns: repeat(3, minmax(0, 1fr)); gap: 0.72rem; }
.maintenance-kpi { display: flex; min-height: 7.5rem; gap: 0.9rem; align-items: flex-start; padding: 1rem; border: 1px solid var(--couleur-bordure); border-radius: var(--rayon-moyen); background: var(--couleur-surface); box-shadow: var(--ombre-carte); transition: transform 140ms ease, box-shadow 140ms ease; }
.maintenance-kpi:hover { transform: translateY(-1px); box-shadow: var(--ombre-flottante); }
.maintenance-kpi__icone { display: grid; width: 2.75rem; height: 2.75rem; place-items: center; border-radius: var(--rayon-moyen); color: #fff; flex: 0 0 auto; }
.maintenance-kpi__icone svg { width: 1.4rem; height: 1.4rem; stroke-width: 2.2; }
.maintenance-kpi__icone--bleu { background: var(--couleur-principale); }
.maintenance-kpi__icone--violet { background: #6f56d9; }
.maintenance-kpi__icone--orange { background: var(--couleur-accent); }
.maintenance-kpi span { display: block; color: var(--couleur-texte-douce); font-size: 0.74rem; font-weight: 900; letter-spacing: 0.05em; text-transform: uppercase; }
.maintenance-kpi strong { display: block; margin-top: 0.3rem; color: var(--couleur-encre); }
.bloc-maintenance { min-height: 13.5rem; border: 1px solid var(--couleur-bordure); border-radius: var(--rayon-moyen); background: var(--couleur-surface); box-shadow: var(--ombre-carte); transition: transform 140ms ease, box-shadow 140ms ease; }
.bloc-maintenance:hover { transform: translateY(-1px); box-shadow: var(--ombre-flottante); }
.bloc-maintenance__entete { padding: 0.9rem 1rem; border-bottom: 1px solid var(--couleur-bordure); background: #fbfcfe; }
.bloc-maintenance__entete h3 { margin: 0.45rem 0 0; color: var(--couleur-encre); }
.bloc-maintenance__contenu { padding: 0.95rem 1rem; color: var(--couleur-texte); }
.bloc-maintenance__contenu p { margin: 0; }
@media (max-width: 900px) { .maintenance-kpis { grid-template-columns: 1fr; } }
</style>
