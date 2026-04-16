<script setup lang="ts">
import BadgeStatut from '../../../commun/composants/BadgeStatut.vue';
import { CalendarClock, CalendarRange, Lock, ShieldCheck } from 'lucide-vue-next';
</script>

<template>
  <section class="page-referentiel">
    <div class="page-referentiel__hero">
      <div>
        <h2>Calendriers académiques</h2>
        <p>Cette page structurera les périodes académiques, leur validation et leur verrouillage.</p>
      </div>
    </div>

    <section class="calendriers-kpis" aria-label="Indicateurs calendrier">
      <article class="calendriers-kpi">
        <div class="calendriers-kpi__icone calendriers-kpi__icone--bleu"><CalendarRange /></div>
        <div>
          <span>Période active</span>
          <strong>À connecter</strong>
        </div>
      </article>
      <article class="calendriers-kpi">
        <div class="calendriers-kpi__icone calendriers-kpi__icone--vert"><ShieldCheck /></div>
        <div>
          <span>Validation</span>
          <strong>En attente</strong>
        </div>
      </article>
      <article class="calendriers-kpi">
        <div class="calendriers-kpi__icone calendriers-kpi__icone--violet"><Lock /></div>
        <div>
          <span>Verrouillage</span>
          <strong>À planifier</strong>
        </div>
      </article>
    </section>

    <section class="calendriers-grille">
      <article class="bloc-calendriers">
        <div class="bloc-calendriers__entete">
          <div>
            <BadgeStatut libelle="Roadmap" />
            <h3>Étapes métier</h3>
          </div>
        </div>
        <div class="liste-etapes">
          <p><CalendarClock class="icone-etape" /> Définir les périodes académiques.</p>
          <p><ShieldCheck class="icone-etape" /> Valider les périodes avec le référentiel courant.</p>
          <p><Lock class="icone-etape" /> Verrouiller le calendrier avant exploitation.</p>
        </div>
      </article>
    </section>
  </section>
</template>

<style scoped>
.page-referentiel {
  gap: 1rem;
}

.calendriers-kpis {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.72rem;
}

.calendriers-kpi {
  display: flex;
  min-height: 7.5rem;
  gap: 0.9rem;
  align-items: flex-start;
  padding: 1rem;
  border: 1px solid var(--couleur-bordure);
  border-radius: var(--rayon-moyen);
  background: var(--couleur-surface);
  box-shadow: var(--ombre-carte);
  transition: transform 140ms ease, box-shadow 140ms ease;
}

.calendriers-kpi:hover {
  transform: translateY(-1px);
  box-shadow: var(--ombre-flottante);
}

.calendriers-kpi__icone {
  display: grid;
  width: 2.75rem;
  height: 2.75rem;
  flex: 0 0 auto;
  place-items: center;
  border-radius: var(--rayon-moyen);
  color: #fff;
}

.calendriers-kpi__icone svg {
  width: 1.4rem;
  height: 1.4rem;
  stroke-width: 2.2;
}

.calendriers-kpi__icone--bleu {
  background: var(--couleur-principale);
}

.calendriers-kpi__icone--vert {
  background: var(--couleur-succes);
}

.calendriers-kpi__icone--violet {
  background: #6f56d9;
}

.calendriers-kpi span {
  display: block;
  color: var(--couleur-texte-douce);
  font-size: 0.74rem;
  font-weight: 900;
  letter-spacing: 0.05em;
  text-transform: uppercase;
}

.calendriers-kpi strong {
  display: block;
  margin-top: 0.3rem;
  color: var(--couleur-encre);
}

.calendriers-grille {
  display: grid;
}

.bloc-calendriers {
  min-height: 13.5rem;
  border: 1px solid var(--couleur-bordure);
  border-radius: var(--rayon-moyen);
  background: var(--couleur-surface);
  box-shadow: var(--ombre-carte);
  transition: transform 140ms ease, box-shadow 140ms ease;
}

.bloc-calendriers:hover {
  transform: translateY(-1px);
  box-shadow: var(--ombre-flottante);
}

.bloc-calendriers__entete {
  padding: 0.9rem 1rem;
  border-bottom: 1px solid var(--couleur-bordure);
  background: #fbfcfe;
}

.bloc-calendriers__entete h3 {
  margin: 0.45rem 0 0;
  color: var(--couleur-encre);
}

.liste-etapes {
  display: grid;
  padding: 0.35rem 1rem;
}

.liste-etapes p {
  display: flex;
  gap: 0.65rem;
  align-items: center;
  margin: 0;
  padding: 0.8rem 0;
  border-bottom: 1px solid var(--couleur-bordure);
  color: var(--couleur-texte);
}

.liste-etapes p:last-child {
  border-bottom: 0;
}

.icone-etape {
  width: 1rem;
  height: 1rem;
  color: var(--couleur-principale);
}

@media (max-width: 900px) {
  .calendriers-kpis {
    grid-template-columns: 1fr;
  }
}
</style>
