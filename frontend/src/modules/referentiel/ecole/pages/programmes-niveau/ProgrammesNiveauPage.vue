<script setup lang="ts">
import {
  BookOpenCheck,
  CheckCircle2,
  Clock3,
  Eye,
  FileCheck2,
  Layers3,
  ListChecks,
  Search,
  ShieldCheck,
  SlidersHorizontal,
  Sparkles,
} from 'lucide-vue-next';

const programmesNiveau = [
  {
    classe: '1ère primaire',
    codeClasse: '1PR',
    section: 'Primaire',
    option: '-',
    cours: 9,
    totalPonderations: 500,
    statut: 'Validé',
    source: 'Référentiel officiel',
  },
  {
    classe: '7ème éducation de base',
    codeClasse: '7EB',
    section: 'Secondaire',
    option: '-',
    cours: 12,
    totalPonderations: 600,
    statut: 'À vérifier',
    source: 'Référentiel officiel',
  },
  {
    classe: '1ère scientifique',
    codeClasse: '1SC',
    section: 'Secondaire',
    option: 'Scientifique',
    cours: 14,
    totalPonderations: 700,
    statut: 'Validé',
    source: 'Référentiel officiel',
  },
  {
    classe: '2ème commerciale et gestion',
    codeClasse: '2CG',
    section: 'Secondaire',
    option: 'Commerciale et gestion',
    cours: 15,
    totalPonderations: 720,
    statut: 'Brouillon',
    source: 'Initialisation locale',
  },
];

const lignesProgramme = [
  { ordre: '01', cours: 'Français', domaine: 'Langues', ponderation: 80, statut: 'Confirmé' },
  { ordre: '02', cours: 'Mathématiques', domaine: 'Sciences', ponderation: 100, statut: 'Confirmé' },
  { ordre: '03', cours: 'Éducation civique et morale', domaine: 'Vie sociale', ponderation: 40, statut: 'Confirmé' },
  { ordre: '04', cours: 'Sciences physiques', domaine: 'Sciences', ponderation: 60, statut: 'À vérifier' },
  { ordre: '05', cours: 'Technologie', domaine: 'Formation technique', ponderation: 60, statut: 'À vérifier' },
];
</script>

<template>
  <section class="programmes-page">
    <header class="programmes-hero">
      <div>
        <span class="programmes-hero__eyebrow">Exploitation locale</span>
        <h2>Programmes niveau</h2>
        <p>Suivi des programmes utilisés par classe pour l’année active, avec cours et pondérations.</p>
      </div>

      <div class="programmes-hero__actions">
        <button class="bouton bouton--principal" type="button">
          <Sparkles :size="18" />
          Initialiser
        </button>
        <button class="bouton" type="button">
          <FileCheck2 :size="18" />
          Valider
        </button>
      </div>
    </header>

    <section class="indicateurs" aria-label="Indicateurs des programmes niveau">
      <article class="indicateur indicateur--principal">
        <div class="indicateur__icone">
          <BookOpenCheck :size="24" />
        </div>
        <div>
          <span>Programmes niveau</span>
          <strong>4 suivis</strong>
          <p>Alignement entre classes, cours et pondérations.</p>
        </div>
      </article>

      <article class="indicateur">
        <div class="indicateur__icone indicateur__icone--vert">
          <CheckCircle2 :size="22" />
        </div>
        <div>
          <span>Validés</span>
          <strong>2</strong>
          <p>Prêts pour l’exploitation scolaire</p>
        </div>
      </article>

      <article class="indicateur">
        <div class="indicateur__icone indicateur__icone--orange">
          <Clock3 :size="22" />
        </div>
        <div>
          <span>À vérifier</span>
          <strong>1</strong>
          <p>Contrôle pédagogique requis</p>
        </div>
      </article>

      <article class="indicateur">
        <div class="indicateur__icone indicateur__icone--bleu">
          <Layers3 :size="22" />
        </div>
        <div>
          <span>Pondérations</span>
          <strong>Contrôlées</strong>
          <p>Lecture par programme et par cours</p>
        </div>
      </article>
    </section>

    <section class="barre-outils" aria-label="Filtres des programmes niveau">
      <label class="champ-recherche">
        <Search :size="18" />
        <input type="search" placeholder="Rechercher une classe, une option ou un cours..." />
      </label>

      <button class="bouton-filtre" type="button">
        <SlidersHorizontal :size="18" />
        Filtres
      </button>

      <div class="badge-securite">
        <ShieldCheck :size="18" />
        Année active uniquement
      </div>
    </section>

    <section class="grille-programmes">
      <article class="carte-tableau carte-tableau--large">
        <div class="carte-tableau__entete">
          <div>
            <span>Pilotage</span>
            <h3>Programmes par classe</h3>
          </div>
          <ListChecks :size="22" />
        </div>

        <div class="tableau-programmes tableau-programmes--principal">
          <div class="tableau-programmes__ligne tableau-programmes__ligne--entete">
            <span>Classe</span>
            <span>Section</span>
            <span>Option</span>
            <span>Cours</span>
            <span>Pondération</span>
            <span>Statut</span>
            <span>Action</span>
          </div>

          <div
            v-for="programme in programmesNiveau"
            :key="programme.codeClasse"
            class="tableau-programmes__ligne"
          >
            <div>
              <strong>{{ programme.classe }}</strong>
              <small>{{ programme.codeClasse }} · {{ programme.source }}</small>
            </div>
            <span>{{ programme.section }}</span>
            <span>{{ programme.option }}</span>
            <span>{{ programme.cours }}</span>
            <span>{{ programme.totalPonderations }}</span>
            <span>
              <span
                class="badge"
                :class="{
                  'badge--vert': programme.statut === 'Validé',
                  'badge--orange': programme.statut === 'À vérifier',
                  'badge--gris': programme.statut === 'Brouillon',
                }"
              >
                {{ programme.statut }}
              </span>
            </span>
            <button class="bouton-icone" type="button" aria-label="Consulter le programme">
              <Eye :size="16" />
            </button>
          </div>
        </div>
      </article>

      <article class="carte-focus">
        <div class="carte-focus__entete">
          <div>
            <span>Lecture rapide</span>
            <h3>1ère scientifique</h3>
          </div>
          <BookOpenCheck :size="24" />
        </div>

        <div class="focus-statuts">
          <div>
            <span>Section</span>
            <strong>Secondaire</strong>
          </div>
          <div>
            <span>Option</span>
            <strong>Scientifique</strong>
          </div>
          <div>
            <span>Total</span>
            <strong>700 pts</strong>
          </div>
        </div>
      </article>

      <article class="carte-tableau carte-tableau--detail">
        <div class="carte-tableau__entete">
          <div>
            <span>Détail</span>
            <h3>Cours et pondérations</h3>
          </div>
          <FileCheck2 :size="22" />
        </div>

        <div class="tableau-programmes tableau-programmes--lignes">
          <div class="tableau-programmes__ligne tableau-programmes__ligne--entete">
            <span>Ordre</span>
            <span>Cours</span>
            <span>Domaine</span>
            <span>Pondération</span>
            <span>Statut</span>
          </div>

          <div v-for="ligne in lignesProgramme" :key="ligne.ordre" class="tableau-programmes__ligne">
            <strong>{{ ligne.ordre }}</strong>
            <span>{{ ligne.cours }}</span>
            <span>{{ ligne.domaine }}</span>
            <span>{{ ligne.ponderation }}</span>
            <span>
              <span class="badge" :class="ligne.statut === 'Confirmé' ? 'badge--vert' : 'badge--orange'">
                {{ ligne.statut }}
              </span>
            </span>
          </div>
        </div>
      </article>
    </section>
  </section>
</template>

<style scoped>
.programmes-page {
  display: grid;
  max-width: 1080px;
  gap: 1rem;
}

.programmes-hero,
.indicateur,
.barre-outils,
.carte-tableau,
.carte-focus {
  border: 1px solid var(--couleur-bordure);
  background: var(--couleur-surface);
  box-shadow: var(--ombre-carte);
}

.programmes-hero {
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

.programmes-hero__eyebrow,
.indicateur span,
.carte-tableau__entete span,
.carte-focus__entete span,
.focus-statuts span {
  color: var(--couleur-texte-douce);
  font-size: 0.72rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.programmes-hero h2 {
  margin: 0.25rem 0 0.35rem;
  color: var(--couleur-encre);
  font-size: 1.75rem;
  letter-spacing: -0.03em;
}

.programmes-hero p {
  margin: 0;
  color: var(--couleur-texte-douce);
  line-height: 1.55;
}

.programmes-hero__actions {
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

.indicateur__icone--bleu {
  background: #2f99c9;
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

.badge-securite {
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

.grille-programmes {
  display: grid;
  grid-template-columns: 1.45fr 0.75fr;
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

.tableau-programmes {
  display: grid;
  overflow-x: auto;
}

.tableau-programmes__ligne {
  display: grid;
  align-items: center;
  gap: 0.8rem;
  min-width: 940px;
  padding: 0.78rem 1rem;
  border-bottom: 1px solid #e7ecf3;
  color: var(--couleur-texte);
}

.tableau-programmes__ligne:last-child {
  border-bottom: 0;
}

.tableau-programmes__ligne--entete {
  background: #f3f6fa;
  color: var(--couleur-texte-douce);
  font-size: 0.72rem;
  font-weight: 900;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.tableau-programmes__ligne strong {
  color: var(--couleur-encre);
}

.tableau-programmes__ligne small {
  display: block;
  margin-top: 0.16rem;
  color: var(--couleur-texte-douce);
}

.tableau-programmes--principal .tableau-programmes__ligne {
  grid-template-columns: 1.45fr 1fr 1.3fr 0.55fr 0.8fr 0.85fr 0.42fr;
}

.tableau-programmes--lignes .tableau-programmes__ligne {
  min-width: 760px;
  grid-template-columns: 0.55fr 1.65fr 1.25fr 0.9fr 0.85fr;
}

.carte-focus {
  min-height: 100%;
  background:
    radial-gradient(circle at top right, rgba(47, 153, 201, 0.12), transparent 18rem),
    #ffffff;
}

.focus-statuts {
  display: grid;
  gap: 0.7rem;
  padding: 1rem;
}

.focus-statuts div {
  padding: 0.85rem;
  border: 1px solid var(--couleur-bordure);
  border-radius: 0.75rem;
  background: #fbfcfe;
}

.focus-statuts strong {
  display: block;
  margin-top: 0.28rem;
  color: var(--couleur-encre);
}

.carte-tableau--detail {
  min-width: 0;
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
  .grille-programmes {
    grid-template-columns: 1fr;
  }

  .carte-tableau--large {
    grid-column: span 1;
  }
}

@media (max-width: 760px) {
  .programmes-hero,
  .barre-outils {
    align-items: stretch;
    flex-direction: column;
  }

  .programmes-hero__actions,
  .bouton,
  .bouton-filtre {
    width: 100%;
  }

  .badge-securite {
    justify-content: center;
    white-space: normal;
  }
}
</style>
