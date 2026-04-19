<script setup lang="ts">
import {
  AlertTriangle,
  CalendarCheck2,
  CalendarClock,
  CalendarDays,
  CalendarRange,
  CheckCircle2,
  Eye,
  FileLock2,
  Lock,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
} from 'lucide-vue-next';

const periodes = [
  {
    code: 'P1',
    libelle: 'Première période',
    debut: '01 sept. 2025',
    fin: '31 oct. 2025',
    statut: 'Clôturée',
    verrouillage: 'Verrouillée',
  },
  {
    code: 'P2',
    libelle: 'Deuxième période',
    debut: '03 nov. 2025',
    fin: '19 déc. 2025',
    statut: 'Active',
    verrouillage: 'Ouverte',
  },
  {
    code: 'P3',
    libelle: 'Troisième période',
    debut: '05 janv. 2026',
    fin: '27 févr. 2026',
    statut: 'Planifiée',
    verrouillage: 'À verrouiller',
  },
  {
    code: 'P4',
    libelle: 'Quatrième période',
    debut: '02 mars 2026',
    fin: '30 avr. 2026',
    statut: 'Planifiée',
    verrouillage: 'À verrouiller',
  },
  {
    code: 'P5',
    libelle: 'Cinquième période',
    debut: '04 mai 2026',
    fin: '30 juin 2026',
    statut: 'Planifiée',
    verrouillage: 'À verrouiller',
  },
];

const jalons = [
  { date: '19 déc. 2025', libelle: 'Fin de la deuxième période', type: 'Période', criticite: 'Important' },
  { date: '05 janv. 2026', libelle: 'Reprise académique', type: 'Calendrier', criticite: 'Normal' },
  { date: '27 févr. 2026', libelle: 'Contrôle des résultats P3', type: 'Validation', criticite: 'Important' },
  { date: '30 juin 2026', libelle: 'Préparation clôture annuelle', type: 'Clôture', criticite: 'Sensible' },
];
</script>

<template>
  <section class="calendriers-page">
    <header class="calendriers-hero">
      <div>
        <span class="calendriers-hero__eyebrow">Pilotage académique</span>
        <h2>Calendriers académiques</h2>
        <p>Suivi des périodes, jalons, validations et verrouillages de l’année active.</p>
      </div>

      <div class="calendriers-hero__actions">
        <button class="bouton bouton--principal" type="button">
          <Sparkles :size="18" />
          Préparer
        </button>
        <button class="bouton" type="button">
          <Lock :size="18" />
          Verrouiller
        </button>
      </div>
    </header>

    <section class="indicateurs" aria-label="Indicateurs du calendrier académique">
      <article class="indicateur indicateur--principal">
        <div class="indicateur__icone">
          <CalendarRange :size="24" />
        </div>
        <div>
          <span>Période active</span>
          <strong>P2</strong>
          <p>03 nov. 2025 au 19 déc. 2025</p>
        </div>
      </article>

      <article class="indicateur">
        <div class="indicateur__icone indicateur__icone--vert">
          <ShieldCheck :size="22" />
        </div>
        <div>
          <span>Validation</span>
          <strong>En contrôle</strong>
          <p>Les périodes sont suivies avant verrouillage</p>
        </div>
      </article>

      <article class="indicateur">
        <div class="indicateur__icone indicateur__icone--orange">
          <CalendarClock :size="22" />
        </div>
        <div>
          <span>Prochain jalon</span>
          <strong>19 déc.</strong>
          <p>Fin de la période active</p>
        </div>
      </article>

      <article class="indicateur">
        <div class="indicateur__icone indicateur__icone--rouge">
          <FileLock2 :size="22" />
        </div>
        <div>
          <span>Verrouillage</span>
          <strong>À confirmer</strong>
          <p>Avant exploitation définitive</p>
        </div>
      </article>
    </section>

    <section class="barre-outils" aria-label="Filtres des calendriers académiques">
      <label class="champ-recherche">
        <Search :size="18" />
        <input type="search" placeholder="Rechercher une période, une date ou un jalon..." />
      </label>

      <button class="bouton-filtre" type="button">
        <SlidersHorizontal :size="18" />
        Filtres
      </button>

      <div class="badge-contexte">
        <CheckCircle2 :size="18" />
        Année active 2025-2026
      </div>
    </section>

    <section class="grille-calendrier">
      <article class="carte-tableau carte-tableau--large">
        <div class="carte-tableau__entete">
          <div>
            <span>Calendrier</span>
            <h3>Périodes académiques</h3>
          </div>
          <CalendarDays :size="22" />
        </div>

        <div class="tableau-calendrier tableau-calendrier--periodes">
          <div class="tableau-calendrier__ligne tableau-calendrier__ligne--entete">
            <span>Code</span>
            <span>Période</span>
            <span>Date début</span>
            <span>Date fin</span>
            <span>Statut</span>
            <span>Verrouillage</span>
            <span>Action</span>
          </div>

          <div v-for="periode in periodes" :key="periode.code" class="tableau-calendrier__ligne">
            <strong>{{ periode.code }}</strong>
            <span>{{ periode.libelle }}</span>
            <span>{{ periode.debut }}</span>
            <span>{{ periode.fin }}</span>
            <span>
              <span
                class="badge"
                :class="{
                  'badge--vert': periode.statut === 'Active',
                  'badge--orange': periode.statut === 'Planifiée',
                  'badge--gris': periode.statut === 'Clôturée',
                }"
              >
                {{ periode.statut }}
              </span>
            </span>
            <span>{{ periode.verrouillage }}</span>
            <button class="bouton-icone" type="button" aria-label="Consulter la période">
              <Eye :size="16" />
            </button>
          </div>
        </div>
      </article>

      <article class="carte-focus">
        <div class="carte-focus__entete">
          <div>
            <span>État courant</span>
            <h3>Période active</h3>
          </div>
          <CalendarCheck2 :size="24" />
        </div>

        <div class="focus-periode">
          <div class="focus-periode__anneau">
            <strong>P2</strong>
            <span>Active</span>
          </div>

          <div class="focus-periode__details">
            <div>
              <span>Début</span>
              <strong>03 nov. 2025</strong>
            </div>
            <div>
              <span>Fin</span>
              <strong>19 déc. 2025</strong>
            </div>
            <div>
              <span>État</span>
              <strong>Ouverte</strong>
            </div>
          </div>
        </div>
      </article>

      <article class="carte-tableau">
        <div class="carte-tableau__entete">
          <div>
            <span>Jalons</span>
            <h3>Dates importantes</h3>
          </div>
          <AlertTriangle :size="22" />
        </div>

        <div class="tableau-calendrier tableau-calendrier--jalons">
          <div class="tableau-calendrier__ligne tableau-calendrier__ligne--entete">
            <span>Date</span>
            <span>Jalon</span>
            <span>Type</span>
            <span>Criticité</span>
          </div>

          <div v-for="jalon in jalons" :key="`${jalon.date}-${jalon.libelle}`" class="tableau-calendrier__ligne">
            <strong>{{ jalon.date }}</strong>
            <span>{{ jalon.libelle }}</span>
            <span>{{ jalon.type }}</span>
            <span>
              <span class="badge" :class="jalon.criticite === 'Normal' ? 'badge--bleu' : 'badge--orange'">
                {{ jalon.criticite }}
              </span>
            </span>
          </div>
        </div>
      </article>
    </section>
  </section>
</template>

<style scoped>
.calendriers-page {
  display: grid;
  max-width: 1080px;
  gap: 1rem;
}

.calendriers-hero,
.indicateur,
.barre-outils,
.carte-tableau,
.carte-focus {
  border: 1px solid var(--couleur-bordure);
  background: var(--couleur-surface);
  box-shadow: var(--ombre-carte);
}

.calendriers-hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.2rem;
  padding: 1.2rem;
  border-radius: 1rem;
  background:
    radial-gradient(circle at top right, rgba(45, 95, 159, 0.16), transparent 22rem),
    linear-gradient(135deg, #ffffff 0%, #f7faff 100%);
}

.calendriers-hero__eyebrow,
.indicateur span,
.carte-tableau__entete span,
.carte-focus__entete span,
.focus-periode__details span {
  color: var(--couleur-texte-douce);
  font-size: 0.72rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.calendriers-hero h2 {
  margin: 0.25rem 0 0.35rem;
  color: var(--couleur-encre);
  font-size: 1.75rem;
  letter-spacing: -0.03em;
}

.calendriers-hero p {
  margin: 0;
  color: var(--couleur-texte-douce);
  line-height: 1.55;
}

.calendriers-hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
}

.bouton,
.bouton-filtre {
  display: inline-flex;
  min-height: 2.55rem;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  padding: 0 0.95rem;
  border: 1px solid var(--couleur-bordure);
  border-radius: 0.45rem;
  background: #ffffff;
  color: var(--couleur-encre);
  cursor: pointer;
  font-weight: 850;
}

.bouton--principal {
  border-color: var(--couleur-principale);
  background: var(--couleur-principale);
  color: #ffffff;
  box-shadow: 0 10px 18px rgba(45, 95, 159, 0.2);
}

.indicateurs {
  display: grid;
  grid-template-columns: 1.35fr repeat(3, minmax(0, 1fr));
  gap: 0.75rem;
}

.indicateur {
  display: flex;
  min-height: 7.1rem;
  gap: 0.85rem;
  align-items: flex-start;
  padding: 1rem;
  border-radius: 0.85rem;
}

.indicateur--principal {
  background: linear-gradient(135deg, #1f4d85 0%, #2d5f9f 100%);
  color: #ffffff;
}

.indicateur--principal span,
.indicateur--principal strong,
.indicateur--principal p {
  color: #ffffff;
}

.indicateur__icone {
  display: grid;
  width: 2.85rem;
  height: 2.85rem;
  flex: 0 0 auto;
  place-items: center;
  border-radius: 0.7rem;
  background: rgba(255, 255, 255, 0.16);
  color: #ffffff;
}

.indicateur__icone--vert {
  background: var(--couleur-succes);
}

.indicateur__icone--orange {
  background: #e5a324;
}

.indicateur__icone--rouge {
  background: #d94b4b;
}

.indicateur strong {
  display: block;
  margin: 0.28rem 0;
  color: var(--couleur-encre);
  font-size: 1.15rem;
}

.indicateur p {
  margin: 0;
  color: var(--couleur-texte-douce);
  line-height: 1.45;
}

.barre-outils {
  display: flex;
  align-items: center;
  gap: 0.75rem;
  padding: 0.85rem;
  border-radius: 0.9rem;
}

.champ-recherche {
  display: flex;
  min-height: 2.8rem;
  flex: 1;
  align-items: center;
  gap: 0.65rem;
  padding: 0 0.85rem;
  border: 1px solid var(--couleur-bordure);
  border-radius: 0.65rem;
  background: #fbfcfe;
  color: var(--couleur-texte-douce);
}

.champ-recherche input {
  width: 100%;
  border: 0;
  outline: 0;
  background: transparent;
  color: var(--couleur-encre);
}

.badge-contexte {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  padding: 0.72rem 0.85rem;
  border-radius: 999px;
  background: rgba(47, 157, 98, 0.12);
  color: #23784a;
  font-size: 0.85rem;
  font-weight: 900;
  white-space: nowrap;
}

.grille-calendrier {
  display: grid;
  grid-template-columns: 0.82fr 1.18fr;
  gap: 0.85rem;
}

.carte-tableau,
.carte-focus {
  overflow: hidden;
  border-radius: 1rem;
}

.carte-tableau--large {
  grid-column: span 2;
}

.carte-tableau__entete,
.carte-focus__entete {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem;
  border-bottom: 1px solid var(--couleur-bordure);
  background: linear-gradient(180deg, #fbfcfe 0%, #f3f6fa 100%);
}

.carte-tableau__entete h3,
.carte-focus__entete h3 {
  margin: 0.35rem 0 0;
  color: var(--couleur-encre);
  font-size: 1.05rem;
}

.carte-tableau__entete svg,
.carte-focus__entete svg {
  color: var(--couleur-principale);
}

.tableau-calendrier {
  display: grid;
  overflow-x: auto;
}

.tableau-calendrier__ligne {
  display: grid;
  align-items: center;
  gap: 0.8rem;
  min-width: 860px;
  padding: 0.78rem 1rem;
  border-bottom: 1px solid #e7ecf3;
  color: var(--couleur-texte);
}

.tableau-calendrier__ligne:last-child {
  border-bottom: 0;
}

.tableau-calendrier__ligne--entete {
  background: #f3f6fa;
  color: var(--couleur-texte-douce);
  font-size: 0.72rem;
  font-weight: 900;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.tableau-calendrier__ligne strong {
  color: var(--couleur-encre);
}

.tableau-calendrier--periodes .tableau-calendrier__ligne {
  grid-template-columns: 0.55fr 1.4fr 1fr 1fr 0.9fr 1.05fr 0.45fr;
}

.tableau-calendrier--jalons .tableau-calendrier__ligne {
  min-width: 720px;
  grid-template-columns: 0.85fr 1.8fr 0.95fr 0.9fr;
}

.carte-focus {
  min-height: 100%;
  background:
    radial-gradient(circle at top right, rgba(45, 95, 159, 0.12), transparent 18rem),
    #ffffff;
}

.focus-periode {
  display: grid;
  gap: 1rem;
  padding: 1rem;
}

.focus-periode__anneau {
  display: grid;
  width: 8.6rem;
  height: 8.6rem;
  place-items: center;
  justify-self: center;
  border: 12px solid rgba(45, 95, 159, 0.16);
  border-top-color: var(--couleur-principale);
  border-radius: 999px;
  background: #ffffff;
  box-shadow: inset 0 0 0 1px var(--couleur-bordure);
}

.focus-periode__anneau strong {
  color: var(--couleur-encre);
  font-size: 1.7rem;
}

.focus-periode__anneau span {
  margin-top: -1.7rem;
  color: var(--couleur-texte-douce);
  font-size: 0.76rem;
  font-weight: 900;
  text-transform: uppercase;
}

.focus-periode__details {
  display: grid;
  gap: 0.7rem;
}

.focus-periode__details div {
  padding: 0.85rem;
  border: 1px solid var(--couleur-bordure);
  border-radius: 0.75rem;
  background: #fbfcfe;
}

.focus-periode__details strong {
  display: block;
  margin-top: 0.28rem;
  color: var(--couleur-encre);
}

.badge {
  display: inline-flex;
  width: fit-content;
  align-items: center;
  justify-content: center;
  padding: 0.32rem 0.58rem;
  border-radius: 999px;
  font-size: 0.74rem;
  font-weight: 900;
}

.badge--vert {
  background: rgba(47, 157, 98, 0.13);
  color: #23784a;
}

.badge--orange {
  background: rgba(229, 163, 36, 0.18);
  color: #9a5e00;
}

.badge--gris {
  background: #edf0f4;
  color: #667085;
}

.badge--bleu {
  background: rgba(45, 95, 159, 0.12);
  color: #1f4d85;
}

.bouton-icone {
  display: grid;
  width: 2.1rem;
  height: 2.1rem;
  place-items: center;
  border: 1px solid var(--couleur-bordure);
  border-radius: 0.6rem;
  background: #ffffff;
  color: #18365f;
  cursor: pointer;
}

.bouton-icone:hover {
  border-color: var(--couleur-principale);
  background: #edf3fb;
}

@media (max-width: 1180px) {
  .indicateurs,
  .grille-calendrier {
    grid-template-columns: 1fr;
  }

  .carte-tableau--large {
    grid-column: span 1;
  }
}

@media (max-width: 760px) {
  .calendriers-hero,
  .barre-outils {
    align-items: stretch;
    flex-direction: column;
  }

  .calendriers-hero__actions,
  .bouton,
  .bouton-filtre {
    width: 100%;
  }

  .badge-contexte {
    justify-content: center;
    white-space: normal;
  }
}
</style>
