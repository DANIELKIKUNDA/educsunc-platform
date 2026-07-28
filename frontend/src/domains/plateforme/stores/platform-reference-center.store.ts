import { computed, reactive } from 'vue';
import { sessionStore } from '../../../shared/auth/session.store';
import { notificationsService } from '../../../services/notifications.service';
import { ApiError } from '../../../services/api';
import type {
  AjouterLigneVersionReferentielRequest,
  ClasseAcademiqueItem,
  ComparaisonReferentielRequest,
  CreerVersionTravailReferentielRequest,
  LigneDiffMigrationItem,
  MigrationReferentielItem,
  ModifierLigneVersionReferentielRequest,
  ModifierPonderationLigneVersionReferentielRequest,
  OptionEtudeItem,
  PublicationReferentielRequest,
  RapportComparaisonReferentielItem,
  RapportMigrationItem,
  ReordonnerLignesVersionReferentielRequest,
  ReferentielCoursItem,
  ReferentielProgrammeItem,
  SectionScolaireItem,
  VerificationCoherenceVersionReferentielItem,
  VersionReferentielProgrammeItem,
} from '../../academique/models/academique.model';
import {
  mapperClassesAcademiques,
  mapperOptionsEtudes,
  mapperReferentielsProgrammes,
  mapperSectionsScolaires,
} from '../mappers/platform-reference.mapper';
import {
  lireContexteApiReferentielOfficielPlateforme,
  platformOfficialReferenceApi,
} from '../services/platform-official-reference.api';

export type PlatformReferenceTab =
  | 'socle'
  | 'cours'
  | 'referentiels'
  | 'comparaisons'
  | 'migrations';

export type PlatformReferenceFamily = 'sections' | 'classes' | 'options';
export type PlatformReferenceImportType =
  | 'sections'
  | 'options'
  | 'classes'
  | 'cours'
  | 'programmes'
  | 'lignes';

interface PlatformReferenceCenterState {
  bootStatus: 'idle' | 'loading' | 'ready' | 'error';
  bootErrorMessage: string | null;
  actionStatus: 'idle' | 'loading' | 'ready' | 'error';
  actionErrorMessage: string | null;
  activeTab: PlatformReferenceTab;
  activeFamily: PlatformReferenceFamily;
  sections: SectionScolaireItem[];
  classesAcademiques: ClasseAcademiqueItem[];
  optionsEtudes: OptionEtudeItem[];
  cours: ReferentielCoursItem[];
  referentiels: ReferentielProgrammeItem[];
  detailReferentiel: ReferentielProgrammeItem | null;
  selectedReferentielId: string | null;
  selectedVersionId: string | null;
  comparisonReport: RapportComparaisonReferentielItem | null;
  migrations: MigrationReferentielItem[];
  migrationReport: RapportMigrationItem | null;
  importResult: Record<string, unknown> | null;
  publishedVersion: VersionReferentielProgrammeItem | null;
  activatedVersion: VersionReferentielProgrammeItem | null;
  coherenceReport: VerificationCoherenceVersionReferentielItem | null;
}

const PLATFORM_REFERENCE_PAGE_SIZE = 200;

const state = reactive<PlatformReferenceCenterState>({
  bootStatus: 'idle',
  bootErrorMessage: null,
  actionStatus: 'idle',
  actionErrorMessage: null,
  activeTab: 'socle',
  activeFamily: 'sections',
  sections: [],
  classesAcademiques: [],
  optionsEtudes: [],
  cours: [],
  referentiels: [],
  detailReferentiel: null,
  selectedReferentielId: null,
  selectedVersionId: null,
  comparisonReport: null,
  migrations: [],
  migrationReport: null,
  importResult: null,
  publishedVersion: null,
  activatedVersion: null,
  coherenceReport: null,
});

const importPaths: Record<PlatformReferenceImportType, string> = {
  sections: '/api/referentiels/import-sections',
  options: '/api/referentiels/import-options',
  classes: '/api/referentiels/import-classes',
  cours: '/api/referentiels/import-cours',
  programmes: '/api/referentiels/import-programmes',
  lignes: '/api/referentiels/import-lignes',
};

function lireMessageErreur(error: unknown, fallbackMessage: string): string {
  if (error instanceof ApiError && error.status === 403) {
    if (error.code === 'MODULE_INACTIF') {
      return 'Le module requis n est pas actif pour le contexte selectionne.';
    }

    if (
      error.code === 'PERMISSION_DENIED'
      || error.code?.endsWith('_PERMISSION_DENIED')
      || error.code === 'REFERENTIEL_FORBIDDEN'
    ) {
      return 'Vous n etes pas autorise a effectuer cette action.';
    }

    return 'Une action demandee n a pas pu etre terminee.';
  }

  if (!(error instanceof Error)) {
    return fallbackMessage;
  }

  const message = error.message.trim();
  if (message.length === 0) {
    return fallbackMessage;
  }

  if (/failed to fetch/i.test(message) || /networkerror/i.test(message)) {
    return 'Impossible de joindre le service pour le moment. Veuillez reessayer.';
  }

  if (/module_inactif/i.test(message) || /module .* n'est pas actif/i.test(message)) {
    return 'Le module requis n est pas actif pour le contexte selectionne.';
  }

  return message.replace(/^error:\s*/i, '');
}

function trierCours(items: ReferentielCoursItem[]): ReferentielCoursItem[] {
  return items
    .slice()
    .sort((left, right) =>
      (left.domaine ?? '').localeCompare(right.domaine ?? '', 'fr')
      || (left.sousDomaine ?? '').localeCompare(right.sousDomaine ?? '', 'fr')
      || left.libelle.localeCompare(right.libelle, 'fr')
      || left.code.localeCompare(right.code, 'fr'));
}

async function collecterToutesLesPages<TItem>(
  chargerPage: (pagination: { page: number; taillePage: number }) => Promise<{
    donnees: TItem[];
    pagination?: {
      total: number;
      page: number;
      taillePage: number;
      totalPages: number;
    };
  }>,
): Promise<TItem[]> {
  const premierePage = await chargerPage({ page: 1, taillePage: PLATFORM_REFERENCE_PAGE_SIZE });
  const donnees = [...premierePage.donnees];
  const totalPages = premierePage.pagination?.totalPages ?? 1;

  for (let page = 2; page <= totalPages; page += 1) {
    const response = await chargerPage({ page, taillePage: PLATFORM_REFERENCE_PAGE_SIZE });
    donnees.push(...response.donnees);
  }

  return donnees;
}

async function executerBoot(
  action: () => Promise<void>,
  fallbackMessage: string,
): Promise<void> {
  state.bootStatus = 'loading';
  state.bootErrorMessage = null;

  try {
    await action();
    state.bootStatus = 'ready';
  } catch (error) {
    state.bootStatus = 'error';
    state.bootErrorMessage = lireMessageErreur(error, fallbackMessage);
  }
}

async function executerAction<T>(
  action: () => Promise<T>,
  fallbackMessage: string,
): Promise<T | null> {
  state.actionStatus = 'loading';
  state.actionErrorMessage = null;

  try {
    const result = await action();
    state.actionStatus = 'ready';
    return result;
  } catch (error) {
    state.actionStatus = 'error';
    state.actionErrorMessage = lireMessageErreur(error, fallbackMessage);
    notificationsService.danger('Action impossible', state.actionErrorMessage);
    return null;
  }
}

async function chargerSocle(): Promise<void> {
  const contexte = lireContexteApiReferentielOfficielPlateforme();
  const [sections, classesAcademiques, optionsEtudes] = await Promise.all([
    collecterToutesLesPages((pagination) =>
      platformOfficialReferenceApi.listerSectionsScolaires(contexte, pagination)),
    collecterToutesLesPages((pagination) =>
      platformOfficialReferenceApi.listerClassesAcademiques(contexte, pagination)),
    collecterToutesLesPages((pagination) =>
      platformOfficialReferenceApi.listerOptionsEtudes(contexte, pagination)),
  ]);

  state.sections = mapperSectionsScolaires(sections);
  state.classesAcademiques = mapperClassesAcademiques(classesAcademiques);
  state.optionsEtudes = mapperOptionsEtudes(optionsEtudes);
}

async function chargerCours(): Promise<void> {
  const contexte = lireContexteApiReferentielOfficielPlateforme();
  const cours = await collecterToutesLesPages((pagination) =>
    platformOfficialReferenceApi.listerReferentielsCours(contexte, pagination));
  state.cours = trierCours(cours);
}

async function chargerReferentiels(): Promise<void> {
  const contexte = lireContexteApiReferentielOfficielPlateforme();

  if (state.classesAcademiques.length === 0) {
    await chargerSocle();
  }

  const responses = await Promise.all(
    state.classesAcademiques.map((classe) =>
      collecterToutesLesPages((pagination) =>
        platformOfficialReferenceApi.listerReferentielsProgrammes(classe.id, contexte, pagination)),
    ),
  );

  state.referentiels = mapperReferentielsProgrammes(
    responses.flatMap((response) => response),
  );
}

async function chargerCentre(): Promise<void> {
  await executerBoot(async () => {
    await Promise.all([chargerSocle(), chargerCours()]);
    await chargerReferentiels();
  }, 'Le centre referentiel officiel est indisponible.');
}

async function rechargerCentre(): Promise<void> {
  await chargerCentre();
}

async function ouvrirReferentiel(idReferentielProgramme: string): Promise<void> {
  const result = await executerAction(async () => {
    const contexte = lireContexteApiReferentielOfficielPlateforme();
    return platformOfficialReferenceApi.consulterReferentielProgramme(idReferentielProgramme, contexte);
  }, 'Le detail du referentiel est indisponible.');

  if (!result) {
    return;
  }

  state.detailReferentiel = result.donnee;
  state.selectedReferentielId = result.donnee.id;
  const versionSelectionneeExiste = result.donnee.versions.some(
    (version) => version.id === state.selectedVersionId,
  );
  state.selectedVersionId = versionSelectionneeExiste
    ? state.selectedVersionId
    : result.donnee.versionProjectionnee?.id ?? result.donnee.versions[0]?.id ?? null;
}

async function creerSectionScolaire(demande: {
  code: string;
  libelle: string;
  ordreAffichage: number;
}): Promise<void> {
  const result = await executerAction(async () => {
    const contexte = lireContexteApiReferentielOfficielPlateforme();
    return platformOfficialReferenceApi.creerSectionScolaire(
      {
        ...demande,
        creePar: contexte.utilisateurId ?? sessionStore.state.userId,
      },
      contexte,
    );
  }, 'La creation de la section scolaire a echoue.');

  if (!result) {
    return;
  }

  notificationsService.succes(
    'Section creee',
    `${result.donnee.libelle} a ete ajoutee au socle officiel.`,
  );
  await chargerSocle();
  state.activeFamily = 'sections';
}

async function creerClasseAcademique(demande: {
  idSectionScolaire: string;
  code: string;
  libelle: string;
  ordrePedagogique: number;
  cycle: string;
  accepteOptions: boolean;
  optionObligatoire: boolean;
  typeStructureEvaluation: string;
  idOptionEtude?: string;
  estClasseTENASOSP?: boolean;
  estClasseEXETAT?: boolean;
  estClasseFinaliste?: boolean;
}): Promise<void> {
  const result = await executerAction(async () => {
    const contexte = lireContexteApiReferentielOfficielPlateforme();
    return platformOfficialReferenceApi.creerClasseAcademique(
      {
        ...demande,
        creePar: contexte.utilisateurId ?? sessionStore.state.userId,
      },
      contexte,
    );
  }, 'La creation de la classe academique a echoue.');

  if (!result) {
    return;
  }

  notificationsService.succes(
    'Classe academique creee',
    `${result.donnee.libelle} a ete ajoutee au socle officiel.`,
  );
  await Promise.all([chargerSocle(), chargerReferentiels()]);
  state.activeFamily = 'classes';
}

async function creerOptionEtude(demande: {
  code: number;
  libelle: string;
  typeOption?: string;
  estTechnique: boolean;
  categorieTechnique?: 'GROUPE_1' | 'GROUPE_2' | null;
  abreviation?: string;
  ordreAffichage?: number;
}): Promise<void> {
  const result = await executerAction(async () => {
    const contexte = lireContexteApiReferentielOfficielPlateforme();
    return platformOfficialReferenceApi.creerOptionEtude(
      {
        ...demande,
        creePar: contexte.utilisateurId ?? sessionStore.state.userId,
      },
      contexte,
    );
  }, 'La creation de l option d etude a echoue.');

  if (!result) {
    return;
  }

  notificationsService.succes(
    'Option creee',
    `${result.donnee.libelle} a ete ajoutee au socle officiel.`,
  );
  await Promise.all([chargerSocle(), chargerReferentiels()]);
  state.activeFamily = 'options';
}

async function publierVersion(demande: PublicationReferentielRequest): Promise<void> {
  const result = await executerAction(async () => {
    const contexte = lireContexteApiReferentielOfficielPlateforme();
    return platformOfficialReferenceApi.publierVersionReferentiel(demande, contexte);
  }, 'La publication a echoue.');

  if (!result) {
    return;
  }

  state.publishedVersion = result.donnee;
  notificationsService.succes(
    'Version publiee',
    `La version ${result.donnee.codeVersion} a ete publiee avec succes.`,
  );
  await Promise.all([chargerReferentiels(), ouvrirReferentiel(demande.idReferentielProgramme)]);
}

async function creerVersionTravailReferentiel(
  idReferentielProgramme: string,
  demande: CreerVersionTravailReferentielRequest,
): Promise<void> {
  const result = await executerAction(async () => {
    const contexte = lireContexteApiReferentielOfficielPlateforme();
    return platformOfficialReferenceApi.creerVersionTravailReferentiel(
      idReferentielProgramme,
      demande,
      contexte,
    );
  }, 'La creation de la version de travail a echoue.');

  if (!result) {
    return;
  }

  state.selectedVersionId = result.donnee.id;
  notificationsService.succes(
    'Version de travail creee',
    `La version ${result.donnee.codeVersion} est prete pour edition.`,
  );
  await Promise.all([chargerReferentiels(), ouvrirReferentiel(idReferentielProgramme)]);
}

async function ajouterLigneVersionReferentiel(
  idVersionReferentielProgramme: string,
  demande: AjouterLigneVersionReferentielRequest,
): Promise<void> {
  const result = await executerAction(async () => {
    const contexte = lireContexteApiReferentielOfficielPlateforme();
    return platformOfficialReferenceApi.ajouterLigneVersionReferentiel(
      idVersionReferentielProgramme,
      demande,
      contexte,
    );
  }, 'L ajout de la ligne a echoue.');

  if (!result) {
    return;
  }

  state.selectedVersionId = result.donnee.id;
  notificationsService.succes(
    'Ligne ajoutee',
    'La ligne a ete ajoutee a la version de travail.',
  );

  if (state.selectedReferentielId) {
    await Promise.all([chargerReferentiels(), ouvrirReferentiel(state.selectedReferentielId)]);
  }
}

async function modifierLigneVersionReferentiel(
  idVersionReferentielProgramme: string,
  idLigneReferentielProgramme: string,
  demande: ModifierLigneVersionReferentielRequest,
): Promise<void> {
  const result = await executerAction(async () => {
    const contexte = lireContexteApiReferentielOfficielPlateforme();
    return platformOfficialReferenceApi.modifierLigneVersionReferentiel(
      idVersionReferentielProgramme,
      idLigneReferentielProgramme,
      demande,
      contexte,
    );
  }, 'La mise a jour de la ligne a echoue.');

  if (!result) {
    return;
  }

  state.selectedVersionId = result.donnee.id;
  notificationsService.succes(
    'Ligne mise a jour',
    'La ligne du programme a ete mise a jour.',
  );

  if (state.selectedReferentielId) {
    await Promise.all([chargerReferentiels(), ouvrirReferentiel(state.selectedReferentielId)]);
  }
}

async function retirerLigneVersionReferentiel(
  idVersionReferentielProgramme: string,
  idLigneReferentielProgramme: string,
): Promise<void> {
  const result = await executerAction(async () => {
    const contexte = lireContexteApiReferentielOfficielPlateforme();
    return platformOfficialReferenceApi.retirerLigneVersionReferentiel(
      idVersionReferentielProgramme,
      idLigneReferentielProgramme,
      contexte,
    );
  }, 'Le retrait de la ligne a echoue.');

  if (!result) {
    return;
  }

  state.selectedVersionId = result.donnee.id;
  notificationsService.info(
    'Ligne retiree',
    'La ligne a ete retiree de la version de travail.',
  );

  if (state.selectedReferentielId) {
    await Promise.all([chargerReferentiels(), ouvrirReferentiel(state.selectedReferentielId)]);
  }
}

async function reordonnerLignesVersionReferentiel(
  idVersionReferentielProgramme: string,
  demande: ReordonnerLignesVersionReferentielRequest,
): Promise<void> {
  const result = await executerAction(async () => {
    const contexte = lireContexteApiReferentielOfficielPlateforme();
    return platformOfficialReferenceApi.reordonnerLignesVersionReferentiel(
      idVersionReferentielProgramme,
      demande,
      contexte,
    );
  }, 'Le reordonnancement des lignes a echoue.');

  if (!result) {
    return;
  }

  state.selectedVersionId = result.donnee.id;
  notificationsService.succes(
    'Ordre mis a jour',
    'Les lignes du programme ont ete reordonnees avec succes.',
  );

  if (state.selectedReferentielId) {
    await Promise.all([chargerReferentiels(), ouvrirReferentiel(state.selectedReferentielId)]);
  }
}

async function modifierPonderationLigneVersionReferentiel(
  idVersionReferentielProgramme: string,
  idLigneReferentielProgramme: string,
  demande: ModifierPonderationLigneVersionReferentielRequest,
): Promise<void> {
  const result = await executerAction(async () => {
    const contexte = lireContexteApiReferentielOfficielPlateforme();
    return platformOfficialReferenceApi.modifierPonderationLigneVersionReferentiel(
      idVersionReferentielProgramme,
      idLigneReferentielProgramme,
      demande,
      contexte,
    );
  }, 'La mise a jour des ponderations a echoue.');

  if (!result) {
    return;
  }

  state.selectedVersionId = result.donnee.id;
  notificationsService.succes(
    'Ponderations mises a jour',
    'Les ponderations officielles ont ete enregistrees.',
  );

  if (state.selectedReferentielId) {
    await Promise.all([chargerReferentiels(), ouvrirReferentiel(state.selectedReferentielId)]);
  }
}

async function verifierCoherenceVersionReferentiel(
  idVersionReferentielProgramme: string,
): Promise<void> {
  const result = await executerAction(async () => {
    const contexte = lireContexteApiReferentielOfficielPlateforme();
    return platformOfficialReferenceApi.verifierCoherenceVersionReferentiel(
      idVersionReferentielProgramme,
      contexte,
    );
  }, 'La verification de coherence a echoue.');

  if (!result) {
    return;
  }

  state.coherenceReport = result.donnee;
  state.selectedVersionId = result.donnee.versionReferentielProgramme.id;
  notificationsService.succes(
    result.donnee.estCoherente ? 'Version coherente' : 'Verification terminee',
    result.donnee.estCoherente
      ? 'La version peut poursuivre son cycle de publication.'
      : 'Des points de controle doivent etre verifies avant publication.',
  );

  if (state.selectedReferentielId) {
    await Promise.all([chargerReferentiels(), ouvrirReferentiel(state.selectedReferentielId)]);
  }
}

async function activerVersion(idVersionReferentielProgramme: string): Promise<void> {
  const result = await executerAction(async () => {
    const contexte = lireContexteApiReferentielOfficielPlateforme();
    return platformOfficialReferenceApi.activerVersionReferentiel(idVersionReferentielProgramme, contexte);
  }, 'L activation a echoue.');

  if (!result) {
    return;
  }

  state.activatedVersion = result.donnee;
  state.selectedVersionId = result.donnee.id;
  notificationsService.succes(
    'Version activee',
    `La version ${result.donnee.codeVersion} est maintenant active.`,
  );
  await chargerReferentiels();

  if (state.selectedReferentielId) {
    await ouvrirReferentiel(state.selectedReferentielId);
  }
}

async function importerComposante(
  typeImport: PlatformReferenceImportType,
  corps: Record<string, unknown>,
): Promise<void> {
  const result = await executerAction(async () => {
    const contexte = lireContexteApiReferentielOfficielPlateforme();
    return platformOfficialReferenceApi.importerReferentiel(importPaths[typeImport], corps, contexte);
  }, 'L import de la composante officielle a echoue.');

  if (!result) {
    return;
  }

  state.importResult = result.donnee;
  notificationsService.succes(
    'Import termine',
    `La composante ${typeImport} a ete importee avec succes.`,
  );

  if (typeImport === 'cours') {
    await chargerCours();
  } else if (typeImport === 'programmes' || typeImport === 'lignes' || typeImport === 'classes') {
    await Promise.all([chargerSocle(), chargerReferentiels()]);
  } else {
    await chargerSocle();
  }
}

async function comparerVersions(demande: ComparaisonReferentielRequest): Promise<void> {
  const result = await executerAction(async () => {
    const contexte = lireContexteApiReferentielOfficielPlateforme();
    return platformOfficialReferenceApi.comparerVersionsReferentiel(demande, contexte);
  }, 'La comparaison a echoue.');

  if (!result) {
    return;
  }

  state.comparisonReport = result.donnee;
  notificationsService.succes(
    'Comparaison terminee',
    `Les versions ${demande.versionReferentielSource} et ${demande.versionReferentielCible} ont ete comparees.`,
    { duree: 3500 },
  );
}

async function chargerMigrations(idProgrammeNiveau: string): Promise<void> {
  const result = await executerAction(async () => {
    const contexte = lireContexteApiReferentielOfficielPlateforme();
    const donnees = await collecterToutesLesPages((pagination) =>
      platformOfficialReferenceApi.listerMigrationsReferentiel(idProgrammeNiveau, contexte, pagination));
    return { donnees };
  }, 'La lecture des migrations a echoue.');

  if (!result) {
    return;
  }

  state.migrations = result.donnees;
}

async function analyserMigration(demande: {
  idProgrammeNiveau: string;
  idAncienneVersionReferentiel: string;
  idNouvelleVersionReferentiel: string;
}): Promise<void> {
  const result = await executerAction(async () => {
    const contexte = lireContexteApiReferentielOfficielPlateforme();
    return platformOfficialReferenceApi.analyserMigrationReferentiel(demande, contexte);
  }, 'L analyse de migration a echoue.');

  if (!result) {
    return;
  }

  state.migrationReport = result.donnee;
  notificationsService.succes(
    'Migration analysee',
    'Le rapport de migration est pret a etre consulte.',
  );
  await chargerMigrations(demande.idProgrammeNiveau);
}

async function consulterMigration(idMigrationReferentielProgramme: string): Promise<void> {
  const result = await executerAction(async () => {
    const contexte = lireContexteApiReferentielOfficielPlateforme();
    return platformOfficialReferenceApi.consulterMigrationReferentiel(idMigrationReferentielProgramme, contexte);
  }, 'Le rapport de migration est indisponible.');

  if (!result) {
    return;
  }

  state.migrationReport = result.donnee;
}

async function appliquerMigration(idMigrationReferentielProgramme: string): Promise<void> {
  const result = await executerAction(async () => {
    const contexte = lireContexteApiReferentielOfficielPlateforme();
    return platformOfficialReferenceApi.appliquerMigrationReferentiel({ idMigrationReferentielProgramme }, contexte);
  }, 'L application de migration a echoue.');

  if (!result) {
    return;
  }

  state.migrationReport = result.donnee.migrationReferentielProgramme
    ? {
      migrationReferentielProgramme: result.donnee.migrationReferentielProgramme,
      totalDifferences: result.donnee.migrationReferentielProgramme.lignesDiffMigration.length,
      totalTransformationsNotes: result.donnee.migrationReferentielProgramme.transformationsNotes.length,
    }
    : state.migrationReport;
  notificationsService.succes(
    'Migration appliquee',
    'La migration referentielle a ete appliquee avec succes.',
  );
}

async function annulerMigration(idMigrationReferentielProgramme: string): Promise<void> {
  const result = await executerAction(async () => {
    const contexte = lireContexteApiReferentielOfficielPlateforme();
    return platformOfficialReferenceApi.annulerMigrationReferentiel(idMigrationReferentielProgramme, contexte);
  }, 'L annulation de migration a echoue.');

  if (!result) {
    return;
  }

  state.migrations = state.migrations.map((migration) =>
    (migration.id === result.donnee.id ? result.donnee : migration));
  notificationsService.info(
    'Migration annulee',
    'La migration selectionnee a ete annulee.',
  );
}

async function relancerMigration(idMigrationReferentielProgramme: string): Promise<void> {
  const result = await executerAction(async () => {
    const contexte = lireContexteApiReferentielOfficielPlateforme();
    return platformOfficialReferenceApi.relancerRecalculMigration(idMigrationReferentielProgramme, contexte);
  }, 'La relance du recalcul a echoue.');

  if (!result) {
    return;
  }

  state.migrations = state.migrations.map((migration) =>
    (migration.id === result.donnee.id ? result.donnee : migration));
  notificationsService.info(
    'Recalcul relance',
    'La relance du recalcul post-migration a ete prise en compte.',
  );
}

function definirOnglet(tab: PlatformReferenceTab): void {
  state.activeTab = tab;
}

function definirFamille(family: PlatformReferenceFamily): void {
  state.activeFamily = family;
}

function selectionnerVersion(versionId: string | null): void {
  state.selectedVersionId = versionId;
}

const versionsDisponibles = computed(() => {
  const allVersions = state.referentiels.flatMap((referentiel) => referentiel.versions ?? []);
  const detailVersions = state.detailReferentiel?.versions ?? [];

  return [...allVersions, ...detailVersions].filter(
    (version, index, items) => items.findIndex((candidate) => candidate.id === version.id) === index,
  );
});

const statistiquesGlobales = computed(() => ({
  sections: state.sections.length,
  classesAcademiques: state.classesAcademiques.length,
  optionsEtudes: state.optionsEtudes.length,
  cours: state.cours.length,
  referentiels: state.referentiels.length,
  versionsActives: versionsDisponibles.value.filter((version) => version.active).length,
  migrations: state.migrations.length,
}));

const differencesComparaison = computed<LigneDiffMigrationItem[]>(
  () => state.comparisonReport?.differences ?? [],
);

function reinitialiser(): void {
  state.bootStatus = 'idle';
  state.bootErrorMessage = null;
  state.actionStatus = 'idle';
  state.actionErrorMessage = null;
  state.activeTab = 'socle';
  state.activeFamily = 'sections';
  state.sections = [];
  state.classesAcademiques = [];
  state.optionsEtudes = [];
  state.cours = [];
  state.referentiels = [];
  state.detailReferentiel = null;
  state.selectedReferentielId = null;
  state.selectedVersionId = null;
  state.comparisonReport = null;
  state.migrations = [];
  state.migrationReport = null;
  state.importResult = null;
  state.publishedVersion = null;
  state.activatedVersion = null;
  state.coherenceReport = null;
}

export function usePlatformReferenceCenterStore() {
  return {
    state,
    versionsDisponibles,
    statistiquesGlobales,
    differencesComparaison,
    chargerCentre,
    rechargerCentre,
    ouvrirReferentiel,
    creerSectionScolaire,
    creerClasseAcademique,
    creerOptionEtude,
    creerVersionTravailReferentiel,
    ajouterLigneVersionReferentiel,
    modifierLigneVersionReferentiel,
    retirerLigneVersionReferentiel,
    reordonnerLignesVersionReferentiel,
    modifierPonderationLigneVersionReferentiel,
    verifierCoherenceVersionReferentiel,
    publierVersion,
    activerVersion,
    importerComposante,
    comparerVersions,
    chargerMigrations,
    analyserMigration,
    consulterMigration,
    appliquerMigration,
    annulerMigration,
    relancerMigration,
    definirOnglet,
    definirFamille,
    selectionnerVersion,
    reinitialiser,
  };
}
