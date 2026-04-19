<script setup lang="ts">
import {
  Archive,
  BookOpen,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Eye,
  Filter,
  MoreHorizontal,
  Plus,
  Search,
  Trash2,
  Users,
} from 'lucide-vue-next';

interface ClasseAcademiqueUi {
  classe: string;
  section: string;
  option: string;
  effectif: number;
  annee: string;
  statut: 'ACTIF' | 'ARCHIVE';
}

const classesAcademiques: ClasseAcademiqueUi[] = [
  { classe: '6ème A', section: 'Primaire', option: '-', effectif: 28, annee: '2024-2025', statut: 'ACTIF' },
  { classe: '4ème A', section: 'Primaire', option: '-', effectif: 34, annee: '2024-2025', statut: 'ACTIF' },
  { classe: '8ème A', section: 'Secondaire', option: '-', effectif: 30, annee: '2024-2025', statut: 'ACTIF' },
  { classe: '2ème CG', section: 'Secondaire', option: 'Commerciale et gestion', effectif: 32, annee: '2024-2025', statut: 'ACTIF' },
  { classe: '1ère Scientifique', section: 'Secondaire', option: 'Scientifique', effectif: 31, annee: '2024-2025', statut: 'ACTIF' },
];
</script>

<template>
  <section class="classes-page">
    <header class="classes-page__entete">
      <div>
        <h2>Classes académiques</h2>
        <p>Gestion des classes ouvertes pour l’année active</p>
      </div>

      <button class="classes-bouton classes-bouton--principal" type="button">
        <Plus :size="18" />
        Créer une classe
      </button>
    </header>

    <section class="classes-resume" aria-label="Résumé des classes académiques">
      <article class="classes-resume__carte">
        <div class="classes-resume__icone classes-resume__icone--bleu">
          <BookOpen :size="23" />
        </div>
        <div>
          <strong>20</strong>
          <span>Total classes</span>
          <small>Du 01 sept 2025 au 03 juil 2026</small>
        </div>
      </article>

      <article class="classes-resume__carte">
        <div class="classes-resume__icone classes-resume__icone--vert">
          <Users :size="23" />
        </div>
        <div>
          <strong>652</strong>
          <span>Total élèves</span>
        </div>
      </article>

      <article class="classes-resume__carte">
        <div class="classes-resume__icone classes-resume__icone--emeraude">
          <Edit3 :size="22" />
        </div>
        <div>
          <strong>18</strong>
          <span>Classes actives</span>
        </div>
      </article>

      <article class="classes-resume__carte">
        <div class="classes-resume__icone classes-resume__icone--violet">
          <Archive :size="22" />
        </div>
        <div>
          <strong>2</strong>
          <span>Classes archivées</span>
        </div>
      </article>
    </section>

    <section class="classes-outils" aria-label="Filtres des classes">
      <label class="classes-recherche">
        <Search :size="18" />
        <input type="search" placeholder="Rechercher..." />
      </label>

      <button class="classes-selecteur" type="button">
        Année : 2024-2025
        <ChevronDown :size="16" />
      </button>

      <button class="classes-selecteur" type="button">
        Section : Toutes
        <ChevronDown :size="16" />
      </button>

      <button class="classes-selecteur" type="button">
        Option : Toutes
        <ChevronDown :size="16" />
      </button>

      <button class="classes-filtre" type="button" aria-label="Filtrer les classes">
        <Filter :size="18" />
        <ChevronDown :size="16" />
      </button>
    </section>

    <section class="classes-tableau" aria-label="Liste des classes académiques">
      <div class="classes-tableau__ligne classes-tableau__ligne--entete">
        <span>Classe</span>
        <span>Section <ChevronDown :size="14" /></span>
        <span>Option <ChevronDown :size="14" /></span>
        <span>Effectif <ChevronDown :size="14" /></span>
        <span>Année <ChevronDown :size="14" /></span>
        <span>Statut <ChevronDown :size="14" /></span>
        <span>Actions</span>
      </div>

      <div
        v-for="classe in classesAcademiques"
        :key="classe.classe"
        class="classes-tableau__ligne"
      >
        <strong>{{ classe.classe }}</strong>
        <span>{{ classe.section }}</span>
        <span>{{ classe.option }}</span>
        <span>{{ classe.effectif }}</span>
        <span>{{ classe.annee }}</span>
        <span class="classes-badge" :data-statut="classe.statut">Actif</span>
        <div class="classes-actions">
          <button type="button"><Eye :size="15" /> Gérer</button>
          <button type="button"><Edit3 :size="15" /> Gérer</button>
          <button class="classes-actions__menu" type="button"><MoreHorizontal :size="18" /></button>

          <div class="classes-menu">
            <span><Edit3 :size="15" /> Modifier</span>
            <span><Trash2 :size="15" /> Supprimer</span>
            <span><Archive :size="15" /> Archiver</span>
            <span><Archive :size="15" /> Archiver</span>
          </div>
        </div>
      </div>

      <footer class="classes-pagination">
        <span>1-5 sur 20</span>
        <div class="classes-pagination__pages">
          <button type="button">Précédent</button>
          <button type="button"><ChevronLeft :size="15" /></button>
          <button class="classes-pagination__active" type="button">1</button>
          <button type="button">2</button>
          <button type="button">3</button>
          <button type="button">4</button>
          <button type="button">5</button>
          <button type="button">6</button>
          <button type="button">...</button>
          <button type="button"><ChevronRight :size="15" /></button>
          <button type="button">Suivant</button>
        </div>
      </footer>
    </section>
  </section>
</template>

<style scoped>
.classes-page {
  display: grid;
  max-width: 1060px;
  gap: 1rem;
}

.classes-page__entete {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
}

.classes-page__entete h2 {
  margin: 0 0 0.45rem;
  color: #1f2937;
  font-size: 1.55rem;
  font-weight: 800;
}

.classes-page__entete p {
  margin: 0;
  color: #5f6b7a;
}

.classes-bouton,
.classes-selecteur,
.classes-filtre,
.classes-actions button,
.classes-pagination button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  border: 1px solid #dfe5ef;
  border-radius: 0.25rem;
  background: #ffffff;
  color: #1f2937;
  cursor: pointer;
  font-weight: 700;
}

.classes-bouton {
  min-height: 2.55rem;
  padding: 0 1rem;
}

.classes-bouton--principal {
  border-color: #1f5d73;
  background: #1f5d73;
  color: #ffffff;
  box-shadow: 0 8px 18px rgba(31, 93, 115, 0.18);
}

.classes-resume {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.75rem;
}

.classes-resume__carte {
  display: flex;
  min-height: 6.9rem;
  gap: 0.85rem;
  align-items: flex-start;
  padding: 0.95rem;
  border: 1px solid #dfe5ef;
  border-radius: 0.35rem;
  background: #ffffff;
  box-shadow: 0 8px 18px rgba(31, 41, 55, 0.07);
}

.classes-resume__icone {
  display: grid;
  width: 2.75rem;
  height: 2.75rem;
  flex: 0 0 auto;
  place-items: center;
  border-radius: 0.22rem;
  color: #ffffff;
}

.classes-resume__icone--bleu {
  background: #2f99c9;
}

.classes-resume__icone--vert {
  background: #2f9d62;
}

.classes-resume__icone--emeraude {
  background: #2d927e;
}

.classes-resume__icone--violet {
  background: #5d6fa8;
}

.classes-resume strong {
  display: block;
  color: #1f2937;
  font-size: 1.45rem;
  line-height: 1;
}

.classes-resume span,
.classes-resume small {
  display: block;
  color: #4b5563;
}

.classes-resume small {
  margin-top: 1.1rem;
  font-size: 0.78rem;
}

.classes-outils {
  display: grid;
  grid-template-columns: minmax(16rem, 1fr) auto auto auto auto;
  gap: 0.45rem;
  padding: 0.65rem;
  border: 1px solid #dfe5ef;
  border-radius: 0.35rem;
  background: #ffffff;
  box-shadow: 0 8px 18px rgba(31, 41, 55, 0.05);
}

.classes-recherche {
  display: flex;
  min-height: 2.35rem;
  align-items: center;
  gap: 0.55rem;
  padding: 0 0.75rem;
  border: 1px solid #dfe5ef;
  border-radius: 0.25rem;
  color: #6b7280;
}

.classes-recherche input {
  width: 100%;
  border: 0;
  outline: 0;
  color: #1f2937;
}

.classes-selecteur,
.classes-filtre {
  min-height: 2.35rem;
  padding: 0 0.75rem;
}

.classes-tableau {
  overflow: visible;
  border: 1px solid #dfe5ef;
  border-radius: 0.35rem;
  background: #ffffff;
  box-shadow: 0 8px 18px rgba(31, 41, 55, 0.07);
}

.classes-tableau__ligne {
  position: relative;
  display: grid;
  grid-template-columns: 1.2fr 1fr 1fr 0.75fr 1fr 0.85fr 1.35fr;
  min-height: 2.7rem;
  align-items: center;
  gap: 0.6rem;
  padding: 0 0.9rem;
  border-bottom: 1px solid #dfe5ef;
  color: #374151;
}

.classes-tableau__ligne:last-of-type {
  border-bottom: 0;
}

.classes-tableau__ligne--entete {
  min-height: 2.75rem;
  background: #f3f6fb;
  color: #374151;
  font-weight: 800;
}

.classes-tableau__ligne--entete span {
  display: inline-flex;
  align-items: center;
  gap: 0.25rem;
}

.classes-badge {
  width: fit-content;
  padding: 0.28rem 0.55rem;
  border-radius: 0.22rem;
  background: #2d8b72;
  color: #ffffff;
  font-size: 0.75rem;
  font-weight: 800;
}

.classes-actions {
  position: relative;
  display: flex;
  gap: 0.25rem;
  align-items: center;
}

.classes-actions button {
  min-height: 2rem;
  padding: 0 0.55rem;
}

.classes-actions__menu {
  width: 2rem;
  padding: 0;
}

.classes-menu {
  position: absolute;
  top: 2.15rem;
  right: 0.5rem;
  z-index: 4;
  display: grid;
  min-width: 10rem;
  overflow: hidden;
  border: 1px solid #d8dee9;
  border-radius: 0.25rem;
  background: #ffffff;
  box-shadow: 0 12px 26px rgba(31, 41, 55, 0.15);
  opacity: 0;
  pointer-events: none;
  transform: translateY(-0.2rem);
  transition: opacity 120ms ease, transform 120ms ease;
}

.classes-actions:hover .classes-menu {
  opacity: 1;
  pointer-events: auto;
  transform: translateY(0);
}

.classes-menu span {
  display: inline-flex;
  align-items: center;
  gap: 0.55rem;
  padding: 0.65rem 0.8rem;
  border-bottom: 1px solid #e5e9f1;
  color: #374151;
  font-weight: 600;
}

.classes-menu span:last-child {
  border-bottom: 0;
}

.classes-pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.7rem 0.9rem;
  border-top: 1px solid #dfe5ef;
}

.classes-pagination__pages {
  display: flex;
  gap: 0.2rem;
  align-items: center;
}

.classes-pagination button {
  min-width: 2rem;
  min-height: 2rem;
  padding: 0 0.55rem;
}

.classes-pagination__active {
  border-color: #2d5f9f !important;
  background: #2d5f9f !important;
  color: #ffffff !important;
}

@media (max-width: 1100px) {
  .classes-resume,
  .classes-outils {
    grid-template-columns: 1fr 1fr;
  }

  .classes-tableau {
    overflow-x: auto;
  }

  .classes-tableau__ligne {
    min-width: 920px;
  }
}
</style>
