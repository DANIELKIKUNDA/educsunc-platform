import { computed, onMounted, reactive, ref, watch } from 'vue';
import { useRoute } from 'vue-router';
import { useDoctrineAccess } from '../../../shared/doctrine/use-doctrine-access';
import {
  configurationModuleCatalog,
  type ConfigurationModuleCatalogItem,
  type ConfigurationModuleCode,
} from '../../configuration/models/configuration.model';
import { configurationApi, lireContexteApiConfiguration } from '../../configuration/services/configuration.api';
import { schoolModeOptions, type SchoolModeValue } from '../models/school-administration.model';
import { useSchoolAdministrationStore } from '../stores/school-administration.store';
import {
  evaluateRenameSchool,
  evaluateSchoolInstitutionalInfoUpdate,
  evaluateSchoolModeUpdate,
} from './school-administration.logic';

type DetailModal = 'identity' | 'rename' | 'mode' | 'modules' | null;
type LifecycleAction = 'activate' | 'deactivate';

export function useSchoolAdministrationDetailViewModel() {
  const route = useRoute();
  const store = useSchoolAdministrationStore();
  const { canUseAction } = useDoctrineAccess();

  const activeModal = ref<DetailModal>(null);
  const renameTarget = ref('');
  const lifecycleModalOpen = ref(false);
  const lifecycleAction = ref<LifecycleAction>('activate');
  const modulesLoading = ref(false);
  const modulesSaving = ref(false);
  const modulesErrorMessage = ref<string | null>(null);
  const modulesAllowed = ref<ConfigurationModuleCode[]>([]);
  const modulesEnabled = ref<ConfigurationModuleCode[]>([]);
  const modulesDraft = ref<ConfigurationModuleCode[]>([]);
  const modulesEffective = ref<ConfigurationModuleCode[]>([]);
  const moduleCatalog = ref<readonly ConfigurationModuleCatalogItem[]>(configurationModuleCatalog);

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

  const school = computed(() => store.state.selectedEcole);
  const organization = computed(
    () => store.state.organisations.find((item) => item.id === school.value?.idOrganisation) ?? null,
  );
  const canMutateDetail = computed(() => canUseAction('referentiel.write', 'ADM-002'));
  const canManageModules = computed(() => canUseAction('configuration.modules.school.write', 'ADM-002'));
  const returnPath = computed(() => {
    const requested = typeof route.query.retour === 'string' ? route.query.retour : '';
    return requested.startsWith('/app/') ? requested : '/app/administration-ecole/ecoles';
  });
  const returnLabel = computed(() => returnPath.value.includes('/organisation/organisations/')
    ? 'Retour aux écoles rattachées'
    : 'Retour au registre');

  const renameEvaluation = computed(() => evaluateRenameSchool(
    school.value?.nom,
    renameTarget.value,
    store.state.mutationStatus === 'loading',
  ));
  const modeEvaluation = computed(() => evaluateSchoolModeUpdate(
    school.value?.modeExploitation,
    identityForm.modeExploitation,
    store.state.mutationStatus === 'loading',
  ));
  const identityEvaluation = computed(() => evaluateSchoolInstitutionalInfoUpdate(
    school.value,
    identityForm,
    store.state.mutationStatus === 'loading',
  ));
  const modulesDirty = computed(() => normalizeModules(modulesDraft.value) !== normalizeModules(modulesEnabled.value));
  const canSaveModules = computed(() => canManageModules.value
    && modulesDirty.value
    && !modulesLoading.value
    && !modulesSaving.value);

  const completeness = computed(() => {
    if (!school.value) return { percentage: 0, missing: [] as string[] };
    const fields = [
      ['Sigle', school.value.sigle],
      ['Téléphone', school.value.telephone],
      ['E-mail', school.value.email],
      ['Adresse', school.value.adresse],
      ['Province éducationnelle', school.value.provinceEducationnelle],
      ['Ville', school.value.ville],
      ['Commune ou territoire', school.value.communeOuTerritoire],
    ] as const;
    const missing = fields.filter(([, value]) => !String(value ?? '').trim()).map(([label]) => label);
    return { percentage: Math.round(((fields.length - missing.length) / fields.length) * 100), missing };
  });

  const moduleGroups = computed(() => ({
    allowed: createModuleCards(modulesAllowed.value),
    enabled: createModuleCards(modulesEnabled.value),
    available: createModuleCards(modulesAllowed.value.filter((code) => !modulesEnabled.value.includes(code))),
    effective: createModuleCards(modulesEffective.value),
  }));

  function createModuleCards(codes: readonly ConfigurationModuleCode[]) {
    return moduleCatalog.value.filter((module) => codes.includes(module.code));
  }

  function syncFormFromSchool(): void {
    if (!school.value) return;
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
    if (!idEcole) return;
    await Promise.all([store.loadOrganizations(), store.loadSchool(idEcole)]);
    syncFormFromSchool();
    await loadModules();
  }

  async function loadModules(): Promise<void> {
    if (!school.value) return resetModules();
    modulesLoading.value = true;
    modulesErrorMessage.value = null;
    try {
      const [catalogueResponse, resolution] = await Promise.all([
        configurationApi.consulterCatalogueModules(lireContexteApiConfiguration()),
        configurationApi.resoudreModulesEffectifs(
          { organisationId: school.value.idOrganisation, ecoleId: school.value.id },
          lireContexteApiConfiguration(),
        ),
      ]);
      moduleCatalog.value = catalogueResponse.donnees.modules.length > 0
        ? catalogueResponse.donnees.modules
        : configurationModuleCatalog;
      modulesAllowed.value = [...resolution.donnees.modulesAutorisesOrganisation];
      modulesEnabled.value = [...resolution.donnees.modulesActivesEcole];
      modulesDraft.value = [...resolution.donnees.modulesActivesEcole];
      modulesEffective.value = [...resolution.donnees.modulesEffectifs];
    } catch {
      resetModules();
      modulesErrorMessage.value = 'Les modules de cette école ne peuvent pas être affichés pour le moment.';
    } finally {
      modulesLoading.value = false;
    }
  }

  function resetModules(): void {
    modulesAllowed.value = [];
    modulesEnabled.value = [];
    modulesDraft.value = [];
    modulesEffective.value = [];
  }

  function openModal(modal: Exclude<DetailModal, null>): void {
    renameTarget.value = school.value?.nom ?? '';
    syncFormFromSchool();
    modulesDraft.value = [...modulesEnabled.value];
    activeModal.value = modal;
  }

  function closeModal(): void {
    activeModal.value = null;
  }

  async function renameSchool(): Promise<void> {
    if (!school.value?.id || !renameEvaluation.value.canSubmit) return;
    if (await store.renameSchool(school.value.id, renameTarget.value.trim())) closeModal();
  }

  async function updateMode(): Promise<void> {
    if (!school.value?.id || !modeEvaluation.value.canSubmit) return;
    if (await store.changeSchoolMode(school.value.id, identityForm.modeExploitation)) closeModal();
  }

  async function updateInstitutionalInfo(): Promise<void> {
    if (!school.value?.id || !identityEvaluation.value.canSubmit) return;
    const success = await store.updateSchoolInstitutionalInfo(school.value.id, {
      sigle: identityForm.sigle.trim() || undefined,
      telephone: identityForm.telephone.trim() || undefined,
      email: identityForm.email.trim() || undefined,
      provinceEducationnelle: identityForm.provinceEducationnelle.trim() || undefined,
      ville: identityForm.ville.trim() || undefined,
      communeOuTerritoire: identityForm.communeOuTerritoire.trim() || undefined,
      adresse: identityForm.adresse.trim() || undefined,
    });
    if (success) closeModal();
  }

  function toggleModule(code: ConfigurationModuleCode): void {
    if (!modulesAllowed.value.includes(code)) return;
    modulesDraft.value = modulesDraft.value.includes(code)
      ? modulesDraft.value.filter((item) => item !== code)
      : [...modulesDraft.value, code];
  }

  async function saveModules(): Promise<void> {
    if (!school.value || !canSaveModules.value) return;
    modulesSaving.value = true;
    modulesErrorMessage.value = null;
    try {
      await configurationApi.configurerModulesEcole(
        school.value.id,
        { organisationId: school.value.idOrganisation, modules: modulesDraft.value },
        lireContexteApiConfiguration(),
      );
      await loadModules();
      closeModal();
    } catch {
      modulesErrorMessage.value = 'Les changements n’ont pas pu être enregistrés. Votre sélection est conservée.';
    } finally {
      modulesSaving.value = false;
    }
  }

  function openLifecycleModal(action: LifecycleAction): void {
    lifecycleAction.value = action;
    lifecycleModalOpen.value = true;
  }

  async function confirmLifecycle(): Promise<void> {
    if (!school.value?.id) return;
    const success = lifecycleAction.value === 'activate'
      ? await store.activateSchool(school.value.id)
      : await store.deactivateSchool(school.value.id);
    if (success) lifecycleModalOpen.value = false;
  }

  function formatDate(value?: string): string {
    if (!value) return 'Aucune modification enregistrée';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return 'Information non disponible';
    return new Intl.DateTimeFormat('fr-FR', { dateStyle: 'long', timeStyle: 'short' }).format(date);
  }

  function normalizeModules(values: readonly string[]): string {
    return [...values].sort().join('|');
  }

  watch(school, syncFormFromSchool);
  onMounted(() => void load());

  return {
    store, school, organization, canMutateDetail, canManageModules, returnPath, returnLabel,
    activeModal, renameTarget, identityForm, schoolModeOptions, renameEvaluation, modeEvaluation,
    identityEvaluation, completeness, modulesLoading, modulesSaving, modulesErrorMessage,
    modulesAllowed, modulesDraft, moduleGroups, modulesDirty, canSaveModules,
    lifecycleModalOpen, lifecycleAction, formatDate, load, loadModules, openModal, closeModal,
    renameSchool, updateMode, updateInstitutionalInfo, toggleModule, saveModules,
    openLifecycleModal, confirmLifecycle,
  };
}
