<script setup lang="ts">
import {
  BookOpen,
  CheckCircle2,
  ChevronDown,
  Database,
  Eye,
  FileText,
  Filter,
  GraduationCap,
  Layers3,
  Search,
  ShieldCheck,
  Sparkles,
} from 'lucide-vue-next';

interface ElementReferentielUi {
  code: string;
  libelle: string;
  famille: string;
  statut: 'OFFICIEL' | 'ACTIF' | 'A_VERIFIER';
}

const sections: ElementReferentielUi[] = [
  { code: 'MAT', libelle: 'Maternelle', famille: 'Section scolaire', statut: 'OFFICIEL' },
  { code: 'PRI', libelle: 'Primaire', famille: 'Section scolaire', statut: 'OFFICIEL' },
  { code: 'SEC', libelle: 'Secondaire', famille: 'Section scolaire', statut: 'OFFICIEL' },
];

const options: ElementReferentielUi[] = [
  { code: 'SC', libelle: 'Scientifique', famille: 'Option secondaire', statut: 'ACTIF' },
  { code: 'CG', libelle: 'Commerciale et gestion', famille: 'Option secondaire', statut: 'ACTIF' },
  { code: 'MG', libelle: 'Mécanique générale', famille: 'Option secondaire', statut: 'ACTIF' },
  { code: 'HP', libelle: 'Pédagogie générale', famille: 'Option secondaire', statut: 'ACTIF' },
];

const classesAcademiques: ElementReferentielUi[] = [
  { code: '1PR', libelle: '1ère primaire', famille: 'Primaire', statut: 'OFFICIEL' },
  { code: '6PR', libelle: '6ème primaire', famille: 'Primaire', statut: 'OFFICIEL' },
  { code: '7EB', libelle: '7ème éducation de base', famille: 'Secondaire', statut: 'OFFICIEL' },
  { code: '1SC', libelle: '1ère scientifique', famille: 'Secondaire', statut: 'OFFICIEL' },
];

const programmesOfficiels: ElementReferentielUi[] = [
  { code: 'PRG-1PR', libelle: 'Programme 1ère primaire', famille: 'Programme officiel', statut: 'ACTIF' },
  { code: 'PRG-7EB', libelle: 'Programme 7ème EB', famille: 'Programme officiel', statut: 'ACTIF' },
  { code: 'PRG-1SC', libelle: 'Programme 1ère scientifique', famille: 'Programme officiel', statut: 'ACTIF' },
  { code: 'PRG-2CG', libelle: 'Programme 2ème commerciale et gestion', famille: 'Programme officiel', statut: 'A_VERIFIER' },
];

const elementsReferentiel = [
  ...sections,
  ...options,
  ...classesAcademiques,
  ...programmesOfficiels,
];

function obtenirLibelleStatut(statut: ElementReferentielUi['statut']): string {
  const libelles: Record<ElementReferentielUi['statut'], string> = {
    OFFICIEL: 'Officiel',
    ACTIF: 'Actif',
    A_VERIFIER: 'À vérifier',
  };

  return libelles[statut];
}
</script>

<template>
  <section class="officiel-page">
    <header class="officiel-entete">
      <div>
        <span class="officiel-sur-titre">Référentiel national</span>
        <h2>Référentiel officiel</h2>
        <p>
          Consultation des sections, options, classes académiques et programmes officiels utilisés par l’école.
        </p>
      </div>

      <div class="officiel-entete__actions">
        <button class="officiel-bouton officiel-bouton--principal" type="button">
          <ShieldCheck :size="18" />
          Version active
        </button>
        <button class="officiel-bouton" type="button">
          <Eye :size="18" />
          Consulter
        </button>
      </div>
    </header>

    <section class="officiel-resume" aria-label="Résumé du référentiel officiel">
      <article class="officiel-carte">
        <div class="officiel-carte__icone officiel-carte__icone--bleu">
          <Layers3 :size="23" />
        </div>
        <div>
          <strong>3</strong>
          <span>Sections scolaires</span>
          <small>Maternelle, primaire, secondaire</small>
        </div>
      </article>

      <article class="officiel-carte">
        <div class="officiel-carte__icone officiel-carte__icone--vert">
          <GraduationCap :size="23" />
        </div>
        <div>
          <strong>Options</strong>
          <span>Secondaire</span>
          <small>Consultation officielle</small>
        </div>
      </article>

      <article class="officiel-carte">
        <div class="officiel-carte__icone officiel-carte__icone--orange">
          <BookOpen :size="23" />
        </div>
        <div>
          <strong>Classes</strong>
          <span>Académiques</span>
          <small>Structure de référence</small>
        </div>
      </article>

      <article class="officiel-carte">
        <div class="officiel-carte__icone officiel-carte__icone--violet">
          <FileText :size="23" />
        </div>
        <div>
          <strong>Programmes</strong>
          <span>Officiels</span>
          <small>Versions publiées</small>
        </div>
      </article>
    </section>

    <section class="officiel-grille">
      <article class="officiel-panel officiel-panel--version">
        <div class="officiel-panel__entete">
          <div>
            <span class="officiel-badge">Version</span>
            <h3>État du référentiel</h3>
          </div>
          <CheckCircle2 class="officiel-panel__icone" :size="22" />
        </div>

        <div class="officiel-version">
          <strong>Référentiel actif</strong>
          <p>Les données sont prêtes pour la consultation école. Les imports restent dans la maintenance.</p>
          <div class="officiel-version__meta">
            <span>Source : officielle</span>
            <span>Mode : lecture</span>
          </div>
        </div>
      </article>

      <article class="officiel-panel officiel-panel--familles">
        <div class="officiel-panel__entete">
          <div>
            <span class="officiel-badge">Familles</span>
            <h3>Organisation du référentiel</h3>
          </div>
          <Sparkles class="officiel-panel__icone" :size="22" />
        </div>

        <div class="officiel-familles">
          <button class="officiel-famille officiel-famille--active" type="button">Sections</button>
          <button class="officiel-famille" type="button">Options</button>
          <button class="officiel-famille" type="button">Classes académiques</button>
          <button class="officiel-famille" type="button">Programmes officiels</button>
        </div>
      </article>
    </section>

    <section class="officiel-outils" aria-label="Filtres du référentiel officiel">
      <label class="officiel-recherche">
        <Search :size="18" />
        <input type="search" placeholder="Rechercher un code, un libellé ou une famille..." />
      </label>

      <button class="officiel-selecteur" type="button">
        Famille : Toutes
        <ChevronDown :size="16" />
      </button>

      <button class="officiel-selecteur" type="button">
        Statut : Tous
        <ChevronDown :size="16" />
      </button>

      <button class="officiel-filtre" type="button" aria-label="Filtrer le référentiel officiel">
        <Filter :size="18" />
      </button>
    </section>

    <section class="officiel-tableau" aria-label="Liste du référentiel officiel">
      <div class="officiel-tableau__ligne officiel-tableau__ligne--entete">
        <span>Code</span>
        <span>Libellé</span>
        <span>Famille</span>
        <span>Statut</span>
        <span>Actions</span>
      </div>

      <div
        v-for="element in elementsReferentiel"
        :key="`${element.famille}-${element.code}`"
        class="officiel-tableau__ligne"
      >
        <strong>{{ element.code }}</strong>
        <span>{{ element.libelle }}</span>
        <span>{{ element.famille }}</span>
        <span class="officiel-statut" :data-statut="element.statut">
          {{ obtenirLibelleStatut(element.statut) }}
        </span>
        <div class="officiel-actions">
          <button type="button">
            <Eye :size="16" />
            Voir
          </button>
        </div>
      </div>
    </section>
  </section>
</template>

<style scoped>
.officiel-page {
  display: grid;
  max-width: 1060px;
  gap: 1rem;
}

.officiel-entete {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.officiel-sur-titre {
  color: #2d5f9f;
  font-size: 0.74rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.officiel-entete h2 {
  margin: 0.2rem 0 0.45rem;
  color: #1f2937;
  font-size: 1.58rem;
  font-weight: 850;
}

.officiel-entete p {
  max-width: 42rem;
  margin: 0;
  color: #5f6b7a;
}

.officiel-entete__actions,
.officiel-actions {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.officiel-bouton,
.officiel-selecteur,
.officiel-filtre,
.officiel-actions button {
  display: inline-flex;
  min-height: 2.45rem;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  padding: 0 0.85rem;
  border: 1px solid #dfe5ef;
  border-radius: 0.35rem;
  background: #ffffff;
  color: #1f2937;
  cursor: pointer;
  font-weight: 800;
  transition: transform 120ms ease, box-shadow 120ms ease, border-color 120ms ease;
}

.officiel-bouton:hover,
.officiel-selecteur:hover,
.officiel-filtre:hover,
.officiel-actions button:hover {
  transform: translateY(-1px);
  border-color: #c8d3e4;
  box-shadow: 0 8px 16px rgba(31, 41, 55, 0.08);
}

.officiel-bouton--principal {
  border-color: #2d5f9f;
  background: #2d5f9f;
  color: #ffffff;
  box-shadow: 0 8px 18px rgba(45, 95, 159, 0.18);
}

.officiel-resume {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.75rem;
}

.officiel-carte,
.officiel-panel,
.officiel-outils,
.officiel-tableau {
  border: 1px solid #dfe5ef;
  border-radius: 0.55rem;
  background: #ffffff;
  box-shadow: 0 8px 18px rgba(31, 41, 55, 0.07);
}

.officiel-carte {
  display: flex;
  min-height: 7.2rem;
  gap: 0.85rem;
  align-items: flex-start;
  padding: 1rem;
}

.officiel-carte__icone {
  display: grid;
  width: 2.9rem;
  height: 2.9rem;
  flex: 0 0 auto;
  place-items: center;
  border-radius: 0.35rem;
  color: #ffffff;
  box-shadow: inset 0 -10px 18px rgba(0, 0, 0, 0.08);
}

.officiel-carte__icone--bleu {
  background: #2f99c9;
}

.officiel-carte__icone--vert {
  background: #2f9d62;
}

.officiel-carte__icone--orange {
  background: #e5a324;
}

.officiel-carte__icone--violet {
  background: #6f56d9;
}

.officiel-carte strong {
  display: block;
  color: #1f2937;
  font-size: 1.28rem;
  line-height: 1.1;
}

.officiel-carte span,
.officiel-carte small {
  display: block;
  color: #5f6b7a;
}

.officiel-carte span {
  margin-top: 0.2rem;
  font-weight: 750;
}

.officiel-carte small {
  margin-top: 0.65rem;
  font-size: 0.78rem;
}

.officiel-grille {
  display: grid;
  grid-template-columns: 1fr 1.2fr;
  gap: 0.8rem;
}

.officiel-panel {
  overflow: hidden;
}

.officiel-panel__entete {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.9rem 1rem;
  border-bottom: 1px solid #dfe5ef;
  background: #fbfcfe;
}

.officiel-panel__entete h3 {
  margin: 0.45rem 0 0;
  color: #1f2937;
  font-size: 1.05rem;
}

.officiel-panel__icone {
  color: #2d5f9f;
}

.officiel-badge {
  width: fit-content;
  padding: 0.26rem 0.58rem;
  border: 1px solid rgba(47, 157, 98, 0.18);
  border-radius: 0.28rem;
  background: rgba(47, 157, 98, 0.12);
  color: #23784a;
  font-size: 0.7rem;
  font-weight: 900;
  letter-spacing: 0.04em;
  text-transform: uppercase;
}

.officiel-version {
  padding: 1rem;
}

.officiel-version strong {
  color: #1f2937;
}

.officiel-version p {
  margin: 0.45rem 0 1rem;
  color: #5f6b7a;
  line-height: 1.55;
}

.officiel-version__meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
}

.officiel-version__meta span,
.officiel-famille {
  padding: 0.45rem 0.65rem;
  border-radius: 999px;
  background: #f2f5fa;
  color: #374151;
  font-size: 0.82rem;
  font-weight: 750;
}

.officiel-familles {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
  padding: 1rem;
}

.officiel-famille {
  border: 1px solid #dfe5ef;
  cursor: pointer;
}

.officiel-famille--active {
  border-color: #2d5f9f;
  background: #edf3fb;
  color: #18365f;
}

.officiel-outils {
  display: grid;
  grid-template-columns: minmax(18rem, 1fr) auto auto auto;
  gap: 0.5rem;
  padding: 0.65rem;
}

.officiel-recherche {
  display: flex;
  min-height: 2.45rem;
  align-items: center;
  gap: 0.55rem;
  padding: 0 0.75rem;
  border: 1px solid #dfe5ef;
  border-radius: 0.35rem;
  color: #6b7280;
}

.officiel-recherche input {
  width: 100%;
  border: 0;
  outline: 0;
  color: #1f2937;
}

.officiel-tableau {
  overflow: hidden;
}

.officiel-tableau__ligne {
  display: grid;
  grid-template-columns: 0.8fr 1.7fr 1.15fr 0.85fr 0.65fr;
  min-height: 3rem;
  align-items: center;
  gap: 0.75rem;
  padding: 0 1rem;
  border-bottom: 1px solid #dfe5ef;
  color: #374151;
}

.officiel-tableau__ligne:last-child {
  border-bottom: 0;
}

.officiel-tableau__ligne--entete {
  background: #f3f6fa;
  color: #5f6b7a;
  font-size: 0.75rem;
  font-weight: 900;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.officiel-tableau__ligne strong {
  color: #1f2937;
}

.officiel-statut {
  width: fit-content;
  padding: 0.3rem 0.55rem;
  border-radius: 0.35rem;
  font-size: 0.75rem;
  font-weight: 900;
}

.officiel-statut[data-statut='OFFICIEL'],
.officiel-statut[data-statut='ACTIF'] {
  background: rgba(47, 157, 98, 0.12);
  color: #23784a;
}

.officiel-statut[data-statut='A_VERIFIER'] {
  background: rgba(229, 163, 36, 0.16);
  color: #946000;
}

@media (max-width: 1100px) {
  .officiel-resume,
  .officiel-grille,
  .officiel-outils {
    grid-template-columns: 1fr 1fr;
  }

  .officiel-tableau {
    overflow-x: auto;
  }

  .officiel-tableau__ligne {
    min-width: 820px;
  }
}
</style>
