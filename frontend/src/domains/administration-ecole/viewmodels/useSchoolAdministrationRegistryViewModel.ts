import { Building2, CircleOff, School, Wifi, WifiOff } from 'lucide-vue-next';
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useDoctrineAccess } from '../../../shared/doctrine/use-doctrine-access';
import { activeContextStore } from '../../../shared/session/active-context.store';
import { schoolModeOptions, type CreateSchoolPayload, type SchoolModeValue } from '../models/school-administration.model';
import { useSchoolAdministrationStore } from '../stores/school-administration.store';
import { evaluateCreateSchoolForm } from './school-administration.logic';

type LifecycleAction = 'activate' | 'deactivate';

export function useSchoolAdministrationRegistryViewModel() {
  const router = useRouter();
  const route = useRoute();
  const store = useSchoolAdministrationStore();
  const { canUseAction } = useDoctrineAccess();

  const selectedOrganisationId = ref('');
  const search = ref('');
  const statusFilter = ref<'ALL' | 'ACTIVE' | 'INACTIVE'>('ALL');
  const modeFilter = ref<'ALL' | SchoolModeValue>('ALL');
  const lifecycleModalOpen = ref(false);
  const lifecycleAction = ref<LifecycleAction>('activate');
  const lifecycleSchoolId = ref('');
  const lifecycleSchoolName = ref('');
  const creationModalOpen = ref(false);
  const rowsPerPage = ref(10);
  const currentPage = ref(1);

  const form = reactive<CreateSchoolPayload>({
    idOrganisation: '',
    code: '',
    nom: '',
    modeExploitation: 'SYNC',
    sigle: '',
    telephone: '',
    email: '',
    provinceEducationnelle: '',
    ville: '',
    communeOuTerritoire: '',
    adresse: '',
  });

  const canReadRegistry = computed(() => canUseAction('referentiel.read', 'ADM-001'));
  const canMutateRegistry = computed(() => canUseAction('referentiel.write', 'ADM-001'));
  const currentOrganization = computed(
    () => store.state.organisations.find((organization) => organization.id === selectedOrganisationId.value) ?? null,
  );

  const filteredSchools = computed(() => {
    const normalizedSearch = search.value.trim().toLowerCase();

    return store.state.ecoles.filter((school) => {
      const matchesSearch = normalizedSearch.length === 0
        || [
          school.code,
          school.nom,
          school.sigle,
          school.ville,
          school.communeOuTerritoire,
        ].some((value) => value?.toLowerCase().includes(normalizedSearch));
      const matchesStatus = statusFilter.value === 'ALL'
        || (statusFilter.value === 'ACTIVE' ? school.actif : !school.actif);
      const matchesMode = modeFilter.value === 'ALL' || school.modeExploitation === modeFilter.value;

      return matchesSearch && matchesStatus && matchesMode;
    });
  });

  const createEvaluation = computed(() => evaluateCreateSchoolForm(form, store.state.mutationStatus === 'loading'));
  const totalPages = computed(() => Math.max(1, Math.ceil(filteredSchools.value.length / rowsPerPage.value)));
  const paginatedSchools = computed(() => {
    const start = (currentPage.value - 1) * rowsPerPage.value;
    return filteredSchools.value.slice(start, start + rowsPerPage.value);
  });
  const paginationEnd = computed(() => Math.min(filteredSchools.value.length, currentPage.value * rowsPerPage.value));
  const activeSchoolsCount = computed(() => filteredSchools.value.filter((school) => school.actif).length);
  const inactiveSchoolsCount = computed(() => filteredSchools.value.filter((school) => !school.actif).length);
  const syncSchoolsCount = computed(() => filteredSchools.value.filter((school) => school.modeExploitation === 'SYNC').length);

  const summaryCards = computed(() => [
    {
      label: 'Organisation selectionnee',
      value: currentOrganization.value?.code ?? 'A choisir',
      hint: currentOrganization.value?.nom ?? "Selectionnez une organisation pour consulter ses ecoles.",
      icon: Building2,
      tone: 'neutral' as const,
      filter: () => {
        currentPage.value = 1;
      },
    },
    {
      label: 'Ecoles enregistrees',
      value: filteredSchools.value.length,
      hint: currentOrganization.value ? "Resultat visible dans l'organisation ouverte." : "Aucune organisation n'est encore selectionnee.",
      icon: School,
      tone: 'primary' as const,
      filter: () => {
        statusFilter.value = 'ALL';
        modeFilter.value = 'ALL';
        currentPage.value = 1;
      },
    },
    {
      label: 'Ecoles actives',
      value: activeSchoolsCount.value,
      hint: "Etablissements immediatement exploitables dans l'affichage courant.",
      icon: Wifi,
      tone: 'success' as const,
      filter: () => {
        statusFilter.value = 'ACTIVE';
        currentPage.value = 1;
      },
    },
    {
      label: 'Ecoles inactives',
      value: inactiveSchoolsCount.value,
      hint: "Etablissements visibles mais suspendus dans l'affichage courant.",
      icon: CircleOff,
      tone: 'warning' as const,
      filter: () => {
        statusFilter.value = 'INACTIVE';
        currentPage.value = 1;
      },
    },
    {
      label: 'Mode synchronise',
      value: syncSchoolsCount.value,
      hint: "Ecoles actuellement reglees en fonctionnement synchronise.",
      icon: WifiOff,
      tone: 'neutral' as const,
      filter: () => {
        modeFilter.value = 'SYNC';
        currentPage.value = 1;
      },
    },
  ]);

  const emptyState = computed(() => {
    if (!selectedOrganisationId.value) {
      return {
        title: 'Selectionnez une organisation',
        message: 'Choisissez une organisation pour consulter les ecoles rattachees a ce perimetre.',
        actionLabel: 'Choisir une organisation',
        action: () => {
          const fallback = store.state.organisations[0]?.id ?? '';
          if (fallback) {
            selectedOrganisationId.value = fallback;
            form.idOrganisation = fallback;
          }
        },
      };
    }

    if (store.state.ecoles.length === 0) {
      return {
        title: 'Cette organisation ne possede encore aucune ecole',
        message: 'Creez le premier etablissement pour commencer le pilotage administratif.',
        actionLabel: 'Creer une ecole',
        action: () => {
          if (canMutateRegistry.value) {
            creationModalOpen.value = true;
          }
        },
      };
    }

    return {
      title: 'Aucune ecole ne correspond a votre recherche',
      message: "Ajustez vos filtres ou revenez a l'affichage complet.",
      actionLabel: 'Effacer les filtres',
      action: () => clearFilters(),
    };
  });

  function resetForm(): void {
    form.code = '';
    form.nom = '';
    form.modeExploitation = 'SYNC';
    form.sigle = '';
    form.telephone = '';
    form.email = '';
    form.provinceEducationnelle = '';
    form.ville = '';
    form.communeOuTerritoire = '';
    form.adresse = '';
  }

  async function loadOrganizations(): Promise<void> {
    await store.loadOrganizations();
  }

  async function loadSchools(): Promise<void> {
    if (!selectedOrganisationId.value) {
      return;
    }

    await store.loadSchoolsByOrganization(selectedOrganisationId.value);
  }

  async function createSchool(): Promise<void> {
    if (!createEvaluation.value.canSubmit) {
      return;
    }

    const success = await store.createSchool({
      idOrganisation: form.idOrganisation,
      code: form.code.trim(),
      nom: form.nom.trim(),
      modeExploitation: form.modeExploitation,
      sigle: form.sigle?.trim() || undefined,
      telephone: form.telephone?.trim() || undefined,
      email: form.email?.trim() || undefined,
      provinceEducationnelle: form.provinceEducationnelle?.trim() || undefined,
      ville: form.ville?.trim() || undefined,
      communeOuTerritoire: form.communeOuTerritoire?.trim() || undefined,
      adresse: form.adresse?.trim() || undefined,
    });

    if (!success) {
      return;
    }

    selectedOrganisationId.value = form.idOrganisation;
    resetForm();
    creationModalOpen.value = false;
    currentPage.value = 1;
  }

  function openLifecycleModal(action: LifecycleAction, schoolId: string, schoolName: string): void {
    lifecycleAction.value = action;
    lifecycleSchoolId.value = schoolId;
    lifecycleSchoolName.value = schoolName;
    lifecycleModalOpen.value = true;
  }

  async function confirmLifecycle(): Promise<void> {
    if (!lifecycleSchoolId.value) {
      return;
    }

    let success = false;
    if (lifecycleAction.value === 'activate') {
      success = await store.activateSchool(lifecycleSchoolId.value);
    } else {
      success = await store.deactivateSchool(lifecycleSchoolId.value);
    }

    if (success) {
      lifecycleModalOpen.value = false;
    }
  }

  function closeLifecycleModal(): void {
    lifecycleModalOpen.value = false;
  }

  function clearFilters(): void {
    search.value = '';
    statusFilter.value = 'ALL';
    modeFilter.value = 'ALL';
    currentPage.value = 1;
  }

  function openCreationModal(): void {
    if (!form.idOrganisation && selectedOrganisationId.value) {
      form.idOrganisation = selectedOrganisationId.value;
    }
    creationModalOpen.value = true;
  }

  function closeCreationModal(): void {
    creationModalOpen.value = false;
  }

  function openSchool(idEcole: string): void {
    void router.push(`/app/administration-ecole/ecoles/${idEcole}`);
  }

  function formatDate(value: string | undefined): string {
    if (!value) {
      return 'Information non disponible';
    }

    const date = new Date(value);
    if (Number.isNaN(date.getTime())) {
      return value;
    }

    return new Intl.DateTimeFormat('fr-FR', {
      dateStyle: 'medium',
      timeStyle: 'short',
    }).format(date);
  }

  watch(selectedOrganisationId, (next) => {
    form.idOrganisation = next;
    currentPage.value = 1;
  });

  watch([search, statusFilter, modeFilter, rowsPerPage], () => {
    currentPage.value = 1;
  });

  onMounted(async () => {
    const organizationFromRoute = typeof route.query.idOrganisation === 'string' ? route.query.idOrganisation : '';
    if (organizationFromRoute) {
      selectedOrganisationId.value = organizationFromRoute;
      form.idOrganisation = organizationFromRoute;
    } else if (activeContextStore.state.organizationId) {
      selectedOrganisationId.value = activeContextStore.state.organizationId;
      form.idOrganisation = activeContextStore.state.organizationId;
    }

    await loadOrganizations();

    const organizationFromQuery = typeof route.query.organizationId === 'string' ? route.query.organizationId : '';
    if (organizationFromQuery) {
      selectedOrganisationId.value = organizationFromQuery;
      form.idOrganisation = organizationFromQuery;
    }
    const statusFromQuery = typeof route.query.statut === 'string' ? route.query.statut : '';
    if (statusFromQuery === 'ACTIVE' || statusFromQuery === 'INACTIVE') {
      statusFilter.value = statusFromQuery;
    }
    const modeFromQuery = typeof route.query.mode === 'string' ? route.query.mode : '';
    if (modeFromQuery === 'SYNC' || modeFromQuery === 'OFFLINE_ONLY' || modeFromQuery === 'MIGRATION') {
      modeFilter.value = modeFromQuery;
    }
    const createFromQuery = route.query.creation === '1';
    if (createFromQuery && canMutateRegistry.value) {
      creationModalOpen.value = true;
    }

    if (selectedOrganisationId.value) {
      await loadSchools();
    }
  });

  return {
    store,
    form,
    schoolModeOptions,
    selectedOrganisationId,
    search,
    statusFilter,
    modeFilter,
    canReadRegistry,
    canMutateRegistry,
    currentOrganization,
    filteredSchools,
    summaryCards,
    emptyState,
    createEvaluation,
    creationModalOpen,
    rowsPerPage,
    currentPage,
    totalPages,
    paginatedSchools,
    paginationEnd,
    lifecycleModalOpen,
    lifecycleAction,
    lifecycleSchoolName,
    loadOrganizations,
    loadSchools,
    createSchool,
    openCreationModal,
    closeCreationModal,
    openSchool,
    openLifecycleModal,
    confirmLifecycle,
    closeLifecycleModal,
    clearFilters,
    formatDate,
  };
}
