<script setup lang="ts">
import { computed, onMounted, ref } from 'vue';
import {
  AlertTriangle,
  Archive,
  Calendar,
  CheckCircle,
  Eye,
  MoreHorizontal,
  Pencil,
  Plus,
  RefreshCw,
  Zap,
} from 'lucide-vue-next';
import type {
  AnneeScolaireResume,
  PaginationAnneesScolaires,
  StatutAnneeScolaire,
} from '../../../commun/types/annees-scolaires.types';
import { anneesScolairesApi } from '../../services/annees-scolaires.api';
import {
  contexteEcoleCourant,
  contexteEcoleEstConfigure,
} from '../../stores/contexte-ecole.store';

type ActionAnneeSensible = 'activer' | 'cloturer' | 'archiver';

interface FormulaireCreationAnnee {
  code: string;
  libelle: string;
  dateDebut: string;
  dateFin: string;
}

type ModeFormulaireAnnee = 'creation' | 'modification';

const anneesScolaires = ref<AnneeScolaireResume[]>([]);
const anneeActive = ref<AnneeScolaireResume | null>(null);
const pagination = ref<PaginationAnneesScolaires>({
  total: 0,
  page: 1,
  taillePage: 20,
  totalPages: 0,
});
const chargement = ref(false);
const creationEnCours = ref(false);
const garantieEnCours = ref(false);
const preparationEnCours = ref(false);
const basculeEnCours = ref(false);
const actionSensibleEnCours = ref(false);
const consultationDetailEnCours = ref(false);
const confirmationCreationVisible = ref(false);
const confirmationGarantieVisible = ref(false);
const confirmationPreparationVisible = ref(false);
const confirmationBasculeVisible = ref(false);
const actionSensibleSelectionnee = ref<ActionAnneeSensible | null>(null);
const anneeSensibleSelectionnee = ref<AnneeScolaireResume | null>(null);
const anneeModificationSelectionnee = ref<AnneeScolaireResume | null>(null);
const anneeDetail = ref<AnneeScolaireResume | null>(null);
const messageUtilisateur = ref<string | null>(null);
const messageSucces = ref<string | null>(null);
const messageFormulaireAnnee = ref<string | null>(null);
const messageGarantieAnnee = ref<string | null>(null);
const modeFormulaireAnnee = ref<ModeFormulaireAnnee>('creation');
const formulaireCreation = ref<FormulaireCreationAnnee>({
  code: '',
  libelle: '',
  dateDebut: '',
  dateFin: '',
});

const totalAnnees = computed(() => pagination.value.total || anneesScolaires.value.length);
const totalPlanifiees = computed(() =>
  anneesScolaires.value.filter((annee) => annee.statut === 'PLANIFIEE').length,
);
const totalClotureesArchivees = computed(() =>
  anneesScolaires.value.filter((annee) =>
    annee.statut === 'CLOTUREE' || annee.statut === 'ARCHIVEE'
  ).length,
);

const libelleAnneeActive = computed(() => anneeActive.value?.code ?? anneeActive.value?.libelle ?? 'À charger');

const creationPossible = computed(() =>
  contexteEcoleEstConfigure()
  && contexteEcoleCourant.idEcole !== null
  && contexteEcoleCourant.idUtilisateur !== null
  && !chargement.value
  && !creationEnCours.value
);

const garantiePossible = computed(() =>
  contexteEcoleEstConfigure()
  && contexteEcoleCourant.idEcole !== null
  && contexteEcoleCourant.idUtilisateur !== null
  && !chargement.value
  && !garantieEnCours.value
);

const preparationPossible = computed(() =>
  contexteEcoleEstConfigure()
  && contexteEcoleCourant.idEcole !== null
  && contexteEcoleCourant.idUtilisateur !== null
  && !chargement.value
  && !preparationEnCours.value
);

const basculePossible = computed(() =>
  contexteEcoleEstConfigure()
  && contexteEcoleCourant.idEcole !== null
  && contexteEcoleCourant.idUtilisateur !== null
  && anneeActive.value !== null
  && !chargement.value
  && !basculeEnCours.value
);

const contexteOperationnel = computed(() =>
  contexteEcoleEstConfigure()
  && contexteEcoleCourant.idEcole !== null
  && contexteEcoleCourant.idUtilisateur !== null,
);

const statutConnexionBackend = computed(() => {
  if (!contexteEcoleEstConfigure()) {
    return 'Contexte école manquant';
  }

  if (contexteEcoleCourant.idUtilisateur === null) {
    return 'Utilisateur non configuré';
  }

  return 'Connecté';
});

const pagePrecedenteDisponible = computed(() => pagination.value.page > 1);
const pageSuivanteDisponible = computed(() =>
  pagination.value.totalPages > pagination.value.page,
);

const titreFormulaireAnnee = computed(() =>
  modeFormulaireAnnee.value === 'modification'
    ? "Modifier l’année scolaire"
    : "Créer une année scolaire manuellement",
);

const descriptionFormulaireAnnee = computed(() =>
  modeFormulaireAnnee.value === 'modification'
    ? "La modification est limitée aux années planifiées et respecte les règles métier backend."
    : "Cette action utilise le cas d’usage backend de création. Pour une école neuve, le bouton recommandé reste “Garantir année active”.",
);

const plagePagination = computed(() => {
  if (pagination.value.total === 0) {
    return '0 année';
  }

  const debut = (pagination.value.page - 1) * pagination.value.taillePage + 1;
  const fin = Math.min(
    pagination.value.page * pagination.value.taillePage,
    pagination.value.total,
  );

  return `${debut}-${fin} sur ${pagination.value.total}`;
});

function obtenirLibelleStatut(statut: StatutAnneeScolaire): string {
  const libelles: Record<StatutAnneeScolaire, string> = {
    ACTIVE: 'Active',
    PLANIFIEE: 'Planifiée',
    CLOTUREE: 'Clôturée',
    ARCHIVEE: 'Archivée',
  };

  return libelles[statut];
}

function formaterDate(dateIso?: string): string {
  if (dateIso === undefined || dateIso.trim().length === 0) {
    return 'Non renseignée';
  }

  const date = new Date(dateIso);

  if (Number.isNaN(date.getTime())) {
    return dateIso;
  }

  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  }).format(date);
}

function obtenirDateActivation(annee: AnneeScolaireResume): string {
  return annee.dateActivation === undefined
    ? 'Non activée'
    : formaterDate(annee.dateActivation);
}

function obtenirLibelleAlerteContexte(): string | null {
  if (!contexteEcoleEstConfigure()) {
    return "Contexte école non configuré : ajoute VITE_REFERENTIEL_ECOLE_ID pour charger les années réelles.";
  }

  if (messageUtilisateur.value !== null) {
    return messageUtilisateur.value;
  }

  return null;
}

async function chargerAnneesScolaires(): Promise<void> {
  if (!contexteEcoleEstConfigure() || contexteEcoleCourant.idEcole === null) {
    messageUtilisateur.value = obtenirLibelleAlerteContexte();
    return;
  }

  chargement.value = true;
  messageUtilisateur.value = null;

  try {
    const options = { tenantId: contexteEcoleCourant.tenantId ?? contexteEcoleCourant.idEcole };
    const [reponseListe, reponseActive] = await Promise.all([
      anneesScolairesApi.lister(
        {
          idEcole: contexteEcoleCourant.idEcole,
          page: pagination.value.page,
          taillePage: pagination.value.taillePage,
        },
        options,
      ),
      anneesScolairesApi.consulterActive(
        { idEcole: contexteEcoleCourant.idEcole },
        options,
      ),
    ]);

    anneesScolaires.value = reponseListe.donnees;
    pagination.value = reponseListe.pagination;
    anneeActive.value = reponseActive.donnee;
  } catch {
    messageUtilisateur.value =
      "Les années scolaires n'ont pas pu être chargées. Vérifie que le backend est démarré et que le contexte école est correct.";
  } finally {
    chargement.value = false;
  }
}

function creerCleIdempotence(operation: string): string {
  const composantAleatoire = crypto.randomUUID?.() ?? `${Date.now()}-${Math.random()}`;

  return `${operation}-${composantAleatoire}`;
}

function formaterDatePourChamp(date: Date): string {
  return date.toISOString().slice(0, 10);
}

function obtenirAnneeDebutProposee(): number {
  const datesExistantes = anneesScolaires.value
    .map((annee) => new Date(annee.dateDebut).getTime())
    .filter((date) => !Number.isNaN(date));

  if (datesExistantes.length > 0) {
    const dateMaximale = new Date(Math.max(...datesExistantes));

    return dateMaximale.getUTCFullYear() + 1;
  }

  const aujourdHui = new Date();
  const moisJuillet = 6;

  return aujourdHui.getMonth() >= moisJuillet
    ? aujourdHui.getFullYear()
    : aujourdHui.getFullYear() - 1;
}

function proposerFormulaireCreation(): FormulaireCreationAnnee {
  const anneeDebut = obtenirAnneeDebutProposee();
  const code = `${anneeDebut}-${anneeDebut + 1}`;

  return {
    code,
    libelle: `Année scolaire ${code}`,
    dateDebut: formaterDatePourChamp(new Date(Date.UTC(anneeDebut, 6, 1))),
    dateFin: formaterDatePourChamp(new Date(Date.UTC(anneeDebut + 1, 5, 30))),
  };
}

function demanderCreationAnnee(): void {
  if (!contexteEcoleEstConfigure() || contexteEcoleCourant.idEcole === null) {
    messageUtilisateur.value =
      "Contexte école non configuré : la création manuelle est impossible.";
    return;
  }

  if (contexteEcoleCourant.idUtilisateur === null) {
    messageUtilisateur.value =
      "Utilisateur non configuré : ajoute VITE_REFERENTIEL_UTILISATEUR_ID pour créer une année.";
    return;
  }

  formulaireCreation.value = proposerFormulaireCreation();
  anneeModificationSelectionnee.value = null;
  modeFormulaireAnnee.value = 'creation';
  messageFormulaireAnnee.value = null;
  messageUtilisateur.value = null;
  confirmationCreationVisible.value = true;
}

function annulerCreationAnnee(): void {
  confirmationCreationVisible.value = false;
  anneeModificationSelectionnee.value = null;
  modeFormulaireAnnee.value = 'creation';
  messageFormulaireAnnee.value = null;
}

function validerFormulaireCreation(): string | null {
  if (formulaireCreation.value.code.trim().length === 0) {
    return "Le code de l’année scolaire est obligatoire.";
  }

  if (formulaireCreation.value.libelle.trim().length === 0) {
    return "Le libellé de l’année scolaire est obligatoire.";
  }

  if (formulaireCreation.value.dateDebut.trim().length === 0) {
    return "La date de début est obligatoire.";
  }

  if (formulaireCreation.value.dateFin.trim().length === 0) {
    return "La date de fin est obligatoire.";
  }

  return null;
}

async function confirmerCreationAnnee(): Promise<void> {
  if (!creationPossible.value || contexteEcoleCourant.idEcole === null || contexteEcoleCourant.idUtilisateur === null) {
    demanderCreationAnnee();
    return;
  }

  const erreurValidation = validerFormulaireCreation();

  if (erreurValidation !== null) {
    messageFormulaireAnnee.value = erreurValidation;
    return;
  }

  creationEnCours.value = true;
  messageUtilisateur.value = null;
  messageFormulaireAnnee.value = null;
  messageSucces.value = null;

  try {
    const options = {
      tenantId: contexteEcoleCourant.tenantId ?? contexteEcoleCourant.idEcole,
      idempotencyKey: creerCleIdempotence('creer-annee-scolaire'),
    };

    if (modeFormulaireAnnee.value === 'modification' && anneeModificationSelectionnee.value !== null) {
      await anneesScolairesApi.modifier(
        {
          idAnneeScolaire: anneeModificationSelectionnee.value.id,
          code: formulaireCreation.value.code.trim(),
          libelle: formulaireCreation.value.libelle.trim(),
          dateDebut: formulaireCreation.value.dateDebut,
          dateFin: formulaireCreation.value.dateFin,
          modifiePar: contexteEcoleCourant.idUtilisateur,
        },
        { tenantId: options.tenantId },
      );
      messageSucces.value = "L’année scolaire a été modifiée avec succès.";
    } else {
      await anneesScolairesApi.creer(
        {
          idEcole: contexteEcoleCourant.idEcole,
          code: formulaireCreation.value.code.trim(),
          libelle: formulaireCreation.value.libelle.trim(),
          dateDebut: formulaireCreation.value.dateDebut,
          dateFin: formulaireCreation.value.dateFin,
          creePar: contexteEcoleCourant.idUtilisateur,
        },
        options,
      );
      messageSucces.value = "L’année scolaire a été créée avec succès.";
    }

    confirmationCreationVisible.value = false;
    anneeModificationSelectionnee.value = null;
    modeFormulaireAnnee.value = 'creation';

    await chargerAnneesScolaires();
  } catch {
    messageFormulaireAnnee.value =
      "L’année scolaire n’a pas pu être enregistrée. Vérifie le code, les dates et l’état de l’année, puis réessaie.";
  } finally {
    creationEnCours.value = false;
  }
}

function obtenirMessageGarantie(action: string): string {
  if (action === 'CREEE_ET_ACTIVEE') {
    return "L’année scolaire courante a été créée et activée automatiquement.";
  }

  if (action === 'PLANIFIEE_ACTIVEE') {
    return "L’année scolaire planifiée a été activée automatiquement.";
  }

  return "Une année active existe déjà. La page a été actualisée.";
}

function demanderGarantieAnneeActive(): void {
  if (!contexteEcoleEstConfigure() || contexteEcoleCourant.idEcole === null) {
    messageGarantieAnnee.value =
      "Contexte école non configuré : l’initialisation de l’année active est impossible.";
    confirmationGarantieVisible.value = true;
    return;
  }

  if (contexteEcoleCourant.idUtilisateur === null) {
    messageGarantieAnnee.value =
      "Utilisateur non configuré : ajoute VITE_REFERENTIEL_UTILISATEUR_ID pour garantir l’année active.";
    confirmationGarantieVisible.value = true;
    return;
  }

  messageGarantieAnnee.value = null;
  messageUtilisateur.value = null;
  confirmationGarantieVisible.value = true;
}

function annulerGarantieAnneeActive(): void {
  confirmationGarantieVisible.value = false;
  messageGarantieAnnee.value = null;
}

async function confirmerGarantieAnneeActive(): Promise<void> {
  if (!garantiePossible.value || contexteEcoleCourant.idEcole === null || contexteEcoleCourant.idUtilisateur === null) {
    demanderGarantieAnneeActive();
    return;
  }

  garantieEnCours.value = true;
  messageUtilisateur.value = null;
  messageGarantieAnnee.value = null;
  messageSucces.value = null;

  try {
    const reponse = await anneesScolairesApi.garantirActive(
      {
        idEcole: contexteEcoleCourant.idEcole,
        modifiePar: contexteEcoleCourant.idUtilisateur,
      },
      {
        tenantId: contexteEcoleCourant.tenantId ?? contexteEcoleCourant.idEcole,
        idempotencyKey: creerCleIdempotence('garantir-annee-active'),
      },
    );

    confirmationGarantieVisible.value = false;
    messageSucces.value = obtenirMessageGarantie(reponse.meta.action);

    await chargerAnneesScolaires();
  } catch {
    messageGarantieAnnee.value =
      "L’année active n’a pas pu être garantie. Vérifie que le backend est démarré et que le contexte école est correct.";
  } finally {
    garantieEnCours.value = false;
  }
}

function demanderPreparationSuivante(): void {
  if (!contexteEcoleEstConfigure() || contexteEcoleCourant.idEcole === null) {
    messageUtilisateur.value =
      "Contexte école non configuré : la préparation de l’année suivante est impossible.";
    return;
  }

  if (contexteEcoleCourant.idUtilisateur === null) {
    messageUtilisateur.value =
      "Utilisateur non configuré : ajoute VITE_REFERENTIEL_UTILISATEUR_ID pour préparer l’année suivante.";
    return;
  }

  if (anneeActive.value === null) {
    messageUtilisateur.value =
      "Garantis d’abord une année active avant de préparer l’année suivante.";
    return;
  }

  confirmationPreparationVisible.value = true;
}

function annulerPreparationSuivante(): void {
  confirmationPreparationVisible.value = false;
}

async function confirmerPreparationSuivante(): Promise<void> {
  if (!preparationPossible.value || contexteEcoleCourant.idEcole === null || contexteEcoleCourant.idUtilisateur === null) {
    demanderPreparationSuivante();
    return;
  }

  preparationEnCours.value = true;
  messageUtilisateur.value = null;
  messageSucces.value = null;

  try {
    const reponse = await anneesScolairesApi.preparerSuivante(
      {
        idEcole: contexteEcoleCourant.idEcole,
        creePar: contexteEcoleCourant.idUtilisateur,
      },
      {
        tenantId: contexteEcoleCourant.tenantId ?? contexteEcoleCourant.idEcole,
        idempotencyKey: creerCleIdempotence('preparer-annee-suivante'),
      },
    );

    confirmationPreparationVisible.value = false;
    messageSucces.value = reponse.meta.dejaExistante
      ? "L’année suivante était déjà préparée. La liste a été actualisée."
      : "L’année suivante a été préparée avec succès.";

    await chargerAnneesScolaires();
  } catch {
    messageUtilisateur.value =
      "La préparation de l’année suivante n’a pas pu être terminée. Aucune donnée locale n’a été modifiée côté interface.";
  } finally {
    preparationEnCours.value = false;
  }
}

function demanderBasculeAnneeScolaire(): void {
  if (!contexteEcoleEstConfigure() || contexteEcoleCourant.idEcole === null) {
    messageUtilisateur.value =
      "Contexte école non configuré : la bascule annuelle est impossible.";
    return;
  }

  if (contexteEcoleCourant.idUtilisateur === null) {
    messageUtilisateur.value =
      "Utilisateur non configuré : ajoute VITE_REFERENTIEL_UTILISATEUR_ID pour basculer l’année.";
    return;
  }

  if (anneeActive.value === null) {
    messageUtilisateur.value =
      "Aucune année active n’est disponible pour lancer la bascule annuelle.";
    return;
  }

  confirmationBasculeVisible.value = true;
}

function annulerBasculeAnneeScolaire(): void {
  confirmationBasculeVisible.value = false;
}

async function confirmerBasculeAnneeScolaire(): Promise<void> {
  if (!basculePossible.value || contexteEcoleCourant.idEcole === null || contexteEcoleCourant.idUtilisateur === null) {
    demanderBasculeAnneeScolaire();
    return;
  }

  basculeEnCours.value = true;
  messageUtilisateur.value = null;
  messageSucces.value = null;

  try {
    const reponse = await anneesScolairesApi.basculer(
      {
        idEcole: contexteEcoleCourant.idEcole,
        modifiePar: contexteEcoleCourant.idUtilisateur,
        creerSuivanteSiAbsente: true,
      },
      {
        tenantId: contexteEcoleCourant.tenantId ?? contexteEcoleCourant.idEcole,
        idempotencyKey: creerCleIdempotence('basculer-annee-scolaire'),
      },
    );

    confirmationBasculeVisible.value = false;
    messageSucces.value = reponse.meta.anneeSuivanteCreee
      ? "L’année active a été clôturée et la suivante a été créée puis activée."
      : "L’année active a été clôturée et l’année suivante a été activée.";

    await chargerAnneesScolaires();
  } catch {
    messageUtilisateur.value =
      "La bascule annuelle n’a pas pu être terminée. Aucune action locale n’a été forcée côté interface.";
  } finally {
    basculeEnCours.value = false;
  }
}

function obtenirTitreActionSensible(): string {
  if (actionSensibleSelectionnee.value === 'activer') {
    return "Activer l’année scolaire ?";
  }

  if (actionSensibleSelectionnee.value === 'archiver') {
    return "Archiver l’année scolaire ?";
  }

  return "Clôturer l’année scolaire ?";
}

function obtenirMessageActionSensible(): string {
  if (actionSensibleSelectionnee.value === 'activer') {
    return "Le backend activera l’année planifiée sélectionnée en respectant la règle d’une seule année active par école.";
  }

  if (actionSensibleSelectionnee.value === 'archiver') {
    return "Le backend archivera l’année clôturée sélectionnée. Elle restera consultable dans l’historique.";
  }

  return "Le backend clôturera l’année active sélectionnée. Cette action doit rester volontaire et confirmée.";
}

function demanderActionSensible(
  annee: AnneeScolaireResume,
  action: ActionAnneeSensible,
): void {
  if (contexteEcoleCourant.idUtilisateur === null) {
    messageUtilisateur.value =
      "Utilisateur non configuré : ajoute VITE_REFERENTIEL_UTILISATEUR_ID pour exécuter cette action.";
    return;
  }

  anneeSensibleSelectionnee.value = annee;
  actionSensibleSelectionnee.value = action;
}

function annulerActionSensible(): void {
  anneeSensibleSelectionnee.value = null;
  actionSensibleSelectionnee.value = null;
}

function fermerDetailAnnee(): void {
  anneeDetail.value = null;
}

async function afficherDetailAnnee(annee: AnneeScolaireResume): Promise<void> {
  consultationDetailEnCours.value = true;
  messageUtilisateur.value = null;
  messageSucces.value = null;

  try {
    const reponse = await anneesScolairesApi.consulter(
      { idAnneeScolaire: annee.id },
      {
        tenantId: contexteEcoleCourant.tenantId ?? contexteEcoleCourant.idEcole ?? undefined,
      },
    );

    anneeDetail.value = reponse.donnee;
  } catch {
    messageUtilisateur.value =
      "Le détail de l’année scolaire n’a pas pu être chargé.";
  } finally {
    consultationDetailEnCours.value = false;
  }
}

function demanderModificationAnnee(annee: AnneeScolaireResume): void {
  if (contexteEcoleCourant.idUtilisateur === null) {
    messageUtilisateur.value =
      "Utilisateur non configuré : ajoute VITE_REFERENTIEL_UTILISATEUR_ID pour modifier une année.";
    return;
  }

  if (annee.statut !== 'PLANIFIEE') {
    messageUtilisateur.value =
      "Seule une année planifiée peut être modifiée.";
    return;
  }

  anneeModificationSelectionnee.value = annee;
  modeFormulaireAnnee.value = 'modification';
  messageFormulaireAnnee.value = null;
  messageUtilisateur.value = null;
  formulaireCreation.value = {
    code: annee.code,
    libelle: annee.libelle,
    dateDebut: annee.dateDebut.slice(0, 10),
    dateFin: annee.dateFin.slice(0, 10),
  };
  confirmationCreationVisible.value = true;
}

async function confirmerActionSensible(): Promise<void> {
  if (
    anneeSensibleSelectionnee.value === null
    || actionSensibleSelectionnee.value === null
    || contexteEcoleCourant.idUtilisateur === null
  ) {
    annulerActionSensible();
    return;
  }

  actionSensibleEnCours.value = true;
  messageUtilisateur.value = null;
  messageSucces.value = null;

  try {
    const parametres = {
      idAnneeScolaire: anneeSensibleSelectionnee.value.id,
      modifiePar: contexteEcoleCourant.idUtilisateur,
    };
    const options = {
      tenantId: contexteEcoleCourant.tenantId ?? contexteEcoleCourant.idEcole ?? undefined,
    };

    if (actionSensibleSelectionnee.value === 'activer') {
      await anneesScolairesApi.activer(parametres, options);
      messageSucces.value = "L’année scolaire a été activée avec succès.";
    } else if (actionSensibleSelectionnee.value === 'archiver') {
      await anneesScolairesApi.archiver(parametres, options);
      messageSucces.value = "L’année scolaire a été archivée avec succès.";
    } else {
      await anneesScolairesApi.cloturer(parametres, options);
      messageSucces.value = "L’année scolaire a été clôturée avec succès.";
    }

    annulerActionSensible();
    await chargerAnneesScolaires();
  } catch {
    messageUtilisateur.value =
      "L’action demandée n’a pas pu être terminée. Le backend a conservé les règles métier.";
  } finally {
    actionSensibleEnCours.value = false;
  }
}

async function changerPageAnnees(nouvellePage: number): Promise<void> {
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

  await chargerAnneesScolaires();
}

onMounted(() => {
  void chargerAnneesScolaires();
});
</script>

<template>
  <section class="annees-page">
    <header class="annees-page__header">
      <div class="annees-page__contexte">
        <div>
          <span>Organisation</span>
          <strong>{{ contexteEcoleCourant.nomOrganisation }}</strong>
        </div>
        <div>
          <span>École</span>
          <strong>{{ contexteEcoleCourant.nomEcole }}</strong>
        </div>
        <div>
          <span>Année active</span>
          <strong>{{ libelleAnneeActive }}</strong>
        </div>
      </div>

      <div class="annees-page__actions">
        <button
          class="bouton-annee bouton-annee--principal"
          type="button"
          :disabled="!garantiePossible"
          :title="!contexteOperationnel ? 'Configure VITE_REFERENTIEL_ECOLE_ID et VITE_REFERENTIEL_UTILISATEUR_ID.' : ''"
          @click="demanderGarantieAnneeActive"
        >
          <Plus :size="17" />
          {{ garantieEnCours ? 'Initialisation...' : 'Garantir année active' }}
        </button>
        <button
          class="bouton-annee"
          type="button"
          :disabled="!preparationPossible"
          :title="!contexteOperationnel ? 'Configure VITE_REFERENTIEL_ECOLE_ID et VITE_REFERENTIEL_UTILISATEUR_ID.' : ''"
          @click="demanderPreparationSuivante"
        >
          <RefreshCw :size="17" />
          {{ preparationEnCours ? 'Préparation...' : 'Préparer suivante' }}
        </button>
        <button
          class="bouton-annee bouton-annee--accent"
          type="button"
          :disabled="!basculePossible"
          :title="!contexteOperationnel ? 'Configure VITE_REFERENTIEL_ECOLE_ID et VITE_REFERENTIEL_UTILISATEUR_ID.' : anneeActive === null ? 'Aucune année active disponible pour basculer.' : ''"
          @click="demanderBasculeAnneeScolaire"
        >
          <Zap :size="17" />
          {{ basculeEnCours ? 'Bascule...' : 'Basculer année' }}
        </button>
      </div>
    </header>

    <section class="annees-page__titre">
      <div>
        <h2>Années scolaires</h2>
        <p>Suivi administratif des années scolaires de l’école, connecté en lecture au backend.</p>
      </div>
      <div class="annees-page__titre-actions">
        <span class="badge-info" :data-etat="statutConnexionBackend">{{ statutConnexionBackend }}</span>
        <button
          class="bouton-annee"
          type="button"
          :disabled="!creationPossible"
          :title="!contexteOperationnel ? 'Configure VITE_REFERENTIEL_ECOLE_ID et VITE_REFERENTIEL_UTILISATEUR_ID.' : ''"
          @click="demanderCreationAnnee"
        >
          <Calendar :size="17" />
          {{ creationEnCours ? 'Création...' : 'Créer manuellement' }}
        </button>
      </div>
    </section>

    <section class="annees-page__cartes" aria-label="Résumé des années scolaires">
      <article class="carte-resume carte-resume--bleue">
        <div class="carte-resume__icone"><Calendar :size="24" /></div>
        <div>
          <span>Année active</span>
          <strong>{{ libelleAnneeActive }}</strong>
          <p>{{ anneeActive === null ? 'Aucune année active confirmée.' : 'Ouverte pour l’exploitation locale.' }}</p>
        </div>
      </article>

      <article class="carte-resume">
        <div class="carte-resume__icone carte-resume__icone--neutre"><Calendar :size="24" /></div>
        <div>
          <span>Total années</span>
          <strong>{{ totalAnnees }}</strong>
          <p>Historique et planification.</p>
        </div>
      </article>

      <article class="carte-resume">
        <div class="carte-resume__icone carte-resume__icone--orange"><RefreshCw :size="24" /></div>
        <div>
          <span>Planifiées</span>
          <strong>{{ totalPlanifiees }}</strong>
          <p>Années suivantes préparées.</p>
        </div>
      </article>

      <article class="carte-resume">
        <div class="carte-resume__icone carte-resume__icone--gris"><Archive :size="24" /></div>
        <div>
          <span>Clôturées / archivées</span>
          <strong>{{ totalClotureesArchivees }}</strong>
          <p>Années passées consultables.</p>
        </div>
      </article>
    </section>

    <section class="annees-page__grille">
      <article class="bloc-annees bloc-annees--alertes">
        <div class="bloc-annees__header">
          <h3>Suivi administratif</h3>
          <span class="badge-info">Temps réel</span>
        </div>

        <div class="liste-alertes-annees">
          <p v-if="messageSucces !== null" class="alerte-succes-annee">
            <CheckCircle :size="18" />
            {{ messageSucces }}
          </p>
          <p v-if="obtenirLibelleAlerteContexte() !== null">
            <AlertTriangle :size="18" />
            {{ obtenirLibelleAlerteContexte() }}
          </p>
          <p v-if="!chargement && anneeActive === null">
            <AlertTriangle :size="18" />
            Aucune année active détectée dans le contexte courant.
          </p>
          <p v-if="totalPlanifiees === 0">
            <AlertTriangle :size="18" />
            Année suivante non préparée ou non disponible dans la liste chargée.
          </p>
          <p>
            <AlertTriangle :size="18" />
            Les actions sont confirmées via un dialogue avant tout appel backend.
          </p>
        </div>
      </article>

      <article class="bloc-annees">
        <div class="bloc-annees__header">
          <h3>Liste des années scolaires</h3>
          <span class="badge-info">{{ chargement ? 'Chargement' : 'Backend' }}</span>
        </div>

        <div class="tableau-annees">
          <div class="tableau-annees__ligne tableau-annees__ligne--entete">
            <span>Année scolaire</span>
            <span>Date début</span>
            <span>Date fin</span>
            <span>Statut</span>
            <span>Date activation</span>
            <span>Actions</span>
          </div>

          <div v-if="chargement" class="tableau-annees__ligne tableau-annees__ligne--etat">
            <span>Chargement des années scolaires...</span>
          </div>

          <div
            v-else-if="anneesScolaires.length === 0"
            class="tableau-annees__ligne tableau-annees__ligne--etat"
          >
            <span>Aucune année scolaire retournée pour l’école courante.</span>
          </div>

          <div
            v-for="annee in anneesScolaires"
            :key="annee.id"
            class="tableau-annees__ligne"
          >
            <strong>{{ annee.code || annee.libelle }}</strong>
            <span>{{ formaterDate(annee.dateDebut) }}</span>
            <span>{{ formaterDate(annee.dateFin) }}</span>
            <span class="badge-statut-annee" :data-statut="annee.statut">
              <CheckCircle v-if="annee.statut === 'ACTIVE'" :size="15" />
              <Archive v-else-if="annee.statut === 'CLOTUREE' || annee.statut === 'ARCHIVEE'" :size="15" />
              <RefreshCw v-else :size="15" />
              {{ obtenirLibelleStatut(annee.statut) }}
            </span>
            <span>{{ obtenirDateActivation(annee) }}</span>
            <div class="actions-ligne">
              <button type="button" aria-label="Plus d’actions">
                <MoreHorizontal :size="18" />
              </button>
              <div class="menu-ligne">
                <button type="button" @click="afficherDetailAnnee(annee)">
                  <Eye :size="15" /> Voir
                </button>
                <button
                  type="button"
                  :disabled="annee.statut !== 'PLANIFIEE'"
                  @click="demanderModificationAnnee(annee)"
                >
                  <Pencil :size="15" /> Modifier après confirmation
                </button>
                <button
                  v-if="annee.statut === 'PLANIFIEE'"
                  type="button"
                  @click="demanderActionSensible(annee, 'activer')"
                >
                  <CheckCircle :size="15" /> Activer après confirmation
                </button>
                <button
                  v-if="annee.statut === 'ACTIVE'"
                  type="button"
                  @click="demanderActionSensible(annee, 'cloturer')"
                >
                  <CheckCircle :size="15" /> Clôturer après confirmation
                </button>
                <button
                  v-if="annee.statut === 'CLOTUREE'"
                  type="button"
                  @click="demanderActionSensible(annee, 'archiver')"
                >
                  <Archive :size="15" /> Archiver après confirmation
                </button>
              </div>
            </div>
          </div>

        </div>

        <div class="pagination-annees" aria-label="Pagination des années scolaires">
          <span>{{ plagePagination }}</span>
          <div>
            <button
              class="bouton-annee"
              type="button"
              :disabled="!pagePrecedenteDisponible || chargement"
              @click="changerPageAnnees(pagination.page - 1)"
            >
              Précédent
            </button>
            <strong>Page {{ pagination.page }} / {{ pagination.totalPages || 1 }}</strong>
            <button
              class="bouton-annee"
              type="button"
              :disabled="!pageSuivanteDisponible || chargement"
              @click="changerPageAnnees(pagination.page + 1)"
            >
              Suivant
            </button>
          </div>
        </div>
      </article>
    </section>

    <div
      v-if="confirmationCreationVisible"
      class="dialogue-confirmation"
      role="dialog"
      aria-modal="true"
      aria-labelledby="titre-confirmation-creation"
    >
      <article class="dialogue-confirmation__carte dialogue-confirmation__carte--large">
        <div class="dialogue-confirmation__icone">
          <Calendar :size="24" />
        </div>
        <div>
          <h3 id="titre-confirmation-creation">{{ titreFormulaireAnnee }}</h3>
          <p>
            {{ descriptionFormulaireAnnee }}
          </p>
        </div>
        <p v-if="messageFormulaireAnnee !== null" class="message-formulaire-annee">
          <AlertTriangle :size="18" />
          {{ messageFormulaireAnnee }}
        </p>
        <div class="formulaire-annee">
          <label>
            <span>Code</span>
            <input v-model="formulaireCreation.code" type="text" autocomplete="off" />
          </label>
          <label>
            <span>Libellé</span>
            <input v-model="formulaireCreation.libelle" type="text" autocomplete="off" />
          </label>
          <label>
            <span>Date début</span>
            <input v-model="formulaireCreation.dateDebut" type="date" />
          </label>
          <label>
            <span>Date fin</span>
            <input v-model="formulaireCreation.dateFin" type="date" />
          </label>
        </div>
        <div class="dialogue-confirmation__actions">
          <button class="bouton-annee" type="button" @click="annulerCreationAnnee">
            Annuler
          </button>
          <button
            class="bouton-annee bouton-annee--principal"
            type="button"
            :disabled="creationEnCours"
            @click="confirmerCreationAnnee"
          >
            Confirmer
          </button>
        </div>
      </article>
    </div>

    <div
      v-if="confirmationGarantieVisible"
      class="dialogue-confirmation"
      role="dialog"
      aria-modal="true"
      aria-labelledby="titre-confirmation-garantie"
    >
      <article class="dialogue-confirmation__carte">
        <div class="dialogue-confirmation__icone">
          <Plus :size="24" />
        </div>
        <div>
          <h3 id="titre-confirmation-garantie">Garantir l’année active ?</h3>
          <p>
            Le backend vérifiera l’école courante. Si aucune année n’existe encore,
            il proposera automatiquement l’année scolaire RDC courante puis l’activera.
          </p>
        </div>
        <p v-if="messageGarantieAnnee !== null" class="message-formulaire-annee">
          <AlertTriangle :size="18" />
          {{ messageGarantieAnnee }}
        </p>
        <div class="dialogue-confirmation__actions">
          <button class="bouton-annee" type="button" @click="annulerGarantieAnneeActive">
            Annuler
          </button>
          <button
            class="bouton-annee bouton-annee--principal"
            type="button"
            :disabled="garantieEnCours"
            @click="confirmerGarantieAnneeActive"
          >
            Confirmer
          </button>
        </div>
      </article>
    </div>

    <div
      v-if="confirmationPreparationVisible"
      class="dialogue-confirmation"
      role="dialog"
      aria-modal="true"
      aria-labelledby="titre-confirmation-preparation"
    >
      <article class="dialogue-confirmation__carte">
        <div class="dialogue-confirmation__icone">
          <RefreshCw :size="24" />
        </div>
        <div>
          <h3 id="titre-confirmation-preparation">Préparer l’année suivante ?</h3>
          <p>
            Le backend créera l’année scolaire suivante si elle n’existe pas encore.
            L’opération est protégée par une clé d’idempotence.
          </p>
        </div>
        <div class="dialogue-confirmation__actions">
          <button class="bouton-annee" type="button" @click="annulerPreparationSuivante">
            Annuler
          </button>
          <button
            class="bouton-annee bouton-annee--principal"
            type="button"
            :disabled="preparationEnCours"
            @click="confirmerPreparationSuivante"
          >
            Confirmer
          </button>
        </div>
      </article>
    </div>

    <div
      v-if="confirmationBasculeVisible"
      class="dialogue-confirmation"
      role="dialog"
      aria-modal="true"
      aria-labelledby="titre-confirmation-bascule"
    >
      <article class="dialogue-confirmation__carte">
        <div class="dialogue-confirmation__icone">
          <Zap :size="24" />
        </div>
        <div>
          <h3 id="titre-confirmation-bascule">Basculer l’année scolaire ?</h3>
          <p>
            Le backend clôturera l’année active et activera l’année suivante.
            Si la suivante n’existe pas encore, elle sera créée par le cas d’usage prévu.
          </p>
        </div>
        <div class="dialogue-confirmation__actions">
          <button class="bouton-annee" type="button" @click="annulerBasculeAnneeScolaire">
            Annuler
          </button>
          <button
            class="bouton-annee bouton-annee--accent"
            type="button"
            :disabled="basculeEnCours"
            @click="confirmerBasculeAnneeScolaire"
          >
            Confirmer
          </button>
        </div>
      </article>
    </div>

    <div
      v-if="anneeSensibleSelectionnee !== null && actionSensibleSelectionnee !== null"
      class="dialogue-confirmation"
      role="dialog"
      aria-modal="true"
      aria-labelledby="titre-confirmation-action-sensible"
    >
      <article class="dialogue-confirmation__carte">
        <div class="dialogue-confirmation__icone">
          <AlertTriangle :size="24" />
        </div>
        <div>
          <h3 id="titre-confirmation-action-sensible">
            {{ obtenirTitreActionSensible() }}
          </h3>
          <p>
            {{ obtenirMessageActionSensible() }}
          </p>
        </div>
        <div class="dialogue-confirmation__actions">
          <button class="bouton-annee" type="button" @click="annulerActionSensible">
            Annuler
          </button>
          <button
            class="bouton-annee bouton-annee--principal"
            type="button"
            :disabled="actionSensibleEnCours"
            @click="confirmerActionSensible"
          >
            Confirmer
          </button>
        </div>
      </article>
    </div>

    <div
      v-if="anneeDetail !== null || consultationDetailEnCours"
      class="dialogue-confirmation"
      role="dialog"
      aria-modal="true"
      aria-labelledby="titre-detail-annee"
    >
      <article class="dialogue-confirmation__carte dialogue-confirmation__carte--large">
        <div class="dialogue-confirmation__icone">
          <Eye :size="24" />
        </div>
        <div>
          <h3 id="titre-detail-annee">Détail de l’année scolaire</h3>
          <p v-if="consultationDetailEnCours">
            Chargement du détail depuis le backend...
          </p>
          <p v-else-if="anneeDetail !== null">
            Données relues depuis le backend pour éviter d’afficher un état local dépassé.
          </p>
        </div>
        <dl v-if="anneeDetail !== null" class="detail-annee">
          <div>
            <dt>Code</dt>
            <dd>{{ anneeDetail.code }}</dd>
          </div>
          <div>
            <dt>Libellé</dt>
            <dd>{{ anneeDetail.libelle }}</dd>
          </div>
          <div>
            <dt>Début</dt>
            <dd>{{ formaterDate(anneeDetail.dateDebut) }}</dd>
          </div>
          <div>
            <dt>Fin</dt>
            <dd>{{ formaterDate(anneeDetail.dateFin) }}</dd>
          </div>
          <div>
            <dt>Statut</dt>
            <dd>{{ obtenirLibelleStatut(anneeDetail.statut) }}</dd>
          </div>
          <div>
            <dt>Version</dt>
            <dd>{{ anneeDetail.version }}</dd>
          </div>
        </dl>
        <div class="dialogue-confirmation__actions">
          <button class="bouton-annee bouton-annee--principal" type="button" @click="fermerDetailAnnee">
            Fermer
          </button>
        </div>
      </article>
    </div>
  </section>
</template>

<style scoped>
.annees-page {
  display: grid;
  max-width: 1060px;
  gap: 1rem;
}

.annees-page__header,
.annees-page__titre,
.bloc-annees,
.carte-resume {
  border: 1px solid var(--couleur-bordure);
  border-radius: var(--rayon-moyen);
  background: var(--couleur-surface);
  box-shadow: var(--ombre-carte);
}

.annees-page__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem;
}

.annees-page__contexte {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  flex: 1;
  gap: 0.75rem;
}

.annees-page__contexte div {
  padding: 0.75rem 0.9rem;
  border-radius: var(--rayon-moyen);
  background: var(--couleur-surface-froide);
}

.annees-page__contexte span,
.carte-resume span {
  display: block;
  color: var(--couleur-texte-douce);
  font-size: 0.72rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.annees-page__contexte strong,
.carte-resume strong {
  display: block;
  margin-top: 0.25rem;
  color: var(--couleur-encre);
  font-size: 1.05rem;
}

.annees-page__actions {
  display: flex;
  flex-wrap: wrap;
  gap: 0.55rem;
  justify-content: flex-end;
}

.bouton-annee {
  display: inline-flex;
  min-height: 2.55rem;
  align-items: center;
  gap: 0.45rem;
  padding: 0 0.85rem;
  border: 1px solid var(--couleur-bordure);
  border-radius: var(--rayon-moyen);
  background: var(--couleur-surface);
  color: var(--couleur-encre);
  cursor: pointer;
  font-weight: 800;
  transition: transform 120ms ease, box-shadow 120ms ease, border-color 120ms ease;
}

.bouton-annee:disabled {
  cursor: not-allowed;
  opacity: 0.72;
}

.bouton-annee--principal {
  border-color: var(--couleur-principale);
  background: var(--couleur-principale);
  color: #ffffff;
}

.bouton-annee--accent {
  border-color: var(--couleur-principale-foncee);
  background: var(--couleur-principale-foncee);
  color: #ffffff;
}

.bouton-annee:hover {
  transform: translateY(-1px);
}

.bouton-annee:not(.bouton-annee--principal):not(.bouton-annee--accent):hover {
  border-color: #c8d3e4;
  box-shadow: 0 6px 14px rgba(31, 41, 55, 0.07);
}

.bouton-annee:focus-visible,
.actions-ligne > button:focus-visible {
  outline: 2px solid #7c9fd6;
  outline-offset: 2px;
}

.annees-page__titre {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 1.15rem 1.2rem;
}

.annees-page__titre-actions {
  display: flex;
  flex: 0 0 auto;
  align-items: center;
  gap: 0.6rem;
}

.annees-page__titre h2 {
  margin: 0 0 0.35rem;
  color: var(--couleur-encre);
  font-size: 1.55rem;
}

.annees-page__titre p,
.carte-resume p {
  margin: 0;
  color: var(--couleur-texte-douce);
}

.annees-page__cartes {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.8rem;
}

.carte-resume {
  display: flex;
  min-height: 7.5rem;
  gap: 0.9rem;
  align-items: flex-start;
  padding: 1rem;
}

.carte-resume__icone {
  display: grid;
  width: 3rem;
  height: 3rem;
  flex: 0 0 auto;
  place-items: center;
  border-radius: 0.55rem;
  background: #2d9ccf;
  color: #ffffff;
}

.carte-resume__icone--neutre {
  background: #2d5f9f;
}

.carte-resume__icone--orange {
  background: #f2a51f;
}

.carte-resume__icone--gris {
  background: #7b8494;
}

.annees-page__grille {
  display: grid;
  grid-template-columns: 0.9fr 1.65fr;
  gap: 0.9rem;
}

.bloc-annees {
  overflow: hidden;
}

.bloc-annees__header {
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 0.95rem 1rem;
  border-bottom: 1px solid var(--couleur-bordure);
  background: #fbfcfe;
}

.bloc-annees__header h3 {
  margin: 0;
  color: var(--couleur-encre);
  font-size: 1.05rem;
}

.badge-alerte,
.badge-info {
  padding: 0.25rem 0.55rem;
  border-radius: 0.35rem;
  font-size: 0.72rem;
  font-weight: 900;
  text-transform: uppercase;
}

.badge-alerte {
  background: rgba(217, 83, 79, 0.12);
  color: #b42318;
}

.badge-info {
  background: rgba(45, 95, 159, 0.12);
  color: #2d5f9f;
}

.liste-alertes-annees {
  display: grid;
}

.liste-alertes-annees p {
  display: flex;
  gap: 0.7rem;
  align-items: center;
  margin: 0;
  padding: 0.9rem 1rem;
  border-bottom: 1px solid var(--couleur-bordure);
  color: var(--couleur-texte);
}

.liste-alertes-annees svg {
  flex: 0 0 auto;
  color: #d9534f;
}

.alerte-succes-annee svg {
  color: #23784a;
}

.tableau-annees {
  display: grid;
  overflow-x: auto;
}

.tableau-annees__ligne {
  display: grid;
  grid-template-columns: 1.1fr 0.9fr 0.9fr 0.85fr 1fr 0.7fr;
  min-width: 820px;
  align-items: center;
  gap: 0.75rem;
  padding: 0.82rem 1rem;
  border-bottom: 1px solid var(--couleur-bordure);
}

.tableau-annees__ligne:last-child {
  border-bottom: 0;
}

.tableau-annees__ligne--entete {
  background: #f3f6fa;
  color: var(--couleur-texte-douce);
  font-size: 0.75rem;
  font-weight: 900;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.tableau-annees__ligne--etat {
  grid-template-columns: 1fr;
  color: var(--couleur-texte-douce);
  font-weight: 800;
}

.badge-statut-annee {
  display: inline-flex;
  width: fit-content;
  align-items: center;
  gap: 0.35rem;
  padding: 0.3rem 0.55rem;
  border-radius: 0.35rem;
  font-size: 0.75rem;
  font-weight: 900;
}

.badge-statut-annee[data-statut='ACTIVE'] {
  background: rgba(47, 157, 98, 0.12);
  color: #23784a;
}

.badge-statut-annee[data-statut='PLANIFIEE'] {
  background: rgba(242, 166, 31, 0.16);
  color: #a15d00;
}

.badge-statut-annee[data-statut='CLOTUREE'],
.badge-statut-annee[data-statut='ARCHIVEE'] {
  background: rgba(123, 132, 148, 0.15);
  color: #4b5563;
}

.actions-ligne {
  position: relative;
  width: fit-content;
}

.actions-ligne > button {
  display: grid;
  width: 2rem;
  height: 2rem;
  place-items: center;
  border: 1px solid var(--couleur-bordure);
  border-radius: var(--rayon-moyen);
  background: var(--couleur-surface);
  color: var(--couleur-texte);
  cursor: pointer;
}

.menu-ligne {
  position: absolute;
  right: 0;
  z-index: 5;
  display: none;
  min-width: 12rem;
  padding: 0.35rem;
  border: 1px solid var(--couleur-bordure);
  border-radius: var(--rayon-moyen);
  background: var(--couleur-surface);
  box-shadow: var(--ombre-flottante);
}

.actions-ligne:hover .menu-ligne {
  display: grid;
}

.menu-ligne button {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
  border: 0;
  padding: 0.55rem;
  border-radius: 0.4rem;
  background: transparent;
  color: var(--couleur-texte);
  cursor: pointer;
  font-weight: 700;
  text-align: left;
}

.menu-ligne button:hover {
  background: #f3f6fa;
}

.pagination-annees {
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

.pagination-annees div {
  display: flex;
  align-items: center;
  gap: 0.6rem;
}

.pagination-annees strong {
  color: var(--couleur-encre);
  white-space: nowrap;
}

.dialogue-confirmation {
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

.dialogue-confirmation__carte {
  display: grid;
  width: min(100%, 30rem);
  max-height: calc(100dvh - clamp(3.25rem, 10vh, 6.5rem));
  gap: 1rem;
  margin: 0 auto;
  overflow-y: auto;
  padding: 1.2rem;
  border: 1px solid var(--couleur-bordure);
  border-radius: var(--rayon-grand);
  background: var(--couleur-surface);
  box-shadow: 0 24px 60px rgba(15, 23, 42, 0.24);
}

.dialogue-confirmation__carte--large {
  width: min(100%, 38rem);
}

.dialogue-confirmation__icone {
  display: grid;
  width: 3rem;
  height: 3rem;
  place-items: center;
  border-radius: 0.85rem;
  background: rgba(45, 95, 159, 0.12);
  color: var(--couleur-principale);
}

.dialogue-confirmation h3 {
  margin: 0 0 0.4rem;
  color: var(--couleur-encre);
}

.dialogue-confirmation p {
  margin: 0;
  color: var(--couleur-texte-douce);
  line-height: 1.55;
}

.dialogue-confirmation__actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.6rem;
}

.message-formulaire-annee {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  padding: 0.8rem 0.9rem;
  border: 1px solid rgba(217, 83, 79, 0.2);
  border-radius: var(--rayon-moyen);
  background: rgba(217, 83, 79, 0.08);
  color: #9f1d16;
  font-weight: 800;
}

.message-formulaire-annee svg {
  flex: 0 0 auto;
  margin-top: 0.1rem;
}

.formulaire-annee,
.detail-annee {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.75rem;
}

.formulaire-annee label,
.detail-annee div {
  display: grid;
  gap: 0.35rem;
}

.formulaire-annee span,
.detail-annee dt {
  color: var(--couleur-texte-douce);
  font-size: 0.74rem;
  font-weight: 900;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.formulaire-annee input {
  min-height: 2.7rem;
  border: 1px solid var(--couleur-bordure);
  border-radius: var(--rayon-moyen);
  padding: 0 0.75rem;
  color: var(--couleur-encre);
  font: inherit;
}

.formulaire-annee input:focus {
  border-color: #7c9fd6;
  outline: 2px solid rgba(124, 159, 214, 0.22);
}

.detail-annee {
  margin: 0;
}

.detail-annee dd {
  margin: 0;
  color: var(--couleur-encre);
  font-weight: 800;
}

@media (max-width: 1100px) {
  .annees-page__cartes {
    grid-template-columns: repeat(2, minmax(0, 1fr));
  }

  .annees-page__grille {
    grid-template-columns: 1fr;
  }
}

@media (max-width: 760px) {
  .annees-page__header {
    flex-direction: column;
    align-items: stretch;
  }

  .annees-page__titre,
  .annees-page__titre-actions {
    align-items: stretch;
    flex-direction: column;
  }

  .annees-page__contexte {
    grid-template-columns: 1fr;
  }

  .annees-page__actions {
    justify-content: stretch;
  }

  .bouton-annee {
    width: 100%;
    justify-content: center;
  }

  .annees-page__cartes {
    grid-template-columns: 1fr;
  }

  .pagination-annees,
  .pagination-annees div {
    align-items: stretch;
    flex-direction: column;
  }

  .formulaire-annee,
  .detail-annee {
    grid-template-columns: 1fr;
  }
}
</style>
