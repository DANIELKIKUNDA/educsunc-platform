<script setup lang="ts">
import { computed, onMounted, ref, watch } from 'vue';
import {
  AlertTriangle,
  BookOpen,
  CheckCircle2,
  FileSearch,
  GraduationCap,
  Layers3,
  LibraryBig,
  Loader2,
  RefreshCw,
  School,
  Search,
  ShieldCheck,
} from 'lucide-vue-next';
import type { ReferentielCoursResume, ReferentielProgrammeResume } from '../../../commun/types/referentiel-officiel.types';
import type {
  ClasseAcademiqueResume,
  OptionEtudeResume,
  SectionScolaireResume,
} from '../../../commun/types/structure-scolaire.types';
import { referentielOfficielApi } from '../../services/referentiel-officiel.api';
import { structureScolaireApi } from '../../services/structure-scolaire.api';
import {
  contexteEcoleCourant,
  contexteEcoleEstConfigure,
} from '../../stores/contexte-ecole.store';

const sections = ref<SectionScolaireResume[]>([]);
const options = ref<OptionEtudeResume[]>([]);
const classesAcademiques = ref<ClasseAcademiqueResume[]>([]);
const coursOfficiels = ref<ReferentielCoursResume[]>([]);
const programmesClasse = ref<ReferentielProgrammeResume[]>([]);
const idClasseProgramme = ref('');
const recherche = ref('');
const chargement = ref(false);
const chargementProgrammes = ref(false);
const messagePage = ref<string | null>(null);
const messageProgrammes = ref<string | null>(null);
const chargementInitialEffectue = ref(false);
const pageSections = ref(1);
const pageOptions = ref(1);
const pageClasses = ref(1);
const pageCours = ref(1);

const TAILLE_PAGE_SECTIONS = 5;
const TAILLE_PAGE_OPTIONS = 8;
const TAILLE_PAGE_CLASSES = 10;
const TAILLE_PAGE_COURS = 12;

const sectionsParId = computed(() => {
  const correspondances: Record<string, SectionScolaireResume> = {};

  sections.value.forEach((section) => {
    correspondances[section.id] = section;
  });

  return correspondances;
});

const optionsParId = computed(() => {
  const correspondances: Record<string, OptionEtudeResume> = {};

  options.value.forEach((option) => {
    correspondances[option.id] = option;
  });

  return correspondances;
});

const termeRecherche = computed(() => recherche.value.trim().toLocaleLowerCase('fr-FR'));

const sectionsFiltrees = computed(() =>
  filtrerParRecherche(sections.value, (section) => [
    section.code,
    section.libelle,
    section.active ? 'active' : 'inactive',
  ]),
);

const optionsFiltrees = computed(() =>
  filtrerParRecherche(options.value, (option) => [
    option.code,
    option.abreviation ?? '',
    option.libelle,
  ]),
);

const classesFiltrees = computed(() =>
  filtrerParRecherche(classesAcademiques.value, (classe) => [
    classe.code,
    classe.libelle,
    obtenirLibelleSection(classe.idSectionScolaire),
    obtenirLibelleOption(classe.idOptionEtude),
    classe.cycle,
    classe.typeStructureEvaluation,
  ]),
);

const coursFiltres = computed(() =>
  filtrerParRecherche(coursOfficiels.value, (cours) => [
    cours.code,
    cours.abreviation ?? '',
    cours.libelle,
    cours.actif ? 'actif' : 'inactif',
  ]),
);

const sectionsPage = computed(() =>
  paginerElements(sectionsFiltrees.value, pageSections.value, TAILLE_PAGE_SECTIONS),
);

const optionsPage = computed(() =>
  paginerElements(optionsFiltrees.value, pageOptions.value, TAILLE_PAGE_OPTIONS),
);

const classesPage = computed(() =>
  paginerElements(classesFiltrees.value, pageClasses.value, TAILLE_PAGE_CLASSES),
);

const coursPage = computed(() =>
  paginerElements(coursFiltres.value, pageCours.value, TAILLE_PAGE_COURS),
);

const totalPagesSections = computed(() =>
  calculerTotalPages(sectionsFiltrees.value.length, TAILLE_PAGE_SECTIONS),
);

const totalPagesOptions = computed(() =>
  calculerTotalPages(optionsFiltrees.value.length, TAILLE_PAGE_OPTIONS),
);

const totalPagesClasses = computed(() =>
  calculerTotalPages(classesFiltrees.value.length, TAILLE_PAGE_CLASSES),
);

const totalPagesCours = computed(() =>
  calculerTotalPages(coursFiltres.value.length, TAILLE_PAGE_COURS),
);

const classeProgrammeSelectionnee = computed(() =>
  classesAcademiques.value.find((classe) => classe.id === idClasseProgramme.value) ?? null,
);

const totalProgrammesPublies = computed(() =>
  programmesClasse.value.filter((programme) =>
    programme.versionProjectionnee !== null
    && programme.versionProjectionnee.publiee,
  ).length,
);

function filtrerParRecherche<TElement>(
  elements: TElement[],
  obtenirValeurs: (element: TElement) => string[],
): TElement[] {
  if (termeRecherche.value.length === 0) {
    return elements;
  }

  return elements.filter((element) =>
    obtenirValeurs(element)
      .join(' ')
      .toLocaleLowerCase('fr-FR')
      .includes(termeRecherche.value),
  );
}

function calculerTotalPages(total: number, taillePage: number): number {
  return Math.max(1, Math.ceil(total / taillePage));
}

function paginerElements<TElement>(
  elements: TElement[],
  pageCourante: number,
  taillePage: number,
): TElement[] {
  const debut = (pageCourante - 1) * taillePage;
  return elements.slice(debut, debut + taillePage);
}

function obtenirPlagePagination(total: number, pageCourante: number, taillePage: number): string {
  if (total === 0) {
    return '0 élément';
  }

  const debut = (pageCourante - 1) * taillePage + 1;
  const fin = Math.min(pageCourante * taillePage, total);

  return `${debut}-${fin} sur ${total}`;
}

function validerNouvellePage(nouvellePage: number, totalPages: number): number | null {
  if (nouvellePage < 1 || nouvellePage > totalPages) {
    return null;
  }

  return nouvellePage;
}

function changerPageSections(nouvellePage: number): void {
  const pageValidee = validerNouvellePage(nouvellePage, totalPagesSections.value);

  if (pageValidee !== null) {
    pageSections.value = pageValidee;
  }
}

function changerPageOptions(nouvellePage: number): void {
  const pageValidee = validerNouvellePage(nouvellePage, totalPagesOptions.value);

  if (pageValidee !== null) {
    pageOptions.value = pageValidee;
  }
}

function changerPageClasses(nouvellePage: number): void {
  const pageValidee = validerNouvellePage(nouvellePage, totalPagesClasses.value);

  if (pageValidee !== null) {
    pageClasses.value = pageValidee;
  }
}

function changerPageCours(nouvellePage: number): void {
  const pageValidee = validerNouvellePage(nouvellePage, totalPagesCours.value);

  if (pageValidee !== null) {
    pageCours.value = pageValidee;
  }
}

function obtenirOptionsRequete(): { tenantId?: string } {
  return {
    tenantId: contexteEcoleCourant.tenantId ?? contexteEcoleCourant.idEcole ?? undefined,
  };
}

function obtenirLibelleSection(idSectionScolaire: string): string {
  return sectionsParId.value[idSectionScolaire]?.libelle ?? '-';
}

function obtenirLibelleOption(idOptionEtude?: string): string {
  if (idOptionEtude === undefined) {
    return '-';
  }

  const option = optionsParId.value[idOptionEtude];

  if (option === undefined) {
    return '-';
  }

  return option.abreviation === undefined
    ? option.libelle
    : `${option.abreviation} - ${option.libelle}`;
}

function obtenirStatutProgramme(programme: ReferentielProgrammeResume): string {
  if (programme.versionProjectionnee === null) {
    return 'À publier';
  }

  return programme.versionProjectionnee.publiee ? 'Publié' : 'Préparation';
}

function obtenirClasseBadgeProgramme(programme: ReferentielProgrammeResume): string {
  return programme.versionProjectionnee?.publiee === true ? 'badge--vert' : 'badge--orange';
}

function obtenirLibelleVersion(programme: ReferentielProgrammeResume): string {
  return programme.versionProjectionnee?.codeVersion ?? 'Version non publiée';
}

function obtenirNombreLignes(programme: ReferentielProgrammeResume): number {
  return programme.versionProjectionnee?.lignes.length ?? 0;
}

async function chargerReferentielOfficiel(): Promise<void> {
  if (!contexteEcoleEstConfigure()) {
    messagePage.value =
      'Contexte école non configuré : impossible de charger le référentiel officiel.';
    return;
  }

  chargement.value = true;
  messagePage.value = null;

  try {
    const optionsRequete = obtenirOptionsRequete();
    const resultats = await Promise.allSettled([
      structureScolaireApi.listerSectionsScolaires({ page: 1, taillePage: 50 }, optionsRequete),
      structureScolaireApi.listerOptionsEtudes({ page: 1, taillePage: 300 }, optionsRequete),
      structureScolaireApi.listerClassesAcademiques({ page: 1, taillePage: 500 }, optionsRequete),
      referentielOfficielApi.listerCours({ page: 1, taillePage: 700 }, optionsRequete),
    ]);

    if (resultats[0].status === 'fulfilled') {
      sections.value = resultats[0].value;
    }

    if (resultats[1].status === 'fulfilled') {
      options.value = resultats[1].value;
    }

    if (resultats[2].status === 'fulfilled') {
      classesAcademiques.value = resultats[2].value;
      idClasseProgramme.value = resultats[2].value[0]?.id ?? '';
    }

    if (resultats[3].status === 'fulfilled') {
      coursOfficiels.value = resultats[3].value.donnees;
    }

    if (resultats.some((resultat) => resultat.status === 'rejected')) {
      messagePage.value =
        'Certaines données officielles n’ont pas pu être chargées. Les informations disponibles restent affichées.';
    }

    if (resultats.every((resultat) => resultat.status === 'rejected')) {
      messagePage.value =
        'Le référentiel officiel n’a pas pu être chargé. Vérifie que l’école est bien sélectionnée puis réessaie.';
    }
  } catch {
    messagePage.value =
      'Le référentiel officiel n’a pas pu être chargé. Vérifie que l’école est bien sélectionnée puis réessaie.';
  } finally {
    chargement.value = false;
    chargementInitialEffectue.value = true;
  }

  if (idClasseProgramme.value.length > 0) {
    await chargerProgrammesClasse();
  }
}

async function chargerProgrammesClasse(): Promise<void> {
  if (idClasseProgramme.value.length === 0) {
    programmesClasse.value = [];
    return;
  }

  chargementProgrammes.value = true;
  messageProgrammes.value = null;

  try {
    const reponse = await referentielOfficielApi.listerProgrammes(
      {
        idClasseAcademique: idClasseProgramme.value,
        page: 1,
        taillePage: 20,
      },
      obtenirOptionsRequete(),
    );

    programmesClasse.value = reponse.donnees;
  } catch {
    programmesClasse.value = [];
    messageProgrammes.value =
      'Les programmes officiels de cette classe n’ont pas pu être chargés.';
  } finally {
    chargementProgrammes.value = false;
  }
}

watch(idClasseProgramme, () => {
  if (!chargement.value) {
    void chargerProgrammesClasse();
  }
});

watch(recherche, () => {
  pageSections.value = 1;
  pageOptions.value = 1;
  pageClasses.value = 1;
  pageCours.value = 1;
});

onMounted(() => {
  void chargerReferentielOfficiel();
});
</script>

<template>
  <section class="referentiel-officiel-page">
    <header class="page-hero">
      <div>
        <span class="page-hero__eyebrow">Référentiel national</span>
        <h2>Référentiel officiel</h2>
        <p>Consultation en lecture seule des données académiques utilisées par l’école.</p>
      </div>

      <div class="page-hero__actions">
        <div class="badge-officiel" aria-label="Données officielles en lecture seule">
          <ShieldCheck :size="18" />
          Données officielles
        </div>
        <button class="bouton" type="button" :disabled="chargement" @click="chargerReferentielOfficiel">
          <RefreshCw :size="18" :class="{ 'icone-rotation': chargement }" />
          Recharger
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
          <p>Catalogue national synchronisé.</p>
        </div>
      </article>

      <article class="indicateur">
        <div class="indicateur__icone indicateur__icone--cyan">
          <Layers3 :size="22" />
        </div>
        <div>
          <span>Sections</span>
          <strong>{{ sections.length }}</strong>
          <p>Cycles scolaires disponibles</p>
        </div>
      </article>

      <article class="indicateur">
        <div class="indicateur__icone indicateur__icone--vert">
          <GraduationCap :size="22" />
        </div>
        <div>
          <span>Classes</span>
          <strong>{{ classesAcademiques.length }}</strong>
          <p>{{ options.length }} option(s) d’études</p>
        </div>
      </article>

      <article class="indicateur">
        <div class="indicateur__icone indicateur__icone--or">
          <BookOpen :size="22" />
        </div>
        <div>
          <span>Cours</span>
          <strong>{{ coursOfficiels.length }}</strong>
          <p>{{ totalProgrammesPublies }} programme(s) publié(s) pour la classe sélectionnée</p>
        </div>
      </article>
    </section>

    <section class="barre-controle" aria-label="Recherche dans le référentiel officiel">
      <label class="champ-recherche">
        <Search :size="18" />
        <input v-model="recherche" type="search" placeholder="Rechercher une section, option, classe ou cours..." />
      </label>

      <div class="badge-validation">
        <CheckCircle2 :size="18" />
        Données synchronisées
      </div>
    </section>

    <p v-if="messagePage !== null" class="message-page message-page--erreur">
      <AlertTriangle :size="18" />
      {{ messagePage }}
    </p>

    <section class="etat-chargement" aria-label="Etat de chargement des familles du référentiel">
      <div>
        <span>Sections</span>
        <strong>{{ sections.length }}</strong>
      </div>
      <div>
        <span>Options</span>
        <strong>{{ options.length }}</strong>
      </div>
      <div>
        <span>Classes</span>
        <strong>{{ classesAcademiques.length }}</strong>
      </div>
      <div>
        <span>Cours</span>
        <strong>{{ coursOfficiels.length }}</strong>
      </div>
      <p v-if="chargementInitialEffectue && sections.length + options.length + classesAcademiques.length + coursOfficiels.length === 0">
        Aucune donnée reçue côté navigateur. Utilise le bouton Recharger ou vérifie l’onglet Réseau du navigateur.
      </p>
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
            <span>Ordre</span>
            <span>Statut</span>
          </div>

          <div v-if="chargement" class="tableau-reference__ligne tableau-reference__ligne--etat">
            <span><Loader2 :size="16" class="icone-rotation" /> Chargement des sections...</span>
          </div>
          <div v-else-if="sectionsFiltrees.length === 0" class="tableau-reference__ligne tableau-reference__ligne--etat">
            <span>Aucune section trouvée.</span>
          </div>
          <div v-for="section in sectionsPage" :key="section.id" class="tableau-reference__ligne">
            <strong>{{ section.code }}</strong>
            <span>{{ section.libelle }}</span>
            <span>{{ section.ordreAffichage }}</span>
            <span><span class="badge" :class="section.active ? 'badge--vert' : 'badge--gris'">{{ section.active ? 'Active' : 'Inactive' }}</span></span>
          </div>
        </div>
        <footer class="pagination-tableau">
          <span>{{ obtenirPlagePagination(sectionsFiltrees.length, pageSections, TAILLE_PAGE_SECTIONS) }}</span>
          <div>
            <button class="bouton-page" type="button" :disabled="pageSections <= 1" @click="changerPageSections(pageSections - 1)">
              Précédent
            </button>
            <strong>{{ pageSections }} / {{ totalPagesSections }}</strong>
            <button class="bouton-page" type="button" :disabled="pageSections >= totalPagesSections" @click="changerPageSections(pageSections + 1)">
              Suivant
            </button>
          </div>
        </footer>
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
            <span>Abrév.</span>
            <span>Libellé</span>
          </div>

          <div v-if="chargement" class="tableau-reference__ligne tableau-reference__ligne--etat">
            <span><Loader2 :size="16" class="icone-rotation" /> Chargement des options...</span>
          </div>
          <div v-else-if="optionsFiltrees.length === 0" class="tableau-reference__ligne tableau-reference__ligne--etat">
            <span>Aucune option trouvée.</span>
          </div>
          <div v-for="option in optionsPage" :key="option.id" class="tableau-reference__ligne">
            <strong>{{ option.code }}</strong>
            <span class="abreviation">{{ option.abreviation ?? '-' }}</span>
            <span>{{ option.libelle }}</span>
          </div>
        </div>
        <footer class="pagination-tableau">
          <span>{{ obtenirPlagePagination(optionsFiltrees.length, pageOptions, TAILLE_PAGE_OPTIONS) }}</span>
          <div>
            <button class="bouton-page" type="button" :disabled="pageOptions <= 1" @click="changerPageOptions(pageOptions - 1)">
              Précédent
            </button>
            <strong>{{ pageOptions }} / {{ totalPagesOptions }}</strong>
            <button class="bouton-page" type="button" :disabled="pageOptions >= totalPagesOptions" @click="changerPageOptions(pageOptions + 1)">
              Suivant
            </button>
          </div>
        </footer>
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
            <span>Cycle</span>
            <span>Évaluation</span>
            <span>Statut</span>
          </div>

          <div v-if="chargement" class="tableau-reference__ligne tableau-reference__ligne--etat">
            <span><Loader2 :size="16" class="icone-rotation" /> Chargement des classes académiques...</span>
          </div>
          <div v-else-if="classesFiltrees.length === 0" class="tableau-reference__ligne tableau-reference__ligne--etat">
            <span>Aucune classe académique trouvée.</span>
          </div>
          <div v-for="classe in classesPage" :key="classe.id" class="tableau-reference__ligne">
            <strong>{{ classe.code }}</strong>
            <span>{{ classe.libelle }}</span>
            <span>{{ obtenirLibelleSection(classe.idSectionScolaire) }}</span>
            <span>{{ obtenirLibelleOption(classe.idOptionEtude) }}</span>
            <span>{{ classe.cycle }}</span>
            <span><span class="badge badge--bleu">{{ classe.typeStructureEvaluation }}</span></span>
            <span><span class="badge" :class="classe.active ? 'badge--vert' : 'badge--gris'">{{ classe.active ? 'Active' : 'Inactive' }}</span></span>
          </div>
        </div>
        <footer class="pagination-tableau">
          <span>{{ obtenirPlagePagination(classesFiltrees.length, pageClasses, TAILLE_PAGE_CLASSES) }}</span>
          <div>
            <button class="bouton-page" type="button" :disabled="pageClasses <= 1" @click="changerPageClasses(pageClasses - 1)">
              Précédent
            </button>
            <strong>{{ pageClasses }} / {{ totalPagesClasses }}</strong>
            <button class="bouton-page" type="button" :disabled="pageClasses >= totalPagesClasses" @click="changerPageClasses(pageClasses + 1)">
              Suivant
            </button>
          </div>
        </footer>
      </article>

      <article class="tableau-carte tableau-carte--large">
        <div class="tableau-carte__entete tableau-carte__entete--avec-filtre">
          <div>
            <span>Famille 04</span>
            <h3>Cours officiels</h3>
          </div>
          <BookOpen :size="22" />
        </div>

        <div class="tableau-reference tableau-reference--cours">
          <div class="tableau-reference__ligne tableau-reference__ligne--entete">
            <span>Code</span>
            <span>Abrév.</span>
            <span>Libellé</span>
            <span>Statut</span>
          </div>

          <div v-if="chargement" class="tableau-reference__ligne tableau-reference__ligne--etat">
            <span><Loader2 :size="16" class="icone-rotation" /> Chargement des cours officiels...</span>
          </div>
          <div v-else-if="coursFiltres.length === 0" class="tableau-reference__ligne tableau-reference__ligne--etat">
            <span>Aucun cours trouvé.</span>
          </div>
          <div v-for="cours in coursPage" :key="cours.id" class="tableau-reference__ligne">
            <strong>{{ cours.code }}</strong>
            <span class="abreviation">{{ cours.abreviation ?? '-' }}</span>
            <span>{{ cours.libelle }}</span>
            <span><span class="badge" :class="cours.actif ? 'badge--vert' : 'badge--gris'">{{ cours.actif ? 'Actif' : 'Inactif' }}</span></span>
          </div>
        </div>
        <footer class="pagination-tableau">
          <span>{{ obtenirPlagePagination(coursFiltres.length, pageCours, TAILLE_PAGE_COURS) }}</span>
          <div>
            <button class="bouton-page" type="button" :disabled="pageCours <= 1" @click="changerPageCours(pageCours - 1)">
              Précédent
            </button>
            <strong>{{ pageCours }} / {{ totalPagesCours }}</strong>
            <button class="bouton-page" type="button" :disabled="pageCours >= totalPagesCours" @click="changerPageCours(pageCours + 1)">
              Suivant
            </button>
          </div>
        </footer>
      </article>

      <article class="tableau-carte tableau-carte--large">
        <div class="tableau-carte__entete tableau-carte__entete--avec-filtre">
          <div>
            <span>Famille 05</span>
            <h3>Programmes officiels</h3>
          </div>
          <label class="select-classe">
            <span>Classe</span>
            <select v-model="idClasseProgramme">
              <option
                v-for="classe in classesAcademiques"
                :key="classe.id"
                :value="classe.id"
              >
                {{ classe.code }} - {{ classe.libelle }}
              </option>
            </select>
          </label>
        </div>

        <p v-if="messageProgrammes !== null" class="message-page message-page--erreur message-page--dans-carte">
          <AlertTriangle :size="18" />
          {{ messageProgrammes }}
        </p>

        <div class="programme-selection">
          <FileSearch :size="18" />
          <span>
            {{ classeProgrammeSelectionnee === null ? 'Aucune classe sélectionnée' : `${classeProgrammeSelectionnee.code} - ${classeProgrammeSelectionnee.libelle}` }}
          </span>
        </div>

        <div class="tableau-reference tableau-reference--programmes">
          <div class="tableau-reference__ligne tableau-reference__ligne--entete">
            <span>Classe</span>
            <span>Version</span>
            <span>Lignes</span>
            <span>Évaluation</span>
            <span>Statut</span>
          </div>

          <div v-if="chargementProgrammes" class="tableau-reference__ligne tableau-reference__ligne--etat">
            <span><Loader2 :size="16" class="icone-rotation" /> Chargement des programmes officiels...</span>
          </div>
          <div v-else-if="programmesClasse.length === 0" class="tableau-reference__ligne tableau-reference__ligne--etat">
            <span>Aucun programme officiel trouvé pour cette classe.</span>
          </div>
          <div v-for="programme in programmesClasse" :key="programme.id" class="tableau-reference__ligne">
            <strong>{{ classeProgrammeSelectionnee?.code ?? '-' }}</strong>
            <span>{{ obtenirLibelleVersion(programme) }}</span>
            <span>{{ obtenirNombreLignes(programme) }} cours</span>
            <span>{{ programme.typeStructureEvaluation }}</span>
            <span>
              <span class="badge" :class="obtenirClasseBadgeProgramme(programme)">
                {{ obtenirStatutProgramme(programme) }}
              </span>
            </span>
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
  border: 1px solid var(--couleur-bordure);
  background: var(--couleur-surface);
  box-shadow: var(--ombre-carte);
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
.tableau-carte__entete span,
.select-classe span {
  color: var(--couleur-texte-douce);
  font-size: 0.72rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.page-hero h2 {
  margin: 0.25rem 0 0.35rem;
  color: var(--couleur-encre);
  font-size: 1.75rem;
  letter-spacing: -0.03em;
}

.page-hero p,
.indicateur p {
  margin: 0;
  color: var(--couleur-texte-douce);
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
  border: 1px solid var(--couleur-bordure);
  border-radius: 0.45rem;
  background: #ffffff;
  color: var(--couleur-encre);
  cursor: default;
  font-weight: 850;
}

.bouton--principal {
  border-color: var(--couleur-principale);
  background: var(--couleur-principale);
  color: #ffffff;
  box-shadow: 0 10px 18px rgba(45, 95, 159, 0.2);
}

.badge-officiel {
  display: inline-flex;
  min-height: 2.55rem;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  padding: 0 0.95rem;
  border: 1px solid rgba(47, 157, 98, 0.22);
  border-radius: 999px;
  background: rgba(47, 157, 98, 0.12);
  color: #23784a;
  font-weight: 900;
  white-space: nowrap;
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
  background: var(--couleur-succes);
}

.indicateur__icone--or {
  background: #e5a324;
}

.indicateur strong {
  display: block;
  margin: 0.28rem 0;
  color: var(--couleur-encre);
  font-size: 1.15rem;
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

.badge-validation,
.programme-selection {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  color: #23784a;
  font-weight: 900;
}

.badge-validation {
  padding: 0.72rem 0.85rem;
  border-radius: 999px;
  background: rgba(47, 157, 98, 0.12);
  font-size: 0.85rem;
  white-space: nowrap;
}

.message-page {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  margin: 0;
  padding: 0.8rem 0.9rem;
  border: 1px solid rgba(217, 83, 79, 0.24);
  border-radius: 0.55rem;
  background: rgba(217, 83, 79, 0.09);
  color: #9f1d16;
  font-weight: 800;
}

.message-page--dans-carte {
  margin: 1rem 1rem 0;
}

.message-page svg {
  flex: 0 0 auto;
}

.etat-chargement {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.65rem;
  padding: 0.85rem;
  border: 1px solid var(--couleur-bordure);
  border-radius: 0.9rem;
  background: #ffffff;
  box-shadow: var(--ombre-carte);
}

.etat-chargement div {
  display: grid;
  gap: 0.25rem;
  padding: 0.75rem;
  border-radius: 0.7rem;
  background: #f8fbff;
}

.etat-chargement span {
  color: var(--couleur-texte-douce);
  font-size: 0.72rem;
  font-weight: 900;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.etat-chargement strong {
  color: var(--couleur-encre);
  font-size: 1.2rem;
}

.etat-chargement p {
  grid-column: 1 / -1;
  margin: 0;
  color: #9f1d16;
  font-weight: 850;
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
  border-bottom: 1px solid var(--couleur-bordure);
  background: linear-gradient(180deg, #fbfcfe 0%, #f3f6fa 100%);
}

.tableau-carte__entete--avec-filtre {
  align-items: center;
}

.tableau-carte__entete h3 {
  margin: 0.35rem 0 0;
  color: var(--couleur-encre);
  font-size: 1.05rem;
}

.tableau-carte__entete svg {
  color: var(--couleur-principale);
}

.select-classe {
  display: grid;
  min-width: min(100%, 24rem);
  gap: 0.35rem;
}

.select-classe select {
  min-height: 2.5rem;
  border: 1px solid var(--couleur-bordure);
  border-radius: 0.55rem;
  padding: 0 0.75rem;
  background: #ffffff;
  color: var(--couleur-encre);
  font: inherit;
}

.programme-selection {
  margin: 0;
  padding: 0.85rem 1rem;
  border-bottom: 1px solid #e7ecf3;
  color: #18365f;
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
  color: var(--couleur-texte);
}

.tableau-reference__ligne:last-child {
  border-bottom: 0;
}

.tableau-reference__ligne--entete {
  background: #f3f6fa;
  color: var(--couleur-texte-douce);
  font-size: 0.72rem;
  font-weight: 900;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.tableau-reference__ligne--etat {
  grid-template-columns: 1fr !important;
  color: var(--couleur-texte-douce);
  font-weight: 850;
}

.tableau-reference__ligne--etat span {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
}

.tableau-reference__ligne strong {
  color: var(--couleur-encre);
}

.tableau-reference--sections .tableau-reference__ligne {
  grid-template-columns: 0.65fr 1.35fr 0.65fr 0.85fr;
}

.tableau-reference--options .tableau-reference__ligne {
  grid-template-columns: 0.7fr 0.85fr 1.85fr;
}

.tableau-reference--classes .tableau-reference__ligne {
  min-width: 1060px;
  grid-template-columns: 0.65fr 1.45fr 1fr 1.4fr 0.9fr 1.05fr 0.75fr;
}

.tableau-reference--cours .tableau-reference__ligne {
  min-width: 760px;
  grid-template-columns: 0.9fr 0.75fr 2fr 0.75fr;
}

.tableau-reference--programmes .tableau-reference__ligne {
  min-width: 760px;
  grid-template-columns: 0.75fr 1.45fr 0.8fr 1fr 0.9fr;
}

.pagination-tableau {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 0.8rem;
  padding: 0.85rem 1rem;
  border-top: 1px solid var(--couleur-bordure);
  background: #fbfcfe;
  color: var(--couleur-texte-douce);
  font-size: 0.86rem;
  font-weight: 850;
}

.pagination-tableau div {
  display: flex;
  align-items: center;
  gap: 0.5rem;
}

.pagination-tableau strong {
  color: var(--couleur-encre);
  white-space: nowrap;
}

.bouton-page {
  min-height: 2.1rem;
  padding: 0 0.7rem;
  border: 1px solid var(--couleur-bordure);
  border-radius: 0.5rem;
  background: #ffffff;
  color: var(--couleur-encre);
  cursor: pointer;
  font-weight: 850;
}

.bouton-page:disabled {
  cursor: not-allowed;
  opacity: 0.5;
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

.badge--gris {
  background: #edf0f4;
  color: #667085;
}

.icone-rotation {
  animation: rotation 0.8s linear infinite;
}

@keyframes rotation {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 1180px) {
  .indicateurs,
  .grille-tableaux {
    grid-template-columns: 1fr;
  }

  .tableau-carte--large {
    grid-column: span 1;
  }

  .etat-chargement {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 760px) {
  .page-hero,
  .barre-controle,
  .tableau-carte__entete--avec-filtre {
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

  .pagination-tableau,
  .pagination-tableau div {
    align-items: stretch;
    flex-direction: column;
  }

  .etat-chargement {
    grid-template-columns: 1fr;
  }
}
</style>
