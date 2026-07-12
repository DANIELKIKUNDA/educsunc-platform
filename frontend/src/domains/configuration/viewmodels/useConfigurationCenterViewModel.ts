import { computed, reactive, ref, watch } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import {
  Bell,
  Building2,
  Cog,
  Palette,
  ShieldCheck,
  SlidersHorizontal,
  UserRound,
  type LucideIcon,
} from 'lucide-vue-next';
import { notificationsService } from '../../../services/notifications.service';
import { sessionStore } from '../../../shared/auth/session.store';
import { useDoctrineAccess } from '../../../shared/doctrine/use-doctrine-access';
import { activeContextStore } from '../../../shared/session/active-context.store';
import { tenantContextStore } from '../../../shared/session/tenant-context.store';
import type {
  ConfigurationItem,
  ConfigurationModulesResolution,
  ConfigurationScope,
  ConfigurationScopeLevel,
  ConfigurationValue,
  EffectiveConfigurationItem,
  OfficialSystemConfigurationDefinition,
  OfficialUserConfigurationDefinition,
} from '../models/configuration.model';
import {
  configurationModuleCatalog,
  findOfficialSystemConfiguration,
  findOfficialUserConfiguration,
  officialSystemConfigurationCatalog,
  officialUserConfigurationCatalog,
  type ConfigurationModuleCode,
} from '../models/configuration.model';
import { buildScopeFromLevel, formatConfigurationValue, parseConfigurationValue } from '../mappers/configuration.mapper';
import {
  evaluateConfigurationForm,
  formatConfigurationValueForForm,
  getConfigurationFieldDefinition,
  resolveCloseBehavior,
} from './configuration-form.logic';
import { useConfigurationCenterStore } from '../stores/configuration-center.store';
import { useConfigurationModulesStore } from '../stores/configuration-modules.store';

export type ConfigurationCenterTabCode =
  | 'platform'
  | 'organization'
  | 'school-modules'
  | 'branding'
  | 'notifications'
  | 'user';

type ModalActionCode =
  | 'create'
  | 'edit'
  | 'delete'
  | 'validate'
  | 'lock'
  | 'unlock'
  | 'snapshot'
  | 'compare'
  | 'propagate'
  | 'reload'
  | 'consult';

interface ConfigurationCenterTabDefinition {
  code: ConfigurationCenterTabCode;
  label: string;
  routeName: string;
  pageCode: string;
  icon: LucideIcon;
  level: ConfigurationScopeLevel;
  keyPrefix?: string;
  description: string;
}

interface ConfigurationDisplayRow {
  key: string;
  label: string;
  description: string;
  dataTypeLabel: string;
  effectiveValueText: string;
  rawValue: ConfigurationValue | null;
  hasRecordedValue: boolean;
  isDefinedLocally: boolean;
  sourceLabel: string;
  statusLabel: string;
  inherited: boolean;
  locked: boolean;
  explanation: string;
}

const TAB_DEFINITIONS: readonly ConfigurationCenterTabDefinition[] = [
  {
    code: 'platform',
    label: 'Parametres de la plateforme',
    routeName: 'configuration-platform-runtime',
    pageCode: 'CFG-PLAT-001',
    icon: SlidersHorizontal,
    level: 'SYSTEM',
    keyPrefix: 'runtime.',
    description: 'Pilotez les reglages globaux de la plateforme.',
  },
  {
    code: 'organization',
    label: 'Politiques organisationnelles',
    routeName: 'configuration-organization',
    pageCode: 'CFG-ORG-001',
    icon: Building2,
    level: 'ORGANIZATION',
    keyPrefix: 'policies.',
    description: "Regles communes et modules autorises pour les ecoles de l'organisation.",
  },
  {
    code: 'school-modules',
    label: "Modules de l'ecole",
    routeName: 'configuration-school-modules',
    pageCode: 'CFG-ECO-001',
    icon: Cog,
    level: 'SCHOOL',
    description: 'Activation locale des modules dans le cadre autorise.',
  },
  {
    code: 'branding',
    label: 'Identite visuelle',
    routeName: 'configuration-school-branding',
    pageCode: 'CFG-ECO-002',
    icon: Palette,
    level: 'SCHOOL',
    keyPrefix: 'branding.',
    description: "Reglages visuels propres a l'ecole.",
  },
  {
    code: 'notifications',
    label: 'Notifications',
    routeName: 'configuration-school-notifications',
    pageCode: 'CFG-ECO-003',
    icon: Bell,
    level: 'SCHOOL',
    keyPrefix: 'notifications.',
    description: 'Reglages locaux de diffusion et de communication.',
  },
  {
    code: 'user',
    label: 'Preferences personnelles',
    routeName: 'configuration-user-preferences',
    pageCode: 'CFG-USER-001',
    icon: UserRound,
    level: 'USER',
    keyPrefix: 'preferences.',
    description: 'Preferences du compte actuel.',
  },
] as const;

function detectTabFromRouteName(routeName: string | symbol | null | undefined): ConfigurationCenterTabCode {
  const name = String(routeName ?? '');
  const found = TAB_DEFINITIONS.find((tab) => tab.routeName === name || (tab.code === 'user' && name === 'me-preferences'));
  return found?.code ?? 'platform';
}

function humanizeKey(key: string): string {
  return key
    .replace(/^runtime\./, '')
    .replace(/^policies\./, '')
    .replace(/^branding\./, '')
    .replace(/^notifications\./, '')
    .replace(/^preferences\./, '')
    .replace(/^user\.preferences\./, '')
    .replace(/^notifications\.preferences\./, '')
    .split('.')
    .filter(Boolean)
    .map((segment, index) => {
      const cleaned = segment.replace(/[_-]/g, ' ');
      return index === 0
        ? cleaned.charAt(0).toUpperCase() + cleaned.slice(1)
        : cleaned;
    })
    .join(' / ');
}

function formatSourceLevel(level: ConfigurationScopeLevel): string {
  switch (level) {
    case 'SYSTEM':
      return 'Plateforme';
    case 'ORGANIZATION':
      return 'Organisation';
    case 'SCHOOL':
      return 'Ecole';
    default:
      return 'Utilisateur';
  }
}

function formatLevelLabel(level: ConfigurationScopeLevel): string {
  switch (level) {
    case 'SYSTEM':
      return 'Plateforme';
    case 'ORGANIZATION':
      return 'Organisation';
    case 'SCHOOL':
      return 'Ecole';
    default:
      return 'Utilisateur';
  }
}

function mapErrorToUserMessage(error: unknown): string {
  const raw = error instanceof Error ? error.message : String(error ?? '');
  const message = raw.toLowerCase();

  if (
    message.includes('failed to fetch')
    || message.includes('networkerror')
    || message.includes('fetch')
  ) {
    return "Le centre n'a pas pu joindre le service pour le moment. Reessayez dans un instant.";
  }

  if (
    message.includes('not authorized')
    || message.includes('non autorise')
    || message.includes('permission')
    || message.includes('forbidden')
  ) {
    return "Cette action n'est pas autorisee pour le perimetre actuellement selectionne.";
  }

  if (
    message.includes('incomplet')
    || message.includes('context')
    || message.includes('contexte')
  ) {
    return "Le contexte courant ne permet pas encore cette action. Verifiez le niveau actif puis reessayez.";
  }

  if (
    message.includes('reference du reglage')
    || message.includes('identifiant')
  ) {
    return "Ouvrez d'abord un reglage existant par sa reference pour utiliser cette action avancee.";
  }

  return "Une action demandee n'a pas pu etre finalisee.";
}

function buildDisplayRows(effective: EffectiveConfigurationItem | null): ConfigurationDisplayRow[] {
  if (!effective) {
    return [];
  }

  return effective.valeurs.map((entry) => ({
    key: entry.key,
    label: findOfficialSystemConfiguration(entry.key)?.label
      ?? findOfficialUserConfiguration(entry.key)?.label
      ?? humanizeKey(entry.key),
    description: findOfficialSystemConfiguration(entry.key)?.description
      ?? findOfficialUserConfiguration(entry.key)?.description
      ?? entry.explanation,
    dataTypeLabel: findOfficialSystemConfiguration(entry.key)?.dataTypeLabel
      ?? findOfficialUserConfiguration(entry.key)?.dataTypeLabel
      ?? 'Texte court',
    effectiveValueText: formatConfigurationValue(entry.value),
    rawValue: entry.value,
    hasRecordedValue: true,
    isDefinedLocally: !entry.herite && entry.sourceNiveau === effective.scope.niveau,
    sourceLabel: formatSourceLevel(entry.sourceNiveau),
    statusLabel: entry.verrouille
      ? 'Verrouille'
      : entry.herite
        ? 'Herite'
        : 'Personnalise',
    inherited: entry.herite,
    locked: entry.verrouille,
    explanation: entry.explanation,
  }));
}

function buildOfficialConfigurationRows(
  entries: readonly (OfficialSystemConfigurationDefinition | OfficialUserConfigurationDefinition)[],
  level: ConfigurationScopeLevel,
): ConfigurationDisplayRow[] {
  return entries.map((entry) => ({
    key: entry.key,
    label: entry.label,
    description: entry.description,
    dataTypeLabel: entry.dataTypeLabel,
    effectiveValueText: 'Aucune valeur enregistree',
    rawValue: null,
    hasRecordedValue: false,
    isDefinedLocally: false,
    sourceLabel: level === 'USER' ? 'Compte actuel' : formatSourceLevel(level),
    statusLabel: 'Non renseigne',
    inherited: false,
    locked: false,
    explanation: entry.defaultValueLabel,
  }));
}

function filterOfficialDefinitionsByTab(
  tab: ConfigurationCenterTabDefinition,
): readonly (OfficialSystemConfigurationDefinition | OfficialUserConfigurationDefinition)[] {
  if (tab.code === 'user') {
    return officialUserConfigurationCatalog;
  }

  return officialSystemConfigurationCatalog.filter((entry) => {
    if (tab.code === 'platform') {
      return entry.key.startsWith('runtime.');
    }
    if (tab.code === 'organization') {
      return entry.key.startsWith('policies.');
    }
    if (tab.code === 'branding') {
      return entry.key.startsWith('branding.');
    }
    if (tab.code === 'notifications') {
      return entry.key.startsWith('notifications.');
    }

    return false;
  });
}

function mergeRowsWithOfficialCatalog(
  liveRows: readonly ConfigurationDisplayRow[],
  officialRows: readonly ConfigurationDisplayRow[],
): ConfigurationDisplayRow[] {
  if (officialRows.length === 0) {
    return [...liveRows];
  }

  const liveByKey = new Map(liveRows.map((row) => [row.key, row]));
  const merged: ConfigurationDisplayRow[] = [];

  for (const officialRow of officialRows) {
    const liveRow = liveByKey.get(officialRow.key);
    merged.push(liveRow
      ? {
          ...liveRow,
          label: officialRow.label,
          description: officialRow.description,
          dataTypeLabel: officialRow.dataTypeLabel,
          explanation: liveRow.explanation || officialRow.explanation,
        }
      : officialRow);
  }

  for (const row of liveRows) {
    if (!officialRows.some((officialRow) => officialRow.key === row.key)) {
      merged.push(row);
    }
  }

  return merged;
}

function buildScope(tab: ConfigurationCenterTabDefinition): ConfigurationScope {
  return buildScopeFromLevel(tab.level, {
    organisationId: tenantContextStore.state.organizationId,
    ecoleId: tenantContextStore.state.schoolId,
    utilisateurId: tenantContextStore.state.userId,
  });
}

export function useConfigurationCenterViewModel() {
  const route = useRoute();
  const router = useRouter();
  const doctrineAccess = useDoctrineAccess();
  const centerStore = useConfigurationCenterStore();
  const modulesStore = useConfigurationModulesStore();
  const session = sessionStore.state;
  const context = activeContextStore.state;
  const tenantContext = tenantContextStore.state;

  const activeTab = ref<ConfigurationCenterTabCode>(detectTabFromRouteName(route.name));
  const bootStatus = ref<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const bootErrorMessage = ref<string | null>(null);
  const search = ref('');
  const statusFilter = ref<'all' | 'modifiable' | 'locked' | 'inherited' | 'local'>('all');
  const selectedRowKey = ref<string | null>(null);
  const selectedModules = ref<ConfigurationModuleCode[]>([]);
  const discardModalOpen = ref(false);
  const modalDraftBaseline = ref('');

  const modalState = reactive<{
    open: boolean;
    action: ModalActionCode | null;
    title: string;
    description: string;
  }>({
    open: false,
    action: null,
    title: '',
    description: '',
  });

  const form = reactive({
    configurationId: '',
    key: '',
    valueRaw: '',
    snapshotSourceId: '',
    snapshotTargetId: '',
    lockLevel: 'SCHOOL' as ConfigurationScopeLevel,
    reason: '',
  });

  const currentTab = computed(() =>
    TAB_DEFINITIONS.find((tab) => tab.code === activeTab.value) ?? TAB_DEFINITIONS[0],
  );

  const visibleTabs = computed(() =>
    TAB_DEFINITIONS.filter((tab) => doctrineAccess.canAccessPage(tab.pageCode))
      .map((tab) => ({
        code: tab.code,
        label: tab.label,
        icon: tab.icon,
        description: tab.description,
        levelLabel: formatLevelLabel(tab.level),
      })),
  );

  const canReadCenter = computed(() => visibleTabs.value.length > 0);
  const currentPageCode = computed(() => currentTab.value.pageCode);
  const canMutateCurrentTab = computed(() => doctrineAccess.listVisibleActions(currentPageCode.value).length > 0);
  const currentLevelLabel = computed(() => formatLevelLabel(currentTab.value.level));
  const currentFamilyLabel = computed(() => currentTab.value.label);
  const hasActiveFilters = computed(() => search.value.trim().length > 0 || statusFilter.value !== 'all');
  const hasLoadedConfiguration = computed(() => Boolean(centerStore.state.configuration?.identifiant || form.configurationId.trim()));
  const canCreateFromSelection = computed(() =>
    activeTab.value !== 'school-modules'
    && canMutateCurrentTab.value
    && Boolean(selectedRow.value?.key)
    && !selectedRow.value?.locked
    && (
      !selectedRow.value?.hasRecordedValue
      || hasLoadedConfiguration.value
    )
  );
  const selectedFieldDefinition = computed(() => {
    const row = selectedRow.value;
    if (!row) {
      return null;
    }

    return getConfigurationFieldDefinition(row.key, row.dataTypeLabel, row.label);
  });
  const formEvaluation = computed(() => {
    const row = selectedRow.value;
    const fieldDefinition = selectedFieldDefinition.value;

    if (!row || !fieldDefinition) {
      return null;
    }

    return evaluateConfigurationForm({
      action: modalState.action === 'edit' ? 'edit' : 'create',
      rawValue: form.valueRaw,
      initialValue: row.rawValue,
      fieldDefinition,
      isLoaded: hasLoadedConfiguration.value,
      canMutate: canMutateCurrentTab.value,
      locked: row.locked,
      isSubmitting: centerStore.state.status === 'loading',
      conflictDetected: false,
    });
  });

  const contextBadges = computed(() => {
    const badges = [session.actorLabel];

    if (currentTab.value.level === 'ORGANIZATION' || currentTab.value.level === 'SCHOOL') {
      badges.push(context.organizationName);
    }

    if (currentTab.value.level === 'SCHOOL') {
      badges.push(context.schoolName);
    }

    if (currentTab.value.level === 'USER') {
      badges.push('Compte personnel');
    }

    badges.push(canMutateCurrentTab.value ? 'Modifications autorisees' : 'Lecture seule');
    return badges;
  });

  const centerIntro = computed(() => {
    switch (context.governanceLevel) {
      case 'PLATEFORME':
        return 'Retrouvez ici les reglages globaux de la plateforme et les lectures utiles avant diffusion.';
      case 'ORGANISATION':
        return "Pilotez ici les politiques communes de l'organisation sans melanger les usages propres a chaque ecole.";
      case 'ECOLE':
        return "Pilotez ici les reglages propres a l'ecole, ses modules actifs et ses usages locaux autorises.";
      default:
        return 'Retrouvez ici les preferences propres au compte actuellement ouvert.';
    }
  });

  const familyCards = computed(() =>
    visibleTabs.value.map((tab) => ({
      code: tab.code,
      label: tab.label,
      description: tab.description,
      levelLabel: tab.levelLabel,
      active: activeTab.value === tab.code,
    })),
  );

  const currentRows = computed(() => {
    if (activeTab.value === 'school-modules') {
      const resolution = modulesStore.state.effective;
      if (!resolution) {
        return [];
      }

      return configurationModuleCatalog.map((module) => ({
        key: module.code,
        label: module.label,
        description: module.description,
        dataTypeLabel: 'Catalogue de modules',
        effectiveValueText: resolution.modulesEffectifs.includes(module.code) ? 'Disponible pour l usage' : 'Non disponible',
        rawValue: resolution.modulesEffectifs.includes(module.code),
        hasRecordedValue: true,
        isDefinedLocally: resolution.modulesActivesEcole.includes(module.code),
        sourceLabel: resolution.modulesAutorisesOrganisation.includes(module.code) ? "Autorise par l'organisation" : 'Non autorise',
        statusLabel: resolution.modulesEffectifs.includes(module.code) ? 'Disponible' : 'Non disponible',
        inherited: !resolution.modulesActivesEcole.includes(module.code),
        locked: !resolution.modulesAutorisesOrganisation.includes(module.code),
        explanation: module.description,
      }));
    }

    const liveRows = buildDisplayRows(centerStore.state.effective);
    const officialRows = buildOfficialConfigurationRows(
      filterOfficialDefinitionsByTab(currentTab.value),
      currentTab.value.level,
    );

    return mergeRowsWithOfficialCatalog(liveRows, officialRows);
  });

  const filteredRows = computed(() =>
    currentRows.value.filter((row) => {
      const matchesSearch = search.value.trim().length === 0
        || row.label.toLowerCase().includes(search.value.trim().toLowerCase())
        || row.key.toLowerCase().includes(search.value.trim().toLowerCase());

      const matchesStatus = statusFilter.value === 'all'
        || (statusFilter.value === 'locked' && row.locked)
        || (statusFilter.value === 'inherited' && row.inherited)
        || (statusFilter.value === 'local' && !row.inherited)
        || (statusFilter.value === 'modifiable' && !row.locked);

      return matchesSearch && matchesStatus;
    }),
  );

  const selectedRow = computed(() => {
    if (!filteredRows.value.length) {
      return null;
    }

    return filteredRows.value.find((row) => row.key === selectedRowKey.value) ?? filteredRows.value[0];
  });

  const summaryCards = computed(() => {
    const rows = currentRows.value;
    const total = rows.length;
    const locked = rows.filter((row) => row.locked).length;
    const inherited = rows.filter((row) => row.inherited).length;

    if (activeTab.value === 'school-modules') {
      const resolution = modulesStore.state.effective;
      return [
        {
          code: 'allowed',
          icon: ShieldCheck,
          label: 'Modules autorises',
          value: resolution?.modulesAutorisesOrganisation.length ?? 0,
          hint: "Cadre fixe par l'organisation",
          tone: 'primary' as const,
        },
        {
          code: 'active',
          icon: Cog,
          label: 'Modules actifs',
          value: resolution?.modulesActivesEcole.length ?? 0,
          hint: "Actives localement dans l'ecole",
          tone: 'success' as const,
        },
        {
          code: 'effective',
          icon: ShieldCheck,
          label: 'Modules disponibles',
          value: resolution?.modulesEffectifs.length ?? 0,
          hint: 'Reellement exploitables',
          tone: 'warning' as const,
        },
        {
          code: 'review',
          icon: SlidersHorizontal,
          label: 'Points a verifier',
          value: Math.max((resolution?.modulesAutorisesOrganisation.length ?? 0) - (resolution?.modulesEffectifs.length ?? 0), 0),
          hint: 'Ecart entre autorisation et activation',
          tone: 'neutral' as const,
        },
      ];
    }

    return [
      {
        code: 'visible',
        icon: currentTab.value.icon,
        label: 'Reglages visibles',
        value: total,
        hint: 'Elements lus pour ce niveau',
        tone: 'primary' as const,
      },
      {
        code: 'local',
        icon: currentTab.value.icon,
        label: activeTab.value === 'user' ? 'Preferences personnalisees' : 'Reglages personnalises',
        value: rows.filter((row) => row.isDefinedLocally).length,
        hint: 'Valeurs definies au niveau courant',
        tone: 'success' as const,
      },
        {
          code: 'saved',
          icon: SlidersHorizontal,
          label: 'Versions du reglage ouvert',
          value: centerStore.state.configuration?.totalVersions ?? 0,
          hint: hasLoadedConfiguration.value
            ? 'Historique connu pour le reglage ouvert'
            : 'Ouvrez un reglage pour voir son historique',
          tone: 'warning' as const,
        },
      {
        code: 'review',
        icon: ShieldCheck,
        label: 'Alertes a verifier',
        value: locked + inherited + rows.filter((row) => !row.hasRecordedValue).length,
        hint: 'Valeurs heritees ou verrouillees',
        tone: 'neutral' as const,
      },
    ];
  });

  const detailFacts = computed(() => {
    const row = selectedRow.value;
    if (!row) {
      return [];
    }

    return [
      { label: 'Reglage', value: row.label },
      { label: 'Description', value: row.description },
      { label: 'Type de saisie', value: row.dataTypeLabel },
      { label: 'Valeur enregistree', value: row.hasRecordedValue ? row.effectiveValueText : 'Aucune valeur enregistree' },
      { label: 'Valeur appliquee', value: row.effectiveValueText },
      { label: 'Origine', value: row.sourceLabel },
      { label: 'Statut', value: row.statusLabel },
      { label: 'Repere utile', value: row.explanation },
    ];
  });
  const primaryActionLabel = computed(() => {
    if (activeTab.value === 'school-modules') {
      return 'Enregistrer les modules actifs';
    }

    if (!selectedRow.value) {
      return 'Enregistrer';
    }

    return selectedRow.value.hasRecordedValue ? 'Mettre a jour la valeur' : 'Enregistrer une valeur';
  });
  const modalActionLabel = computed(() => {
    switch (modalState.action) {
      case 'delete':
        return 'Supprimer';
      case 'lock':
        return 'Verrouiller';
      case 'propagate':
        return 'Appliquer';
      case 'validate':
        return 'Verifier';
      case 'compare':
        return 'Comparer';
      case 'snapshot':
        return 'Enregistrer la version';
      case 'reload':
        return 'Actualiser';
      default:
        return selectedRow.value?.hasRecordedValue ? 'Mettre a jour' : 'Enregistrer';
    }
  });
  const modalDraftDirty = computed(() => {
    if (!modalState.open) {
      return false;
    }

    const snapshot = JSON.stringify({
      configurationId: form.configurationId,
      key: form.key,
      valueRaw: form.valueRaw,
      snapshotSourceId: form.snapshotSourceId,
      snapshotTargetId: form.snapshotTargetId,
      lockLevel: form.lockLevel,
      reason: form.reason,
      modules: [...selectedModules.value],
      action: modalState.action,
    });

    return snapshot !== modalDraftBaseline.value;
  });

  function syncFormWithSelection(): void {
    const row = selectedRow.value;
    form.key = row?.key ?? currentTab.value.keyPrefix ?? '';
    form.valueRaw = row && selectedFieldDefinition.value
      ? formatConfigurationValueForForm(row.rawValue, selectedFieldDefinition.value)
      : '';
    form.lockLevel = currentTab.value.level === 'SYSTEM' ? 'SYSTEM' : currentTab.value.level;
    form.reason = '';
  }

  function captureModalBaseline(): void {
    modalDraftBaseline.value = JSON.stringify({
      configurationId: form.configurationId,
      key: form.key,
      valueRaw: form.valueRaw,
      snapshotSourceId: form.snapshotSourceId,
      snapshotTargetId: form.snapshotTargetId,
      lockLevel: form.lockLevel,
      reason: form.reason,
      modules: [...selectedModules.value],
      action: modalState.action,
    });
  }

  watch(selectedRow, () => {
    syncFormWithSelection();
  }, { immediate: true });

  watch(() => route.name, () => {
    activeTab.value = detectTabFromRouteName(route.name);
  });

  async function loadCurrentTab(): Promise<void> {
    if (!canReadCenter.value) {
      bootStatus.value = 'error';
      bootErrorMessage.value = "Vous n'etes pas autorise a consulter ce centre pour le niveau actuellement selectionne.";
      return;
    }

    bootStatus.value = 'loading';
    bootErrorMessage.value = null;

    try {
      if (activeTab.value === 'school-modules') {
        await modulesStore.resoudre(tenantContext.organizationId, tenantContext.schoolId);
        if (modulesStore.state.effective) {
          selectedModules.value = [...modulesStore.state.effective.modulesActivesEcole];
        }
      } else {
        const tab = currentTab.value;
        await centerStore.consulterEffective({
          niveau: tab.level,
          organisationId: tab.level === 'SYSTEM' ? undefined : tenantContext.organizationId,
          ecoleId: tab.level === 'SCHOOL' || tab.level === 'USER' ? tenantContext.schoolId : undefined,
          utilisateurId: tab.level === 'USER' ? tenantContext.userId : undefined,
          keyPrefix: tab.keyPrefix,
        });
      }

      selectedRowKey.value = filteredRows.value[0]?.key ?? null;
      bootStatus.value = 'ready';
    } catch (error) {
      bootStatus.value = 'error';
      bootErrorMessage.value = mapErrorToUserMessage(error);
    }
  }

  async function selectTab(tabCode: ConfigurationCenterTabCode): Promise<void> {
    const tab = TAB_DEFINITIONS.find((item) => item.code === tabCode);
    if (!tab) {
      return;
    }

    activeTab.value = tab.code;
    await router.replace({ name: tab.routeName });
    await loadCurrentTab();
  }

  function openModal(action: ModalActionCode): void {
    syncFormWithSelection();
    const row = selectedRow.value;
    const actionTitles: Record<ModalActionCode, [string, string]> = {
      create: ['Personnaliser le reglage', 'Enregistrez une valeur propre a ce niveau sans quitter ce centre.'],
      edit: ['Modifier ce reglage', 'Mettez a jour la valeur definie pour le niveau courant.'],
      delete: ['Supprimer ce reglage', 'Cette action retirera la valeur definie pour ce niveau.'],
      validate: ['Verifier ce reglage', 'Controlez la coherence de la valeur avant application.'],
      lock: ['Verrouiller les modifications', 'Les niveaux inferieurs ne pourront plus personnaliser ce reglage selon les regles en vigueur.'],
      unlock: ['Autoriser les modifications', 'Les modifications locales redeviendront possibles selon les regles en vigueur.'],
      snapshot: ['Enregistrer une version', 'Conservez une version lisible du reglage actuellement applique.'],
      compare: ['Comparer des versions', 'Visualisez clairement les ecarts entre deux versions enregistrees.'],
      propagate: ['Appliquer aux niveaux concernes', 'Diffusez cette modification selon les capacites reelles du backend.'],
      reload: ['Actualiser', "Relancez l'application de ce reglage dans le systeme."],
      consult: ['Ouvrir un reglage', "Consultez un reglage a partir de sa reference connue."],
    };

    modalState.open = true;
    modalState.action = action;
    modalState.title = actionTitles[action][0];
    modalState.description = row
      ? `${actionTitles[action][1]} Reglage cible : ${row.label}.`
      : actionTitles[action][1];
    discardModalOpen.value = false;
    captureModalBaseline();
  }

  function forceCloseModal(): void {
    modalState.open = false;
    modalState.action = null;
    discardModalOpen.value = false;
  }

  function closeModal(intent: 'cancel' | 'escape' | 'backdrop' | 'button' = 'button'): void {
    const resolution = resolveCloseBehavior(
      intent,
      modalDraftDirty.value,
      centerStore.state.status === 'loading',
    );

    if (resolution === 'close') {
      forceCloseModal();
      return;
    }

    if (resolution === 'confirm') {
      discardModalOpen.value = true;
    }
  }

  function keepEditing(): void {
    discardModalOpen.value = false;
  }

  function discardAndClose(): void {
    forceCloseModal();
  }

  function requireConfigurationId(): string {
    return form.configurationId.trim() || centerStore.state.configuration?.identifiant || '';
  }

  async function submitModal(): Promise<void> {
    const tab = currentTab.value;
    const scope = buildScope(tab);
    const actorId = tenantContext.userId;

    try {
      if (activeTab.value === 'school-modules') {
        await modulesStore.configurerEcole(
          tenantContext.organizationId,
          tenantContext.schoolId,
          selectedModules.value,
          actorId,
        );
        notificationsService.succes(
          'Modules mis a jour',
          "Les modules actifs de l'ecole ont ete enregistres.",
        );
        closeModal();
        await loadCurrentTab();
        return;
      }

      switch (modalState.action) {
        case 'create':
          await centerStore.creer({
            key: form.key.trim(),
            value: parseConfigurationValue(form.valueRaw),
            scope,
            actorId,
          });
          form.configurationId = centerStore.state.configuration?.identifiant ?? '';
          notificationsService.succes('Reglage enregistre', 'Le reglage a ete cree avec succes.');
          break;
        case 'edit': {
          if (!hasLoadedConfiguration.value) {
            throw new Error('reference du reglage manquante');
          }
          const id = requireConfigurationId();
          if (!id) {
            throw new Error('reference du reglage manquante');
          }
          await centerStore.mettreAJour(id, {
            value: parseConfigurationValue(form.valueRaw),
            actorId,
          });
          notificationsService.succes('Reglage mis a jour', 'Les modifications ont ete enregistrees.');
          break;
        }
        case 'delete': {
          if (!hasLoadedConfiguration.value) {
            throw new Error('reference du reglage manquante');
          }
          const id = requireConfigurationId();
          if (!id) {
            throw new Error('reference du reglage manquante');
          }
          await centerStore.supprimer(id, { actorId, raison: form.reason.trim() || undefined });
          notificationsService.succes('Reglage supprime', 'Le reglage a ete retire pour ce niveau.');
          form.configurationId = '';
          break;
        }
        case 'validate':
          await centerStore.valider({
            key: form.key.trim(),
            value: parseConfigurationValue(form.valueRaw),
            scope,
          });
          notificationsService.succes('Verification terminee', 'La configuration a ete verifiee avec succes.');
          break;
        case 'lock': {
          if (!hasLoadedConfiguration.value) {
            throw new Error('reference du reglage manquante');
          }
          const id = requireConfigurationId();
          if (!id) {
            throw new Error('reference du reglage manquante');
          }
          await centerStore.verrouiller(id, {
            niveauMinimalAutorise: form.lockLevel,
            actorId,
            raison: form.reason.trim() || undefined,
          });
          notificationsService.succes('Modifications verrouillees', 'Le reglage est desormais protege contre certaines personnalisations locales.');
          break;
        }
        case 'unlock': {
          if (!hasLoadedConfiguration.value) {
            throw new Error('reference du reglage manquante');
          }
          const id = requireConfigurationId();
          if (!id) {
            throw new Error('reference du reglage manquante');
          }
          await centerStore.deverrouiller(id, { actorId });
          notificationsService.succes('Modifications reouvertes', 'Les modifications autorisees peuvent de nouveau etre appliquees.');
          break;
        }
        case 'snapshot': {
          if (!hasLoadedConfiguration.value) {
            throw new Error('reference du reglage manquante');
          }
          const id = requireConfigurationId();
          if (!id) {
            throw new Error('reference du reglage manquante');
          }
          await centerStore.creerSnapshot(id, { actorId });
          notificationsService.succes('Version enregistree', 'Une nouvelle version du reglage a ete enregistree.');
          break;
        }
        case 'compare': {
          if (!hasLoadedConfiguration.value) {
            throw new Error('reference du reglage manquante');
          }
          const id = requireConfigurationId();
          if (!id) {
            throw new Error('reference du reglage manquante');
          }
          await centerStore.comparerSnapshots(id, {
            sourceId: form.snapshotSourceId.trim(),
            cibleId: form.snapshotTargetId.trim(),
          });
          notificationsService.succes('Comparaison terminee', 'Les differences entre les versions ont ete chargees.');
          break;
        }
        case 'propagate': {
          if (!hasLoadedConfiguration.value) {
            throw new Error('reference du reglage manquante');
          }
          const id = requireConfigurationId();
          if (!id) {
            throw new Error('reference du reglage manquante');
          }
          await centerStore.propager(id, { actorId });
          notificationsService.succes('Application demandee', 'La demande d application aux niveaux concernes a ete transmise.');
          break;
        }
        case 'reload': {
          if (!hasLoadedConfiguration.value) {
            throw new Error('reference du reglage manquante');
          }
          const id = requireConfigurationId();
          if (!id) {
            throw new Error('reference du reglage manquante');
          }
          await centerStore.recharger(id, { actorId, forcer: true });
          notificationsService.succes('Actualisation demandee', "La demande d'actualisation a ete transmise.");
          break;
        }
        case 'consult': {
          const id = requireConfigurationId();
          if (!id) {
            throw new Error('reference du reglage manquante');
          }
          await centerStore.consulter(id);
          form.key = centerStore.state.configuration?.key ?? form.key;
          form.valueRaw = centerStore.state.configuration ? formatConfigurationValue(centerStore.state.configuration.valeur) : form.valueRaw;
          notificationsService.info('Reglage charge', 'Le reglage cible est maintenant disponible dans le panneau detail.');
          break;
        }
        default:
          break;
      }

      forceCloseModal();
      await loadCurrentTab();
    } catch (error) {
      const message = mapErrorToUserMessage(error);
      notificationsService.danger('Action impossible', message);
    }
  }

  async function recharger(): Promise<void> {
    await loadCurrentTab();
  }

  function clearFilters(): void {
    search.value = '';
    statusFilter.value = 'all';
  }

  const currentStatus = computed(() => {
    if (bootStatus.value === 'loading') {
      return 'loading';
    }
    if (bootStatus.value === 'error') {
      return 'error';
    }
    return 'ready';
  });

  return reactive({
    session,
    context,
    centerStore,
    modulesStore,
    activeTab,
    currentTab,
    visibleTabs,
    familyCards,
    canReadCenter,
    canMutateCurrentTab,
    bootStatus,
    bootErrorMessage,
    currentRows,
    filteredRows,
    selectedRow,
    selectedRowKey,
    selectedModules,
    search,
    statusFilter,
    summaryCards,
    detailFacts,
    currentLevelLabel,
    currentFamilyLabel,
    contextBadges,
    centerIntro,
    hasLoadedConfiguration,
    canCreateFromSelection,
    hasActiveFilters,
    selectedFieldDefinition,
    formEvaluation,
    primaryActionLabel,
    modalActionLabel,
    modalDraftDirty,
    discardModalOpen,
    modalState,
    form,
    configurationModuleCatalog,
    currentStatus,
    loadCurrentTab,
    selectTab,
    openModal,
    closeModal,
    keepEditing,
    discardAndClose,
    submitModal,
    recharger,
    clearFilters,
  });
}
