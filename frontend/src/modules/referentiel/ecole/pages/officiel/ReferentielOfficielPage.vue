<script setup lang="ts">
import {
  ArrowUpRight,
  BookOpen,
  CheckCircle2,
  Eye,
  FileText,
  GraduationCap,
  Layers3,
  LibraryBig,
  School,
  Search,
  ShieldCheck,
  Sparkles,
} from 'lucide-vue-next';

const sections = [
  { code: 'MAT', libelle: 'Maternelle', description: 'Cycle initial de l’école.' },
  { code: 'PRI', libelle: 'Primaire', description: 'Cycle primaire officiel.' },
  { code: 'SEC', libelle: 'Secondaire', description: 'Éducation de base et humanités.' },
];

const options = [
  { code: 'SC', abreviation: 'SC', libelle: 'Scientifique' },
  { code: 'CG', abreviation: 'CG', libelle: 'Commerciale et gestion' },
  { code: 'MG', abreviation: 'MG', libelle: 'Mécanique générale' },
  { code: 'HP', abreviation: 'HP', libelle: 'Pédagogie générale' },
];

const classesAcademiques = [
  { code: '1PR', libelle: '1ère primaire', section: 'Primaire', option: '-' },
  { code: '6PR', libelle: '6ème primaire', section: 'Primaire', option: '-' },
  { code: '7EB', libelle: '7ème éducation de base', section: 'Secondaire', option: '-' },
  { code: '1SC', libelle: '1ère scientifique', section: 'Secondaire', option: 'Scientifique' },
  { code: '2CG', libelle: '2ème commerciale et gestion', section: 'Secondaire', option: 'Commerciale et gestion' },
];

const programmes = [
  { classe: '1PR', option: '-', version: 'Officielle active', statut: 'Publié' },
  { classe: '7EB', option: '-', version: 'Officielle active', statut: 'Publié' },
  { classe: '1SC', option: 'Scientifique', version: 'Officielle active', statut: 'Publié' },
  { classe: '2CG', option: 'Commerciale et gestion', version: 'À vérifier', statut: 'Préparation' },
];
</script>

<template>
  <section class="officiel-premium">
    <header class="officiel-hero">
      <div class="officiel-hero__contenu">
        <span class="officiel-eyebrow">Référentiel national</span>
        <h2>Référentiel officiel</h2>
        <p>
          Une lecture claire des données officielles utilisées par l’école : sections, options,
          classes académiques et programmes publiés.
        </p>
      </div>

      <div class="officiel-hero__actions">
        <button class="officiel-bouton officiel-bouton--principal" type="button">
          <ShieldCheck :size="18" />
          Version active
        </button>
        <button class="officiel-bouton" type="button">
          <Eye :size="18" />
          Mode lecture
        </button>
      </div>
    </header>

    <section class="officiel-scoreboard" aria-label="Synthèse du référentiel officiel">
      <article class="officiel-score officiel-score--principal">
        <div class="officiel-score__icone">
          <LibraryBig :size="25" />
        </div>
        <div>
          <span>Référentiel actif</span>
          <strong>Officiel</strong>
          <p>Données prêtes pour la consultation école.</p>
        </div>
      </article>

      <article class="officiel-score">
        <span>Sections</span>
        <strong>3</strong>
        <p>Maternelle, primaire, secondaire</p>
      </article>

      <article class="officiel-score">
        <span>Options</span>
        <strong>Secondaire</strong>
        <p>Humanités et filières techniques</p>
      </article>

      <article class="officiel-score">
        <span>Programmes</span>
        <strong>Publiés</strong>
        <p>Versions officielles disponibles</p>
      </article>
    </section>

    <section class="officiel-command-center">
      <article class="officiel-version-card">
        <div class="officiel-card-header">
          <div>
            <span class="officiel-pill">État</span>
            <h3>Version officielle prête</h3>
          </div>
          <CheckCircle2 :size="24" />
        </div>
        <p>
          Cette zone est consultative côté école. Les imports, publications et migrations restent dans la
          maintenance du référentiel.
        </p>
        <div class="officiel-meta">
          <span>Source officielle</span>
          <span>Lecture seule</span>
          <span>Compatible école</span>
        </div>
      </article>

      <article class="officiel-search-card">
        <div class="officiel-card-header">
          <div>
            <span class="officiel-pill">Recherche</span>
            <h3>Trouver rapidement une donnée</h3>
          </div>
          <Search :size="24" />
        </div>
        <label class="officiel-search">
          <Search :size="18" />
          <input type="search" placeholder="Rechercher une section, option, classe ou programme..." />
        </label>
      </article>
    </section>

    <section class="officiel-familles-premium">
      <article class="famille-card famille-card--sections">
        <div class="famille-card__header">
          <div class="famille-card__icone"><Layers3 :size="22" /></div>
          <div>
            <span>Famille 01</span>
            <h3>Sections scolaires</h3>
          </div>
        </div>

        <div class="famille-list famille-list--compacte">
          <div v-for="section in sections" :key="section.code" class="famille-row">
            <strong>{{ section.code }}</strong>
            <div>
              <span>{{ section.libelle }}</span>
              <small>{{ section.description }}</small>
            </div>
          </div>
        </div>
      </article>

      <article class="famille-card famille-card--options">
        <div class="famille-card__header">
          <div class="famille-card__icone"><GraduationCap :size="22" /></div>
          <div>
            <span>Famille 02</span>
            <h3>Options d’études</h3>
          </div>
        </div>

        <div class="option-grid">
          <div v-for="option in options" :key="option.code" class="option-chip">
            <strong>{{ option.abreviation }}</strong>
            <span>{{ option.libelle }}</span>
          </div>
        </div>
      </article>

      <article class="famille-card famille-card--classes">
        <div class="famille-card__header">
          <div class="famille-card__icone"><School :size="22" /></div>
          <div>
            <span>Famille 03</span>
            <h3>Classes académiques</h3>
          </div>
        </div>

        <div class="famille-table">
          <div class="famille-table__header">
            <span>Code</span>
            <span>Libellé</span>
            <span>Section</span>
            <span>Option</span>
          </div>
          <div v-for="classe in classesAcademiques" :key="classe.code" class="famille-table__row">
            <strong>{{ classe.code }}</strong>
            <span>{{ classe.libelle }}</span>
            <span>{{ classe.section }}</span>
            <span>{{ classe.option }}</span>
          </div>
        </div>
      </article>

      <article class="famille-card famille-card--programmes">
        <div class="famille-card__header">
          <div class="famille-card__icone"><BookOpen :size="22" /></div>
          <div>
            <span>Famille 04</span>
            <h3>Programmes officiels</h3>
          </div>
        </div>

        <div class="programme-list">
          <div v-for="programme in programmes" :key="`${programme.classe}-${programme.option}`" class="programme-row">
            <div>
              <strong>{{ programme.classe }}</strong>
              <span>{{ programme.option }}</span>
            </div>
            <div>
              <small>{{ programme.version }}</small>
              <span class="programme-status">{{ programme.statut }}</span>
            </div>
            <button type="button" aria-label="Consulter le programme">
              <ArrowUpRight :size="17" />
            </button>
          </div>
        </div>
      </article>
    </section>

    <section class="officiel-bottom-note">
      <FileText :size="20" />
      <p>
        Les données affichées ici servent de référence. La gestion locale se fait ensuite dans les classes
        pédagogiques et les programmes niveau.
      </p>
      <Sparkles :size="20" />
    </section>
  </section>
</template>

<style scoped>
.officiel-premium {
  display: grid;
  max-width: 1080px;
  gap: 1rem;
}

.officiel-hero,
.officiel-score,
.officiel-version-card,
.officiel-search-card,
.famille-card,
.officiel-bottom-note {
  border: 1px solid #dfe5ef;
  background: #ffffff;
  box-shadow: 0 10px 24px rgba(31, 41, 55, 0.08);
}

.officiel-hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.25rem;
  padding: 1.2rem;
  border-radius: 1rem;
  background:
    radial-gradient(circle at top right, rgba(45, 95, 159, 0.14), transparent 22rem),
    linear-gradient(135deg, #ffffff 0%, #f7faff 100%);
}

.officiel-eyebrow,
.famille-card__header span,
.officiel-score span {
  color: #5f6b7a;
  font-size: 0.72rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.officiel-hero h2 {
  margin: 0.25rem 0 0.45rem;
  color: #172033;
  font-size: 1.75rem;
  letter-spacing: -0.03em;
}

.officiel-hero p {
  max-width: 44rem;
  margin: 0;
  color: #5f6b7a;
  line-height: 1.55;
}

.officiel-hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
}

.officiel-bouton {
  display: inline-flex;
  min-height: 2.55rem;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  padding: 0 0.95rem;
  border: 1px solid #dfe5ef;
  border-radius: 0.45rem;
  background: #ffffff;
  color: #1f2937;
  cursor: pointer;
  font-weight: 850;
}

.officiel-bouton--principal {
  border-color: #2d5f9f;
  background: #2d5f9f;
  color: #ffffff;
  box-shadow: 0 10px 18px rgba(45, 95, 159, 0.2);
}

.officiel-scoreboard {
  display: grid;
  grid-template-columns: 1.45fr repeat(3, minmax(0, 1fr));
  gap: 0.75rem;
}

.officiel-score {
  min-height: 7rem;
  padding: 1rem;
  border-radius: 0.85rem;
}

.officiel-score--principal {
  display: flex;
  gap: 0.9rem;
  align-items: flex-start;
  background: linear-gradient(135deg, #1f4d85 0%, #2d5f9f 100%);
  color: #ffffff;
}

.officiel-score--principal span,
.officiel-score--principal p,
.officiel-score--principal strong {
  color: #ffffff;
}

.officiel-score__icone {
  display: grid;
  width: 3rem;
  height: 3rem;
  flex: 0 0 auto;
  place-items: center;
  border-radius: 0.7rem;
  background: rgba(255, 255, 255, 0.16);
}

.officiel-score strong {
  display: block;
  margin: 0.3rem 0;
  color: #172033;
  font-size: 1.2rem;
}

.officiel-score p {
  margin: 0;
  color: #667085;
  line-height: 1.45;
}

.officiel-command-center {
  display: grid;
  grid-template-columns: 1fr 1.1fr;
  gap: 0.85rem;
}

.officiel-version-card,
.officiel-search-card,
.famille-card {
  overflow: hidden;
  border-radius: 1rem;
}

.officiel-card-header,
.famille-card__header {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem;
  border-bottom: 1px solid #dfe5ef;
  background: #fbfcfe;
}

.officiel-card-header h3,
.famille-card__header h3 {
  margin: 0.45rem 0 0;
  color: #172033;
  font-size: 1.05rem;
}

.officiel-card-header > svg {
  color: #2d5f9f;
}

.officiel-pill {
  width: fit-content;
  padding: 0.28rem 0.6rem;
  border-radius: 999px;
  background: #edf3fb;
  color: #18365f;
  font-size: 0.72rem;
  font-weight: 900;
  text-transform: uppercase;
}

.officiel-version-card p {
  margin: 0;
  padding: 1rem 1rem 0.85rem;
  color: #5f6b7a;
  line-height: 1.55;
}

.officiel-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 0.45rem;
  padding: 0 1rem 1rem;
}

.officiel-meta span {
  padding: 0.45rem 0.6rem;
  border-radius: 999px;
  background: #f2f5fa;
  color: #374151;
  font-size: 0.8rem;
  font-weight: 800;
}

.officiel-search {
  display: flex;
  min-height: 3rem;
  align-items: center;
  gap: 0.65rem;
  margin: 1rem;
  padding: 0 0.85rem;
  border: 1px solid #dfe5ef;
  border-radius: 0.65rem;
  background: #ffffff;
  color: #667085;
}

.officiel-search input {
  width: 100%;
  border: 0;
  outline: 0;
  color: #172033;
}

.officiel-familles-premium {
  display: grid;
  grid-template-columns: 0.9fr 1.1fr;
  gap: 0.85rem;
}

.famille-card__icone {
  display: grid;
  width: 2.65rem;
  height: 2.65rem;
  place-items: center;
  border-radius: 0.7rem;
  color: #ffffff;
}

.famille-card--sections .famille-card__icone {
  background: #2f99c9;
}

.famille-card--options .famille-card__icone {
  background: #2f9d62;
}

.famille-card--classes .famille-card__icone {
  background: #e5a324;
}

.famille-card--programmes .famille-card__icone {
  background: #6f56d9;
}

.famille-list,
.programme-list {
  display: grid;
}

.famille-row,
.programme-row {
  display: grid;
  gap: 0.75rem;
  align-items: center;
  padding: 0.85rem 1rem;
  border-bottom: 1px solid #dfe5ef;
}

.famille-row {
  grid-template-columns: 4rem 1fr;
}

.famille-row:last-child,
.programme-row:last-child {
  border-bottom: 0;
}

.famille-row strong,
.programme-row strong {
  color: #172033;
}

.famille-row small,
.programme-row small {
  display: block;
  margin-top: 0.18rem;
  color: #667085;
}

.option-grid {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.65rem;
  padding: 1rem;
}

.option-chip {
  padding: 0.8rem;
  border: 1px solid #dfe5ef;
  border-radius: 0.75rem;
  background: #fbfcfe;
}

.option-chip strong {
  display: block;
  color: #23784a;
  font-size: 1.05rem;
}

.option-chip span {
  display: block;
  margin-top: 0.25rem;
  color: #374151;
}

.famille-card--classes,
.famille-card--programmes {
  grid-column: span 2;
}

.famille-table {
  display: grid;
}

.famille-table__header,
.famille-table__row {
  display: grid;
  grid-template-columns: 0.75fr 1.5fr 1fr 1.2fr;
  gap: 0.8rem;
  align-items: center;
  padding: 0.8rem 1rem;
  border-bottom: 1px solid #dfe5ef;
}

.famille-table__header {
  background: #f3f6fa;
  color: #667085;
  font-size: 0.75rem;
  font-weight: 900;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.famille-table__row:last-child {
  border-bottom: 0;
}

.programme-row {
  grid-template-columns: 1fr 1.2fr auto;
}

.programme-status {
  display: inline-flex;
  width: fit-content;
  margin-top: 0.28rem;
  padding: 0.3rem 0.55rem;
  border-radius: 999px;
  background: rgba(47, 157, 98, 0.12);
  color: #23784a;
  font-size: 0.75rem;
  font-weight: 900;
}

.programme-row button {
  display: grid;
  width: 2.15rem;
  height: 2.15rem;
  place-items: center;
  border: 1px solid #dfe5ef;
  border-radius: 0.6rem;
  background: #ffffff;
  color: #18365f;
  cursor: pointer;
}

.officiel-bottom-note {
  display: flex;
  align-items: center;
  gap: 0.85rem;
  padding: 0.95rem 1rem;
  border-radius: 1rem;
  color: #5f6b7a;
}

.officiel-bottom-note p {
  flex: 1;
  margin: 0;
}

.officiel-bottom-note svg {
  color: #2d5f9f;
}

@media (max-width: 1100px) {
  .officiel-scoreboard,
  .officiel-command-center,
  .officiel-familles-premium {
    grid-template-columns: 1fr;
  }

  .famille-card--classes,
  .famille-card--programmes {
    grid-column: span 1;
  }

  .famille-table {
    overflow-x: auto;
  }

  .famille-table__header,
  .famille-table__row {
    min-width: 760px;
  }
}
</style>
