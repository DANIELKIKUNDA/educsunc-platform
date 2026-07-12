import { Building2, CircleOff, MapPin, School, Wifi } from 'lucide-vue-next';
import { computed, onMounted, reactive, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useDoctrineAccess } from '../../../shared/doctrine/use-doctrine-access';
import { schoolModeOptions, type SchoolModeValue } from '../models/school-administration.model';
import { useSchoolAdministrationStore } from '../stores/school-administration.store';
import {
  evaluateRenameSchool,
  evaluateSchoolInstitutionalInfoUpdate,
  evaluateSchoolModeUpdate,
} from './school-administration.logic';

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
  const organization = computed(
    () => store.state.organisations.find((item) => item.id === school.value?.idOrganisation) ?? null,
  );
  const renameEvaluation = computed(
    () => evaluateRenameSchool(school.value?.nom, renameTarget.value, store.state.mutationStatus === 'loading'),
  );
  const modeEvaluation = computed(
    () => evaluateSchoolModeUpdate(
      school.value?.modeExploitation,
      identityForm.modeExploitation,
      store.state.mutationStatus === 'loading',
    ),
  );
  const identityEvaluation = computed(
    () => evaluateSchoolInstitutionalInfoUpdate(school.value, identityForm, store.state.mutationStatus === 'loading'),
  );

  const summaryCards = computed(() => {
    if (!school.value) {
      return [];
    }

    return [
      {
        label: 'Ecole',
        value: school.value.nom,
        hint: school.value.code,
        icon: School,
        tone: 'primary' as const,
      },
      {
        label: 'Organisation',
        value: organization.value?.nom ?? 'Organisation non relue',
        hint: organization.value?.code ?? "Rattachement administratif de l'etablissement.",
        icon: Building2,
        tone: 'neutral' as const,
      },
      {
        label: "Mode d'exploitation",
        value: schoolModeOptions.find((option) => option.value === school.value?.modeExploitation)?.label ?? school.value.modeExploitation,
        hint: 'Reglage actuellement applique a cette ecole.',
        icon: Wifi,
        tone: 'success' as const,
      },
      {
        label: 'Statut',
        value: school.value.actif ? 'Active' : 'Inactive',
        hint: school.value.modifieLe ? `Mise a jour le ${formatDate(school.value.modifieLe)}` : "Aucune modification recente n'a ete relue.",
        icon: CircleOff,
        tone: school.value.actif ? 'success' as const : 'warning' as const,
      },
      {
        label: 'Localisation',
        value: school.value.ville || 'Non renseignee',
        hint: school.value.communeOuTerritoire || school.value.provinceEducationnelle || 'A completer dans la fiche.',
        icon: MapPin,
        tone: 'neutral' as const,
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

    await store.loadOrganizations();
    await store.loadSchool(idEcole);
    syncFormFromSchool();
  }

  async function renameSchool(): Promise<void> {
    if (!school.value?.id || !renameEvaluation.value.canSubmit) {
      return;
    }

    const success = await store.renameSchool(school.value.id, renameTarget.value.trim());
    if (success) {
      renameTarget.value = '';
    }
  }

  async function updateMode(): Promise<void> {
    if (!school.value?.id || !modeEvaluation.value.canSubmit) {
      return;
    }

    await store.changeSchoolMode(school.value.id, identityForm.modeExploitation);
  }

  async function updateInstitutionalInfo(): Promise<void> {
    if (!school.value?.id || !identityEvaluation.value.canSubmit) {
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

    let success = false;
    if (lifecycleAction.value === 'activate') {
      success = await store.activateSchool(school.value.id);
    } else {
      success = await store.deactivateSchool(school.value.id);
    }

    if (success) {
      lifecycleModalOpen.value = false;
    }
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

  watch(school, () => {
    syncFormFromSchool();
  });

  onMounted(() => {
    void load();
  });

  return {
    store,
    school,
    organization,
    canReadDetail,
    canMutateDetail,
    renameTarget,
    identityForm,
    schoolModeOptions,
    summaryCards,
    renameEvaluation,
    modeEvaluation,
    identityEvaluation,
    lifecycleModalOpen,
    lifecycleAction,
    formatDate,
    load,
    renameSchool,
    updateMode,
    updateInstitutionalInfo,
    openLifecycleModal,
    closeLifecycleModal,
    confirmLifecycle,
  };
}
