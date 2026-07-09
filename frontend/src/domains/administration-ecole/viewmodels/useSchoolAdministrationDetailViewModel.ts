import { computed, onMounted, reactive, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { Building2, Fingerprint, ShieldCheck, Waypoints } from 'lucide-vue-next';
import { useDoctrineAccess } from '../../../shared/doctrine/use-doctrine-access';
import { schoolModeOptions, type SchoolModeValue } from '../models/school-administration.model';
import { useSchoolAdministrationStore } from '../stores/school-administration.store';

type LifecycleAction = 'activate' | 'deactivate';

export function useSchoolAdministrationDetailViewModel() {
  const route = useRoute();
  const store = useSchoolAdministrationStore();
  const { canUseAction } = useDoctrineAccess();

  const renameTarget = ref('');
  const lifecycleModalOpen = ref(false);
  const lifecycleAction = ref<LifecycleAction>('activate');

  const identityForm = reactive({
    modeExploitation: 'SYNC' as SchoolModeValue,
    sigle: '',
    telephone: '',
    email: '',
    provinceEducationnelle: '',
    ville: '',
    communeOuTerritoire: '',
    adresse: '',
  });

  const canReadDetail = computed(() => canUseAction('referentiel.read', 'ADM-002'));
  const canMutateDetail = computed(() => canUseAction('referentiel.write', 'ADM-002'));
  const school = computed(() => store.state.selectedEcole);

  const summaryCards = computed(() => {
    if (!school.value) {
      return [];
    }

    return [
      {
        label: 'Code ecole',
        value: school.value.code,
        hint: 'Identifiant structurel relu depuis le backend.',
        icon: Fingerprint,
        tone: 'primary' as const,
      },
      {
        label: 'Organisation',
        value: school.value.idOrganisation,
        hint: 'Rattachement structurel reel de cette ecole.',
        icon: Building2,
        tone: 'neutral' as const,
      },
      {
        label: 'Lecture',
        value: 'referentiel.read',
        hint: 'Lecture detaillee autorisee par ADM-01.',
        icon: ShieldCheck,
        tone: 'success' as const,
      },
      {
        label: 'Mutation',
        value: canMutateDetail.value ? 'referentiel.write' : 'Lecture seule',
        hint: canMutateDetail.value
          ? 'Mutations structurelles backend disponibles.'
          : 'Le backend n ouvrira pas les mutations dans ce profil.',
        icon: Waypoints,
        tone: canMutateDetail.value ? 'warning' as const : 'neutral' as const,
      },
    ];
  });

  function syncFormFromSchool(): void {
    if (!school.value) {
      return;
    }

    identityForm.modeExploitation = school.value.modeExploitation;
    identityForm.sigle = school.value.sigle ?? '';
    identityForm.telephone = school.value.telephone ?? '';
    identityForm.email = school.value.email ?? '';
    identityForm.provinceEducationnelle = school.value.provinceEducationnelle ?? '';
    identityForm.ville = school.value.ville ?? '';
    identityForm.communeOuTerritoire = school.value.communeOuTerritoire ?? '';
    identityForm.adresse = school.value.adresse ?? '';
  }

  async function load(): Promise<void> {
    const idEcole = typeof route.params.idEcole === 'string' ? route.params.idEcole : '';
    if (!idEcole) {
      return;
    }

    await store.loadSchool(idEcole);
    syncFormFromSchool();
  }

  async function renameSchool(): Promise<void> {
    if (!school.value?.id || !renameTarget.value.trim()) {
      return;
    }

    await store.renameSchool(school.value.id, renameTarget.value.trim());
    renameTarget.value = '';
  }

  async function updateMode(): Promise<void> {
    if (!school.value?.id) {
      return;
    }

    await store.changeSchoolMode(school.value.id, identityForm.modeExploitation);
  }

  async function updateInstitutionalInfo(): Promise<void> {
    if (!school.value?.id) {
      return;
    }

    await store.updateSchoolInstitutionalInfo(school.value.id, {
      sigle: identityForm.sigle.trim() || undefined,
      telephone: identityForm.telephone.trim() || undefined,
      email: identityForm.email.trim() || undefined,
      provinceEducationnelle: identityForm.provinceEducationnelle.trim() || undefined,
      ville: identityForm.ville.trim() || undefined,
      communeOuTerritoire: identityForm.communeOuTerritoire.trim() || undefined,
      adresse: identityForm.adresse.trim() || undefined,
    });
  }

  function openLifecycleModal(action: LifecycleAction): void {
    lifecycleAction.value = action;
    lifecycleModalOpen.value = true;
  }

  function closeLifecycleModal(): void {
    lifecycleModalOpen.value = false;
  }

  async function confirmLifecycle(): Promise<void> {
    if (!school.value?.id) {
      return;
    }

    if (lifecycleAction.value === 'activate') {
      await store.activateSchool(school.value.id);
    } else {
      await store.deactivateSchool(school.value.id);
    }

    lifecycleModalOpen.value = false;
  }

  watch(school, () => {
    syncFormFromSchool();
  });

  onMounted(() => {
    void load();
  });

  return {
    store,
    school,
    canReadDetail,
    canMutateDetail,
    renameTarget,
    identityForm,
    schoolModeOptions,
    summaryCards,
    lifecycleModalOpen,
    lifecycleAction,
    load,
    renameSchool,
    updateMode,
    updateInstitutionalInfo,
    openLifecycleModal,
    closeLifecycleModal,
    confirmLifecycle,
  };
}
