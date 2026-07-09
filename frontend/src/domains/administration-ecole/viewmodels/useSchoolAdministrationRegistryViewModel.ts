import { computed, onMounted, reactive, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { School, ShieldCheck, Waypoints, Workflow } from 'lucide-vue-next';
import { useDoctrineAccess } from '../../../shared/doctrine/use-doctrine-access';
import { activeContextStore } from '../../../shared/session/active-context.store';
import { schoolModeOptions, type SchoolModeValue } from '../models/school-administration.model';
import { useSchoolAdministrationStore } from '../stores/school-administration.store';

type LifecycleAction = 'activate' | 'deactivate';

export function useSchoolAdministrationRegistryViewModel() {
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

  const form = reactive({
    idOrganisation: '',
    code: '',
    nom: '',
    modeExploitation: 'SYNC' as SchoolModeValue,
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
          school.telephone,
          school.email,
        ].some((value) => value?.toLowerCase().includes(normalizedSearch));
      const matchesStatus = statusFilter.value === 'ALL'
        || (statusFilter.value === 'ACTIVE' ? school.actif : !school.actif);
      const matchesMode = modeFilter.value === 'ALL' || school.modeExploitation === modeFilter.value;

      return matchesSearch && matchesStatus && matchesMode;
    });
  });

  const summaryCards = computed(() => [
    {
      label: 'Ecoles visibles',
      value: filteredSchools.value.length,
      hint: 'Resultat filtre dans le registre courant.',
      icon: School,
      tone: 'primary' as const,
    },
    {
      label: 'Organisation cible',
      value: currentOrganization.value?.code ?? 'A definir',
      hint: currentOrganization.value?.nom ?? 'Selectionnez une organisation pour lire ou creer des ecoles.',
      icon: Workflow,
      tone: 'neutral' as const,
    },
    {
      label: 'Lecture',
      value: 'referentiel.read',
      hint: 'Lecture reelle prouvee par le backend pour ADM-01.',
      icon: ShieldCheck,
      tone: 'success' as const,
    },
    {
      label: 'Mutation',
      value: canMutateRegistry.value ? 'referentiel.write' : 'Non ouverte',
      hint: canMutateRegistry.value
        ? 'Creation et cycle de vie autorises dans ce profil.'
        : 'Le backend n ouvrira pas les mutations pour ce profil.',
      icon: Waypoints,
      tone: canMutateRegistry.value ? 'warning' as const : 'neutral' as const,
    },
  ]);

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
    if (!form.idOrganisation || !form.code.trim() || !form.nom.trim()) {
      return;
    }

    await store.createSchool({
      idOrganisation: form.idOrganisation,
      code: form.code.trim(),
      nom: form.nom.trim(),
      modeExploitation: form.modeExploitation,
      sigle: form.sigle.trim() || undefined,
      telephone: form.telephone.trim() || undefined,
      email: form.email.trim() || undefined,
      provinceEducationnelle: form.provinceEducationnelle.trim() || undefined,
      ville: form.ville.trim() || undefined,
      communeOuTerritoire: form.communeOuTerritoire.trim() || undefined,
      adresse: form.adresse.trim() || undefined,
    });

    selectedOrganisationId.value = form.idOrganisation;
    resetForm();
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

    if (lifecycleAction.value === 'activate') {
      await store.activateSchool(lifecycleSchoolId.value);
    } else {
      await store.deactivateSchool(lifecycleSchoolId.value);
    }

    lifecycleModalOpen.value = false;
  }

  function closeLifecycleModal(): void {
    lifecycleModalOpen.value = false;
  }

  function clearFilters(): void {
    search.value = '';
    statusFilter.value = 'ALL';
    modeFilter.value = 'ALL';
  }

  watch(selectedOrganisationId, (next) => {
    form.idOrganisation = next;
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
    lifecycleModalOpen,
    lifecycleAction,
    lifecycleSchoolName,
    loadOrganizations,
    loadSchools,
    createSchool,
    openLifecycleModal,
    confirmLifecycle,
    closeLifecycleModal,
    clearFilters,
  };
}
