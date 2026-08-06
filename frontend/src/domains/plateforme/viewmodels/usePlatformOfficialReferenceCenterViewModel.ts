import {
  computed,
  inject,
  onMounted,
  proxyRefs,
  provide,
  reactive,
  ref,
  watch,
  type Component,
  type ComputedRef,
  type InjectionKey,
  type Ref,
} from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  ArrowRightLeft,
  BookOpenText,
  CircleCheckBig,
  Download,
  FileStack,
  FolderTree,
  GitCompareArrows,
  GraduationCap,
  LibraryBig,
  ListChecks,
} from 'lucide-vue-next';
import type {
  AjouterLigneVersionReferentielRequest,
  ClasseAcademiqueItem,
  CreerVersionTravailReferentielRequest,
  LigneDiffMigrationItem,
  MigrationReferentielItem,
  ModifierLigneVersionReferentielRequest,
  ModifierPonderationLigneVersionReferentielRequest,
  OptionEtudeItem,
  SectionScolaireItem,
  VersionReferentielProgrammeItem,
} from '../../academique/models/academique.model';
import { activeContextStore } from '../../../shared/session/active-context.store';
import { sessionStore } from '../../../shared/auth/session.store';
import { notificationsService } from '../../../services/notifications.service';
import { useDoctrineAccess } from '../../../shared/doctrine/use-doctrine-access';
import {
  usePlatformReferenceCenterStore,
  type PlatformReferenceFamily,
  type PlatformReferenceImportType,
  type PlatformReferenceTab,
} from '../stores/platform-reference-center.store';
import {
  PLATFORM_REFERENCE_IMPORT_DEFINITIONS,
  construireModeleImportJson,
  lireDefinitionImport,
  resumerResultatImport,
  validerImportReferentiel,
  type PlatformReferenceImportValidationResult,
} from '../models/platform-reference-import-assistant';

type ModalState =
  | null
  | 'import'
  | 'publish'
  | 'activate'
  | 'compare'
  | 'migration'
  | 'create-socle';

type ConfirmDialogState = null | {
  title: string;
  message: string;
  confirmLabel: string;
  tone?: 'default' | 'danger';
  closeAfter?: boolean;
  execute: () => Promise<void>;
};

type PaginationState = {
  currentPage: number;
  rowsPerPage: number;
};

function createViewModel() {
  const store = usePlatformReferenceCenterStore();
  const route = useRoute();
  const router = useRouter();
  const doctrineAccess = useDoctrineAccess();
  const session = sessionStore.state;
  const context = activeContextStore.state;

  const modalState = ref<ModalState>(null);
  const selectedSocleId = ref<string | null>(null);
  const selectedCourseId = ref<string | null>(null);
  const selectedDifferenceKey = ref<string | null>(null);
  const searchTerm = ref('');
  const statusFilter = ref<'all' | 'active' | 'inactive'>('all');
  const structureFilter = ref<'all' | 'TRIMESTRIEL' | 'SEMESTRIEL'>('all');
  const classFilter = ref('');
  const programmeNiveauLookup = ref('');

  const importForm = reactive({
    typeImport: 'sections' as PlatformReferenceImportType,
    rawJson: '',
  });
  const importSourceMode = ref<'paste' | 'file'>('paste');
  const importValidationStatus = ref<'idle' | 'loading' | 'ready'>('idle');
  const importWizardStep = ref(1);
  const importFileName = ref('');
  const importExecutionStartedAt = ref<number | null>(null);
  const importExecutionDurationMs = ref<number | null>(null);
  const importLastSummary = ref<ReturnType<typeof resumerResultatImport>>(null);
  const importValidation = ref<PlatformReferenceImportValidationResult | null>(null);
  const soclePagination = reactive<PaginationState>({ currentPage: 1, rowsPerPage: 10 });
  const coursesPagination = reactive<PaginationState>({ currentPage: 1, rowsPerPage: 10 });
  const referentielsPagination = reactive<PaginationState>({ currentPage: 1, rowsPerPage: 10 });
  const migrationsPagination = reactive<PaginationState>({ currentPage: 1, rowsPerPage: 10 });

  const publishForm = reactive({
    idReferentielProgramme: '',
    codeVersion: '',
    anneeReference: '',
    datePublication: '',
    sourceImport: '',
    motifPublication: '',
  });

  const activateForm = reactive({
    idVersionReferentielProgramme: '',
  });

  const compareForm = reactive({
    idClasseAcademique: '',
    versionReferentielSource: '',
    versionReferentielCible: '',
  });

  const migrationForm = reactive({
    idProgrammeNiveau: '',
    idAncienneVersionReferentiel: '',
    idNouvelleVersionReferentiel: '',
  });

  const sectionForm = reactive({
    code: '',
    libelle: '',
    ordreAffichage: 1,
  });

  const classeForm = reactive({
    idSectionScolaire: '',
    code: '',
    libelle: '',
    ordrePedagogique: 1,
    cycle: '',
    accepteOptions: false,
    optionObligatoire: false,
    typeStructureEvaluation: 'TRIMESTRIEL',
    estClasseTENASOSP: false,
    estClasseEXETAT: false,
    estClasseFinaliste: false,
  });

  const optionForm = reactive({
    code: 0,
    abreviation: '',
    libelle: '',
    ordreAffichage: 1,
    estTechnique: false,
    categorieTechnique: null as 'GROUPE_1' | 'GROUPE_2' | null,
  });

  const confirmDialog = ref<ConfirmDialogState>(null);

  const tabs: Array<{ code: PlatformReferenceTab; label: string; icon: Component }> = [
    { code: 'socle', label: 'Socle officiel', icon: FolderTree },
    { code: 'cours', label: 'Cours officiels', icon: BookOpenText },
    { code: 'referentiels', label: 'Referentiels programmes', icon: LibraryBig },
    { code: 'comparaisons', label: 'Comparaisons', icon: GitCompareArrows },
    { code: 'migrations', label: 'Migrations', icon: ArrowRightLeft },
  ];

  const families: Array<{ code: PlatformReferenceFamily; label: string }> = [
    { code: 'sections', label: 'Sections' },
    { code: 'classes', label: 'Classes academiques' },
    { code: 'options', label: 'Options d etudes' },
  ];
  const importSteps = [
    { index: 1, label: 'Composante', icon: FolderTree },
    { index: 2, label: 'Modele', icon: Download },
    { index: 3, label: 'Donnees', icon: FileStack },
    { index: 4, label: 'Validation', icon: CircleCheckBig },
    { index: 5, label: 'Apercu', icon: ListChecks },
    { index: 6, label: 'Confirmation', icon: ArrowRightLeft },
    { index: 7, label: 'Resultat', icon: CircleCheckBig },
  ] as const;

  const canReadCenter = computed(() => doctrineAccess.canAccessPage('PLAT-REF-001'));
  const canPublish = computed(() => doctrineAccess.canAccessPage('PLAT-REF-002'));
  const canActivate = computed(() => doctrineAccess.canAccessPage('PLAT-REF-003'));
  const canImport = computed(() => doctrineAccess.canAccessPage('PLAT-REF-004'));
  const canCompare = computed(() => doctrineAccess.canAccessPage('PLAT-REF-005'));
  const canMigrate = computed(() => doctrineAccess.canAccessPage('PLAT-REF-006'));
  const canMutateCenter = computed(() =>
    canPublish.value || canActivate.value || canImport.value || canMigrate.value,
  );
  const importDefinitions = PLATFORM_REFERENCE_IMPORT_DEFINITIONS;
  const selectedImportDefinition = computed(() => lireDefinitionImport(importForm.typeImport));
  const importExistingState = computed(() => ({
    sections: store.state.sections,
    optionsEtudes: store.state.optionsEtudes,
    classesAcademiques: store.state.classesAcademiques,
    cours: store.state.cours,
    referentiels: store.state.referentiels,
  }));
  const importModelJson = computed(() => construireModeleImportJson(importForm.typeImport));
  const importExampleTitle = computed(() => `Exemple ${selectedImportDefinition.value.label.toLowerCase()}`);
  const importValidationPreview = computed(() => importValidation.value?.preview ?? null);
  const importResultSummary = computed(() =>
    importLastSummary.value
    ?? resumerResultatImport(
      importForm.typeImport,
      store.state.importResult,
      importValidation.value,
      importExecutionDurationMs.value,
    ),
  );
  const importValidationIssues = computed(() => {
    const validation = importValidation.value;
    if (!validation) {
      return [];
    }

    return [
      ...validation.erreurs.map((message) => ({ niveau: 'erreur' as const, message })),
      ...validation.avertissements.map((message) => ({ niveau: 'avertissement' as const, message })),
    ];
  });
  const importBlockingMessage = computed(() => {
    if (!importForm.typeImport) {
      return 'Choisissez d abord la composante a importer.';
    }
    if (!importForm.rawJson.trim()) {
      return 'Ajoutez un contenu JSON avant de poursuivre.';
    }
    if (importValidationStatus.value === 'loading') {
      return 'La validation est encore en cours.';
    }
    if (!importValidation.value) {
      return 'Validez le contenu avant l import final.';
    }
    if (!importValidation.value.estValide) {
      return 'Corrigez les erreurs detectees avant de confirmer l import.';
    }
    return null;
  });

  const latestPublishedVersion = computed(() =>
    store.versionsDisponibles.value
      .slice()
      .sort((left, right) =>
        new Date(right.datePublication).getTime() - new Date(left.datePublication).getTime())
      .at(0) ?? null,
  );

  const pendingMigrationsCount = computed(() =>
    store.state.migrations.filter((entry) => !/APPLIQUEE|ANNULEE/i.test(entry.statut)).length,
  );

  const centerOverviewCards = computed(() => [
    {
      label: 'Version active',
      value: store.statistiquesGlobales.value.versionsActives > 0
        ? `${store.statistiquesGlobales.value.versionsActives} version${store.statistiquesGlobales.value.versionsActives > 1 ? 's' : ''}`
        : 'Non renseigne',
      hint: latestPublishedVersion.value?.codeVersion
        ? `Version la plus recente : ${latestPublishedVersion.value.codeVersion}`
        : 'Aucune version officielle active pour le moment.',
    },
    {
      label: 'Derniere publication',
      value: latestPublishedVersion.value?.codeVersion ?? 'Non renseigne',
      hint: latestPublishedVersion.value?.datePublication
        ? `Publiee le ${formatDate(latestPublishedVersion.value.datePublication)}`
        : 'Aucune publication recente disponible.',
    },
    {
      label: 'Dernier import',
      value: store.state.importResult ? 'Effectue dans cette session' : 'Non renseigne',
      hint: store.state.importResult
        ? 'Les donnees importees sont deja disponibles dans le centre.'
        : 'Aucun import recent n est visible dans cette session.',
    },
    {
      label: 'Migrations a suivre',
      value: pendingMigrationsCount.value,
      hint: pendingMigrationsCount.value > 0
        ? `${pendingMigrationsCount.value} migration${pendingMigrationsCount.value > 1 ? 's' : ''} demande${pendingMigrationsCount.value > 1 ? 'nt' : ''} une verification.`
        : 'Aucune migration en attente de suivi.',
    },
  ]);

  const summaryCards = computed(() => [
    {
      code: 'sections',
      icon: FolderTree,
      label: 'Sections',
      value: store.statistiquesGlobales.value.sections,
      hint: `${store.state.sections.filter((entry) => !entry.active).length} inactives`,
      tone: 'primary' as const,
    },
    {
      code: 'classes',
      icon: GraduationCap,
      label: 'Classes academiques',
      value: store.statistiquesGlobales.value.classesAcademiques,
      hint: `${store.state.classesAcademiques.filter((entry) => entry.estClasseFinaliste).length} finalistes`,
      tone: 'success' as const,
    },
    {
      code: 'options',
      icon: LibraryBig,
      label: 'Options',
      value: store.statistiquesGlobales.value.optionsEtudes,
      hint: `${store.state.optionsEtudes.filter((entry) => entry.estTechnique).length} techniques`,
      tone: 'warning' as const,
    },
    {
      code: 'cours',
      icon: BookOpenText,
      label: 'Cours officiels',
      value: store.statistiquesGlobales.value.cours,
      hint: `${store.state.cours.filter((entry) => entry.domaine).length} avec domaine`,
      tone: 'primary' as const,
    },
    {
      code: 'referentiels',
      icon: FileStack,
      label: 'Referentiels',
      value: store.statistiquesGlobales.value.referentiels,
      hint: `${store.state.referentiels.filter((entry) => entry.versionProjectionnee !== null).length} exposes`,
      tone: 'neutral' as const,
    },
    {
      code: 'versions',
      icon: CircleCheckBig,
      label: 'Versions actives',
      value: store.statistiquesGlobales.value.versionsActives,
      hint: 'Versions projetees actuellement actives',
      tone: 'success' as const,
    },
    {
      code: 'migrations',
      icon: ListChecks,
      label: 'Migrations',
      value: store.statistiquesGlobales.value.migrations,
      hint: `${store.state.migrations.filter((entry) => entry.statut === 'ANALYSEE').length} analysees`,
      tone: 'warning' as const,
    },
  ]);

  const socleTitle = computed(() => {
    switch (store.state.activeFamily) {
      case 'classes':
        return 'Socle officiel · Classes academiques';
      case 'options':
        return 'Socle officiel · Options d etudes';
      default:
        return 'Socle officiel · Sections scolaires';
    }
  });

  const currentSocleRows = computed<Array<SectionScolaireItem | ClasseAcademiqueItem | OptionEtudeItem>>(() => {
    const term = searchTerm.value.trim().toLowerCase();
    const matches = (value: string | number | undefined | null) =>
      String(value ?? '').toLowerCase().includes(term);

    if (store.state.activeFamily === 'classes') {
      return store.state.classesAcademiques.filter((entry) => {
        const statusOk = statusFilter.value === 'all'
          || (statusFilter.value === 'active' ? entry.active : !entry.active);
        const structureOk = structureFilter.value === 'all' || entry.typeStructureEvaluation === structureFilter.value;
        const searchOk = term.length === 0
          || matches(entry.code)
          || matches(entry.libelle)
          || matches(readSectionLabel(entry.idSectionScolaire))
          || matches(entry.cycle);
        return statusOk && structureOk && searchOk;
      });
    }

    if (store.state.activeFamily === 'options') {
      return store.state.optionsEtudes.filter((entry) => {
        const statusOk = statusFilter.value === 'all'
          || (statusFilter.value === 'active' ? entry.active : !entry.active);
        const searchOk = term.length === 0
          || matches(entry.code)
          || matches(entry.abreviation)
          || matches(entry.libelle)
          || matches(entry.categorieTechnique);
        return statusOk && searchOk;
      });
    }

    return store.state.sections.filter((entry) => {
      const statusOk = statusFilter.value === 'all'
        || (statusFilter.value === 'active' ? entry.active : !entry.active);
      const searchOk = term.length === 0
        || matches(entry.code)
        || matches(entry.libelle);
      return statusOk && searchOk;
    });
  });
  const socleTotalPages = computed(() =>
    Math.max(1, Math.ceil(currentSocleRows.value.length / soclePagination.rowsPerPage)),
  );
  const paginatedSocleRows = computed(() => {
    const visibleCount = soclePagination.currentPage * soclePagination.rowsPerPage;
    return currentSocleRows.value.slice(0, visibleCount);
  });
  const soclePaginationStart = computed(() =>
    currentSocleRows.value.length === 0
      ? 0
      : ((soclePagination.currentPage - 1) * soclePagination.rowsPerPage) + 1,
  );
  const soclePaginationEnd = computed(() =>
    paginatedSocleRows.value.length,
  );

  const selectedSocleRow = computed(() =>
    currentSocleRows.value.find((entry) => entry.id === selectedSocleId.value)
    ?? currentSocleRows.value[0]
    ?? null,
  );

  const selectedSocleTitle = computed(() => {
    const row = selectedSocleRow.value;
    return row ? row.libelle : 'Aucune selection pour le moment';
  });

  const selectedSocleDetails = computed(() => {
    const row = selectedSocleRow.value;
    if (!row) {
      return [];
    }

    if ('ordrePedagogique' in row) {
      return [
        { label: 'Code', value: row.code },
        { label: 'Section', value: readSectionLabel(row.idSectionScolaire) },
        { label: 'Cycle', value: row.cycle },
        { label: 'Structure', value: row.typeStructureEvaluation },
        { label: 'Finaliste', value: row.estClasseFinaliste ? 'Oui' : 'Non' },
        { label: 'Option', value: row.idOptionEtude ? readOptionLabel(row.idOptionEtude) : 'Sans option' },
      ];
    }

    if ('estTechnique' in row) {
      return [
        { label: 'Code', value: row.code },
        { label: 'Abreviation', value: row.abreviation ?? 'Sans abreviation' },
        { label: 'Technique', value: row.estTechnique ? 'Oui' : 'Non' },
        { label: 'Categorie', value: row.categorieTechnique ?? 'Sans categorie' },
        { label: 'Ordre', value: row.ordreAffichage ?? 'Non renseigne' },
        { label: 'Version', value: row.version },
      ];
    }

    return [
      { label: 'Code', value: row.code },
      { label: 'Libelle', value: row.libelle },
      { label: 'Ordre', value: row.ordreAffichage },
      { label: 'Version', value: row.version },
      { label: 'Cree le', value: formatDate(row.creeLe) },
      { label: 'Modifie le', value: formatDate(row.modifieLe ?? row.creeLe) },
    ];
  });

  const socleMeta = computed(() => {
    switch (store.state.activeFamily) {
      case 'classes':
        return {
          totalLabel: 'Classes academiques visibles',
          totalValue: currentSocleRows.value.length,
          totalAvailable: store.state.classesAcademiques.length,
          emptyTitle: 'Aucune classe academique',
          emptyMessage: 'Aucune classe academique ne correspond aux filtres actuels.',
          detailLabel: 'Classe academique',
        };
      case 'options':
        return {
          totalLabel: 'Options visibles',
          totalValue: currentSocleRows.value.length,
          totalAvailable: store.state.optionsEtudes.length,
          emptyTitle: 'Aucune option d etude',
          emptyMessage: 'Aucune option d etude ne correspond aux filtres actuels.',
          detailLabel: 'Option d etude',
        };
      default:
        return {
          totalLabel: 'Sections visibles',
          totalValue: currentSocleRows.value.length,
          totalAvailable: store.state.sections.length,
          emptyTitle: 'Aucune section scolaire',
          emptyMessage: 'Aucune section scolaire ne correspond aux filtres actuels.',
          detailLabel: 'Section scolaire',
        };
    }
  });

  const socleColumns = computed(() => {
    switch (store.state.activeFamily) {
      case 'classes':
        return ['Code', 'Libelle', 'Section', 'Structure', 'Cycle', 'Statut'];
      case 'options':
        return ['Code', 'Abreviation', 'Libelle', 'Type', 'Categorie', 'Statut'];
      default:
        return ['Code', 'Libelle', 'Ordre', 'Statut', 'Version', 'Derniere mutation'];
    }
  });

  const filteredCourses = computed(() => {
    const term = searchTerm.value.trim().toLowerCase();
    return store.state.cours.filter((entry) => {
      const statusOk = statusFilter.value === 'all'
        || (statusFilter.value === 'active' ? entry.actif : !entry.actif);
      const searchOk = term.length === 0
        || entry.code.toLowerCase().includes(term)
        || entry.libelle.toLowerCase().includes(term)
        || (entry.abreviation ?? '').toLowerCase().includes(term)
        || (entry.domaine ?? '').toLowerCase().includes(term)
        || (entry.sousDomaine ?? '').toLowerCase().includes(term);
      return statusOk && searchOk;
    });
  });
  const coursesTotalPages = computed(() =>
    Math.max(1, Math.ceil(filteredCourses.value.length / coursesPagination.rowsPerPage)),
  );
  const paginatedCourses = computed(() => {
    const visibleCount = coursesPagination.currentPage * coursesPagination.rowsPerPage;
    return filteredCourses.value.slice(0, visibleCount);
  });
  const coursesPaginationStart = computed(() =>
    filteredCourses.value.length === 0
      ? 0
      : ((coursesPagination.currentPage - 1) * coursesPagination.rowsPerPage) + 1,
  );
  const coursesPaginationEnd = computed(() =>
    paginatedCourses.value.length,
  );

  const selectedCourse = computed(() =>
    filteredCourses.value.find((entry) => entry.id === selectedCourseId.value)
    ?? filteredCourses.value[0]
    ?? null,
  );

  const selectedCourseDetails = computed(() => {
    if (!selectedCourse.value) {
      return [];
    }

    return [
      { label: 'Code', value: selectedCourse.value.code },
      { label: 'Libelle', value: selectedCourse.value.libelle },
      { label: 'Abreviation', value: selectedCourse.value.abreviation ?? 'Sans abreviation' },
      { label: 'Domaine', value: selectedCourse.value.domaine ?? 'Sans domaine' },
      { label: 'Sous-domaine', value: selectedCourse.value.sousDomaine ?? 'Sans sous-domaine' },
      { label: 'Version', value: selectedCourse.value.version },
    ];
  });

  const coursesMeta = computed(() => ({
    totalLabel: 'Cours visibles',
    totalValue: filteredCourses.value.length,
    totalAvailable: store.state.cours.length,
  }));

  const filteredReferentiels = computed(() => {
    const term = searchTerm.value.trim().toLowerCase();
    return store.state.referentiels.filter((entry) => {
      const statusOk = statusFilter.value === 'all'
        || (statusFilter.value === 'active'
          ? entry.actif || entry.versionProjectionnee?.publiee || false
          : !entry.actif);
      const structureOk = structureFilter.value === 'all' || entry.typeStructureEvaluation === structureFilter.value;
      const classOk = classFilter.value.length === 0 || entry.idClasseAcademique === classFilter.value;
      const classLabel = readClasseLabel(entry.idClasseAcademique).toLowerCase();
      const versionCode = entry.versionProjectionnee?.codeVersion?.toLowerCase() ?? '';
      const searchOk = term.length === 0
        || classLabel.includes(term)
        || versionCode.includes(term)
        || entry.id.toLowerCase().includes(term);
      return statusOk && structureOk && classOk && searchOk;
    });
  });
  const referentielsTotalPages = computed(() =>
    Math.max(1, Math.ceil(filteredReferentiels.value.length / referentielsPagination.rowsPerPage)),
  );
  const paginatedReferentiels = computed(() => {
    const visibleCount = referentielsPagination.currentPage * referentielsPagination.rowsPerPage;
    return filteredReferentiels.value.slice(0, visibleCount);
  });
  const referentielsPaginationStart = computed(() =>
    filteredReferentiels.value.length === 0
      ? 0
      : ((referentielsPagination.currentPage - 1) * referentielsPagination.rowsPerPage) + 1,
  );
  const referentielsPaginationEnd = computed(() =>
    paginatedReferentiels.value.length,
  );

  const selectedReferentiel = computed(() =>
    store.state.detailReferentiel
    ?? filteredReferentiels.value.find((entry) => entry.id === store.state.selectedReferentielId)
    ?? filteredReferentiels.value[0]
    ?? null,
  );

  const selectedReferentielVersions = computed<VersionReferentielProgrammeItem[]>(() =>
    selectedReferentiel.value?.versions ?? [],
  );

  const selectedReferentielVersion = computed<VersionReferentielProgrammeItem | null>(() => {
    if (!selectedReferentiel.value) {
      return null;
    }

    return selectedReferentielVersions.value.find((version) => version.id === store.state.selectedVersionId)
      ?? selectedReferentiel.value.versionProjectionnee
      ?? selectedReferentielVersions.value[0]
      ?? null;
  });

  const canEditSelectedVersion = computed(() => Boolean(
    canPublish.value
    && selectedReferentielVersion.value
    && !selectedReferentielVersion.value.active
    && !selectedReferentielVersion.value.publiee,
  ));

  const referentielsMeta = computed(() => ({
    totalLabel: 'Referentiels visibles',
    totalValue: filteredReferentiels.value.length,
    totalAvailable: store.state.referentiels.length,
  }));

  const comparisonStats = computed(() => {
    const differences = store.differencesComparaison.value;
    const countBy = (pattern: RegExp) =>
      differences.filter((entry) => pattern.test(String(entry.typeDiff ?? ''))).length;
    return {
      total: differences.length,
      added: countBy(/AJOUT|ADDED/i),
      removed: countBy(/SUPPR|RETIR|REMOVED/i),
      reordered: countBy(/ORDRE/i),
      weighted: countBy(/PONDERATION/i),
    };
  });

  const selectedDifference = computed(() =>
    store.differencesComparaison.value.find((entry) => differenceKey(entry) === selectedDifferenceKey.value)
    ?? store.differencesComparaison.value[0]
    ?? null,
  );

  const filteredMigrations = computed(() => {
    const term = searchTerm.value.trim().toLowerCase();
    return store.state.migrations.filter((entry) => {
      const statusOk = statusFilter.value === 'all'
        || (statusFilter.value === 'active'
          ? /ANALYSEE|APPLIQUEE/i.test(entry.statut)
          : /ANNULEE|BROUILLON/i.test(entry.statut));
      const searchOk = term.length === 0
        || entry.id.toLowerCase().includes(term)
        || entry.resumeDiff.toLowerCase().includes(term)
        || entry.statut.toLowerCase().includes(term);
      return statusOk && searchOk;
    });
  });
  const migrationsTotalPages = computed(() =>
    Math.max(1, Math.ceil(filteredMigrations.value.length / migrationsPagination.rowsPerPage)),
  );
  const paginatedMigrations = computed(() => {
    const visibleCount = migrationsPagination.currentPage * migrationsPagination.rowsPerPage;
    return filteredMigrations.value.slice(0, visibleCount);
  });
  const migrationsPaginationStart = computed(() =>
    filteredMigrations.value.length === 0
      ? 0
      : ((migrationsPagination.currentPage - 1) * migrationsPagination.rowsPerPage) + 1,
  );
  const migrationsPaginationEnd = computed(() =>
    paginatedMigrations.value.length,
  );

  const selectedMigration = computed<MigrationReferentielItem | null>(() =>
    store.state.migrationReport?.migrationReferentielProgramme
    ?? filteredMigrations.value[0]
    ?? null,
  );

  const migrationsMeta = computed(() => ({
    totalLabel: 'Migrations visibles',
    totalValue: filteredMigrations.value.length,
    totalAvailable: store.state.migrations.length,
  }));

  const canSubmitImport = computed(() => importBlockingMessage.value === null);
  const canSubmitPublish = computed(() => Boolean(
    publishForm.idReferentielProgramme.trim()
    && publishForm.codeVersion.trim()
    && publishForm.anneeReference.trim()
    && publishForm.datePublication.trim()
    && publishForm.sourceImport.trim(),
  ));
  const canSubmitCompare = computed(() => Boolean(
    compareForm.idClasseAcademique.trim()
    && compareForm.versionReferentielSource.trim()
    && compareForm.versionReferentielCible.trim(),
  ));
  const canSubmitMigration = computed(() => Boolean(
    migrationForm.idProgrammeNiveau.trim()
    && migrationForm.idAncienneVersionReferentiel.trim()
    && migrationForm.idNouvelleVersionReferentiel.trim(),
  ));
  const canSubmitSocleCreation = computed(() => {
    if (store.state.activeFamily === 'sections') {
      return Boolean(sectionForm.code.trim() && sectionForm.libelle.trim() && sectionForm.ordreAffichage > 0);
    }

    if (store.state.activeFamily === 'classes') {
      return Boolean(
        classeForm.idSectionScolaire.trim()
        && classeForm.code.trim()
        && classeForm.libelle.trim()
        && classeForm.ordrePedagogique > 0
        && classeForm.cycle.trim()
        && classeForm.typeStructureEvaluation.trim(),
      );
    }

    return Boolean(optionForm.code > 0 && optionForm.libelle.trim().length > 0);
  });

  const socleCreationTitle = computed(() => {
    switch (store.state.activeFamily) {
      case 'classes':
        return 'Creer une classe academique';
      case 'options':
        return 'Creer une option d etude';
      default:
        return 'Creer une section scolaire';
    }
  });

  function formatDate(value?: string): string {
    if (!value) {
      return 'Non renseigne';
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return new Intl.DateTimeFormat('fr-FR', {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
    }).format(date);
  }

  function shortId(value?: string): string {
    if (!value) {
      return 'Non renseigne';
    }

    return value.length > 12 ? `${value.slice(0, 8)}...` : value;
  }

  function resumePonderation(ponderation?: Record<string, number>): string {
    if (!ponderation) {
      return 'Sans ponderation';
    }

    return Object.entries(ponderation)
      .filter(([, value]) => Number(value) > 0)
      .map(([key, value]) => `${key}:${value}`)
      .join(' · ') || 'Sans ponderation';
  }

  function differenceKey(entry: LigneDiffMigrationItem): string {
    return [
      entry.codeCours ?? entry.idReferentielCours ?? 'cours',
      entry.typeDiff ?? 'diff',
      entry.ancienOrdre ?? '',
      entry.nouvelOrdre ?? '',
      entry.commentaire ?? '',
    ].join('::');
  }

  function selectionnerVersion(versionId: string | null): void {
    store.selectionnerVersion(versionId);
  }

  function resumeDifference(entry: LigneDiffMigrationItem): string {
    if (entry.commentaire) {
      return entry.commentaire;
    }

    if (entry.ancienOrdre !== undefined || entry.nouvelOrdre !== undefined) {
      return `Ordre ${entry.ancienOrdre ?? '-'} -> ${entry.nouvelOrdre ?? '-'}`;
    }

    if (entry.anciennePonderation || entry.nouvellePonderation) {
      return 'Ponderation modifiee';
    }

    return 'Difference detectee';
  }

  function readSectionLabel(idSectionScolaire: string): string {
    return store.state.sections.find((entry) => entry.id === idSectionScolaire)?.libelle ?? 'Reference interne';
  }

  function readOptionLabel(idOptionEtude: string): string {
    return store.state.optionsEtudes.find((entry) => entry.id === idOptionEtude)?.libelle ?? 'Reference interne';
  }

  function readClasseLabel(idClasseAcademique: string): string {
    return store.state.classesAcademiques.find((entry) => entry.id === idClasseAcademique)?.libelle ?? 'Reference interne';
  }

  function readCourseLabel(idReferentielCours: string): string {
    const course = store.state.cours.find((entry) => entry.id === idReferentielCours);
    return course ? `${course.code} · ${course.libelle}` : 'Cours non renseigne';
  }

  function readVersionLabel(idVersion?: string): string {
    if (!idVersion) {
      return 'Non renseigne';
    }

    const version = store.versionsDisponibles.value.find((entry) => entry.id === idVersion);
    return version ? `${version.codeVersion} · ${version.anneeReference}` : 'Reference interne';
  }

  function badgeClass(value: boolean): string {
    return value ? 'reference-center__badge--success' : 'reference-center__badge--muted';
  }

  function migrationBadgeClass(statut: string): string {
    if (/APPLIQUEE/i.test(statut)) {
      return 'reference-center__badge--success';
    }
    if (/ANALYSEE/i.test(statut)) {
      return 'reference-center__badge--info';
    }
    if (/ANNULEE/i.test(statut)) {
      return 'reference-center__badge--danger';
    }
    return 'reference-center__badge--muted';
  }

  function resetFilters(): void {
    searchTerm.value = '';
    statusFilter.value = 'all';
    structureFilter.value = 'all';
    classFilter.value = '';
  }

  function ouvrirCarteSynthese(code: string): void {
    switch (code) {
      case 'sections':
        store.definirFamille('sections');
        selectTab('socle');
        break;
      case 'classes':
        store.definirFamille('classes');
        selectTab('socle');
        break;
      case 'options':
        store.definirFamille('options');
        selectTab('socle');
        break;
      case 'cours':
        selectTab('cours');
        break;
      case 'versions':
        statusFilter.value = 'active';
        selectTab('referentiels');
        break;
      case 'migrations':
        selectTab('migrations');
        break;
      default:
        selectTab('referentiels');
        break;
    }
  }

  function selectTab(tab: PlatformReferenceTab): void {
    store.definirOnglet(tab);

    if (tab === 'migrations') {
      void router.replace({ name: 'platform-reference-migrations' });
      return;
    }

    void router.replace({ name: 'platform-reference-read' });
  }

  function openSocleCreationModal(): void {
    modalState.value = 'create-socle';
  }

  function openImportModal(typeImport: PlatformReferenceImportType): void {
    resetImportWizard(typeImport);
    importForm.typeImport = typeImport;
    void router.push({ name: 'platform-reference-import' });
  }

  function openMigrationModal(): void {
    modalState.value = 'migration';
  }

  function ouvrirActionRoute(
    routeName: 'platform-reference-import' | 'platform-reference-publish' | 'platform-reference-activate' | 'platform-reference-compare' | 'platform-reference-migrations',
    keepMigrationsTab = false,
  ): void {
    if (routeName === 'platform-reference-publish' && !canPublish.value) {
      notificationsService.attention('Action reservee', 'La publication officielle reste indisponible pour l acteur courant.');
      return;
    }
    if (routeName === 'platform-reference-activate' && !canActivate.value) {
      notificationsService.attention('Action reservee', 'L activation officielle reste indisponible pour l acteur courant.');
      return;
    }
    if (routeName === 'platform-reference-import' && !canImport.value) {
      notificationsService.attention('Action reservee', 'L import officiel reste indisponible pour l acteur courant.');
      return;
    }
    if (routeName === 'platform-reference-compare' && !canCompare.value) {
      notificationsService.attention('Action reservee', 'La comparaison officielle reste indisponible pour l acteur courant.');
      return;
    }
    if (routeName === 'platform-reference-migrations' && !canMigrate.value) {
      notificationsService.attention('Action reservee', 'Les migrations referentielles restent indisponibles pour l acteur courant.');
      return;
    }

    if (keepMigrationsTab) {
      store.definirOnglet('migrations');
    }
    void router.push({ name: routeName });
  }

  function closeModal(): void {
    if (modalState.value === 'import') {
      resetImportWizard(importForm.typeImport);
    }
    modalState.value = null;
    if (route.name !== 'platform-reference-read') {
      void router.replace({ name: 'platform-reference-read' });
    }
  }

  function closeConfirm(): void {
    confirmDialog.value = null;
  }

  async function executeConfirm(): Promise<void> {
    if (!confirmDialog.value) {
      return;
    }

    const shouldClose = confirmDialog.value.closeAfter !== false;
    await confirmDialog.value.execute();
    confirmDialog.value = null;
    if (shouldClose) {
      closeModal();
    }
  }

  async function recharger(): Promise<void> {
    await store.rechargerCentre();
  }

  async function chargerReferentiel(idReferentielProgramme: string): Promise<void> {
    await store.ouvrirReferentiel(idReferentielProgramme);
  }

  async function creerVersionTravailReferentiel(
    idReferentielProgramme: string,
    demande: CreerVersionTravailReferentielRequest,
  ): Promise<void> {
    await store.creerVersionTravailReferentiel(idReferentielProgramme, demande);
  }

  async function ajouterLigneVersionReferentiel(
    idVersionReferentielProgramme: string,
    demande: AjouterLigneVersionReferentielRequest,
  ): Promise<void> {
    await store.ajouterLigneVersionReferentiel(idVersionReferentielProgramme, demande);
  }

  async function modifierLigneVersionReferentiel(
    idVersionReferentielProgramme: string,
    idLigneReferentielProgramme: string,
    demande: ModifierLigneVersionReferentielRequest,
  ): Promise<void> {
    await store.modifierLigneVersionReferentiel(
      idVersionReferentielProgramme,
      idLigneReferentielProgramme,
      demande,
    );
  }

  async function retirerLigneVersionReferentiel(
    idVersionReferentielProgramme: string,
    idLigneReferentielProgramme: string,
  ): Promise<void> {
    await store.retirerLigneVersionReferentiel(idVersionReferentielProgramme, idLigneReferentielProgramme);
  }

  async function reordonnerLignesVersionReferentiel(
    idVersionReferentielProgramme: string,
    lignes: Array<{ idLigneReferentielProgramme: string; ordreAffichage: number }>,
  ): Promise<void> {
    await store.reordonnerLignesVersionReferentiel(idVersionReferentielProgramme, { lignes });
  }

  async function modifierPonderationLigneVersionReferentiel(
    idVersionReferentielProgramme: string,
    idLigneReferentielProgramme: string,
    demande: ModifierPonderationLigneVersionReferentielRequest,
  ): Promise<void> {
    await store.modifierPonderationLigneVersionReferentiel(
      idVersionReferentielProgramme,
      idLigneReferentielProgramme,
      demande,
    );
  }

  async function verifierCoherenceVersionReferentiel(
    idVersionReferentielProgramme: string,
  ): Promise<void> {
    await store.verifierCoherenceVersionReferentiel(idVersionReferentielProgramme);
  }

  function resetImportWizard(typeImport = importForm.typeImport): void {
    importForm.typeImport = typeImport;
    importForm.rawJson = '';
    importSourceMode.value = 'paste';
    importValidationStatus.value = 'idle';
    importWizardStep.value = 1;
    importFileName.value = '';
    importExecutionStartedAt.value = null;
    importExecutionDurationMs.value = null;
    importLastSummary.value = null;
    importValidation.value = null;
  }

  function changerTypeImport(typeImport: PlatformReferenceImportType): void {
    if (importForm.typeImport === typeImport) {
      return;
    }
    resetImportWizard(typeImport);
  }

  function goToImportStep(step: number): void {
    if (step < 1 || step > 7) {
      return;
    }

    if (step > importWizardStep.value) {
      for (let current = importWizardStep.value + 1; current <= step; current += 1) {
        if (!canAdvanceToImportStep(current)) {
          notificationsService.attention('Etape incomplete', lireMessageEtape(current));
          return;
        }
      }
    }

    importWizardStep.value = step;
  }

  function nextImportStep(): void {
    goToImportStep(importWizardStep.value + 1);
  }

  function previousImportStep(): void {
    goToImportStep(importWizardStep.value - 1);
  }

  function canAdvanceToImportStep(step: number): boolean {
    switch (step) {
      case 2:
        return Boolean(importForm.typeImport);
      case 3:
        return Boolean(importForm.typeImport);
      case 4:
        return importForm.rawJson.trim().length > 0;
      case 5:
        return importValidationStatus.value === 'ready' && importValidation.value !== null;
      case 6:
        return Boolean(importValidation.value?.estValide);
      case 7:
        return importResultSummary.value !== null;
      default:
        return true;
    }
  }

  function lireMessageEtape(step: number): string {
    switch (step) {
      case 4:
        return 'Ajoutez d abord le contenu JSON a valider.';
      case 5:
        return 'Lancez d abord la validation automatique pour obtenir un apercu.';
      case 6:
        return 'Corrigez d abord les erreurs detectees avant la confirmation.';
      case 7:
        return 'Le resultat final sera disponible apres execution de l import.';
      default:
        return 'Terminez l etape precedente avant de continuer.';
    }
  }

  function useImportExample(): void {
    importForm.rawJson = importModelJson.value;
    importSourceMode.value = 'paste';
    importValidationStatus.value = 'idle';
    importValidation.value = null;
  }

  function downloadImportModel(): void {
    const blob = new Blob([importModelJson.value], { type: 'application/json;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const anchor = document.createElement('a');
    anchor.href = url;
    anchor.download = `${selectedImportDefinition.value.code}-modele-officiel.json`;
    anchor.click();
    URL.revokeObjectURL(url);
  }

  async function handleImportFileSelection(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement | null;
    const file = input?.files?.[0];
    if (!file) {
      return;
    }

    importFileName.value = file.name;
    importSourceMode.value = 'file';
    importValidationStatus.value = 'idle';
    importValidation.value = null;

    const text = await file.text();
    importForm.rawJson = text;
  }

  async function validateImportPayload(): Promise<void> {
    if (!importForm.rawJson.trim()) {
      notificationsService.attention('Contenu requis', 'Ajoutez un contenu JSON avant la validation.');
      return;
    }

    importValidationStatus.value = 'loading';
    await Promise.resolve();
    importValidation.value = validerImportReferentiel(
      importForm.typeImport,
      importForm.rawJson,
      importExistingState.value,
    );
    importValidationStatus.value = 'ready';

    if (importValidation.value.estValide) {
      importWizardStep.value = Math.max(importWizardStep.value, 5);
      notificationsService.succes(
        'Validation terminee',
        'Le contenu peut maintenant etre verifie avant confirmation.',
        { duree: 2600 },
      );
      return;
    }

    importWizardStep.value = 4;
    notificationsService.attention(
      'Validation a corriger',
      importValidation.value.erreurs[0] ?? 'Le contenu doit etre corrige avant import.',
      { duree: 3800 },
    );
  }

  function askSubmitImport(): void {
    if (!canSubmitImport.value || !importValidation.value?.corps) {
      notificationsService.attention('Import non pret', importBlockingMessage.value ?? 'Le contenu doit encore etre verifie.');
      return;
    }

    confirmDialog.value = {
      title: 'Confirmer l import officiel',
      message:
        'Vous etes sur le point d importer ces donnees dans le referentiel officiel. Cette operation peut modifier les donnees disponibles pour les prochaines publications. Voulez-vous continuer ?',
      confirmLabel: 'Continuer l import',
      closeAfter: false,
      execute: async () => {
        await submitImport();
      },
    };
  }

  async function submitImport(): Promise<void> {
    if (!canSubmitImport.value || !importValidation.value?.corps) {
      notificationsService.attention('Import non pret', importBlockingMessage.value ?? 'Le contenu n est pas encore pret.');
      return;
    }

    importExecutionStartedAt.value = Date.now();
    const previousRawResult = store.state.importResult;
    await store.importerComposante(importForm.typeImport, importValidation.value.corps);

    if (store.state.actionStatus === 'error' || store.state.importResult === previousRawResult) {
      importExecutionDurationMs.value = null;
      importLastSummary.value = null;
      importWizardStep.value = 6;
      return;
    }

    importExecutionDurationMs.value = Date.now() - (importExecutionStartedAt.value ?? Date.now());
    importLastSummary.value = resumerResultatImport(
      importForm.typeImport,
      store.state.importResult,
      importValidation.value,
      importExecutionDurationMs.value,
    );
    importWizardStep.value = 7;
  }

  async function submitPublish(): Promise<void> {
    await store.publierVersion({
      idReferentielProgramme: publishForm.idReferentielProgramme.trim(),
      codeVersion: publishForm.codeVersion.trim(),
      anneeReference: publishForm.anneeReference.trim(),
      datePublication: publishForm.datePublication.trim(),
      sourceImport: publishForm.sourceImport.trim(),
      motifPublication: publishForm.motifPublication.trim() || undefined,
    });
    closeModal();
  }

  function askActivateVersion(): void {
    confirmDialog.value = {
      title: 'Activer cette version officielle',
      message: 'Cette activation rendra la version selectionnee active pour les usages concernes.',
      confirmLabel: 'Activer la version',
      execute: async () => {
        await store.activerVersion(activateForm.idVersionReferentielProgramme.trim());
      },
    };
  }

  async function submitCompare(): Promise<void> {
    store.definirOnglet('comparaisons');
    await store.comparerVersions({
      idClasseAcademique: compareForm.idClasseAcademique.trim(),
      versionReferentielSource: compareForm.versionReferentielSource.trim(),
      versionReferentielCible: compareForm.versionReferentielCible.trim(),
    });
    closeModal();
  }

  async function chargerHistoriqueMigrations(): Promise<void> {
    if (!programmeNiveauLookup.value.trim()) {
      notificationsService.attention('Programme requis', 'Renseignez une reference de programme pour charger son historique.');
      return;
    }

    await store.chargerMigrations(programmeNiveauLookup.value.trim());
  }

  async function submitMigrationAnalysis(): Promise<void> {
    store.definirOnglet('migrations');
    programmeNiveauLookup.value = migrationForm.idProgrammeNiveau.trim();
    await store.analyserMigration({
      idProgrammeNiveau: migrationForm.idProgrammeNiveau.trim(),
      idAncienneVersionReferentiel: migrationForm.idAncienneVersionReferentiel.trim(),
      idNouvelleVersionReferentiel: migrationForm.idNouvelleVersionReferentiel.trim(),
    });
    closeModal();
  }

  async function ouvrirRapportMigration(idMigrationReferentielProgramme: string): Promise<void> {
    await store.consulterMigration(idMigrationReferentielProgramme);
  }

  function askApplyMigration(idMigrationReferentielProgramme: string): void {
    confirmDialog.value = {
      title: 'Appliquer cette migration',
      message: 'Cette operation confirme la migration analysee vers la nouvelle version officielle du programme concerne.',
      confirmLabel: 'Appliquer',
      execute: async () => {
        await store.appliquerMigration(idMigrationReferentielProgramme);
      },
    };
  }

  function askCancelMigration(idMigrationReferentielProgramme: string): void {
    confirmDialog.value = {
      title: 'Annuler cette migration',
      message: 'L annulation reste reservee aux migrations non appliquees. Verifiez le statut avant de confirmer.',
      confirmLabel: 'Annuler la migration',
      tone: 'danger',
      execute: async () => {
        await store.annulerMigration(idMigrationReferentielProgramme);
      },
    };
  }

  function askRelaunchMigration(idMigrationReferentielProgramme: string): void {
    confirmDialog.value = {
      title: 'Relancer le recalcul post-migration',
      message: 'Le recalcul sera relance pour la migration selectionnee sans changer sa provenance officielle.',
      confirmLabel: 'Relancer',
      execute: async () => {
        await store.relancerMigration(idMigrationReferentielProgramme);
      },
    };
  }

  async function submitSocleCreation(): Promise<void> {
    if (store.state.activeFamily === 'sections') {
      await store.creerSectionScolaire({
        code: sectionForm.code.trim(),
        libelle: sectionForm.libelle.trim(),
        ordreAffichage: Number(sectionForm.ordreAffichage),
      });
    } else if (store.state.activeFamily === 'classes') {
      await store.creerClasseAcademique({
        idSectionScolaire: classeForm.idSectionScolaire.trim(),
        code: classeForm.code.trim(),
        libelle: classeForm.libelle.trim(),
        ordrePedagogique: Number(classeForm.ordrePedagogique),
        cycle: classeForm.cycle.trim(),
        accepteOptions: classeForm.accepteOptions,
        optionObligatoire: classeForm.optionObligatoire,
        typeStructureEvaluation: classeForm.typeStructureEvaluation.trim(),
        estClasseTENASOSP: classeForm.estClasseTENASOSP,
        estClasseEXETAT: classeForm.estClasseEXETAT,
        estClasseFinaliste: classeForm.estClasseFinaliste,
      });
    } else {
      await store.creerOptionEtude({
        code: Number(optionForm.code),
        abreviation: optionForm.abreviation.trim() || undefined,
        libelle: optionForm.libelle.trim(),
        ordreAffichage: Number(optionForm.ordreAffichage) || undefined,
        estTechnique: optionForm.estTechnique,
        categorieTechnique: optionForm.categorieTechnique,
      });
    }

    closeModal();
  }

  function appliquerIntentionDeRoute(): void {
    if (!canReadCenter.value) {
      return;
    }

    switch (route.name) {
      case 'platform-reference-import':
        if (!canImport.value) {
          void router.replace({ name: 'platform-reference-read' });
          return;
        }
        if (modalState.value !== 'import') {
          resetImportWizard(importForm.typeImport);
        }
        modalState.value = 'import';
        break;
      case 'platform-reference-publish':
        if (!canPublish.value) {
          void router.replace({ name: 'platform-reference-read' });
          return;
        }
        modalState.value = 'publish';
        break;
      case 'platform-reference-activate':
        if (!canActivate.value) {
          void router.replace({ name: 'platform-reference-read' });
          return;
        }
        modalState.value = 'activate';
        break;
      case 'platform-reference-compare':
        store.definirOnglet('comparaisons');
        if (!canCompare.value) {
          void router.replace({ name: 'platform-reference-read' });
          return;
        }
        modalState.value = 'compare';
        break;
      case 'platform-reference-migrations':
        store.definirOnglet('migrations');
        if (!canMigrate.value) {
          return;
        }
        modalState.value = null;
        break;
      default:
        modalState.value = null;
        break;
    }
  }

  watch(() => route.name, appliquerIntentionDeRoute, { immediate: true });

  watch([searchTerm, statusFilter, structureFilter, classFilter], () => {
    soclePagination.currentPage = 1;
    coursesPagination.currentPage = 1;
    referentielsPagination.currentPage = 1;
    migrationsPagination.currentPage = 1;
  });

  watch(() => store.state.activeFamily, () => {
    soclePagination.currentPage = 1;
  });

  watch(currentSocleRows, () => {
    if (soclePagination.currentPage > socleTotalPages.value) {
      soclePagination.currentPage = socleTotalPages.value;
    }
  });

  watch(filteredCourses, () => {
    if (coursesPagination.currentPage > coursesTotalPages.value) {
      coursesPagination.currentPage = coursesTotalPages.value;
    }
  });

  watch(filteredReferentiels, () => {
    if (referentielsPagination.currentPage > referentielsTotalPages.value) {
      referentielsPagination.currentPage = referentielsTotalPages.value;
    }
  });

  watch(filteredMigrations, () => {
    if (migrationsPagination.currentPage > migrationsTotalPages.value) {
      migrationsPagination.currentPage = migrationsTotalPages.value;
    }
  });

  watch(
    selectedReferentiel,
    (value) => {
      if (value && !publishForm.idReferentielProgramme) {
        publishForm.idReferentielProgramme = value.id;
      }
    },
    { immediate: true },
  );

  onMounted(async () => {
    if (store.state.bootStatus === 'idle') {
      await store.chargerCentre();
    }
  });

  return proxyRefs({
    store,
    session,
    context,
    modalState,
    selectedSocleId,
    selectedCourseId,
    selectedDifferenceKey,
    searchTerm,
    statusFilter,
    structureFilter,
    classFilter,
    programmeNiveauLookup,
    importForm,
    importSourceMode,
    importValidationStatus,
    importWizardStep,
    importFileName,
    importExecutionDurationMs,
    importValidation,
    soclePagination,
    coursesPagination,
    referentielsPagination,
    migrationsPagination,
    importSteps,
    importDefinitions,
    selectedImportDefinition,
    importModelJson,
    importExampleTitle,
    importValidationPreview,
    importValidationIssues,
    importResultSummary,
    importBlockingMessage,
    publishForm,
    activateForm,
    compareForm,
    migrationForm,
    sectionForm,
    classeForm,
    optionForm,
    confirmDialog,
    tabs,
    families,
    canReadCenter,
    canPublish,
    canActivate,
    canImport,
    canCompare,
    canMigrate,
    canMutateCenter,
    centerOverviewCards,
    summaryCards,
    socleTitle,
    currentSocleRows,
    paginatedSocleRows,
    selectedSocleRow,
    selectedSocleTitle,
    selectedSocleDetails,
    socleMeta,
    socleTotalPages,
    soclePaginationStart,
    soclePaginationEnd,
    coursesMeta,
    referentielsMeta,
    migrationsMeta,
    socleColumns,
    filteredCourses,
    paginatedCourses,
    selectedCourse,
    selectedCourseDetails,
    coursesTotalPages,
    coursesPaginationStart,
    coursesPaginationEnd,
    filteredReferentiels,
    paginatedReferentiels,
    selectedReferentiel,
    selectedReferentielVersions,
    selectedReferentielVersion,
    canEditSelectedVersion,
    referentielsTotalPages,
    referentielsPaginationStart,
    referentielsPaginationEnd,
    comparisonStats,
    selectedDifference,
    filteredMigrations,
    paginatedMigrations,
    selectedMigration,
    migrationsTotalPages,
    migrationsPaginationStart,
    migrationsPaginationEnd,
    canSubmitImport,
    canSubmitPublish,
    canSubmitCompare,
    canSubmitMigration,
    canSubmitSocleCreation,
    socleCreationTitle,
    formatDate,
    shortId,
    resumePonderation,
    differenceKey,
    resumeDifference,
    readSectionLabel,
    readOptionLabel,
    readClasseLabel,
    readCourseLabel,
    readVersionLabel,
    badgeClass,
    migrationBadgeClass,
    selectionnerVersion,
    resetFilters,
    ouvrirCarteSynthese,
    selectTab,
    openSocleCreationModal,
    openImportModal,
    openMigrationModal,
    ouvrirActionRoute,
    closeModal,
    closeConfirm,
    executeConfirm,
    recharger,
    chargerReferentiel,
    creerVersionTravailReferentiel,
    ajouterLigneVersionReferentiel,
    modifierLigneVersionReferentiel,
    retirerLigneVersionReferentiel,
    reordonnerLignesVersionReferentiel,
    modifierPonderationLigneVersionReferentiel,
    verifierCoherenceVersionReferentiel,
    resetImportWizard,
    changerTypeImport,
    goToImportStep,
    nextImportStep,
    previousImportStep,
    useImportExample,
    downloadImportModel,
    handleImportFileSelection,
    validateImportPayload,
    askSubmitImport,
    submitImport,
    submitPublish,
    askActivateVersion,
    submitCompare,
    chargerHistoriqueMigrations,
    submitMigrationAnalysis,
    ouvrirRapportMigration,
    askApplyMigration,
    askCancelMigration,
    askRelaunchMigration,
    submitSocleCreation,
  });
}

export type PlatformOfficialReferenceCenterViewModel = ReturnType<typeof createViewModel>;

const platformOfficialReferenceCenterViewModelKey:
  InjectionKey<PlatformOfficialReferenceCenterViewModel> = Symbol('platformOfficialReferenceCenterViewModel');

export function usePlatformOfficialReferenceCenterViewModel(): PlatformOfficialReferenceCenterViewModel {
  return createViewModel();
}

export function providePlatformOfficialReferenceCenterViewModel(
  viewModel: PlatformOfficialReferenceCenterViewModel,
): void {
  provide(platformOfficialReferenceCenterViewModelKey, viewModel);
}

export function usePlatformOfficialReferenceCenterViewModelContext():
  PlatformOfficialReferenceCenterViewModel {
  const viewModel = inject(platformOfficialReferenceCenterViewModelKey, null);
  if (!viewModel) {
    throw new Error('PlatformOfficialReferenceCenterViewModel context is not available.');
  }
  return viewModel;
}
