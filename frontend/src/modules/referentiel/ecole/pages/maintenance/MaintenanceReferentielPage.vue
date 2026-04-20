<script setup lang="ts">
import { computed, ref } from 'vue';
import {
  AlertTriangle,
  ArrowRightLeft,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Clock3,
  FileSearch,
  Loader2,
  RefreshCw,
  RotateCcw,
  Search,
  ShieldCheck,
  Sparkles,
  X,
  XCircle,
} from 'lucide-vue-next';
import type {
  LigneDiffMigrationResume,
  MigrationReferentielResume,
  RapportMigrationReferentielResume,
  StatutMigrationReferentiel,
  TypeDiffReferentiel,
} from '../../../commun/types/migrations-referentiel.types';
import { migrationsReferentielApi } from '../../services/migrations-referentiel.api';
import {
  contexteEcoleCourant,
  contexteEcoleEstConfigure,
} from '../../stores/contexte-ecole.store';

interface FormulaireAnalyseMigration {
  idProgrammeNiveau: string;
  idAncienneVersionReferentiel: string;
  idNouvelleVersionReferentiel: string;
}

type CategorieImpact = 'AJOUT' | 'RETRAIT' | 'PONDERATION' | 'ORDRE' | 'AUTRE';

const formulaireAnalyse = ref<FormulaireAnalyseMigration>({
  idProgrammeNiveau: '',
  idAncienneVersionReferentiel: '',
  idNouvelleVersionReferentiel: '',
});
const idMigrationRecherchee = ref('');
const rechercheDifference = ref('');
const rapportMigration = ref<RapportMigrationReferentielResume | null>(null);
const migrationsDisponibles = ref<MigrationReferentielResume[]>([]);
const panneauAvanceOuvert = ref(false);
const confirmationApplicationOuverte = ref(false);
const chargement = ref(false);
const chargementMigrations = ref(false);
const actionEnCours = ref(false);
const messageErreur = ref<string | null>(null);
const messageSucces = ref<string | null>(null);

const migrationCourante = computed<MigrationReferentielResume | null>(
  () => rapportMigration.value?.migrationReferentielProgramme ?? null,
);

const differences = computed(() => migrationCourante.value?.lignesDiffMigration ?? []);

const differencesFiltrees = computed(() => {
  const terme = rechercheDifference.value.trim().toLocaleLowerCase('fr-FR');

  if (terme.length === 0) {
    return differences.value;
  }

  return differences.value.filter((difference) =>
    [
      difference.codeCours,
      obtenirLibelleTypeDiff(difference.typeDiff),
      obtenirLibelleImpact(difference),
      difference.commentaire ?? '',
    ].join(' ').toLocaleLowerCase('fr-FR').includes(terme),
  );
});

const totalAjouts = computed(() =>
  differences.value.filter((difference) => difference.typeDiff === 'COURS_AJOUTE').length,
);

const totalRetraits = computed(() =>
  differences.value.filter((difference) => difference.typeDiff === 'COURS_RETIRE').length,
);

const totalPonderations = computed(() =>
  differences.value.filter((difference) => difference.typeDiff === 'PONDERATION_MODIFIEE').length,
);

const totalOrdres = computed(() =>
  differences.value.filter((difference) => difference.typeDiff === 'ORDRE_MODIFIE').length,
);

const peutAnalyser = computed(() =>
  contexteEcoleEstConfigure() &&
  contexteEcoleCourant.idEcole !== null &&
  contexteEcoleCourant.idUtilisateur !== null &&
  Object.values(formulaireAnalyse.value).every((valeur) => valeur.trim().length > 0),
);

const peutConsulter = computed(() => idMigrationRecherchee.value.trim().length > 0);
const peutChargerMigrations = computed(() =>
  formulaireAnalyse.value.idProgrammeNiveau.trim().length > 0,
);
const peutAppliquer = computed(() => migrationCourante.value?.statut === 'ANALYSEE');
const peutAnnuler = computed(() =>
  migrationCourante.value !== null && migrationCourante.value.statut !== 'APPLIQUEE',
);
const peutRelancer = computed(() => migrationCourante.value?.statut === 'APPLIQUEE');

function obtenirOptionsRequete(operation: string): { tenantId?: string; idempotencyKey: string } {
  return {
    tenantId: contexteEcoleCourant.tenantId ?? contexteEcoleCourant.idEcole ?? undefined,
    idempotencyKey: `${operation}-${Date.now()}-${Math.random().toString(36).slice(2)}`,
  };
}

function obtenirOptionsLecture(): { tenantId?: string } {
  return {
    tenantId: contexteEcoleCourant.tenantId ?? contexteEcoleCourant.idEcole ?? undefined,
  };
}

function obtenirLibelleStatut(statut: StatutMigrationReferentiel | undefined): string {
  if (statut === 'BROUILLON') {
    return 'Préparation';
  }

  if (statut === 'ANALYSEE') {
    return 'Changements vérifiés';
  }

  if (statut === 'APPLIQUEE') {
    return 'Mise à jour appliquée';
  }

  if (statut === 'ANNULEE') {
    return 'Mise à jour annulée';
  }

  return 'Aucune mise à jour chargée';
}

function obtenirClasseStatut(statut: StatutMigrationReferentiel | undefined): string {
  if (statut === 'APPLIQUEE') {
    return 'badge--vert';
  }

  if (statut === 'ANALYSEE') {
    return 'badge--orange';
  }

  if (statut === 'ANNULEE') {
    return 'badge--gris';
  }

  return 'badge--bleu';
}

function obtenirLibelleTypeDiff(typeDiff: TypeDiffReferentiel): string {
  const libelles: Record<TypeDiffReferentiel, string> = {
    PONDERATION_MODIFIEE: 'Pondération modifiée',
    ORDRE_MODIFIE: 'Position modifiée',
    COURS_AJOUTE: 'Nouveau cours',
    COURS_RETIRE: 'Cours retiré',
    COURS_DEVENU_NON_CALCULABLE: 'Cours non calculable',
  };

  return libelles[typeDiff];
}

function obtenirCategorieImpact(difference: LigneDiffMigrationResume): CategorieImpact {
  if (difference.typeDiff === 'COURS_AJOUTE') {
    return 'AJOUT';
  }

  if (difference.typeDiff === 'COURS_RETIRE') {
    return 'RETRAIT';
  }

  if (difference.typeDiff === 'PONDERATION_MODIFIEE') {
    return 'PONDERATION';
  }

  if (difference.typeDiff === 'ORDRE_MODIFIE') {
    return 'ORDRE';
  }

  return 'AUTRE';
}

function obtenirLibelleImpact(difference: LigneDiffMigrationResume): string {
  const categorie = obtenirCategorieImpact(difference);

  if (categorie === 'AJOUT') {
    return 'Le cours sera ajouté au programme.';
  }

  if (categorie === 'RETRAIT') {
    return 'Le cours ne fera plus partie du programme.';
  }

  if (categorie === 'PONDERATION') {
    return 'Les points attribués au cours changent.';
  }

  if (categorie === 'ORDRE') {
    return 'La position du cours dans le bulletin change.';
  }

  return 'Le mode de calcul du cours change.';
}

function obtenirClasseImpact(difference: LigneDiffMigrationResume): string {
  const categorie = obtenirCategorieImpact(difference);

  if (categorie === 'AJOUT') {
    return 'badge--vert';
  }

  if (categorie === 'RETRAIT' || categorie === 'AUTRE') {
    return 'badge--rouge';
  }

  if (categorie === 'PONDERATION') {
    return 'badge--orange';
  }

  return 'badge--bleu';
}

function formaterDate(dateIso: string | undefined): string {
  if (dateIso === undefined) {
    return '-';
  }

  return new Intl.DateTimeFormat('fr-FR', {
    day: '2-digit',
    month: 'short',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  }).format(new Date(dateIso));
}

function calculerTotalPonderation(difference: LigneDiffMigrationResume, variante: 'ancienne' | 'nouvelle'): number | null {
  const ponderation = variante === 'ancienne'
    ? difference.anciennePonderation
    : difference.nouvellePonderation;

  if (ponderation === undefined) {
    return null;
  }

  return Object.values(ponderation).reduce((total, maximum) => total + maximum, 0);
}

function obtenirValeurAvant(difference: LigneDiffMigrationResume): string {
  const total = calculerTotalPonderation(difference, 'ancienne');

  if (total !== null) {
    return `${total} pts`;
  }

  if (difference.ancienOrdre !== undefined) {
    return `Position ${difference.ancienOrdre}`;
  }

  if (difference.typeDiff === 'COURS_AJOUTE') {
    return 'Absent';
  }

  return '-';
}

function obtenirValeurApres(difference: LigneDiffMigrationResume): string {
  const total = calculerTotalPonderation(difference, 'nouvelle');

  if (total !== null) {
    return `${total} pts`;
  }

  if (difference.nouvelOrdre !== undefined) {
    return `Position ${difference.nouvelOrdre}`;
  }

  if (difference.typeDiff === 'COURS_RETIRE') {
    return 'Retiré';
  }

  return '-';
}

function reinitialiserMessages(): void {
  messageErreur.value = null;
  messageSucces.value = null;
}

function ouvrirParametresAvances(): void {
  panneauAvanceOuvert.value = true;
}

function demanderConfirmationApplication(): void {
  if (!peutAppliquer.value) {
    return;
  }

  confirmationApplicationOuverte.value = true;
}

function fermerConfirmationApplication(): void {
  if (actionEnCours.value) {
    return;
  }

  confirmationApplicationOuverte.value = false;
}

async function analyserMigration(): Promise<void> {
  if (!peutAnalyser.value || contexteEcoleCourant.idEcole === null || contexteEcoleCourant.idUtilisateur === null) {
    messageErreur.value =
      'Choisis d’abord le programme à mettre à jour et les deux versions à comparer dans les paramètres avancés.';
    panneauAvanceOuvert.value = true;
    return;
  }

  chargement.value = true;
  reinitialiserMessages();

  try {
    const reponse = await migrationsReferentielApi.analyser(
      {
        idEcole: contexteEcoleCourant.idEcole,
        idProgrammeNiveau: formulaireAnalyse.value.idProgrammeNiveau.trim(),
        idAncienneVersionReferentiel: formulaireAnalyse.value.idAncienneVersionReferentiel.trim(),
        idNouvelleVersionReferentiel: formulaireAnalyse.value.idNouvelleVersionReferentiel.trim(),
        declenchePar: contexteEcoleCourant.idUtilisateur,
      },
      obtenirOptionsRequete('analyser-migration-referentiel'),
    );

    rapportMigration.value = reponse.donnee;
    idMigrationRecherchee.value = reponse.donnee.migrationReferentielProgramme.id;
    messageSucces.value = 'Changements vérifiés. Tu peux maintenant contrôler l’impact avant d’appliquer.';
  } catch {
    messageErreur.value =
      'La vérification n’a pas abouti. Vérifie la sélection de mise à jour puis réessaie.';
  } finally {
    chargement.value = false;
  }
}

async function consulterMigration(): Promise<void> {
  const idMigration = idMigrationRecherchee.value.trim();

  if (idMigration.length === 0) {
    messageErreur.value = 'Indique la référence de mise à jour à retrouver.';
    panneauAvanceOuvert.value = true;
    return;
  }

  chargement.value = true;
  reinitialiserMessages();

  try {
    const reponse = await migrationsReferentielApi.consulter(idMigration, obtenirOptionsLecture());
    rapportMigration.value = reponse.donnee;
    messageSucces.value = 'Rapport de mise à jour chargé.';
  } catch {
    messageErreur.value = 'Cette mise à jour est introuvable ou n’est pas accessible pour cette école.';
  } finally {
    chargement.value = false;
  }
}

async function chargerMisesAJourDisponibles(): Promise<void> {
  const idProgrammeNiveau = formulaireAnalyse.value.idProgrammeNiveau.trim();

  if (idProgrammeNiveau.length === 0) {
    messageErreur.value = 'Indique d’abord le programme à mettre à jour.';
    panneauAvanceOuvert.value = true;
    return;
  }

  chargementMigrations.value = true;
  reinitialiserMessages();

  try {
    const reponse = await migrationsReferentielApi.lister(
      {
        idProgrammeNiveau,
        page: 1,
        taillePage: 8,
      },
      obtenirOptionsLecture(),
    );

    migrationsDisponibles.value = reponse.donnees;

    if (reponse.donnees.length === 0) {
      messageSucces.value = 'Aucune mise à jour déjà vérifiée pour ce programme.';
      return;
    }

    messageSucces.value = 'Mises à jour disponibles chargées.';
  } catch {
    messageErreur.value =
      'Les mises à jour disponibles n’ont pas pu être chargées pour ce programme.';
  } finally {
    chargementMigrations.value = false;
  }
}

async function selectionnerMiseAJour(migration: MigrationReferentielResume): Promise<void> {
  idMigrationRecherchee.value = migration.id;
  await consulterMigration();
}

async function appliquerMigration(): Promise<void> {
  if (
    migrationCourante.value === null ||
    contexteEcoleCourant.idEcole === null ||
    contexteEcoleCourant.idUtilisateur === null
  ) {
    return;
  }

  actionEnCours.value = true;
  reinitialiserMessages();

  try {
    const reponse = await migrationsReferentielApi.appliquer(
      {
        idEcole: contexteEcoleCourant.idEcole,
        idMigrationReferentielProgramme: migrationCourante.value.id,
        appliquePar: contexteEcoleCourant.idUtilisateur,
      },
      obtenirOptionsRequete('appliquer-migration-referentiel'),
    );

    rapportMigration.value = {
      migrationReferentielProgramme: reponse.donnee.migrationReferentielProgramme,
      totalDifferences: reponse.donnee.migrationReferentielProgramme.lignesDiffMigration.length,
      totalTransformationsNotes:
        reponse.donnee.migrationReferentielProgramme.transformationsNotes.length,
    };
    confirmationApplicationOuverte.value = false;
    messageSucces.value = 'Mise à jour appliquée avec succès.';
  } catch {
    messageErreur.value =
      'La mise à jour n’a pas pu être appliquée. Les programmes actuels ont été conservés.';
  } finally {
    actionEnCours.value = false;
  }
}

async function annulerMigration(): Promise<void> {
  if (migrationCourante.value === null || contexteEcoleCourant.idUtilisateur === null) {
    return;
  }

  actionEnCours.value = true;
  reinitialiserMessages();

  try {
    const reponse = await migrationsReferentielApi.annuler(
      {
        idMigrationReferentielProgramme: migrationCourante.value.id,
        annulePar: contexteEcoleCourant.idUtilisateur,
      },
      obtenirOptionsRequete('annuler-migration-referentiel'),
    );

    rapportMigration.value = {
      migrationReferentielProgramme: reponse.donnee,
      totalDifferences: reponse.donnee.lignesDiffMigration.length,
      totalTransformationsNotes: reponse.donnee.transformationsNotes.length,
    };
    messageSucces.value = 'Mise à jour annulée.';
  } catch {
    messageErreur.value = 'La mise à jour n’a pas pu être annulée dans son état actuel.';
  } finally {
    actionEnCours.value = false;
  }
}

async function relancerRecalcul(): Promise<void> {
  if (migrationCourante.value === null || contexteEcoleCourant.idUtilisateur === null) {
    return;
  }

  actionEnCours.value = true;
  reinitialiserMessages();

  try {
    const reponse = await migrationsReferentielApi.relancerRecalcul(
      {
        idMigrationReferentielProgramme: migrationCourante.value.id,
        relancePar: contexteEcoleCourant.idUtilisateur,
      },
      obtenirOptionsRequete('relancer-recalcul-migration'),
    );

    rapportMigration.value = {
      migrationReferentielProgramme: reponse.donnee,
      totalDifferences: reponse.donnee.lignesDiffMigration.length,
      totalTransformationsNotes: reponse.donnee.transformationsNotes.length,
    };
    messageSucces.value = 'Recalcul relancé avec succès.';
  } catch {
    messageErreur.value = 'Le recalcul n’a pas pu être relancé pour cette mise à jour.';
  } finally {
    actionEnCours.value = false;
  }
}
</script>

<template>
  <section class="maintenance-page">
    <header class="maintenance-hero">
      <div>
        <span class="maintenance-hero__eyebrow">Mise à jour officielle</span>
        <h2>Migrations référentiel</h2>
        <p>
          Vérifie ce qui change dans les programmes de l’école avant d’appliquer une nouvelle version officielle.
        </p>
      </div>

      <div class="maintenance-hero__actions">
        <button class="bouton bouton--principal" type="button" :disabled="chargement" @click="analyserMigration">
          <FileSearch :size="18" />
          Vérifier les changements
        </button>
        <button class="bouton" type="button" :disabled="chargement" @click="ouvrirParametresAvances">
          <Sparkles :size="18" />
          Choisir la mise à jour
        </button>
      </div>
    </header>

    <section class="carte-parcours">
      <article class="etape-parcours etape-parcours--active">
        <span>01</span>
        <strong>Choisir</strong>
        <p>Sélectionner le programme et la version officielle cible.</p>
      </article>
      <article class="etape-parcours" :class="{ 'etape-parcours--active': migrationCourante !== null }">
        <span>02</span>
        <strong>Vérifier</strong>
        <p>Lire les cours ajoutés, retirés ou modifiés.</p>
      </article>
      <article class="etape-parcours" :class="{ 'etape-parcours--active': migrationCourante?.statut === 'APPLIQUEE' }">
        <span>03</span>
        <strong>Appliquer</strong>
        <p>Mettre à jour seulement après contrôle.</p>
      </article>
    </section>

    <section class="indicateurs" aria-label="Résumé de la mise à jour">
      <article class="indicateur indicateur--principal">
        <div class="indicateur__icone">
          <ShieldCheck :size="24" />
        </div>
        <div>
          <span>État</span>
          <strong>{{ obtenirLibelleStatut(migrationCourante?.statut) }}</strong>
          <p>Aucun changement n’est appliqué sans confirmation.</p>
        </div>
      </article>

      <article class="indicateur">
        <div class="indicateur__icone indicateur__icone--vert">
          <CheckCircle2 :size="22" />
        </div>
        <div>
          <span>Ajouts</span>
          <strong>{{ totalAjouts }}</strong>
          <p>Nouveaux cours</p>
        </div>
      </article>

      <article class="indicateur">
        <div class="indicateur__icone indicateur__icone--rouge">
          <XCircle :size="22" />
        </div>
        <div>
          <span>Retraits</span>
          <strong>{{ totalRetraits }}</strong>
          <p>Cours retirés</p>
        </div>
      </article>

      <article class="indicateur">
        <div class="indicateur__icone indicateur__icone--orange">
          <ArrowRightLeft :size="22" />
        </div>
        <div>
          <span>Modifications</span>
          <strong>{{ totalPonderations + totalOrdres }}</strong>
          <p>Pondérations ou positions</p>
        </div>
      </article>
    </section>

    <section class="panneau-avance" :class="{ 'panneau-avance--ouvert': panneauAvanceOuvert }">
      <button class="panneau-avance__declencheur" type="button" @click="panneauAvanceOuvert = !panneauAvanceOuvert">
        <span>
          <strong>Sélection de la mise à jour</strong>
          <small>À terme, cette sélection pourra venir d’une liste officielle. Pour l’instant, elle utilise les références de mise à jour disponibles.</small>
        </span>
        <ChevronUp v-if="panneauAvanceOuvert" :size="20" />
        <ChevronDown v-else :size="20" />
      </button>

      <div v-if="panneauAvanceOuvert" class="panneau-avance__contenu">
        <div class="grille-formulaire">
          <label>
            Programme à mettre à jour
            <input v-model="formulaireAnalyse.idProgrammeNiveau" type="text" placeholder="Référence du programme niveau" />
          </label>
          <label>
            Version actuelle
            <input
              v-model="formulaireAnalyse.idAncienneVersionReferentiel"
              type="text"
              placeholder="Référence de la version actuelle"
            />
          </label>
          <label>
            Version officielle cible
            <input
              v-model="formulaireAnalyse.idNouvelleVersionReferentiel"
              type="text"
              placeholder="Référence de la version cible"
            />
          </label>
        </div>

        <div class="consultation-rapport">
          <label>
            Retrouver une mise à jour déjà vérifiée
            <input v-model="idMigrationRecherchee" type="text" placeholder="Référence de mise à jour" />
          </label>
          <button class="bouton" type="button" :disabled="!peutChargerMigrations || chargementMigrations" @click="chargerMisesAJourDisponibles">
            <Loader2 v-if="chargementMigrations" :size="18" class="icone-rotation" />
            <RefreshCw v-else :size="18" />
            Voir les mises à jour
          </button>
          <button class="bouton" type="button" :disabled="!peutConsulter || chargement" @click="consulterMigration">
            <Search :size="18" />
            Charger le rapport
          </button>
        </div>

        <div v-if="migrationsDisponibles.length > 0" class="liste-mises-a-jour">
          <button
            v-for="migration in migrationsDisponibles"
            :key="migration.id"
            class="carte-mise-a-jour"
            type="button"
            @click="selectionnerMiseAJour(migration)"
          >
            <span class="badge" :class="obtenirClasseStatut(migration.statut)">
              {{ obtenirLibelleStatut(migration.statut) }}
            </span>
            <strong>{{ formaterDate(migration.dateMigration) }}</strong>
            <small>{{ migration.resumeDiff }}</small>
          </button>
        </div>
      </div>
    </section>

    <section class="barre-outils" aria-label="Recherche dans les changements">
      <label class="champ-recherche">
        <Search :size="18" />
        <input v-model="rechercheDifference" type="search" placeholder="Rechercher un cours ou un type de changement..." />
      </label>

      <div class="badge-securite">
        <ShieldCheck :size="18" />
        Contrôle obligatoire
      </div>
    </section>

    <p v-if="messageSucces !== null" class="message-page message-page--succes">
      <CheckCircle2 :size="18" />
      {{ messageSucces }}
    </p>
    <p v-if="messageErreur !== null" class="message-page message-page--erreur">
      <AlertTriangle :size="18" />
      {{ messageErreur }}
    </p>

    <section class="grille-maintenance">
      <article class="carte-tableau carte-tableau--large">
        <div class="carte-tableau__entete">
          <div>
            <span>Impact école</span>
            <h3>Changements à contrôler</h3>
          </div>
          <span class="badge" :class="obtenirClasseStatut(migrationCourante?.statut)">
            {{ obtenirLibelleStatut(migrationCourante?.statut) }}
          </span>
        </div>

        <div class="tableau-maintenance tableau-maintenance--differences">
          <div class="tableau-maintenance__ligne tableau-maintenance__ligne--entete">
            <span>Cours</span>
            <span>Changement</span>
            <span>Avant</span>
            <span>Après</span>
            <span>Impact</span>
          </div>

          <div v-if="chargement" class="tableau-maintenance__ligne tableau-maintenance__ligne--etat">
            <span><Loader2 :size="16" class="icone-rotation" /> Vérification des changements...</span>
          </div>
          <div
            v-else-if="differencesFiltrees.length === 0"
            class="tableau-maintenance__ligne tableau-maintenance__ligne--etat"
          >
            <span>Aucun changement chargé. Choisis une mise à jour puis lance la vérification.</span>
          </div>
          <div
            v-for="difference in differencesFiltrees"
            :key="`${difference.typeDiff}-${difference.codeCours}-${difference.ancienOrdre ?? 'na'}-${difference.nouvelOrdre ?? 'na'}`"
            class="tableau-maintenance__ligne"
          >
            <strong>{{ difference.codeCours }}</strong>
            <span>
              <span class="badge" :class="obtenirClasseImpact(difference)">
                {{ obtenirLibelleTypeDiff(difference.typeDiff) }}
              </span>
            </span>
            <span>{{ obtenirValeurAvant(difference) }}</span>
            <span>{{ obtenirValeurApres(difference) }}</span>
            <span>{{ obtenirLibelleImpact(difference) }}</span>
          </div>
        </div>
      </article>

      <article class="carte-actions">
        <div class="carte-actions__entete">
          <div>
            <span>Décision</span>
            <h3>Que faire maintenant ?</h3>
          </div>
          <Clock3 :size="22" />
        </div>

        <div class="actions-sensibles">
          <button class="action-sensible action-sensible--appliquer" type="button" :disabled="!peutAppliquer || actionEnCours" @click="demanderConfirmationApplication">
            <CheckCircle2 :size="18" />
            <span>
              Appliquer la mise à jour
              <small>Disponible après vérification des changements.</small>
            </span>
          </button>
          <button class="action-sensible" type="button" :disabled="!peutAnnuler || actionEnCours" @click="annulerMigration">
            <XCircle :size="18" />
            <span>
              Annuler cette mise à jour
              <small>Utile si les changements ne doivent pas être appliqués.</small>
            </span>
          </button>
          <button class="action-sensible" type="button" :disabled="!peutRelancer || actionEnCours" @click="relancerRecalcul">
            <RotateCcw :size="18" />
            <span>
              Relancer les recalculs
              <small>Seulement après une mise à jour déjà appliquée.</small>
            </span>
          </button>
        </div>
      </article>

      <article class="carte-resume">
        <div class="carte-actions__entete">
          <div>
            <span>Résumé</span>
            <h3>Mise à jour courante</h3>
          </div>
          <RefreshCw :size="22" />
        </div>

        <div class="resume-migration">
          <div>
            <span>Dernière vérification</span>
            <strong>{{ formaterDate(migrationCourante?.dateMigration) }}</strong>
          </div>
          <div>
            <span>Statut</span>
            <strong>{{ obtenirLibelleStatut(migrationCourante?.statut) }}</strong>
          </div>
          <div>
            <span>Changements détectés</span>
            <strong>{{ rapportMigration?.totalDifferences ?? 0 }}</strong>
          </div>
          <div>
            <span>Notes recalculées</span>
            <strong>{{ rapportMigration?.totalTransformationsNotes ?? 0 }}</strong>
          </div>
        </div>
      </article>
    </section>

    <Teleport to="body">
      <div v-if="confirmationApplicationOuverte" class="superposition-modale" role="presentation">
        <section class="modale-confirmation" role="dialog" aria-modal="true" aria-labelledby="titre-confirmation-mise-a-jour">
          <header class="modale-confirmation__entete">
            <div class="modale-confirmation__icone">
              <ShieldCheck :size="24" />
            </div>
            <div>
              <span>Confirmation requise</span>
              <h3 id="titre-confirmation-mise-a-jour">Appliquer cette mise à jour ?</h3>
              <p>
                Cette action mettra à jour les programmes concernés selon les changements vérifiés.
                Les données actuelles restent protégées si l’opération est refusée.
              </p>
            </div>
            <button class="bouton-fermeture" type="button" :disabled="actionEnCours" @click="fermerConfirmationApplication">
              <X :size="20" />
            </button>
          </header>

          <div class="resume-confirmation">
            <article>
              <span>Ajouts</span>
              <strong>{{ totalAjouts }}</strong>
            </article>
            <article>
              <span>Retraits</span>
              <strong>{{ totalRetraits }}</strong>
            </article>
            <article>
              <span>Modifications</span>
              <strong>{{ totalPonderations + totalOrdres }}</strong>
            </article>
            <article>
              <span>Total</span>
              <strong>{{ rapportMigration?.totalDifferences ?? 0 }}</strong>
            </article>
          </div>

          <div class="avertissement-confirmation">
            <AlertTriangle :size="18" />
            <span>Vérifie que les changements affichés correspondent bien à la version officielle attendue avant de confirmer.</span>
          </div>

          <footer class="modale-confirmation__actions">
            <button class="bouton" type="button" :disabled="actionEnCours" @click="fermerConfirmationApplication">
              Annuler
            </button>
            <button class="bouton bouton--principal" type="button" :disabled="actionEnCours" @click="appliquerMigration">
              <Loader2 v-if="actionEnCours" :size="18" class="icone-rotation" />
              <CheckCircle2 v-else :size="18" />
              Confirmer l’application
            </button>
          </footer>
        </section>
      </div>
    </Teleport>
  </section>
</template>

<style scoped>
.maintenance-page {
  display: grid;
  max-width: 1080px;
  gap: 1rem;
}

.maintenance-hero,
.carte-parcours,
.indicateur,
.panneau-avance,
.barre-outils,
.carte-tableau,
.carte-actions,
.carte-resume {
  border: 1px solid var(--couleur-bordure);
  background: var(--couleur-surface);
  box-shadow: var(--ombre-carte);
}

.maintenance-hero {
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

.maintenance-hero__eyebrow,
.indicateur span,
.carte-tableau__entete span,
.carte-actions__entete span,
.resume-migration span {
  color: var(--couleur-texte-douce);
  font-size: 0.72rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.maintenance-hero h2 {
  margin: 0.25rem 0 0.35rem;
  color: var(--couleur-encre);
  font-size: 1.75rem;
  letter-spacing: -0.03em;
}

.maintenance-hero p,
.indicateur p,
.etape-parcours p {
  margin: 0;
  color: var(--couleur-texte-douce);
  line-height: 1.55;
}

.maintenance-hero__actions {
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
  cursor: pointer;
  font-weight: 850;
}

.bouton:disabled,
.action-sensible:disabled {
  cursor: not-allowed;
  opacity: 0.55;
}

.bouton--principal {
  border-color: var(--couleur-principale);
  background: var(--couleur-principale);
  color: #ffffff;
  box-shadow: 0 10px 18px rgba(45, 95, 159, 0.2);
}

.carte-parcours {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.75rem;
  padding: 0.85rem;
  border-radius: 1rem;
}

.etape-parcours {
  display: grid;
  gap: 0.3rem;
  padding: 0.9rem;
  border: 1px solid var(--couleur-bordure);
  border-radius: 0.85rem;
  background: #fbfcfe;
}

.etape-parcours span {
  color: var(--couleur-texte-douce);
  font-size: 0.75rem;
  font-weight: 900;
}

.etape-parcours strong {
  color: var(--couleur-encre);
}

.etape-parcours--active {
  border-color: rgba(45, 95, 159, 0.3);
  background: rgba(45, 95, 159, 0.07);
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

.indicateur__icone--rouge {
  background: #d94b4b;
}

.indicateur__icone--orange {
  background: #e5a324;
}

.indicateur strong {
  display: block;
  margin: 0.28rem 0;
  color: var(--couleur-encre);
  font-size: 1.15rem;
}

.panneau-avance {
  overflow: hidden;
  border-radius: 1rem;
}

.panneau-avance__declencheur {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  gap: 1rem;
  padding: 0.95rem 1rem;
  border: 0;
  background: #ffffff;
  color: var(--couleur-encre);
  cursor: pointer;
  text-align: left;
}

.panneau-avance__declencheur span {
  display: grid;
  gap: 0.25rem;
}

.panneau-avance__declencheur small {
  color: var(--couleur-texte-douce);
  font-size: 0.82rem;
  line-height: 1.45;
}

.panneau-avance__contenu {
  display: grid;
  gap: 0.85rem;
  padding: 0 1rem 1rem;
}

.grille-formulaire {
  display: grid;
  grid-template-columns: repeat(3, minmax(0, 1fr));
  gap: 0.7rem;
}

.grille-formulaire label,
.consultation-rapport label {
  display: grid;
  gap: 0.38rem;
  color: var(--couleur-texte-douce);
  font-size: 0.78rem;
  font-weight: 850;
}

.grille-formulaire input,
.consultation-rapport input {
  min-height: 2.65rem;
  padding: 0 0.78rem;
  border: 1px solid var(--couleur-bordure);
  border-radius: 0.65rem;
  background: #fbfcfe;
  color: var(--couleur-encre);
  outline: 0;
}

.consultation-rapport {
  display: grid;
  grid-template-columns: 1fr auto auto;
  gap: 0.7rem;
  align-items: end;
}

.liste-mises-a-jour {
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 0.7rem;
}

.carte-mise-a-jour {
  display: grid;
  gap: 0.35rem;
  padding: 0.85rem;
  border: 1px solid var(--couleur-bordure);
  border-radius: 0.85rem;
  background: #fbfcfe;
  color: var(--couleur-encre);
  cursor: pointer;
  text-align: left;
  transition: border-color 0.18s ease, box-shadow 0.18s ease, transform 0.18s ease;
}

.carte-mise-a-jour:hover {
  border-color: rgba(45, 95, 159, 0.35);
  box-shadow: 0 12px 28px rgba(45, 95, 159, 0.1);
  transform: translateY(-1px);
}

.carte-mise-a-jour small {
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

.message-page {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  margin: 0;
  padding: 0.8rem 0.9rem;
  border-radius: 0.55rem;
  font-weight: 850;
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

.grille-maintenance {
  display: grid;
  grid-template-columns: 0.78fr 1.22fr;
  gap: 0.85rem;
}

.carte-tableau,
.carte-actions,
.carte-resume {
  overflow: hidden;
  border-radius: 1rem;
}

.carte-tableau--large {
  grid-column: span 2;
}

.carte-tableau__entete,
.carte-actions__entete {
  display: flex;
  align-items: flex-start;
  justify-content: space-between;
  gap: 1rem;
  padding: 1rem;
  border-bottom: 1px solid var(--couleur-bordure);
  background: linear-gradient(180deg, #fbfcfe 0%, #f3f6fa 100%);
}

.carte-tableau__entete h3,
.carte-actions__entete h3 {
  margin: 0.35rem 0 0;
  color: var(--couleur-encre);
  font-size: 1.05rem;
}

.carte-actions__entete svg {
  color: var(--couleur-principale);
}

.tableau-maintenance {
  display: grid;
  overflow-x: auto;
}

.tableau-maintenance__ligne {
  display: grid;
  align-items: center;
  gap: 0.8rem;
  min-width: 880px;
  padding: 0.78rem 1rem;
  border-bottom: 1px solid #e7ecf3;
  color: var(--couleur-texte);
}

.tableau-maintenance__ligne:last-child {
  border-bottom: 0;
}

.tableau-maintenance__ligne--entete {
  background: #f3f6fa;
  color: var(--couleur-texte-douce);
  font-size: 0.72rem;
  font-weight: 900;
  letter-spacing: 0.06em;
  text-transform: uppercase;
}

.tableau-maintenance__ligne--etat {
  grid-template-columns: 1fr !important;
  color: var(--couleur-texte-douce);
  font-weight: 850;
}

.tableau-maintenance__ligne--etat span {
  display: inline-flex;
  align-items: center;
  gap: 0.45rem;
}

.tableau-maintenance__ligne strong {
  color: var(--couleur-encre);
}

.tableau-maintenance--differences .tableau-maintenance__ligne {
  grid-template-columns: 0.9fr 1.15fr 0.8fr 0.8fr 1.8fr;
}

.actions-sensibles,
.resume-migration {
  display: grid;
  gap: 0.75rem;
  padding: 1rem;
}

.action-sensible {
  display: flex;
  align-items: flex-start;
  gap: 0.7rem;
  padding: 0.9rem;
  border: 1px solid var(--couleur-bordure);
  border-radius: 0.75rem;
  background: #fbfcfe;
  color: var(--couleur-encre);
  cursor: pointer;
  text-align: left;
  font-weight: 900;
}

.action-sensible svg {
  flex: 0 0 auto;
  color: #d94b4b;
}

.action-sensible--appliquer svg {
  color: var(--couleur-succes);
}

.action-sensible small {
  display: block;
  margin-top: 0.2rem;
  color: var(--couleur-texte-douce);
  font-size: 0.76rem;
  font-weight: 750;
}

.resume-migration div {
  display: grid;
  gap: 0.25rem;
  padding: 0.85rem;
  border: 1px solid var(--couleur-bordure);
  border-radius: 0.75rem;
  background: #fbfcfe;
}

.resume-migration strong {
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

.badge--rouge {
  background: rgba(217, 75, 75, 0.13);
  color: #9f1d16;
}

.icone-rotation {
  animation: rotation 0.8s linear infinite;
}

.superposition-modale {
  position: fixed;
  z-index: 70;
  inset: 0;
  display: grid;
  place-items: start center;
  padding: 8vh 1.25rem 2rem;
  background: rgba(12, 23, 39, 0.42);
  backdrop-filter: blur(7px);
}

.modale-confirmation {
  display: grid;
  width: min(760px, 100%);
  gap: 1rem;
  padding: 1rem;
  border: 1px solid rgba(255, 255, 255, 0.45);
  border-radius: 1.15rem;
  background:
    radial-gradient(circle at top left, rgba(45, 95, 159, 0.16), transparent 18rem),
    #ffffff;
  box-shadow: 0 24px 80px rgba(12, 23, 39, 0.28);
}

.modale-confirmation__entete {
  display: grid;
  grid-template-columns: auto 1fr auto;
  gap: 0.9rem;
  align-items: start;
}

.modale-confirmation__icone {
  display: grid;
  width: 3.15rem;
  height: 3.15rem;
  place-items: center;
  border-radius: 0.85rem;
  background: var(--couleur-principale);
  color: #ffffff;
  box-shadow: 0 12px 24px rgba(45, 95, 159, 0.22);
}

.modale-confirmation__entete span,
.resume-confirmation span {
  color: var(--couleur-texte-douce);
  font-size: 0.72rem;
  font-weight: 900;
  letter-spacing: 0.08em;
  text-transform: uppercase;
}

.modale-confirmation__entete h3 {
  margin: 0.18rem 0 0.28rem;
  color: var(--couleur-encre);
  font-size: 1.35rem;
}

.modale-confirmation__entete p {
  margin: 0;
  color: var(--couleur-texte-douce);
  line-height: 1.55;
}

.bouton-fermeture {
  display: grid;
  width: 2.35rem;
  height: 2.35rem;
  place-items: center;
  border: 1px solid var(--couleur-bordure);
  border-radius: 0.65rem;
  background: #ffffff;
  color: var(--couleur-texte-douce);
  cursor: pointer;
}

.resume-confirmation {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 0.7rem;
}

.resume-confirmation article {
  display: grid;
  gap: 0.3rem;
  padding: 0.85rem;
  border: 1px solid var(--couleur-bordure);
  border-radius: 0.8rem;
  background: #fbfcfe;
}

.resume-confirmation strong {
  color: var(--couleur-encre);
  font-size: 1.25rem;
}

.avertissement-confirmation {
  display: flex;
  align-items: flex-start;
  gap: 0.6rem;
  padding: 0.85rem;
  border: 1px solid rgba(229, 163, 36, 0.3);
  border-radius: 0.8rem;
  background: rgba(229, 163, 36, 0.12);
  color: #8a5700;
  font-weight: 850;
}

.avertissement-confirmation svg {
  flex: 0 0 auto;
}

.modale-confirmation__actions {
  display: flex;
  justify-content: flex-end;
  gap: 0.65rem;
}

@keyframes rotation {
  to {
    transform: rotate(360deg);
  }
}

@media (max-width: 1180px) {
  .indicateurs,
  .carte-parcours,
  .grille-maintenance {
    grid-template-columns: 1fr;
  }

  .carte-tableau--large {
    grid-column: span 1;
  }
}

@media (max-width: 760px) {
  .maintenance-hero,
  .barre-outils {
    align-items: stretch;
    flex-direction: column;
  }

  .maintenance-hero__actions,
  .bouton {
    width: 100%;
  }

  .grille-formulaire,
  .consultation-rapport,
  .liste-mises-a-jour,
  .resume-confirmation,
  .modale-confirmation__entete {
    grid-template-columns: 1fr;
  }

  .modale-confirmation__actions {
    flex-direction: column-reverse;
  }

  .badge-securite {
    justify-content: center;
    white-space: normal;
  }
}
</style>
