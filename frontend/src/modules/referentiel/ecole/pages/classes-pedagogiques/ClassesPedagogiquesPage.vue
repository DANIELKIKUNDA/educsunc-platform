<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import {
  AlertTriangle,
  Archive,
  BookOpen,
  CheckCircle,
  ChevronLeft,
  ChevronRight,
  Edit3,
  Eye,
  MoreHorizontal,
  Plus,
  Search,
  Users,
} from 'lucide-vue-next';
import type { AnneeScolaireResume } from '../../../commun/types/annees-scolaires.types';
import type {
  ClasseAcademiqueResume,
  ClassePedagogiqueResume,
  OptionEtudeResume,
  PaginationStructureScolaire,
} from '../../../commun/types/structure-scolaire.types';
import { anneesScolairesApi } from '../../services/annees-scolaires.api';
import { structureScolaireApi } from '../../services/structure-scolaire.api';
import {
  contexteEcoleCourant,
  contexteEcoleEstConfigure,
} from '../../stores/contexte-ecole.store';

type ActionClasseSensible = 'desactiver' | 'archiver';
type ModeFormulaireClasse = 'creation' | 'renommage';

interface FormulaireClassePedagogique {
  idClasseAcademique: string;
  code: string;
  libelle: string;
  suffixeParallele: string;
  capaciteAccueil: string;
}

const classesPedagogiques = ref<ClassePedagogiqueResume[]>([]);
const classesAcademiques = ref<ClasseAcademiqueResume[]>([]);
const optionsEtudes = ref<OptionEtudeResume[]>([]);
const anneeActive = ref<AnneeScolaireResume | null>(null);
const pagination = ref<PaginationStructureScolaire>({
  total: 0,
  page: 1,
  taillePage: 20,
  totalPages: 0,
});
const chargement = ref(false);
const creationEnCours = ref(false);
const actionSensibleEnCours = ref(false);
const formulaireVisible = ref(false);
const detailVisible = ref(false);
const confirmationActionVisible = ref(false);
const modeFormulaire = ref<ModeFormulaireClasse>('creation');
const classeSelectionnee = ref<ClassePedagogiqueResume | null>(null);
const actionSelectionnee = ref<ActionClasseSensible | null>(null);
const recherche = ref('');
const messagePage = ref<string | null>(null);
const messageSucces = ref<string | null>(null);
const messageFormulaire = ref<string | null>(null);
const messageAction = ref<string | null>(null);
const formulaire = ref<FormulaireClassePedagogique>({
  idClasseAcademique: '',
  code: '',
  libelle: '',
  suffixeParallele: '',
  capaciteAccueil: '',
});

const classesFiltrees = computed(() => {
  const terme = recherche.value.trim().toLocaleLowerCase('fr-FR');

  if (terme.length === 0) {
    return classesPedagogiques.value;
  }

  return classesPedagogiques.value.filter((classe) => {
    const academique = obtenirClasseAcademique(classe.idClasseAcademique);
    const valeurs = [
      classe.code,
      classe.libelle,
      academique?.libelle ?? '',
      academique?.cycle ?? '',
      obtenirLibelleOption(academique),
    ].join(' ').toLocaleLowerCase('fr-FR');

    return valeurs.includes(terme);
  });
});

const totalClasses = computed(() => pagination.value.total || classesPedagogiques.value.length);
const totalActives = computed(
  () => classesPedagogiques.value.filter((classe) => classe.active).length,
);
const totalArchivees = computed(
  () => classesPedagogiques.value.filter((classe) => classe.archiveLe !== undefined).length,
);
const totalCapaciteAccueil = computed(() =>
  classesPedagogiques.value.reduce(
    (somme, classe) => somme + (classe.capaciteAccueil ?? 0),
    0,
  ),
);

const contexteOperationnel = computed(() =>
  contexteEcoleEstConfigure()
  && contexteEcoleCourant.idEcole !== null
  && contexteEcoleCourant.idUtilisateur !== null,
);

const creationPossible = computed(() =>
  contexteOperationnel.value
  && anneeActive.value !== null
  && classesAcademiques.value.length > 0
  && !creationEnCours.value
  && !chargement.value,
);

const pagePrecedenteDisponible = computed(() => pagination.value.page > 1);
const pageSuivanteDisponible = computed(() =>
  pagination.value.totalPages > pagination.value.page,
);

const plagePagination = computed(() => {
  if (pagination.value.total === 0) {
    return '0 classe';
  }

  const debut = (pagination.value.page - 1) * pagination.value.taillePage + 1;
  const fin = Math.min(
    pagination.value.page * pagination.value.taillePage,
    pagination.value.total,
  );

  return `${debut}-${fin} sur ${pagination.value.total}`;
});

const titreFormulaire = computed(() =>
  modeFormulaire.value === 'renommage'
    ? 'Renommer la classe pédagogique'
    : 'Créer une classe pédagogique',
);

const descriptionFormulaire = computed(() =>
  modeFormulaire.value === 'renommage'
    ? 'Seul le libellé de la classe pédagogique sélectionnée sera modifié.'
    : 'La classe sera créée dans l’année active de l’école courante.',
);

function obtenirClasseAcademique(idClasseAcademique: string): ClasseAcademiqueResume | undefined {
  return classesAcademiques.value.find((classe) => classe.id === idClasseAcademique);
}

function obtenirLibelleOption(classeAcademique?: ClasseAcademiqueResume): string {
  if (classeAcademique?.idOptionEtude === undefined) {
    return '-';
  }

  const option = optionsEtudes.value.find(
    (optionEtude) => optionEtude.id === classeAcademique.idOptionEtude,
  );

  return option?.abreviation ?? option?.libelle ?? '-';
}

function obtenirStatutClasse(classe: ClassePedagogiqueResume): string {
  if (classe.archiveLe !== undefined) {
    return 'Archivée';
  }

  return classe.active ? 'Active' : 'Inactive';
}

function obtenirLibelleAnneeActive(): string {
  return anneeActive.value?.code ?? 'Année active à charger';
}

function creerCleIdempotence(operation: string): string {
  const composantAleatoire = crypto.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;

  return `${operation}-${composantAleatoire}`;
}

async function chargerClassesPedagogiques(): Promise<void> {
  if (!contexteEcoleEstConfigure() || contexteEcoleCourant.idEcole === null) {
    messagePage.value =
      'Contexte école non configuré : impossible de charger les classes pédagogiques.';
    return;
  }

  chargement.value = true;
  messagePage.value = null;

  try {
    const options = { tenantId: contexteEcoleCourant.tenantId ?? contexteEcoleCourant.idEcole };

    try {
      const [classesAcademiquesChargees, optionsChargees] = await Promise.all([
        structureScolaireApi.listerClassesAcademiques({ page: 1, taillePage: 300 }, options),
        structureScolaireApi.listerOptionsEtudes({ page: 1, taillePage: 300 }, options),
      ]);

      classesAcademiques.value = classesAcademiquesChargees;
      optionsEtudes.value = optionsChargees;
    } catch {
      messagePage.value =
        'Le référentiel officiel des classes n’a pas pu être chargé. Vérifie que les classes académiques et options sont bien initialisées.';
      classesPedagogiques.value = [];
      return;
    }

    let anneeActiveChargee: AnneeScolaireResume | null = null;

    try {
      const reponseAnneeActive = await anneesScolairesApi.consulterActive(
        { idEcole: contexteEcoleCourant.idEcole },
        options,
      );

      anneeActiveChargee = reponseAnneeActive.donnee;
    } catch {
      messagePage.value =
        'L’année active de cette école n’est pas encore disponible. Va d’abord sur la page Années scolaires et utilise “Garantir année active”.';
      classesPedagogiques.value = [];
      anneeActive.value = null;
      return;
    }

    anneeActive.value = anneeActiveChargee;

    if (anneeActive.value === null) {
      classesPedagogiques.value = [];
      pagination.value = {
        total: 0,
        page: 1,
        taillePage: pagination.value.taillePage,
        totalPages: 0,
      };
      messagePage.value =
        'Aucune année active disponible. Garantir une année active avant de créer des classes pédagogiques.';
      return;
    }

    const reponse = await structureScolaireApi.listerClassesPedagogiques(
      {
        idEcole: contexteEcoleCourant.idEcole,
        idAnneeScolaire: anneeActive.value.id,
        page: pagination.value.page,
        taillePage: pagination.value.taillePage,
      },
      options,
    );

    classesPedagogiques.value = reponse.donnees;
    pagination.value = reponse.pagination;
  } catch {
    messagePage.value =
      'Les classes créées par l’école n’ont pas pu être lues pour cette année active. Tu peux réessayer après avoir vérifié l’année active.';
  } finally {
    chargement.value = false;
  }
}

function ouvrirCreation(): void {
  if (!creationPossible.value) {
    messagePage.value =
      'La création nécessite une année active, des classes académiques et un utilisateur configuré.';
    return;
  }

  modeFormulaire.value = 'creation';
  classeSelectionnee.value = null;
  messageFormulaire.value = null;
  messagePage.value = null;
  const premiereClasseAcademique = classesAcademiques.value[0];
  formulaire.value = {
    idClasseAcademique: premiereClasseAcademique?.id ?? '',
    code: premiereClasseAcademique?.code ?? '',
    libelle: premiereClasseAcademique?.libelle ?? '',
    suffixeParallele: '',
    capaciteAccueil: '',
  };
  formulaireVisible.value = true;
}

function ouvrirRenommage(classe: ClassePedagogiqueResume): void {
  modeFormulaire.value = 'renommage';
  classeSelectionnee.value = classe;
  messageFormulaire.value = null;
  messagePage.value = null;
  formulaire.value = {
    idClasseAcademique: classe.idClasseAcademique,
    code: classe.code,
    libelle: classe.libelle,
    suffixeParallele: classe.suffixeParallele ?? '',
    capaciteAccueil: classe.capaciteAccueil === undefined ? '' : String(classe.capaciteAccueil),
  };
  formulaireVisible.value = true;
}

function fermerFormulaire(): void {
  formulaireVisible.value = false;
  messageFormulaire.value = null;
  classeSelectionnee.value = null;
}

function synchroniserDepuisClasseAcademique(): void {
  if (modeFormulaire.value !== 'creation') {
    return;
  }

  const classeAcademique = obtenirClasseAcademique(formulaire.value.idClasseAcademique);

  if (classeAcademique === undefined) {
    return;
  }

  const suffixe = formulaire.value.suffixeParallele.trim();
  formulaire.value.code = suffixe.length > 0
    ? `${classeAcademique.code}-${suffixe.toUpperCase()}`
    : classeAcademique.code;
  formulaire.value.libelle = suffixe.length > 0
    ? `${classeAcademique.libelle} ${suffixe.toUpperCase()}`
    : classeAcademique.libelle;
}

function validerFormulaire(): string | null {
  if (modeFormulaire.value === 'creation' && formulaire.value.idClasseAcademique.length === 0) {
    return 'La classe académique est obligatoire.';
  }

  if (formulaire.value.code.trim().length === 0) {
    return 'Le code de la classe pédagogique est obligatoire.';
  }

  if (formulaire.value.libelle.trim().length === 0) {
    return 'Le libellé de la classe pédagogique est obligatoire.';
  }

  if (
    formulaire.value.capaciteAccueil.trim().length > 0
    && (!Number.isInteger(Number(formulaire.value.capaciteAccueil))
      || Number(formulaire.value.capaciteAccueil) <= 0)
  ) {
    return 'La capacité d’accueil doit être un entier strictement positif.';
  }

  return null;
}

async function confirmerFormulaire(): Promise<void> {
  if (
    !contexteOperationnel.value
    || contexteEcoleCourant.idEcole === null
    || contexteEcoleCourant.idUtilisateur === null
    || anneeActive.value === null
  ) {
    messageFormulaire.value =
      'Le contexte école, l’utilisateur et l’année active sont obligatoires.';
    return;
  }

  const erreurValidation = validerFormulaire();

  if (erreurValidation !== null) {
    messageFormulaire.value = erreurValidation;
    return;
  }

  creationEnCours.value = true;
  messageFormulaire.value = null;
  messageSucces.value = null;

  try {
    const options = {
      tenantId: contexteEcoleCourant.tenantId ?? contexteEcoleCourant.idEcole,
    };

    if (modeFormulaire.value === 'renommage' && classeSelectionnee.value !== null) {
      await structureScolaireApi.renommerClassePedagogique(
        {
          idClassePedagogique: classeSelectionnee.value.id,
          nouveauLibelle: formulaire.value.libelle.trim(),
          modifiePar: contexteEcoleCourant.idUtilisateur,
        },
        options,
      );
      messageSucces.value = 'La classe pédagogique a été renommée avec succès.';
    } else {
      await structureScolaireApi.creerClassePedagogique(
        {
          idEcole: contexteEcoleCourant.idEcole,
          idAnneeScolaire: anneeActive.value.id,
          idClasseAcademique: formulaire.value.idClasseAcademique,
          code: formulaire.value.code.trim(),
          libelle: formulaire.value.libelle.trim(),
          suffixeParallele: formulaire.value.suffixeParallele.trim() || undefined,
          capaciteAccueil: formulaire.value.capaciteAccueil.trim().length === 0
            ? undefined
            : Number(formulaire.value.capaciteAccueil),
          creePar: contexteEcoleCourant.idUtilisateur,
        },
        {
          ...options,
          idempotencyKey: creerCleIdempotence('creer-classe-pedagogique'),
        },
      );
      messageSucces.value = 'La classe pédagogique a été créée avec succès.';
    }

    fermerFormulaire();
    await chargerClassesPedagogiques();
  } catch {
    messageFormulaire.value =
      'La classe pédagogique n’a pas pu être enregistrée. Vérifie les données puis réessaie.';
  } finally {
    creationEnCours.value = false;
  }
}

function afficherDetail(classe: ClassePedagogiqueResume): void {
  classeSelectionnee.value = classe;
  detailVisible.value = true;
}

function fermerDetail(): void {
  detailVisible.value = false;
  classeSelectionnee.value = null;
}

function demanderActionSensible(
  classe: ClassePedagogiqueResume,
  action: ActionClasseSensible,
): void {
  if (contexteEcoleCourant.idUtilisateur === null) {
    messagePage.value =
      'Utilisateur non configuré : impossible d’exécuter cette action.';
    return;
  }

  classeSelectionnee.value = classe;
  actionSelectionnee.value = action;
  messageAction.value = null;
  confirmationActionVisible.value = true;
}

function fermerActionSensible(): void {
  confirmationActionVisible.value = false;
  classeSelectionnee.value = null;
  actionSelectionnee.value = null;
  messageAction.value = null;
}

function obtenirTitreActionSensible(): string {
  return actionSelectionnee.value === 'archiver'
    ? 'Archiver la classe pédagogique ?'
    : 'Désactiver la classe pédagogique ?';
}

function obtenirMessageActionSensible(): string {
  return actionSelectionnee.value === 'archiver'
    ? 'La classe pédagogique sélectionnée sera archivée et restera traçable dans l’historique.'
    : 'La classe pédagogique sélectionnée sera désactivée sans être supprimée.';
}

async function confirmerActionSensible(): Promise<void> {
  if (
    classeSelectionnee.value === null
    || actionSelectionnee.value === null
    || contexteEcoleCourant.idUtilisateur === null
  ) {
    fermerActionSensible();
    return;
  }

  actionSensibleEnCours.value = true;
  messageAction.value = null;
  messageSucces.value = null;

  try {
    const parametres = {
      idClassePedagogique: classeSelectionnee.value.id,
      modifiePar: contexteEcoleCourant.idUtilisateur,
    };
    const options = {
      tenantId: contexteEcoleCourant.tenantId ?? contexteEcoleCourant.idEcole ?? undefined,
    };

    if (actionSelectionnee.value === 'archiver') {
      await structureScolaireApi.archiverClassePedagogique(parametres, options);
      messageSucces.value = 'La classe pédagogique a été archivée avec succès.';
    } else {
      await structureScolaireApi.desactiverClassePedagogique(parametres, options);
      messageSucces.value = 'La classe pédagogique a été désactivée avec succès.';
    }

    fermerActionSensible();
    await chargerClassesPedagogiques();
  } catch {
    messageAction.value =
      'L’action n’a pas pu être terminée. Les règles métier ont été conservées.';
  } finally {
    actionSensibleEnCours.value = false;
  }
}

async function changerPage(nouvellePage: number): Promise<void> {
  if (
    nouvellePage < 1
    || (pagination.value.totalPages > 0 && nouvellePage > pagination.value.totalPages)
    || nouvellePage === pagination.value.page
  ) {
    return;
  }

  pagination.value = {
    ...pagination.value,
    page: nouvellePage,
  };

  await chargerClassesPedagogiques();
}

onMounted(() => {
  void chargerClassesPedagogiques();
});
</script>

<template>
  <section class="classes-page">
    <header class="classes-page__entete">
      <div>
        <h2>Classes pédagogiques</h2>
        <p>Gestion des classes ouvertes pour l’année active {{ obtenirLibelleAnneeActive() }}</p>
      </div>

      <button
        class="classes-bouton classes-bouton--principal"
        type="button"
        :disabled="!creationPossible"
        @click="ouvrirCreation"
      >
        <Plus :size="18" />
        Créer une classe pédagogique
      </button>
    </header>

    <section class="classes-resume" aria-label="Résumé des classes pédagogiques">
      <article class="classes-resume__carte">
        <div class="classes-resume__icone classes-resume__icone--bleu">
          <BookOpen :size="23" />
        </div>
        <div>
          <strong>{{ totalClasses }}</strong>
          <span>Total classes</span>
          <small>{{ obtenirLibelleAnneeActive() }}</small>
        </div>
      </article>

      <article class="classes-resume__carte">
        <div class="classes-resume__icone classes-resume__icone--vert">
          <Users :size="23" />
        </div>
        <div>
          <strong>{{ totalCapaciteAccueil }}</strong>
          <span>Capacité d’accueil</span>
          <small>Donnée déclarative</small>
        </div>
      </article>

      <article class="classes-resume__carte">
        <div class="classes-resume__icone classes-resume__icone--emeraude">
          <CheckCircle :size="22" />
        </div>
        <div>
          <strong>{{ totalActives }}</strong>
          <span>Classes actives</span>
        </div>
      </article>

      <article class="classes-resume__carte">
        <div class="classes-resume__icone classes-resume__icone--violet">
          <Archive :size="22" />
        </div>
        <div>
          <strong>{{ totalArchivees }}</strong>
          <span>Classes archivées</span>
        </div>
      </article>
    </section>

    <section class="classes-outils" aria-label="Filtres des classes">
      <label class="classes-recherche">
        <Search :size="18" />
        <input v-model="recherche" type="search" placeholder="Rechercher..." />
      </label>
      <span class="classes-selecteur">Année : {{ obtenirLibelleAnneeActive() }}</span>
      <span class="classes-selecteur">{{ chargement ? 'Chargement' : 'Données à jour' }}</span>
    </section>

    <p v-if="messageSucces !== null" class="message-page message-page--succes">
      <CheckCircle :size="18" />
      {{ messageSucces }}
    </p>
    <p v-if="messagePage !== null" class="message-page message-page--erreur">
      <AlertTriangle :size="18" />
      {{ messagePage }}
    </p>

    <section class="classes-tableau" aria-label="Liste des classes pédagogiques">
      <div class="classes-tableau__ligne classes-tableau__ligne--entete">
        <span>Classe</span>
        <span>Section</span>
        <span>Option</span>
        <span>Capacité</span>
        <span>Année</span>
        <span>Statut</span>
        <span>Actions</span>
      </div>

      <div v-if="chargement" class="classes-tableau__ligne classes-tableau__ligne--etat">
        <span>Chargement des classes pédagogiques...</span>
      </div>
      <div
        v-else-if="classesFiltrees.length === 0"
        class="classes-tableau__ligne classes-tableau__ligne--etat"
      >
        <span>Aucune classe pédagogique disponible pour cette année active.</span>
      </div>

      <div
        v-for="classe in classesFiltrees"
        :key="classe.id"
        class="classes-tableau__ligne"
      >
        <strong>{{ classe.libelle }}</strong>
        <span>{{ obtenirClasseAcademique(classe.idClasseAcademique)?.cycle ?? '-' }}</span>
        <span>{{ obtenirLibelleOption(obtenirClasseAcademique(classe.idClasseAcademique)) }}</span>
        <span>{{ classe.capaciteAccueil ?? '-' }}</span>
        <span>{{ obtenirLibelleAnneeActive() }}</span>
        <span
          class="classes-badge"
          :data-statut="classe.archiveLe !== undefined ? 'ARCHIVE' : classe.active ? 'ACTIF' : 'INACTIF'"
        >
          {{ obtenirStatutClasse(classe) }}
        </span>
        <div class="classes-actions">
          <button type="button" @click="afficherDetail(classe)">
            <Eye :size="15" /> Voir
          </button>
          <button class="classes-actions__menu" type="button" aria-label="Ouvrir les actions">
            <MoreHorizontal :size="18" />
          </button>

          <div class="classes-menu">
            <button type="button" @click="ouvrirRenommage(classe)">
              <Edit3 :size="15" /> Renommer
            </button>
            <button
              type="button"
              :disabled="!classe.active"
              @click="demanderActionSensible(classe, 'desactiver')"
            >
              <Archive :size="15" /> Désactiver
            </button>
            <button
              type="button"
              :disabled="classe.archiveLe !== undefined"
              @click="demanderActionSensible(classe, 'archiver')"
            >
              <Archive :size="15" /> Archiver
            </button>
          </div>
        </div>
      </div>

      <footer class="classes-pagination">
        <span>{{ plagePagination }}</span>
        <div class="classes-pagination__pages">
          <button
            type="button"
            :disabled="!pagePrecedenteDisponible || chargement"
            @click="changerPage(pagination.page - 1)"
          >
            <ChevronLeft :size="15" /> Précédent
          </button>
          <strong>Page {{ pagination.page }} / {{ pagination.totalPages || 1 }}</strong>
          <button
            type="button"
            :disabled="!pageSuivanteDisponible || chargement"
            @click="changerPage(pagination.page + 1)"
          >
            Suivant <ChevronRight :size="15" />
          </button>
        </div>
      </footer>
    </section>

    <div
      v-if="formulaireVisible"
      class="classes-dialogue"
      role="dialog"
      aria-modal="true"
      aria-labelledby="titre-formulaire-classe"
    >
      <article class="classes-dialogue__carte">
        <div>
          <h3 id="titre-formulaire-classe">{{ titreFormulaire }}</h3>
          <p>{{ descriptionFormulaire }}</p>
        </div>
        <p v-if="messageFormulaire !== null" class="message-page message-page--erreur">
          <AlertTriangle :size="18" />
          {{ messageFormulaire }}
        </p>

        <div class="classes-formulaire">
          <label v-if="modeFormulaire === 'creation'">
            <span>Classe académique</span>
            <select
              v-model="formulaire.idClasseAcademique"
              @change="synchroniserDepuisClasseAcademique"
            >
              <option
                v-for="classeAcademique in classesAcademiques"
                :key="classeAcademique.id"
                :value="classeAcademique.id"
              >
                {{ classeAcademique.code }} - {{ classeAcademique.libelle }}
              </option>
            </select>
          </label>
          <label v-if="modeFormulaire === 'creation'">
            <span>Parallèle</span>
            <input
              v-model="formulaire.suffixeParallele"
              type="text"
              placeholder="A, B, C..."
              @input="synchroniserDepuisClasseAcademique"
            />
          </label>
          <label>
            <span>Code</span>
            <input
              v-model="formulaire.code"
              type="text"
              :disabled="modeFormulaire === 'renommage'"
            />
          </label>
          <label>
            <span>Libellé</span>
            <input v-model="formulaire.libelle" type="text" />
          </label>
          <label v-if="modeFormulaire === 'creation'">
            <span>Capacité d’accueil</span>
            <input v-model="formulaire.capaciteAccueil" type="number" min="1" />
          </label>
        </div>

        <div class="classes-dialogue__actions">
          <button class="classes-bouton" type="button" @click="fermerFormulaire">
            Annuler
          </button>
          <button
            class="classes-bouton classes-bouton--principal"
            type="button"
            :disabled="creationEnCours"
            @click="confirmerFormulaire"
          >
            Confirmer
          </button>
        </div>
      </article>
    </div>

    <div
      v-if="detailVisible && classeSelectionnee !== null"
      class="classes-dialogue"
      role="dialog"
      aria-modal="true"
      aria-labelledby="titre-detail-classe"
    >
      <article class="classes-dialogue__carte">
        <div>
          <h3 id="titre-detail-classe">Détail de la classe pédagogique</h3>
          <p>Données de l’année active.</p>
        </div>
        <dl class="classes-detail">
          <div>
            <dt>Code</dt>
            <dd>{{ classeSelectionnee.code }}</dd>
          </div>
          <div>
            <dt>Libellé</dt>
            <dd>{{ classeSelectionnee.libelle }}</dd>
          </div>
          <div>
            <dt>Classe académique</dt>
            <dd>{{ obtenirClasseAcademique(classeSelectionnee.idClasseAcademique)?.libelle ?? '-' }}</dd>
          </div>
          <div>
            <dt>Capacité</dt>
            <dd>{{ classeSelectionnee.capaciteAccueil ?? '-' }}</dd>
          </div>
          <div>
            <dt>Statut</dt>
            <dd>{{ obtenirStatutClasse(classeSelectionnee) }}</dd>
          </div>
          <div>
            <dt>Version</dt>
            <dd>{{ classeSelectionnee.version }}</dd>
          </div>
        </dl>
        <div class="classes-dialogue__actions">
          <button class="classes-bouton classes-bouton--principal" type="button" @click="fermerDetail">
            Fermer
          </button>
        </div>
      </article>
    </div>

    <div
      v-if="confirmationActionVisible"
      class="classes-dialogue"
      role="dialog"
      aria-modal="true"
      aria-labelledby="titre-action-classe"
    >
      <article class="classes-dialogue__carte">
        <div>
          <h3 id="titre-action-classe">{{ obtenirTitreActionSensible() }}</h3>
          <p>{{ obtenirMessageActionSensible() }}</p>
        </div>
        <p v-if="messageAction !== null" class="message-page message-page--erreur">
          <AlertTriangle :size="18" />
          {{ messageAction }}
        </p>
        <div class="classes-dialogue__actions">
          <button class="classes-bouton" type="button" @click="fermerActionSensible">
            Annuler
          </button>
          <button
            class="classes-bouton classes-bouton--principal"
            type="button"
            :disabled="actionSensibleEnCours"
            @click="confirmerActionSensible"
          >
            Confirmer
          </button>
        </div>
      </article>
    </div>
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
.classes-actions button,
.classes-pagination button {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 0.45rem;
  border: 1px solid #dfe5ef;
  border-radius: 0.45rem;
  background: #ffffff;
  color: #1f2937;
  cursor: pointer;
  font-weight: 800;
}

.classes-bouton:disabled,
.classes-actions button:disabled,
.classes-pagination button:disabled {
  cursor: not-allowed;
  opacity: 0.62;
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
  border-radius: 0.6rem;
  background: #ffffff;
  box-shadow: 0 8px 18px rgba(31, 41, 55, 0.07);
}

.classes-resume__icone {
  display: grid;
  width: 2.75rem;
  height: 2.75rem;
  flex: 0 0 auto;
  place-items: center;
  border-radius: 0.45rem;
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
  grid-template-columns: minmax(16rem, 1fr) auto auto;
  gap: 0.45rem;
  padding: 0.65rem;
  border: 1px solid #dfe5ef;
  border-radius: 0.6rem;
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
  border-radius: 0.45rem;
  color: #6b7280;
}

.classes-recherche input {
  width: 100%;
  border: 0;
  outline: 0;
  color: #1f2937;
}

.classes-selecteur {
  min-height: 2.35rem;
  padding: 0 0.75rem;
}

.message-page {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  margin: 0;
  padding: 0.8rem 0.9rem;
  border-radius: 0.55rem;
  font-weight: 800;
}

.message-page svg {
  flex: 0 0 auto;
}

.message-page--succes {
  border: 1px solid rgba(47, 157, 98, 0.22);
  background: rgba(47, 157, 98, 0.1);
  color: #23784a;
}

.message-page--erreur {
  border: 1px solid rgba(217, 83, 79, 0.24);
  background: rgba(217, 83, 79, 0.09);
  color: #9f1d16;
}

.classes-tableau {
  overflow-x: auto;
  overflow-y: visible;
  border: 1px solid #dfe5ef;
  border-radius: 0.6rem;
  background: #ffffff;
  box-shadow: 0 8px 18px rgba(31, 41, 55, 0.07);
}

.classes-tableau__ligne {
  position: relative;
  display: grid;
  grid-template-columns: 1.25fr 0.9fr 0.85fr 0.75fr 1fr 0.8fr 1.35fr;
  min-height: 2.9rem;
  align-items: center;
  gap: 0.6rem;
  min-width: 920px;
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
  font-weight: 900;
}

.classes-tableau__ligne--etat {
  grid-template-columns: 1fr;
  color: #6b7280;
  font-weight: 800;
}

.classes-badge {
  width: fit-content;
  padding: 0.28rem 0.55rem;
  border-radius: 0.3rem;
  color: #ffffff;
  font-size: 0.75rem;
  font-weight: 900;
}

.classes-badge[data-statut='ACTIF'] {
  background: #2d8b72;
}

.classes-badge[data-statut='INACTIF'] {
  background: #8a94a6;
}

.classes-badge[data-statut='ARCHIVE'] {
  background: #5b6270;
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
  border-radius: 0.45rem;
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

.classes-menu button {
  justify-content: flex-start;
  border: 0;
  border-bottom: 1px solid #e5e9f1;
  border-radius: 0;
}

.classes-menu button:last-child {
  border-bottom: 0;
}

.classes-pagination {
  display: flex;
  align-items: center;
  justify-content: space-between;
  min-width: 920px;
  padding: 0.7rem 0.9rem;
  border-top: 1px solid #dfe5ef;
}

.classes-pagination__pages {
  display: flex;
  gap: 0.5rem;
  align-items: center;
}

.classes-pagination button {
  min-height: 2rem;
  padding: 0 0.55rem;
}

.classes-pagination strong {
  color: #1f2937;
}

.classes-dialogue {
  position: fixed;
  inset: 0;
  z-index: 50;
  display: flex;
  min-height: 100dvh;
  align-items: flex-start;
  justify-content: center;
  overflow-y: auto;
  padding: clamp(1.25rem, 8vh, 4.5rem) 2rem 2rem;
  background: rgba(15, 23, 42, 0.35);
  backdrop-filter: blur(8px);
}

.classes-dialogue__carte {
  display: grid;
  width: min(100%, 38rem);
  max-height: calc(100dvh - clamp(3.25rem, 10vh, 6.5rem));
  gap: 1rem;
  overflow-y: auto;
  padding: 1.2rem;
  border: 1px solid #dfe5ef;
  border-radius: 0.9rem;
  background: #ffffff;
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.24);
}

.classes-dialogue h3 {
  margin: 0 0 0.35rem;
  color: #1f2937;
}

.classes-dialogue p {
  margin: 0;
  color: #5f6b7a;
  line-height: 1.55;
}

.classes-dialogue__actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.6rem;
}

.classes-formulaire,
.classes-detail {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
}

.classes-formulaire label,
.classes-detail div {
  display: grid;
  gap: 0.35rem;
}

.classes-formulaire span,
.classes-detail dt {
  color: #6b7280;
  font-size: 0.74rem;
  font-weight: 900;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.classes-formulaire input,
.classes-formulaire select {
  min-height: 2.7rem;
  border: 1px solid #dfe5ef;
  border-radius: 0.45rem;
  padding: 0 0.75rem;
  color: #1f2937;
  font: inherit;
}

.classes-formulaire input:focus,
.classes-formulaire select:focus {
  border-color: #7c9fd6;
  outline: 2px solid rgba(124, 159, 214, 0.22);
}

.classes-detail {
  margin: 0;
}

.classes-detail dd {
  margin: 0;
  color: #1f2937;
  font-weight: 800;
}

@media (max-width: 1100px) {
  .classes-resume,
  .classes-outils {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 760px) {
  .classes-page__entete,
  .classes-dialogue__actions,
  .classes-pagination,
  .classes-pagination__pages {
    align-items: stretch;
    flex-direction: column;
  }

  .classes-resume,
  .classes-outils,
  .classes-formulaire,
  .classes-detail {
    grid-template-columns: 1fr;
  }

  .classes-bouton {
    width: 100%;
  }
}
</style>
