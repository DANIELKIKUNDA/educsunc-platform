<script setup lang="ts">
import {
  BookOpen,
  CheckCircle2,
  Eye,
  FileSearch,
  GraduationCap,
  Layers3,
  LibraryBig,
  School,
  Search,
  ShieldCheck,
} from 'lucide-vue-next';

const sections = [
  { code: 'MAT', libelle: 'Maternelle', description: 'Cycle initial', statut: 'Officiel' },
  { code: 'PRI', libelle: 'Primaire', description: 'Cycle primaire', statut: 'Officiel' },
  { code: 'SEC', libelle: 'Secondaire', description: 'Éducation de base et humanités', statut: 'Officiel' },
];

const options = [
  { code: '1.01', abreviation: 'LP', libelle: 'Latin-philosophie', section: 'Secondaire', statut: 'Active' },
  { code: '2.01', abreviation: 'SC', libelle: 'Scientifique', section: 'Secondaire', statut: 'Active' },
  { code: '3.02', abreviation: 'CG', libelle: 'Commerciale et gestion', section: 'Secondaire', statut: 'Active' },
  { code: '9.01', abreviation: 'MG', libelle: 'Mécanique générale', section: 'Secondaire', statut: 'Active' },
];

const classesAcademiques = [
  { code: '1MAT', libelle: '1ère maternelle', section: 'Maternelle', option: '-', evaluation: 'Trimestriel' },
  { code: '1PR', libelle: '1ère primaire', section: 'Primaire', option: '-', evaluation: 'Trimestriel' },
  { code: '7EB', libelle: '7ème éducation de base', section: 'Secondaire', option: '-', evaluation: 'Semestriel' },
  { code: '1SC', libelle: '1ère scientifique', section: 'Secondaire', option: 'Scientifique', evaluation: 'Semestriel' },
  { code: '2CG', libelle: '2ème commerciale et gestion', section: 'Secondaire', option: 'Commerciale et gestion', evaluation: 'Semestriel' },
];

const programmes = [
  { classe: '1PR', option: '-', version: 'Version officielle active', cours: 'Cours publiés', statut: 'Publié' },
  { classe: '7EB', option: '-', version: 'Version officielle active', cours: 'Cours publiés', statut: 'Publié' },
  { classe: '1SC', option: 'Scientifique', version: 'Version officielle active', cours: 'Cours publiés', statut: 'Publié' },
  { classe: '2CG', option: 'Commerciale et gestion', version: 'À vérifier', cours: 'Alignement requis', statut: 'Préparation' },
];
</script>

<template>
  <section class="referentiel-officiel-page">
    <header class="page-hero">
      <div>
        <span class="page-hero__eyebrow">Référentiel national</span>
        <h2>Référentiel officiel</h2>
        <p>Consultation structurée des données officielles utilisées par l’école.</p>
      </div>

      <div class="page-hero__actions">
        <button class="bouton bouton--principal" type="button">
          <ShieldCheck :size="18" />
          Version active
        </button>
        <button class="bouton" type="button">
          <Eye :size="18" />
          Lecture seule
        </button>
      </div>
    </header>

    <section class="indicateurs" aria-label="Synthèse du référentiel officiel">
      <article class="indicateur indicateur--bleu">
        <div class="indicateur__icone">
          <LibraryBig :size="24" />
        </div>
        <div>
          <span>Statut</span>
          <strong>Officiel</strong>
          <p>Données prêtes pour l’exploitation école</p>
        </div>
      </article>

      <article class="indicateur">
        <div class="indicateur__icone indicateur__icone--cyan">
          <Layers3 :size="22" />
        </div>
        <div>
          <span>Sections</span>
          <strong>3</strong>
          <p>Maternelle, primaire, secondaire</p>
        </div>
      </article>

      <article class="indicateur">
        <div class="indicateur__icone indicateur__icone--vert">
          <GraduationCap :size="22" />
        </div>
        <div>
          <span>Options</span>
          <strong>Secondaire</strong>
          <p>Humanités et filières techniques</p>
        </div>
      </article>

      <article class="indicateur">
        <div class="indicateur__icone indicateur__icone--or">
          <BookOpen :size="22" />
        </div>
        <div>
          <span>Programmes</span>
          <strong>Publiés</strong>
          <p>Versions consultables par classe</p>
        </div>
      </article>
    </section>

    <section class="barre-controle" aria-label="Recherche dans le référentiel officiel">
      <label class="champ-recherche">
        <Search :size="18" />
        <input type="search" placeholder="Rechercher une section, option, classe ou programme..." />
      </label>

      <div class="badge-validation">
        <CheckCircle2 :size="18" />
        Données officielles synchronisées
      </div>
    </section>

    <section class="grille-tableaux">
      <article class="tableau-carte">
        <div class="tableau-carte__entete">
          <div>
            <span>Famille 01</span>
            <h3>Sections scolaires</h3>
          </div>
          <Layers3 :size="22" />
        </div>

        <div class="tableau-reference tableau-reference--sections">
          <div class="tableau-reference__ligne tableau-reference__ligne--entete">
            <span>Code</span>
            <span>Libellé</span>
            <span>Description</span>
            <span>Statut</span>
            <span>Action</span>
          </div>

          <div v-for="section in sections" :key="section.code" class="tableau-reference__ligne">
            <strong>{{ section.code }}</strong>
            <span>{{ section.libelle }}</span>
            <span>{{ section.description }}</span>
            <span><span class="badge badge--vert">{{ section.statut }}</span></span>
            <button class="bouton-icone" type="button" aria-label="Consulter la section">
              <Eye :size="16" />
            </button>
          </div>
        </div>
      </article>

      <article class="tableau-carte">
        <div class="tableau-carte__entete">
          <div>
            <span>Famille 02</span>
            <h3>Options d’études</h3>
          </div>
          <GraduationCap :size="22" />
        </div>

        <div class="tableau-reference tableau-reference--options">
          <div class="tableau-reference__ligne tableau-reference__ligne--entete">
            <span>Code</span>
            <span>Abréviation</span>
            <span>Libellé</span>
            <span>Section</span>
            <span>Action</span>
          </div>

          <div v-for="option in options" :key="option.code" class="tableau-reference__ligne">
            <strong>{{ option.code }}</strong>
            <span class="abreviation">{{ option.abreviation }}</span>
            <span>{{ option.libelle }}</span>
            <span>{{ option.section }}</span>
            <button class="bouton-icone" type="button" aria-label="Consulter l’option">
              <Eye :size="16" />
            </button>
          </div>
        </div>
      </article>

      <article class="tableau-carte tableau-carte--large">
        <div class="tableau-carte__entete">
          <div>
            <span>Famille 03</span>
            <h3>Classes académiques</h3>
          </div>
          <School :size="22" />
        </div>

        <div class="tableau-reference tableau-reference--classes">
          <div class="tableau-reference__ligne tableau-reference__ligne--entete">
            <span>Code</span>
            <span>Libellé</span>
            <span>Section</span>
            <span>Option</span>
            <span>Évaluation</span>
            <span>Action</span>
          </div>

          <div v-for="classe in classesAcademiques" :key="classe.code" class="tableau-reference__ligne">
            <strong>{{ classe.code }}</strong>
            <span>{{ classe.libelle }}</span>
            <span>{{ classe.section }}</span>
            <span>{{ classe.option }}</span>
            <span><span class="badge badge--bleu">{{ classe.evaluation }}</span></span>
            <button class="bouton-icone" type="button" aria-label="Consulter la classe académique">
              <Eye :size="16" />
            </button>
          </div>
        </div>
      </article>

      <article class="tableau-carte tableau-carte--large">
        <div class="tableau-carte__entete">
          <div>
            <span>Famille 04</span>
            <h3>Programmes officiels</h3>
          </div>
          <BookOpen :size="22" />
        </div>

        <div class="tableau-reference tableau-reference--programmes">
          <div class="tableau-reference__ligne tableau-reference__ligne--entete">
            <span>Classe</span>
            <span>Option</span>
            <span>Version</span>
            <span>Contenu</span>
            <span>Statut</span>
            <span>Action</span>
          </div>

          <div v-for="programme in programmes" :key="`${programme.classe}-${programme.option}`" class="tableau-reference__ligne">
            <strong>{{ programme.classe }}</strong>
            <span>{{ programme.option }}</span>
            <span>{{ programme.version }}</span>
            <span>{{ programme.cours }}</span>
            <span>
              <span class="badge" :class="programme.statut === 'Publié' ? 'badge--vert' : 'badge--orange'">
                {{ programme.statut }}
              </span>
            </span>
            <button class="bouton-icone" type="button" aria-label="Consulter le programme officiel">
              <FileSearch :size="16" />
            </button>
          </div>
        </div>
      </article>
    </section>
  </section>
</template>

<style scoped>
.referentiel-officiel-page {
  display: grid;
  max-width: 1080px;
  gap: 1rem;
}

.page-hero,
.indicateur,
.barre-controle,
.tableau-carte {
  border: 1px solid #dfe5ef;
  background: #ffffff;
  box-shadow: 0 10px 24px rgba(31, 41, 55, 0.08);
}

.page-hero {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1.25rem;
  padding: 1.2rem;
  border-radius: 1rem;
  background:
    radial-gradient(circle at top right, rgba(45, 95, 159, 0.15), transparent 22rem),
    linear-gradient(135deg, #ffffff 0%, #f7faff 100%);
}

.page-hero__eyebrow,
.indicateur span,
.tableau-carte__entete span {
  color: #5f6b7a;
  font-size: 0.72rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.page-hero h2 {
  margin: 0.25rem 0 0.35rem;
  color: #172033;
  font-size: 1.75rem;
  letter-spacing: -0.03em;
}

.page-hero p {
  margin: 0;
  color: #5f6b7a;
  line-height: 1.55;
}

.page-hero__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
}

.bouton {
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

.bouton--principal {
  border-color: #2d5f9f;
  background: #2d5f9f;
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
  min-height: 7rem;
  gap: 0.85rem;
  align-items: flex-start;
  padding: 1rem;
  border-radius: 0.85rem;
}

.indicateur--bleu {
  background: linear-gradient(135deg, #1f4d85 0%, #2d5f9f 100%);
  color: #ffffff;
}

.indicateur--bleu span,
.indicateur--bleu strong,
.indicateur--bleu p {
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

.indicateur__icone--cyan {
  background: #2f99c9;
}

.indicateur__icone--vert {
  background: #2f9d62;
}

.indicateur__icone--or {
  background: #e5a324;
}

.indicateur strong {
  display: block;
  margin: 0.28rem 0;
  color: #172033;
  font-size: 1.15rem;
}

.indicateur p {
  margin: 0;
  color: #667085;
  line-height: 1.45;
}

.barre-controle {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
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
  border: 1px solid #dfe5ef;
  border-radius: 0.65rem;
  background: #fbfcfe;
  color: #667085;
}

.champ-recherche input {
  width: 100%;
  border: 0;
  outline: 0;
  background: transparent;
  color: #172033;
}

.badge-validation {
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

.grille-tableaux {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 0.85rem;
}

.tableau-carte {
  overflow: hidden;
  border-radius: 1rem;
}

.tableau-carte--large {
  grid-column: span 2;
}

.tableau-carte__entete {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem;
  border-bottom: 1px solid #dfe5ef;
  background: linear-gradient(180deg, #fbfcfe 0%, #f3f6fa 100%);
}

.tableau-carte__entete h3 {
  margin: 0.35rem 0 0;
  color: #172033;
  font-size: 1.05rem;
}

.tableau-carte__entete svg {
  color: #2d5f9f;
}

.tableau-reference {
  display: grid;
  overflow-x: auto;
}

.tableau-reference__ligne {
  display: grid;
  min-width: 680px;
  align-items: center;
  gap: 0.8rem;
  padding: 0.78rem 1rem;
  border-bottom: 1px solid #e7ecf3;
  color: #374151;
}

.tableau-reference__ligne:last-child {
  border-bottom: 0;
}

.tableau-reference__ligne--entete {
  background: #f3f6fa;
  color: #667085;
  font-size: 0.72rem;
  font-weight: 900;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.tableau-reference__ligne strong {
  color: #172033;
}

.tableau-reference--sections .tableau-reference__ligne {
  grid-template-columns: 0.65fr 1.1fr 1.7fr 0.85fr 0.45fr;
}

.tableau-reference--options .tableau-reference__ligne {
  grid-template-columns: 0.7fr 0.85fr 1.65fr 1fr 0.45fr;
}

.tableau-reference--classes .tableau-reference__ligne {
  min-width: 860px;
  grid-template-columns: 0.65fr 1.45fr 1fr 1.4fr 1fr 0.45fr;
}

.tableau-reference--programmes .tableau-reference__ligne {
  min-width: 900px;
  grid-template-columns: 0.65fr 1.35fr 1.55fr 1.25fr 0.9fr 0.45fr;
}

.abreviation {
  display: inline-flex;
  width: fit-content;
  min-width: 2.25rem;
  justify-content: center;
  padding: 0.32rem 0.5rem;
  border-radius: 0.55rem;
  background: #edf3fb;
  color: #18365f;
  font-weight: 900;
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

.badge--bleu {
  background: rgba(45, 95, 159, 0.12);
  color: #1f4d85;
}

.badge--orange {
  background: rgba(229, 163, 36, 0.18);
  color: #9a5e00;
}

.bouton-icone {
  display: grid;
  width: 2.1rem;
  height: 2.1rem;
  place-items: center;
  border: 1px solid #dfe5ef;
  border-radius: 0.6rem;
  background: #ffffff;
  color: #18365f;
  cursor: pointer;
}

.bouton-icone:hover {
  border-color: #2d5f9f;
  background: #edf3fb;
}

@media (max-width: 1180px) {
  .indicateurs,
  .grille-tableaux {
    grid-template-columns: 1fr;
  }

  .tableau-carte--large {
    grid-column: span 1;
  }
}

@media (max-width: 760px) {
  .page-hero,
  .barre-controle {
    align-items: stretch;
    flex-direction: column;
  }

  .page-hero__actions {
    width: 100%;
  }

  .bouton {
    flex: 1;
  }

  .badge-validation {
    justify-content: center;
    white-space: normal;
  }
}
</style>
