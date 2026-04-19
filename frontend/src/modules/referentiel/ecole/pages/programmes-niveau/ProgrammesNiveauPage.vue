<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import {
  AlertTriangle,
  BookOpenCheck,
  CheckCircle2,
  Clock3,
  Eye,
  FileCheck2,
  Layers3,
  Search,
  ShieldCheck,
  Sparkles,
} from 'lucide-vue-next';
import type { AnneeScolaireResume } from '../../../commun/types/annees-scolaires.types';
import type {
  EtatLocalProgrammeNiveau,
  ProgrammeNiveauResume,
} from '../../../commun/types/programmes-niveau.types';
import type {
  ReferentielCoursResume,
  ReferentielProgrammeResume,
} from '../../../commun/types/referentiel-officiel.types';
import type {
  ClasseAcademiqueResume,
  PaginationStructureScolaire,
} from '../../../commun/types/structure-scolaire.types';
import { anneesScolairesApi } from '../../services/annees-scolaires.api';
import { programmesNiveauApi } from '../../services/programmes-niveau.api';
import { referentielOfficielApi } from '../../services/referentiel-officiel.api';
import { structureScolaireApi } from '../../services/structure-scolaire.api';
import {
  contexteEcoleCourant,
  contexteEcoleEstConfigure,
} from '../../stores/contexte-ecole.store';

type ActionProgrammeSensible = 'valider' | 'archiver';

const programmesNiveau = ref<ProgrammeNiveauResume[]>([]);
const classesAcademiques = ref<ClasseAcademiqueResume[]>([]);
const referentielsCoursParId = ref<Record<string, ReferentielCoursResume>>({});
const anneeActive = ref<AnneeScolaireResume | null>(null);
const pagination = ref<PaginationStructureScolaire>({
  total: 0,
  page: 1,
  taillePage: 20,
  totalPages: 0,
});
const chargement = ref(false);
const initialisationEnCours = ref(false);
const actionSensibleEnCours = ref(false);
const formulaireInitialisationVisible = ref(false);
const confirmationActionVisible = ref(false);
const detailVisible = ref(false);
const recherche = ref('');
const idClasseAInitialiser = ref('');
const programmeSelectionne = ref<ProgrammeNiveauResume | null>(null);
const etatLocalProgramme = ref<EtatLocalProgrammeNiveau | null>(null);
const actionSelectionnee = ref<ActionProgrammeSensible | null>(null);
const messagePage = ref<string | null>(null);
const messageSucces = ref<string | null>(null);
const messageAvertissement = ref<string | null>(null);
const messageFormulaire = ref<string | null>(null);
const messageAction = ref<string | null>(null);

const programmesFiltres = computed(() => {
  const terme = recherche.value.trim().toLocaleLowerCase('fr-FR');

  if (terme.length === 0) {
    return programmesNiveau.value;
  }

  return programmesNiveau.value.filter((programme) => {
    const classeAcademique = obtenirClasseAcademique(programme.idClasseAcademique);
    const valeurs = [
      classeAcademique?.code ?? '',
      classeAcademique?.libelle ?? '',
      classeAcademique?.cycle ?? '',
      programme.statut,
    ].join(' ').toLocaleLowerCase('fr-FR');

    return valeurs.includes(terme);
  });
});

const totalProgrammes = computed(() => pagination.value.total || programmesNiveau.value.length);
const totalValides = computed(() =>
  programmesNiveau.value.filter((programme) => programme.statut === 'VALIDE').length,
);
const totalBrouillons = computed(() =>
  programmesNiveau.value.filter((programme) => programme.statut === 'BROUILLON').length,
);
const totalArchives = computed(() =>
  programmesNiveau.value.filter((programme) => programme.statut === 'ARCHIVE').length,
);
const totalLignesActives = computed(() =>
  programmesNiveau.value.reduce(
    (somme, programme) =>
      somme + programme.lignes.filter((ligne) => ligne.estActifDansEcole).length,
    0,
  ),
);

const contexteOperationnel = computed(() =>
  contexteEcoleEstConfigure()
  && contexteEcoleCourant.idEcole !== null
  && contexteEcoleCourant.idUtilisateur !== null,
);

const initialisationPossible = computed(() =>
  contexteOperationnel.value
  && anneeActive.value !== null
  && classesAcademiques.value.length > 0
  && !initialisationEnCours.value
  && !chargement.value,
);

const pagePrecedenteDisponible = computed(() => pagination.value.page > 1);
const pageSuivanteDisponible = computed(() =>
  pagination.value.totalPages > pagination.value.page,
);

const plagePagination = computed(() => {
  if (pagination.value.total === 0) {
    return '0 programme';
  }

  const debut = (pagination.value.page - 1) * pagination.value.taillePage + 1;
  const fin = Math.min(
    pagination.value.page * pagination.value.taillePage,
    pagination.value.total,
  );

  return `${debut}-${fin} sur ${pagination.value.total}`;
});

const lignesDetail = computed(() => programmeSelectionne.value?.lignes ?? []);

function obtenirClasseAcademique(idClasseAcademique: string): ClasseAcademiqueResume | undefined {
  return classesAcademiques.value.find((classe) => classe.id === idClasseAcademique);
}

function obtenirLibelleClasse(programme: ProgrammeNiveauResume): string {
  const classeAcademique = obtenirClasseAcademique(programme.idClasseAcademique);

  return classeAcademique === undefined
    ? programme.idClasseAcademique
    : `${classeAcademique.code} - ${classeAcademique.libelle}`;
}

function obtenirCodeClasse(programme: ProgrammeNiveauResume): string {
  return obtenirClasseAcademique(programme.idClasseAcademique)?.code ?? '-';
}

function obtenirLibelleCours(idReferentielCours: string): string {
  const cours = referentielsCoursParId.value[idReferentielCours];

  if (cours === undefined) {
    return idReferentielCours;
  }

  return `${cours.code} - ${cours.libelle}`;
}

function obtenirLibelleAnneeActive(): string {
  return anneeActive.value?.code ?? 'Année active à charger';
}

function obtenirLibelleStatut(statut: ProgrammeNiveauResume['statut']): string {
  const libelles: Record<ProgrammeNiveauResume['statut'], string> = {
    BROUILLON: 'Brouillon',
    VALIDE: 'Validé',
    ARCHIVE: 'Archivé',
  };

  return libelles[statut];
}

function obtenirClasseStatut(statut: ProgrammeNiveauResume['statut']): string {
  if (statut === 'VALIDE') {
    return 'badge--vert';
  }

  if (statut === 'ARCHIVE') {
    return 'badge--gris';
  }

  return 'badge--orange';
}

function calculerTotalPonderation(programme: ProgrammeNiveauResume): number {
  return programme.lignes.reduce((total, ligne) =>
    total
    + ligne.ponderation.maxP1
    + ligne.ponderation.maxP2
    + ligne.ponderation.maxEX1
    + ligne.ponderation.maxP3
    + ligne.ponderation.maxP4
    + ligne.ponderation.maxEX2
    + ligne.ponderation.maxP5
    + ligne.ponderation.maxP6
    + ligne.ponderation.maxEX3,
  0);
}

function calculerTotalPonderationLigne(ligne: ProgrammeNiveauResume['lignes'][number]): number {
  return Object.values(ligne.ponderation).reduce((total, valeur) => total + valeur, 0);
}

function creerCleIdempotence(operation: string): string {
  const composantAleatoire = crypto.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;

  return `${operation}-${composantAleatoire}`;
}

async function chargerReferentielsCours(
  options: { tenantId?: string },
): Promise<void> {
  const coursParId: Record<string, ReferentielCoursResume> = {};
  let pageCourante = 1;
  let totalPages = 1;

  do {
    const reponse = await referentielOfficielApi.listerCours(
      { page: pageCourante, taillePage: 500 },
      options,
    );

    reponse.donnees.forEach((cours) => {
      coursParId[cours.id] = cours;
    });

    totalPages = reponse.pagination.totalPages || 1;
    pageCourante += 1;
  } while (pageCourante <= totalPages);

  referentielsCoursParId.value = coursParId;
}

async function chargerProgrammesNiveau(): Promise<void> {
  if (!contexteEcoleEstConfigure() || contexteEcoleCourant.idEcole === null) {
    messagePage.value =
      'Contexte école non configuré : impossible de charger les programmes niveau.';
    return;
  }

  chargement.value = true;
  messagePage.value = null;
  messageAvertissement.value = null;

  try {
    const options = { tenantId: contexteEcoleCourant.tenantId ?? contexteEcoleCourant.idEcole };

    try {
      classesAcademiques.value = await structureScolaireApi.listerClassesAcademiques(
        { page: 1, taillePage: 300 },
        options,
      );
    } catch {
      messagePage.value =
        'Le référentiel des classes académiques n’a pas pu être chargé.';
      programmesNiveau.value = [];
      return;
    }

    try {
      await chargerReferentielsCours(options);
    } catch {
      referentielsCoursParId.value = {};
      messageAvertissement.value =
        'Les libellés des cours ne sont pas encore disponibles. La page reste consultable.';
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
        'L’année active de cette école n’est pas encore disponible. Va d’abord sur Années scolaires et utilise “Garantir année active”.';
      anneeActive.value = null;
      programmesNiveau.value = [];
      return;
    }

    anneeActive.value = anneeActiveChargee;

    if (anneeActive.value === null) {
      programmesNiveau.value = [];
      pagination.value = {
        total: 0,
        page: 1,
        taillePage: pagination.value.taillePage,
        totalPages: 0,
      };
      messagePage.value =
        'Aucune année active disponible. Les programmes niveau se créent pour une année active.';
      return;
    }

    const reponse = await programmesNiveauApi.lister(
      {
        idEcole: contexteEcoleCourant.idEcole,
        idAnneeScolaire: anneeActive.value.id,
        page: pagination.value.page,
        taillePage: pagination.value.taillePage,
      },
      options,
    );

    programmesNiveau.value = reponse.donnees;
    pagination.value = reponse.pagination;
  } catch {
    messagePage.value =
      'Les programmes niveau n’ont pas pu être lus pour cette année active.';
  } finally {
    chargement.value = false;
  }
}

function ouvrirInitialisation(): void {
  if (!initialisationPossible.value) {
    messagePage.value =
      'L’initialisation nécessite une année active, des classes académiques et un utilisateur configuré.';
    return;
  }

  idClasseAInitialiser.value = classesAcademiques.value[0]?.id ?? '';
  messageFormulaire.value = null;
  messagePage.value = null;
  formulaireInitialisationVisible.value = true;
}

function fermerInitialisation(): void {
  formulaireInitialisationVisible.value = false;
  messageFormulaire.value = null;
}

async function chargerReferentielPourInitialisation(): Promise<ReferentielProgrammeResume | null> {
  if (idClasseAInitialiser.value.length === 0) {
    messageFormulaire.value = 'La classe académique est obligatoire.';
    return null;
  }

  const reponse = await referentielOfficielApi.listerProgrammes(
    {
      idClasseAcademique: idClasseAInitialiser.value,
      page: 1,
      taillePage: 1,
    },
    {
      tenantId: contexteEcoleCourant.tenantId ?? contexteEcoleCourant.idEcole ?? undefined,
    },
  );

  const referentiel = reponse.donnees[0] ?? null;

  if (referentiel === null || referentiel.versionProjectionnee === null) {
    messageFormulaire.value =
      'Aucun référentiel officiel publié n’est disponible pour cette classe académique.';
    return null;
  }

  return referentiel;
}

async function confirmerInitialisation(): Promise<void> {
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

  initialisationEnCours.value = true;
  messageFormulaire.value = null;
  messageSucces.value = null;

  try {
    const referentiel = await chargerReferentielPourInitialisation();

    if (referentiel === null || referentiel.versionProjectionnee === null) {
      return;
    }

    await programmesNiveauApi.initialiser(
      {
        idEcole: contexteEcoleCourant.idEcole,
        idAnneeScolaire: anneeActive.value.id,
        idClasseAcademique: idClasseAInitialiser.value,
        idReferentielProgramme: referentiel.id,
        idVersionReferentielProgramme: referentiel.versionProjectionnee.id,
        creePar: contexteEcoleCourant.idUtilisateur,
      },
      {
        tenantId: contexteEcoleCourant.tenantId ?? contexteEcoleCourant.idEcole,
        idempotencyKey: creerCleIdempotence('initialiser-programme-niveau'),
      },
    );

    fermerInitialisation();
    messageSucces.value = 'Le programme niveau a été initialisé avec succès.';
    await chargerProgrammesNiveau();
  } catch {
    messageFormulaire.value =
      'Le programme niveau n’a pas pu être initialisé. Vérifie le référentiel officiel et réessaie.';
  } finally {
    initialisationEnCours.value = false;
  }
}

async function afficherDetail(programme: ProgrammeNiveauResume): Promise<void> {
  messagePage.value = null;

  try {
    const options = {
      tenantId: contexteEcoleCourant.tenantId ?? contexteEcoleCourant.idEcole ?? undefined,
    };
    const [reponse, reponseEtatLocal] = await Promise.all([
      programmesNiveauApi.consulter({ idProgrammeNiveau: programme.id }, options),
      programmesNiveauApi.produireEtatLocal({ idProgrammeNiveau: programme.id }, options),
    ]);

    programmeSelectionne.value = reponse.donnee;
    etatLocalProgramme.value = reponseEtatLocal.donnee;
    detailVisible.value = true;
  } catch {
    messagePage.value = 'Le détail du programme niveau n’a pas pu être chargé.';
  }
}

function fermerDetail(): void {
  detailVisible.value = false;
  programmeSelectionne.value = null;
  etatLocalProgramme.value = null;
}

function demanderAction(programme: ProgrammeNiveauResume, action: ActionProgrammeSensible): void {
  if (contexteEcoleCourant.idUtilisateur === null) {
    messagePage.value = 'Utilisateur non configuré : impossible d’exécuter cette action.';
    return;
  }

  programmeSelectionne.value = programme;
  actionSelectionnee.value = action;
  messageAction.value = null;
  confirmationActionVisible.value = true;
}

function fermerAction(): void {
  confirmationActionVisible.value = false;
  programmeSelectionne.value = null;
  actionSelectionnee.value = null;
  messageAction.value = null;
}

function obtenirTitreAction(): string {
  return actionSelectionnee.value === 'archiver'
    ? 'Archiver le programme niveau ?'
    : 'Valider le programme niveau ?';
}

function obtenirMessageAction(): string {
  return actionSelectionnee.value === 'archiver'
    ? 'Le backend archivera ce programme niveau. Il restera consultable dans l’historique.'
    : 'Le backend validera ce programme niveau pour l’exploitation locale de l’école.';
}

async function confirmerAction(): Promise<void> {
  if (
    programmeSelectionne.value === null
    || actionSelectionnee.value === null
    || contexteEcoleCourant.idUtilisateur === null
  ) {
    fermerAction();
    return;
  }

  actionSensibleEnCours.value = true;
  messageAction.value = null;
  messageSucces.value = null;

  try {
    const options = {
      tenantId: contexteEcoleCourant.tenantId ?? contexteEcoleCourant.idEcole ?? undefined,
      idempotencyKey: creerCleIdempotence(`programme-niveau-${actionSelectionnee.value}`),
    };

    if (actionSelectionnee.value === 'archiver') {
      await programmesNiveauApi.archiver(
        {
          idProgrammeNiveau: programmeSelectionne.value.id,
          archivePar: contexteEcoleCourant.idUtilisateur,
        },
        options,
      );
      messageSucces.value = 'Le programme niveau a été archivé avec succès.';
    } else {
      await programmesNiveauApi.valider(
        {
          idProgrammeNiveau: programmeSelectionne.value.id,
          validePar: contexteEcoleCourant.idUtilisateur,
        },
        options,
      );
      messageSucces.value = 'Le programme niveau a été validé avec succès.';
    }

    fermerAction();
    await chargerProgrammesNiveau();
  } catch {
    messageAction.value =
      'L’action n’a pas pu être terminée. Le backend a conservé les règles métier.';
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

  await chargerProgrammesNiveau();
}

onMounted(() => {
  void chargerProgrammesNiveau();
});
</script>

<template>
  <section class="programmes-page">
    <header class="programmes-hero">
      <div>
        <span class="programmes-hero__eyebrow">Exploitation locale</span>
        <h2>Programmes niveau</h2>
        <p>Suivi des programmes utilisés par classe pour l’année active {{ obtenirLibelleAnneeActive() }}.</p>
      </div>

      <div class="programmes-hero__actions">
        <button
          class="bouton bouton--principal"
          type="button"
          :disabled="!initialisationPossible"
          @click="ouvrirInitialisation"
        >
          <Sparkles :size="18" />
          Initialiser
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
          <strong>{{ totalProgrammes }} suivis</strong>
          <p>Alignement entre classes académiques, cours et pondérations.</p>
        </div>
      </article>

      <article class="indicateur">
        <div class="indicateur__icone indicateur__icone--vert">
          <CheckCircle2 :size="22" />
        </div>
        <div>
          <span>Validés</span>
          <strong>{{ totalValides }}</strong>
          <p>Prêts pour l’exploitation scolaire</p>
        </div>
      </article>

      <article class="indicateur">
        <div class="indicateur__icone indicateur__icone--orange">
          <Clock3 :size="22" />
        </div>
        <div>
          <span>Brouillons</span>
          <strong>{{ totalBrouillons }}</strong>
          <p>Contrôle pédagogique requis</p>
        </div>
      </article>

      <article class="indicateur">
        <div class="indicateur__icone indicateur__icone--bleu">
          <Layers3 :size="22" />
        </div>
        <div>
          <span>Lignes actives</span>
          <strong>{{ totalLignesActives }}</strong>
          <p>{{ totalArchives }} programme(s) archivé(s)</p>
        </div>
      </article>
    </section>

    <section class="barre-outils" aria-label="Filtres des programmes niveau">
      <label class="champ-recherche">
        <Search :size="18" />
        <input v-model="recherche" type="search" placeholder="Rechercher une classe ou un statut..." />
      </label>

      <div class="badge-securite">
        <ShieldCheck :size="18" />
        Année active uniquement
      </div>
    </section>

    <p v-if="messageSucces !== null" class="message-page message-page--succes">
      <CheckCircle2 :size="18" />
      {{ messageSucces }}
    </p>
    <p v-if="messageAvertissement !== null" class="message-page message-page--avertissement">
      <AlertTriangle :size="18" />
      {{ messageAvertissement }}
    </p>
    <p v-if="messagePage !== null" class="message-page message-page--erreur">
      <AlertTriangle :size="18" />
      {{ messagePage }}
    </p>

    <section class="carte-tableau carte-tableau--large">
      <div class="carte-tableau__entete">
        <div>
          <span>Pilotage</span>
          <h3>Programmes par classe</h3>
        </div>
        <FileCheck2 :size="22" />
      </div>

      <div class="tableau-programmes tableau-programmes--principal">
        <div class="tableau-programmes__ligne tableau-programmes__ligne--entete">
          <span>Classe</span>
          <span>Cycle</span>
          <span>Lignes</span>
          <span>Pondération</span>
          <span>Statut</span>
          <span>Version</span>
          <span>Actions</span>
        </div>

        <div v-if="chargement" class="tableau-programmes__ligne tableau-programmes__ligne--etat">
          <span>Chargement des programmes niveau...</span>
        </div>
        <div
          v-else-if="programmesFiltres.length === 0"
          class="tableau-programmes__ligne tableau-programmes__ligne--etat"
        >
          <span>Aucun programme niveau initialisé pour cette année active.</span>
        </div>

        <div
          v-for="programme in programmesFiltres"
          :key="programme.id"
          class="tableau-programmes__ligne"
        >
          <div>
            <strong>{{ obtenirLibelleClasse(programme) }}</strong>
            <small>{{ obtenirCodeClasse(programme) }} · {{ programme.idVersionReferentielProgramme }}</small>
          </div>
          <span>{{ obtenirClasseAcademique(programme.idClasseAcademique)?.cycle ?? '-' }}</span>
          <span>{{ programme.lignes.length }}</span>
          <span>{{ calculerTotalPonderation(programme) }}</span>
          <span>
            <span class="badge" :class="obtenirClasseStatut(programme.statut)">
              {{ obtenirLibelleStatut(programme.statut) }}
            </span>
          </span>
          <span>{{ programme.version }}</span>
          <div class="actions-programme">
            <button class="bouton-icone" type="button" aria-label="Consulter le programme" @click="afficherDetail(programme)">
              <Eye :size="16" />
            </button>
            <button
              class="bouton-mini"
              type="button"
              :disabled="programme.statut !== 'BROUILLON'"
              @click="demanderAction(programme, 'valider')"
            >
              Valider
            </button>
            <button
              class="bouton-mini"
              type="button"
              :disabled="programme.statut === 'ARCHIVE'"
              @click="demanderAction(programme, 'archiver')"
            >
              Archiver
            </button>
          </div>
        </div>
      </div>

      <footer class="pagination-programmes">
        <span>{{ plagePagination }}</span>
        <div>
          <button
            class="bouton"
            type="button"
            :disabled="!pagePrecedenteDisponible || chargement"
            @click="changerPage(pagination.page - 1)"
          >
            Précédent
          </button>
          <strong>Page {{ pagination.page }} / {{ pagination.totalPages || 1 }}</strong>
          <button
            class="bouton"
            type="button"
            :disabled="!pageSuivanteDisponible || chargement"
            @click="changerPage(pagination.page + 1)"
          >
            Suivant
          </button>
        </div>
      </footer>
    </section>

    <div
      v-if="formulaireInitialisationVisible"
      class="dialogue-programme"
      role="dialog"
      aria-modal="true"
      aria-labelledby="titre-initialisation-programme"
    >
      <article class="dialogue-programme__carte">
        <div>
          <h3 id="titre-initialisation-programme">Initialiser un programme niveau</h3>
          <p>Le backend copiera les lignes de la version officielle publiée vers le programme local de l’école.</p>
        </div>
        <p v-if="messageFormulaire !== null" class="message-page message-page--erreur">
          <AlertTriangle :size="18" />
          {{ messageFormulaire }}
        </p>
        <label class="champ-formulaire">
          <span>Classe académique</span>
          <select v-model="idClasseAInitialiser">
            <option
              v-for="classeAcademique in classesAcademiques"
              :key="classeAcademique.id"
              :value="classeAcademique.id"
            >
              {{ classeAcademique.code }} - {{ classeAcademique.libelle }}
            </option>
          </select>
        </label>
        <div class="dialogue-programme__actions">
          <button class="bouton" type="button" @click="fermerInitialisation">
            Annuler
          </button>
          <button
            class="bouton bouton--principal"
            type="button"
            :disabled="initialisationEnCours"
            @click="confirmerInitialisation"
          >
            Confirmer
          </button>
        </div>
      </article>
    </div>

    <div
      v-if="detailVisible && programmeSelectionne !== null"
      class="dialogue-programme"
      role="dialog"
      aria-modal="true"
      aria-labelledby="titre-detail-programme"
    >
      <article class="dialogue-programme__carte dialogue-programme__carte--large">
        <div>
          <h3 id="titre-detail-programme">{{ obtenirLibelleClasse(programmeSelectionne) }}</h3>
          <p>Détail des lignes locales du programme niveau.</p>
        </div>
        <div v-if="etatLocalProgramme !== null" class="resume-etat-local">
          <div>
            <span>Lignes actives</span>
            <strong>{{ etatLocalProgramme.nombreLignesActivesDansEcole }}</strong>
          </div>
          <div>
            <span>Non calculables</span>
            <strong>{{ etatLocalProgramme.nombreLignesNonCalculables }}</strong>
          </div>
          <div>
            <span>Obsolètes</span>
            <strong>{{ etatLocalProgramme.nombreLignesObsoletes }}</strong>
          </div>
        </div>
        <div class="tableau-programmes tableau-programmes--lignes">
          <div class="tableau-programmes__ligne tableau-programmes__ligne--entete">
            <span>Ordre</span>
            <span>Cours</span>
            <span>Total</span>
            <span>Calculable</span>
            <span>Statut</span>
          </div>
          <div
            v-for="ligne in lignesDetail"
            :key="ligne.id"
            class="tableau-programmes__ligne"
          >
            <strong>{{ ligne.ordreAffichage }}</strong>
            <span>{{ obtenirLibelleCours(ligne.idReferentielCours) }}</span>
            <span>{{ calculerTotalPonderationLigne(ligne) }}</span>
            <span>{{ ligne.estCalculable ? 'Oui' : 'Non' }}</span>
            <span>
              <span class="badge" :class="ligne.obsolete ? 'badge--gris' : ligne.estActifDansEcole ? 'badge--vert' : 'badge--orange'">
                {{ ligne.obsolete ? 'Obsolète' : ligne.estActifDansEcole ? 'Actif' : 'Inactif' }}
              </span>
            </span>
          </div>
        </div>
        <div class="dialogue-programme__actions">
          <button class="bouton bouton--principal" type="button" @click="fermerDetail">
            Fermer
          </button>
        </div>
      </article>
    </div>

    <div
      v-if="confirmationActionVisible"
      class="dialogue-programme"
      role="dialog"
      aria-modal="true"
      aria-labelledby="titre-action-programme"
    >
      <article class="dialogue-programme__carte">
        <div>
          <h3 id="titre-action-programme">{{ obtenirTitreAction() }}</h3>
          <p>{{ obtenirMessageAction() }}</p>
        </div>
        <p v-if="messageAction !== null" class="message-page message-page--erreur">
          <AlertTriangle :size="18" />
          {{ messageAction }}
        </p>
        <div class="dialogue-programme__actions">
          <button class="bouton" type="button" @click="fermerAction">
            Annuler
          </button>
          <button
            class="bouton bouton--principal"
            type="button"
            :disabled="actionSensibleEnCours"
            @click="confirmerAction"
          >
            Confirmer
          </button>
        </div>
      </article>
    </div>
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
.carte-tableau {
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
.champ-formulaire span {
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

.programmes-hero p,
.indicateur p {
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
.bouton-mini {
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

.bouton:disabled,
.bouton-mini:disabled {
  cursor: not-allowed;
  opacity: 0.62;
}

.bouton--principal {
  border-color: var(--couleur-principale);
  background: var(--couleur-principale);
  color: #ffffff;
  box-shadow: 0 10px 18px rgba(45, 95, 159, 0.2);
}

.bouton-mini {
  min-height: 2.1rem;
  padding: 0 0.65rem;
  font-size: 0.78rem;
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

.message-page--avertissement {
  border: 1px solid rgba(229, 163, 36, 0.28);
  background: rgba(229, 163, 36, 0.12);
  color: #8a5a00;
}

.message-page--erreur {
  border: 1px solid rgba(217, 83, 79, 0.24);
  background: rgba(217, 83, 79, 0.09);
  color: #9f1d16;
}

.carte-tableau {
  overflow: hidden;
  border-radius: 1rem;
}

.carte-tableau__entete {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem;
  border-bottom: 1px solid var(--couleur-bordure);
  background: linear-gradient(180deg, #fbfcfe 0%, #f3f6fa 100%);
}

.carte-tableau__entete h3 {
  margin: 0.35rem 0 0;
  color: var(--couleur-encre);
  font-size: 1.05rem;
}

.carte-tableau__entete svg {
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

.tableau-programmes__ligne--etat {
  grid-template-columns: 1fr !important;
  color: var(--couleur-texte-douce);
  font-weight: 800;
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
  grid-template-columns: 1.55fr 0.8fr 0.55fr 0.75fr 0.85fr 0.55fr 1.35fr;
}

.tableau-programmes--lignes .tableau-programmes__ligne {
  min-width: 760px;
  grid-template-columns: 0.55fr 1.65fr 0.7fr 0.8fr 0.85fr;
}

.actions-programme {
  display: flex;
  flex-wrap: wrap;
  gap: 0.4rem;
  align-items: center;
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

.pagination-programmes {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.9rem 1rem;
  border-top: 1px solid var(--couleur-bordure);
  background: #fbfcfe;
  color: var(--couleur-texte-douce);
  font-weight: 800;
}

.pagination-programmes div {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.pagination-programmes strong {
  color: var(--couleur-encre);
}

.dialogue-programme {
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

.dialogue-programme__carte {
  display: grid;
  width: min(100%, 34rem);
  max-height: calc(100dvh - clamp(3.25rem, 10vh, 6.5rem));
  gap: 1rem;
  overflow-y: auto;
  padding: 1.2rem;
  border: 1px solid var(--couleur-bordure);
  border-radius: 0.9rem;
  background: #ffffff;
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.24);
}

.dialogue-programme__carte--large {
  width: min(100%, 58rem);
}

.dialogue-programme h3 {
  margin: 0 0 0.35rem;
  color: var(--couleur-encre);
}

.dialogue-programme p {
  margin: 0;
  color: var(--couleur-texte-douce);
  line-height: 1.55;
}

.resume-etat-local {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.65rem;
}

.resume-etat-local div {
  display: grid;
  gap: 0.25rem;
  padding: 0.8rem;
  border: 1px solid #dfe7f2;
  border-radius: 0.7rem;
  background: #f8fbff;
}

.resume-etat-local span {
  color: var(--couleur-texte-douce);
  font-size: 0.72rem;
  font-weight: 900;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.resume-etat-local strong {
  color: var(--couleur-encre);
  font-size: 1.25rem;
}

.dialogue-programme__actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.6rem;
}

.champ-formulaire {
  display: grid;
  gap: 0.4rem;
}

.champ-formulaire select {
  min-height: 2.7rem;
  border: 1px solid var(--couleur-bordure);
  border-radius: 0.45rem;
  padding: 0 0.75rem;
  color: var(--couleur-encre);
  font: inherit;
}

.champ-formulaire select:focus {
  border-color: #7c9fd6;
  outline: 2px solid rgba(124, 159, 214, 0.22);
}

@media (max-width: 1180px) {
  .indicateurs {
    grid-template-columns: 1fr 1fr;
  }
}

@media (max-width: 760px) {
  .programmes-hero,
  .barre-outils,
  .pagination-programmes,
  .pagination-programmes div,
  .dialogue-programme__actions {
    align-items: stretch;
    flex-direction: column;
  }

  .programmes-hero__actions,
  .bouton {
    width: 100%;
  }

  .indicateurs {
    grid-template-columns: 1fr;
  }

  .resume-etat-local {
    grid-template-columns: 1fr;
  }

  .badge-securite {
    justify-content: center;
    white-space: normal;
  }
}
</style>
