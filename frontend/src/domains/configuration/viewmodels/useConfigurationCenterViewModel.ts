import { computed, onBeforeUnmount, reactive, ref, watch } from 'vue';
import { onBeforeRouteLeave, useRoute, useRouter } from 'vue-router';
import {
  Cog,
  ShieldCheck,
  SlidersHorizontal,
  UserRound,
  type LucideIcon,
} from 'lucide-vue-next';
import { notificationsService } from '../../../services/notifications.service';
import { ApiError } from '../../../shared/http/api.client';
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
  findOfficialSystemConfiguration,
  findOfficialUserConfiguration,
  officialSystemConfigurationCatalog,
  officialUserConfigurationCatalog,
  type ConfigurationModuleCode,
} from '../models/configuration.model';
import { buildScopeFromLevel } from '../mappers/configuration.mapper';
import {
  evaluateConfigurationForm,
  formatConfigurationValueForForm,
  getConfigurationFieldDefinition,
  resolveCloseBehavior,
} from './configuration-form.logic';
import { useConfigurationCenterStore } from '../stores/configuration-center.store';
import { useConfigurationModulesStore } from '../stores/configuration-modules.store';
import { useTheme } from '../../../composables/useTheme';

export type ConfigurationCenterTabCode =
  | 'platform'
  | 'school-modules'
  | 'user';

type ModalActionCode =
  | 'create'
  | 'edit'
  | 'delete'
  | 'validate'
  | 'lock'
  | 'unlock'
  | 'snapshot'
  | 'reload';

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
  valueBadges: readonly string[];
  rawValue: ConfigurationValue | null;
  hasRecordedValue: boolean;
  isDefinedLocally: boolean;
  sourceLabel: string;
  statusLabel: string;
  inherited: boolean;
  locked: boolean;
  explanation: string;
  sourceConfigurationId: string | null;
  sourceTotalVersions: number;
  sourceCreatedAt: string | Date | null;
}

const TAB_DEFINITIONS: readonly ConfigurationCenterTabDefinition[] = [
  {
    code: 'platform',
    label: 'Paramètres de la plateforme',
    routeName: 'configuration-platform-runtime',
    pageCode: 'CFG-PLAT-001',
    icon: SlidersHorizontal,
    level: 'SYSTEM',
    description: 'Pilotez les réglages globaux de la plateforme et la diffusion des notifications.',
  },
  {
    code: 'school-modules',
    label: "Modules de l'école",
    routeName: 'configuration-school-modules',
    pageCode: 'CFG-ECO-001',
    icon: Cog,
    level: 'SCHOOL',
    description: "Activez uniquement les modules autorisés par l'organisation.",
  },
  {
    code: 'user',
    label: 'Préférences personnelles',
    routeName: 'configuration-user-preferences',
    pageCode: 'CFG-USER-001',
    icon: UserRound,
    level: 'USER',
    description: 'Personnalisez votre apparence et vos canaux de notification.',
  },
] as const;

function detectTabFromRouteName(routeName: string | symbol | null | undefined): ConfigurationCenterTabCode {
  const name = String(routeName ?? '');
  const found = TAB_DEFINITIONS.find((tab) => tab.routeName === name || (tab.code === 'user' && name === 'me-preferences'));
  if (found) {
    return found.code;
  }
  if (name === 'configuration-organization' || name === 'configuration-school-branding' || name === 'configuration-school-notifications') {
    return 'platform';
  }
  return 'platform';
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
      return 'École';
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
      return 'École';
    default:
      return 'Utilisateur';
  }
}

const PRESENTATION_VALUE_LABELS: Readonly<Record<string, string>> = {
  system: 'Selon le système',
  light: 'Clair',
  dark: 'Sombre',
  true: 'Oui',
  false: 'Non',
  IN_APP: "Dans l'application",
  SMS: 'SMS',
  EMAIL: 'E-mail',
  WHATSAPP: 'WhatsApp',
  PUSH: 'Notification push',
  WEBHOOK: 'Service connecté',
  SYSTEM: 'Plateforme',
  ORGANIZATION: 'Organisation',
  SCHOOL: 'École',
  USER: 'Compte personnel',
};

function formatPresentationScalar(value: string | number | boolean | null): string {
  if (value === null) return 'Non renseigné';
  const raw = String(value);
  return PRESENTATION_VALUE_LABELS[raw] ?? raw;
}

function normalizePresentationValues(value: ConfigurationValue): readonly string[] {
  if (Array.isArray(value)) {
    return value.flatMap((entry) => normalizePresentationValues(entry));
  }

  if (typeof value === 'string') {
    const trimmed = value.trim();
    if (trimmed.startsWith('[') && trimmed.endsWith(']')) {
      try {
        const parsed = JSON.parse(trimmed) as unknown;
        if (Array.isArray(parsed)) {
          return parsed.flatMap((entry) => (
            typeof entry === 'string' || typeof entry === 'number' || typeof entry === 'boolean'
              ? [formatPresentationScalar(entry)]
              : []
          ));
        }
      } catch {
        // La valeur reste lisible comme un texte normal si elle ne contient pas une liste valide.
      }
    }
    return [formatPresentationScalar(trimmed)];
  }

  if (typeof value === 'number' || typeof value === 'boolean' || value === null) {
    return [formatPresentationScalar(value)];
  }

  return ['Valeur structurée'];
}

function formatPresentationValue(value: ConfigurationValue): string {
  return normalizePresentationValues(value).join(', ');
}

function getSettingActionLabel(key: string, fallbackLabel: string): string {
  const labels: Readonly<Record<string, string>> = {
    'preferences.theme': 'Choisir mon thème',
    'notifications.preferences.muted': 'Gérer les interruptions',
    'notifications.preferences.preferredChannel': 'Choisir mon canal préféré',
    'notifications.preferences.enabledChannels': 'Choisir mes canaux acceptés',
  };

  return labels[key] ?? `Modifier ${fallbackLabel.charAt(0).toLowerCase()}${fallbackLabel.slice(1)}`;
}

function mapErrorToUserMessage(error: unknown): string {
  if (error instanceof ApiError) {
    if (error.status === 0) return 'La connexion au service est momentanément indisponible. Vérifiez votre réseau puis réessayez.';
    if (error.status === 401) return 'Votre session a expiré. Reconnectez-vous avant de poursuivre.';
    if (error.status === 403) return "Vous n'êtes pas autorisé à effectuer cette action dans le périmètre sélectionné.";
    if (error.status === 409) return 'Ce réglage a été modifié ailleurs. Rechargez sa dernière version avant de reprendre votre modification.';
    if (error.status === 422 || error.status === 400) return 'Certaines informations doivent être corrigées avant de poursuivre.';
    if (error.status >= 500) return 'Le service est momentanément indisponible. Votre saisie est conservée; réessayez dans un instant.';
  }

  const raw = error instanceof Error ? error.message : String(error ?? '');
  const message = raw.toLowerCase();

  if (
    message.includes('failed to fetch')
    || message.includes('networkerror')
    || message.includes('fetch')
  ) {
    return "Le centre n'a pas pu joindre le service pour le moment. Réessayez dans un instant.";
  }

  if (
    message.includes('not authorized')
    || message.includes('non autorise')
    || message.includes('permission')
    || message.includes('forbidden')
  ) {
    return "Cette action n'est pas autorisée pour le périmètre actuellement sélectionné.";
  }

  if (
    message.includes('incomplet')
    || message.includes('context')
    || message.includes('contexte')
  ) {
    return "Le contexte courant ne permet pas cette action. Vérifiez le niveau actif puis réessayez.";
  }

  if (
    message.includes('reference du reglage')
    || message.includes('identifiant')
  ) {
    return "Ouvrez d'abord un réglage existant avant d'utiliser cette action.";
  }

  return "L'action n'a pas pu être finalisée. Votre saisie a été conservée.";
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
    effectiveValueText: formatPresentationValue(entry.value),
    valueBadges: normalizePresentationValues(entry.value).length > 1
      ? normalizePresentationValues(entry.value)
      : [],
    rawValue: entry.value,
    hasRecordedValue: true,
    isDefinedLocally: !entry.herite && entry.sourceNiveau === effective.scope.niveau,
    sourceLabel: entry.sourceNiveau === 'USER' ? 'Compte personnel' : formatSourceLevel(entry.sourceNiveau),
    statusLabel: entry.verrouille
      ? 'Verrouille'
      : entry.herite
        ? 'Herite'
        : entry.sourceNiveau === 'USER'
          ? 'Personnalisée'
          : 'Personnalisé',
    inherited: entry.herite,
    locked: entry.verrouille,
    explanation: entry.explanation,
    sourceConfigurationId: entry.sourceConfigurationId ?? null,
    sourceTotalVersions: entry.sourceTotalVersions ?? 0,
    sourceCreatedAt: entry.sourceCreeLe ?? null,
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
    effectiveValueText: 'Valeur initiale appliquée',
    valueBadges: [],
    rawValue: null,
    hasRecordedValue: false,
    isDefinedLocally: false,
    sourceLabel: level === 'USER' ? 'Compte personnel' : formatSourceLevel(level),
    statusLabel: level === 'USER' ? 'Par défaut' : 'Valeur initiale',
    inherited: false,
    locked: false,
    explanation: entry.defaultValueLabel,
    sourceConfigurationId: null,
    sourceTotalVersions: 0,
    sourceCreatedAt: null,
  }));
}

function filterOfficialDefinitionsByTab(
  tab: ConfigurationCenterTabDefinition,
): readonly (OfficialSystemConfigurationDefinition | OfficialUserConfigurationDefinition)[] {
  if (tab.code === 'user') {
    return officialUserConfigurationCatalog;
  }
  return tab.code === 'platform' ? officialSystemConfigurationCatalog : [];
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
  const themeManager = useTheme();

  const activeTab = ref<ConfigurationCenterTabCode>(detectTabFromRouteName(route.name));
  const bootStatus = ref<'idle' | 'loading' | 'ready' | 'error'>('idle');
  const bootErrorMessage = ref<string | null>(null);
  const search = ref('');
  const statusFilter = ref<'all' | 'modifiable' | 'locked' | 'inherited' | 'local'>('all');
  const selectedRowKey = ref<string | null>(null);
  const selectedModules = ref<ConfigurationModuleCode[]>([]);
  const discardModalOpen = ref(false);
  const modalDraftBaseline = ref('');
  const isSubmitting = ref(false);
  const conflictDetected = ref(false);
  const appliedConfigurationIds = ref(new Set<string>());
  let selectionRequest = 0;

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
  const hasLoadedConfiguration = computed(() => Boolean(
    form.configurationId.trim()
    && centerStore.state.configuration?.identifiant === form.configurationId.trim(),
  ));
  const canCreateFromSelection = computed(() =>
    activeTab.value !== 'school-modules'
    && canMutateCurrentTab.value
    && Boolean(selectedRow.value?.key)
    && !selectedRow.value?.locked
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
      isSubmitting: isSubmitting.value,
      conflictDetected: conflictDetected.value,
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

    badges.push(canMutateCurrentTab.value ? 'Modifications autorisées' : 'Lecture seule');
    return badges;
  });

  const centerIntro = computed(() => {
    switch (context.governanceLevel) {
      case 'PLATEFORME':
        return 'Pilotez les réglages globaux de la plateforme et les canaux de diffusion depuis un espace unique.';
      case 'ORGANISATION':
        return "Pilotez les réglages communs de l'organisation sans mélanger les usages propres à chaque école.";
      case 'ECOLE':
        return "Pilotez les réglages propres à l'école et les modules autorisés dans son périmètre.";
      default:
        return 'Personnalisez les préférences du compte actuellement ouvert.';
    }
  });

  const familyCards = computed(() =>
    visibleTabs.value.map((tab) => ({
      code: tab.code,
      label: tab.label,
      icon: tab.icon,
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

      return modulesStore.state.catalog.map((module) => ({
        key: module.code,
        label: module.label,
        description: module.description,
        dataTypeLabel: 'Catalogue de modules',
        effectiveValueText: resolution.modulesEffectifs.includes(module.code) ? 'Disponible pour l usage' : 'Non disponible',
        valueBadges: [],
        rawValue: resolution.modulesEffectifs.includes(module.code),
        hasRecordedValue: true,
        isDefinedLocally: resolution.modulesActivesEcole.includes(module.code),
        sourceLabel: resolution.modulesAutorisesOrganisation.includes(module.code) ? "Autorise par l'organisation" : 'Non autorise',
        statusLabel: resolution.modulesEffectifs.includes(module.code) ? 'Disponible' : 'Non disponible',
        inherited: !resolution.modulesActivesEcole.includes(module.code),
        locked: !resolution.modulesAutorisesOrganisation.includes(module.code),
        explanation: module.description,
        sourceConfigurationId: null,
        sourceTotalVersions: 0,
        sourceCreatedAt: null,
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
        || (statusFilter.value === 'local' && row.isDefinedLocally)
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
        label: 'Modules autorisés',
          value: resolution?.modulesAutorisesOrganisation.length ?? 0,
          hint: "Cadre défini par l'organisation",
          tone: 'primary' as const,
        },
        {
          code: 'active',
          icon: Cog,
          label: 'Modules actifs',
          value: resolution?.modulesActivesEcole.length ?? 0,
          hint: "Activés localement dans l'école",
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
        label: 'Réglages visibles',
        value: total,
        hint: 'Éléments disponibles pour ce niveau',
        tone: 'primary' as const,
      },
      {
        code: 'local',
        icon: currentTab.value.icon,
        label: activeTab.value === 'user' ? 'Préférences personnalisées' : 'Réglages personnalisés',
        value: rows.filter((row) => row.isDefinedLocally).length,
        hint: 'Valeurs définies au niveau courant',
        tone: 'success' as const,
      },
        {
          code: 'saved',
          icon: SlidersHorizontal,
          label: 'Versions du reglage ouvert',
          value: selectedRow.value?.sourceTotalVersions ?? centerStore.state.configuration?.totalVersions ?? 0,
          hint: hasLoadedConfiguration.value
            ? 'Historique connu pour le réglage ouvert'
            : 'Sélectionnez un réglage pour voir son historique',
          tone: 'warning' as const,
        },
      {
        code: 'review',
        icon: ShieldCheck,
        label: 'Alertes a verifier',
        value: locked + inherited + rows.filter((row) => !row.hasRecordedValue).length,
        hint: 'Valeurs héritées, verrouillées ou initiales',
        tone: 'neutral' as const,
      },
    ];
  });

  const detailFacts = computed(() => {
    const row = selectedRow.value;
    if (!row) {
      return [];
    }

    const originExplanation = activeTab.value === 'user'
      ? row.isDefinedLocally
        ? 'Cette valeur a été personnalisée pour votre compte.'
        : 'La valeur proposée par défaut est actuellement utilisée pour votre compte.'
      : row.inherited
        ? `Cette valeur provient du niveau ${row.sourceLabel.toLowerCase()}.`
        : `Cette valeur est définie au niveau ${row.sourceLabel.toLowerCase()}.`;

    const facts = [
      { label: 'Réglage', value: row.label },
      { label: 'Description', value: row.description },
      { label: 'Valeur enregistrée', value: row.hasRecordedValue ? row.effectiveValueText : 'Valeur initiale' },
      { label: 'Statut', value: row.statusLabel },
      { label: 'Origine de cette valeur', value: originExplanation },
    ];

    const options = selectedFieldDefinition.value?.options ?? [];
    if (options.length > 0) {
      facts.push({
        label: 'Options disponibles',
        value: options.map((option) => formatOptionLabel(option)).join(', '),
      });
    }

    if (activeTab.value === 'platform') {
      facts.splice(4, 0, {
        label: "État d'application",
        value: row.sourceConfigurationId && appliedConfigurationIds.value.has(row.sourceConfigurationId)
          ? 'Valeur appliquée au fonctionnement actuel'
          : 'Valeur enregistrée; application à confirmer',
      });
    }
    if (row.sourceCreatedAt) {
      facts.push({
        label: 'Valeur enregistrée le',
        value: new Intl.DateTimeFormat('fr-CD', { dateStyle: 'medium', timeStyle: 'short' }).format(new Date(row.sourceCreatedAt)),
      });
    }
    return facts;
  });
  const primaryActionLabel = computed(() => {
    if (activeTab.value === 'school-modules') {
      return 'Enregistrer les modules actifs';
    }

    if (!selectedRow.value) {
      return 'Enregistrer';
    }

    return getSettingActionLabel(selectedRow.value.key, selectedRow.value.label);
  });
  const modalActionLabel = computed(() => {
    switch (modalState.action) {
      case 'delete':
        return 'Supprimer';
      case 'lock':
        return 'Verrouiller';
      case 'validate':
        return 'Contrôler la saisie';
      case 'snapshot':
        return 'Enregistrer la version';
      case 'reload':
        return 'Actualiser';
      default:
        return primaryActionLabel.value;
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
      lockLevel: form.lockLevel,
      reason: form.reason,
      modules: [...selectedModules.value],
      action: modalState.action,
    });

    return snapshot !== modalDraftBaseline.value;
  });

  const canSubmitModal = computed(() => {
    if (!modalState.open || isSubmitting.value) {
      return false;
    }
    if (activeTab.value === 'school-modules') {
      return canMutateCurrentTab.value && modulesStore.state.effective !== null;
    }
    if (modalState.action === 'create' || modalState.action === 'edit' || modalState.action === 'validate') {
      return formEvaluation.value?.canSubmit === true;
    }
    if (modalState.action === 'lock' || modalState.action === 'unlock' || modalState.action === 'delete' || modalState.action === 'snapshot' || modalState.action === 'reload') {
      return canMutateCurrentTab.value && hasLoadedConfiguration.value;
    }
    return false;
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

  const selectedOptionValues = computed<readonly string[]>(() => {
    if (selectedFieldDefinition.value?.control !== 'multi-checkbox') return [];
    try {
      const value = JSON.parse(form.valueRaw) as unknown;
      return Array.isArray(value) && value.every((entry) => typeof entry === 'string') ? value : [];
    } catch {
      return [];
    }
  });

  function toggleOption(option: string): void {
    const next = new Set(selectedOptionValues.value);
    if (next.has(option)) next.delete(option);
    else next.add(option);
    form.valueRaw = JSON.stringify([...next]);
  }

  function formatOptionLabel(option: string): string {
    return PRESENTATION_VALUE_LABELS[option] ?? option;
  }

  function captureModalBaseline(): void {
    modalDraftBaseline.value = JSON.stringify({
      configurationId: form.configurationId,
      key: form.key,
      valueRaw: form.valueRaw,
      lockLevel: form.lockLevel,
      reason: form.reason,
      modules: [...selectedModules.value],
      action: modalState.action,
    });
  }

  watch(() => route.name, () => {
    activeTab.value = detectTabFromRouteName(route.name);
  });

  async function selectRow(key: string): Promise<void> {
    const request = ++selectionRequest;
    selectedRowKey.value = key;
    centerStore.oublierConfiguration();
    form.configurationId = '';
    conflictDetected.value = false;
    syncFormWithSelection();

    const row = currentRows.value.find((entry) => entry.key === key);
    if (!row || activeTab.value === 'school-modules' || !row.isDefinedLocally || !row.sourceConfigurationId) {
      return;
    }

    try {
      await centerStore.consulter(row.sourceConfigurationId, currentTab.value.level);
      if (request !== selectionRequest) {
        return;
      }
      form.configurationId = centerStore.state.configuration?.identifiant ?? '';
      syncFormWithSelection();
    } catch (error) {
      if (request === selectionRequest) {
        notificationsService.danger('Réglage indisponible', mapErrorToUserMessage(error));
      }
    }
  }

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
          organisationId: tab.level === 'ORGANIZATION' || tab.level === 'SCHOOL' ? tenantContext.organizationId : undefined,
          ecoleId: tab.level === 'SCHOOL' ? tenantContext.schoolId : undefined,
          utilisateurId: tab.level === 'USER' ? tenantContext.userId : undefined,
          keyPrefix: tab.keyPrefix,
        });
      }

      const firstKey = filteredRows.value[0]?.key;
      if (firstKey) {
        await selectRow(firstKey);
      } else {
        selectedRowKey.value = null;
        centerStore.oublierConfiguration();
        form.configurationId = '';
      }
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
    conflictDetected.value = false;
    const row = selectedRow.value;
    const actionTitles: Record<ModalActionCode, [string, string]> = {
      create: ['Personnaliser le réglage', 'Enregistrez une valeur propre à ce niveau.'],
      edit: ['Modifier ce réglage', 'Mettez à jour la valeur définie pour le niveau courant.'],
      delete: ['Supprimer ce réglage', 'Cette action retirera la valeur définie pour ce niveau.'],
      validate: ['Vérifier ce réglage', 'Contrôlez la cohérence de la valeur avant son enregistrement.'],
      lock: ['Verrouiller les modifications', 'Les niveaux inférieurs ne pourront plus personnaliser ce réglage.'],
      unlock: ['Autoriser les modifications', 'Les modifications autorisées pourront de nouveau être appliquées.'],
      snapshot: ['Enregistrer une version', 'Conservez une version du réglage actuellement appliqué.'],
      reload: ['Appliquer maintenant', "Appliquez immédiatement la valeur enregistrée au fonctionnement de la plateforme."],
    };

    modalState.open = true;
    modalState.action = action;
    modalState.title = actionTitles[action][0];
    modalState.description = row
      ? `${actionTitles[action][1]} Réglage concerné : ${row.label}.`
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
    if (!canSubmitModal.value || isSubmitting.value) {
      return;
    }

    const tab = currentTab.value;
    const scope = buildScope(tab);
    const actorId = tenantContext.userId;
    isSubmitting.value = true;
    conflictDetected.value = false;

    try {
      if (
        form.key.trim() === 'preferences.theme'
        && (modalState.action === 'create' || modalState.action === 'edit')
      ) {
        const theme = formEvaluation.value?.normalizedValue;
        if (theme !== 'light' && theme !== 'dark' && theme !== 'system') {
          throw new Error('Le theme choisi doit etre clair, sombre ou adapte a l appareil.');
        }

        const enregistre = await themeManager.setTheme(theme);
        if (!enregistre) {
          throw new Error(
            themeManager.synchronizationError.value
              ?? "Le theme n'a pas pu etre enregistre.",
          );
        }

        notificationsService.succes(
          'Theme mis a jour',
          "Votre preference d'affichage a ete enregistree.",
        );
        forceCloseModal();
        await loadCurrentTab();
        return;
      }

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
        forceCloseModal();
        await loadCurrentTab();
        return;
      }

      switch (modalState.action) {
        case 'create':
          await centerStore.creer({
            key: form.key.trim(),
            value: formEvaluation.value?.normalizedValue as ConfigurationValue,
            scope,
            actorId,
          });
          form.configurationId = centerStore.state.configuration?.identifiant ?? '';
          notificationsService.succes('Réglage enregistré', 'La valeur a été enregistrée avec succès.');
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
            value: formEvaluation.value?.normalizedValue as ConfigurationValue,
            actorId,
          }, tab.level);
          notificationsService.succes('Réglage mis à jour', 'Les modifications ont été enregistrées.');
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
          await centerStore.supprimer(id, { actorId, raison: form.reason.trim() || undefined }, tab.level);
          notificationsService.succes('Réglage supprimé', 'Le réglage a été retiré pour ce niveau.');
          form.configurationId = '';
          break;
        }
        case 'validate':
          await centerStore.valider({
            key: form.key.trim(),
            value: formEvaluation.value?.normalizedValue as ConfigurationValue,
            scope,
          });
          notificationsService.succes('Vérification terminée', 'La valeur est cohérente et peut être enregistrée.');
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
          }, tab.level);
          notificationsService.succes('Modifications verrouillées', 'Le réglage est désormais protégé contre les personnalisations locales.');
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
          await centerStore.deverrouiller(id, { actorId }, tab.level);
          notificationsService.succes('Modifications autorisées', 'Le réglage peut de nouveau être modifié.');
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
          await centerStore.creerSnapshot(id, { actorId }, tab.level);
          notificationsService.succes('Version enregistrée', 'Une nouvelle version du réglage a été enregistrée.');
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
          await centerStore.recharger(id, { actorId, forcer: true }, tab.level);
          appliedConfigurationIds.value = new Set([...appliedConfigurationIds.value, id]);
          notificationsService.succes('Réglage appliqué', 'La valeur enregistrée est maintenant appliquée au fonctionnement de la plateforme.');
          break;
        }
        default:
          break;
      }

      forceCloseModal();
      await loadCurrentTab();
    } catch (error) {
      if (error instanceof ApiError && error.status === 409) {
        conflictDetected.value = true;
      }
      const message = mapErrorToUserMessage(error);
      notificationsService.danger('Action impossible', message);
    } finally {
      isSubmitting.value = false;
    }
  }

  async function recharger(): Promise<void> {
    await loadCurrentTab();
  }

  function clearFilters(): void {
    search.value = '';
    statusFilter.value = 'all';
  }

  function handleBeforeUnload(event: BeforeUnloadEvent): void {
    if (!modalDraftDirty.value && !isSubmitting.value) {
      return;
    }
    event.preventDefault();
    event.returnValue = '';
  }

  window.addEventListener('beforeunload', handleBeforeUnload);
  onBeforeUnmount(() => window.removeEventListener('beforeunload', handleBeforeUnload));
  onBeforeRouteLeave(() => {
    if (isSubmitting.value) return false;
    if (modalDraftDirty.value) {
      discardModalOpen.value = true;
      return false;
    }
    return true;
  });

  watch(
    () => [tenantContext.organizationId, tenantContext.schoolId, tenantContext.userId],
    () => {
      if (bootStatus.value !== 'idle') void loadCurrentTab();
    },
  );

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
    selectedOptionValues,
    formEvaluation,
    primaryActionLabel,
    modalActionLabel,
    modalDraftDirty,
    isSubmitting,
    conflictDetected,
    canSubmitModal,
    discardModalOpen,
    modalState,
    form,
    configurationModuleCatalog: computed(() => modulesStore.state.catalog),
    currentStatus,
    loadCurrentTab,
    selectTab,
    selectRow,
    toggleOption,
    formatOptionLabel,
    openModal,
    closeModal,
    keepEditing,
    discardAndClose,
    submitModal,
    recharger,
    clearFilters,
  });
}
