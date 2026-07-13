export type ConfigurationScopeLevel = 'SYSTEM' | 'ORGANIZATION' | 'SCHOOL' | 'USER';

export type ConfigurationValue =
  | string
  | number
  | boolean
  | null
  | readonly ConfigurationValue[]
  | { readonly [key: string]: ConfigurationValue };

export interface ConfigurationScope {
  readonly niveau: ConfigurationScopeLevel;
  readonly organisationId?: string;
  readonly ecoleId?: string;
  readonly utilisateurId?: string;
}

export interface ConfigurationGovernance {
  readonly proprietaireNiveau: ConfigurationScopeLevel;
  readonly heritable: boolean;
  readonly overridable: boolean;
  readonly visiblePour: readonly ConfigurationScopeLevel[];
  readonly auditRequis: boolean;
  readonly restartRequis: boolean;
}

export interface ConfigurationItem {
  readonly identifiant: string;
  readonly key: string;
  readonly statut: string;
  readonly scope: ConfigurationScope;
  readonly valeur: ConfigurationValue;
  readonly overrides: readonly {
    readonly scope: ConfigurationScope;
    readonly value: ConfigurationValue;
    readonly actorId: string;
    readonly raison?: string;
    readonly overrideLe: string | Date;
  }[];
  readonly lock: {
    readonly niveauMinimalAutorise: ConfigurationScopeLevel;
    readonly actorId: string;
    readonly raison?: string;
    readonly verrouilleLe: string | Date;
  } | null;
  readonly totalVersions: number;
  readonly creeLe: string | Date;
  readonly gouvernance: ConfigurationGovernance;
}

export interface EffectiveConfigurationItem {
  readonly scope: ConfigurationScope;
  readonly valeurs: readonly {
    readonly key: string;
    readonly value: ConfigurationValue;
    readonly sourceNiveau: ConfigurationScopeLevel;
    readonly herite: boolean;
    readonly verrouille: boolean;
    readonly explanation: string;
    readonly sourceConfigurationId?: string;
    readonly sourceStatut?: string;
    readonly sourceTotalVersions?: number;
    readonly sourceCreeLe?: string | Date;
  }[];
}

export interface ConfigurationSnapshotItem {
  readonly identifiantSnapshot: string;
  readonly creeLe: string | Date;
  readonly valeurs: readonly {
    readonly key: string;
    readonly value: ConfigurationValue;
    readonly sourceNiveau: ConfigurationScopeLevel;
    readonly herite: boolean;
    readonly verrouille: boolean;
    readonly explanation: string;
  }[];
}

export interface ConfigurationDiffItem {
  readonly snapshotSourceId: string;
  readonly snapshotCibleId: string;
  readonly ajouts: readonly {
    readonly key: string;
    readonly value: ConfigurationValue;
  }[];
  readonly suppressions: readonly {
    readonly key: string;
    readonly value: ConfigurationValue;
  }[];
  readonly modifications: readonly {
    readonly key: string;
    readonly avant: ConfigurationValue;
    readonly apres: ConfigurationValue;
  }[];
}

export interface ConfigurationValidationItem {
  readonly valide: boolean;
  readonly warnings: readonly string[];
}

export interface ConfigurationApiEnvelope<TData> {
  readonly succes: boolean;
  readonly code: number;
  readonly donnees: TData;
  readonly meta?: {
    readonly dureeMs?: number;
    readonly correlationId?: string;
    readonly requestId?: string;
  };
}

export interface ConfigurationModulesResolution {
  readonly organisationId: string;
  readonly ecoleId: string;
  readonly modulesAutorisesOrganisation: readonly ConfigurationModuleCode[];
  readonly modulesActivesEcole: readonly ConfigurationModuleCode[];
  readonly modulesEffectifs: readonly ConfigurationModuleCode[];
}

export interface ConfigurationModuleCatalogItem {
  readonly code: ConfigurationModuleCode;
  readonly label: string;
  readonly description: string;
  readonly ordre: number;
}

export interface OfficialSystemConfigurationDefinition {
  readonly key: string;
  readonly label: string;
  readonly description: string;
  readonly categoryLabel: string;
  readonly dataTypeLabel: string;
  readonly defaultValueLabel: string;
  readonly required: boolean;
  readonly proofLabel: string;
  readonly allowedValues?: readonly ConfigurationValue[];
  readonly minimum?: number;
  readonly maximum?: number;
  readonly unit?: string;
}

export interface OfficialUserConfigurationDefinition {
  readonly key: string;
  readonly label: string;
  readonly description: string;
  readonly categoryLabel: string;
  readonly dataTypeLabel: string;
  readonly defaultValueLabel: string;
  readonly required: boolean;
  readonly proofLabel: string;
  readonly allowedValues?: readonly ConfigurationValue[];
  readonly minimum?: number;
  readonly maximum?: number;
  readonly unit?: string;
}

export type ConfigurationModuleCode =
  | 'REFERENTIEL_ACADEMIQUE'
  | 'SCOLARITE_ELEVES'
  | 'PAIEMENTS_FACTURATION'
  | 'BULLETINS_EVALUATIONS'
  | 'NOTIFICATIONS'
  | 'AUDIT'
  | 'MONITORING';

export const configurationModuleCatalog: readonly ConfigurationModuleCatalogItem[] = [
  {
    code: 'REFERENTIEL_ACADEMIQUE',
    label: 'Referentiel academique',
    description: 'Socle academique, classes et programmes.',
    ordre: 1,
  },
  {
    code: 'SCOLARITE_ELEVES',
    label: 'Scolarite eleves',
    description: "Inscriptions, familles et cycle de vie de l'eleve.",
    ordre: 2,
  },
  {
    code: 'PAIEMENTS_FACTURATION',
    label: 'Paiements facturation',
    description: 'Caisse, paiements et recouvrements.',
    ordre: 3,
  },
  {
    code: 'BULLETINS_EVALUATIONS',
    label: 'Bulletins evaluations',
    description: 'Resultats, bulletins et analyses.',
    ordre: 4,
  },
  {
    code: 'NOTIFICATIONS',
    label: 'Notifications',
    description: 'Diffusions et canaux de communication.',
    ordre: 5,
  },
  {
    code: 'AUDIT',
    label: 'Audit',
    description: 'Traces, controles et forensic.',
    ordre: 6,
  },
  {
    code: 'MONITORING',
    label: 'Monitoring',
    description: 'Observation et sante de la plateforme.',
    ordre: 7,
  },
] as const;

export const officialSystemConfigurationCatalog: readonly OfficialSystemConfigurationDefinition[] = [
  { key: 'runtime.retry.maxAttempts', label: 'Tentatives de reprise', description: 'Nombre maximal de reprises automatiques des traitements de la plateforme.', categoryLabel: 'Paramètres de la plateforme', dataTypeLabel: 'Nombre', defaultValueLabel: '3 tentatives', required: true, proofLabel: 'Réglage officiel initialisé par la plateforme.', minimum: 1, maximum: 10, unit: 'tentatives' },
  { key: 'runtime.replay.enabled', label: 'Relecture automatique', description: 'Autorise la reprise automatique des opérations qui peuvent être relancées sans risque.', categoryLabel: 'Paramètres de la plateforme', dataTypeLabel: 'Oui / Non', defaultValueLabel: 'Oui', required: true, proofLabel: 'Réglage officiel initialisé par la plateforme.', allowedValues: [true, false] },
  { key: 'runtime.cache.ttlSeconds', label: 'Durée de conservation temporaire', description: 'Durée pendant laquelle les informations temporaires restent disponibles avant leur actualisation.', categoryLabel: 'Paramètres de la plateforme', dataTypeLabel: 'Nombre de secondes', defaultValueLabel: '120 secondes', required: true, proofLabel: 'Réglage officiel initialisé par la plateforme.', minimum: 30, maximum: 86400, unit: 'secondes' },
  { key: 'notifications.providers.in_app.enabled', label: "Notifications dans l'application", description: "Active les notifications visibles directement dans l'application.", categoryLabel: 'Diffusion des notifications', dataTypeLabel: 'Oui / Non', defaultValueLabel: 'Oui', required: true, proofLabel: 'Canal officiel reconnu par la plateforme.', allowedValues: [true, false] },
  { key: 'notifications.providers.sms.enabled', label: 'Notifications par SMS', description: 'Active les envois par SMS lorsque ce canal est disponible.', categoryLabel: 'Diffusion des notifications', dataTypeLabel: 'Oui / Non', defaultValueLabel: 'Oui', required: true, proofLabel: 'Canal officiel reconnu par la plateforme.', allowedValues: [true, false] },
  { key: 'notifications.providers.email.enabled', label: 'Notifications par e-mail', description: 'Active les envois par e-mail lorsque ce canal est disponible.', categoryLabel: 'Diffusion des notifications', dataTypeLabel: 'Oui / Non', defaultValueLabel: 'Oui', required: true, proofLabel: 'Canal officiel reconnu par la plateforme.', allowedValues: [true, false] },
  { key: 'notifications.providers.whatsapp.enabled', label: 'Notifications WhatsApp', description: 'Active les envois WhatsApp lorsque ce canal est disponible.', categoryLabel: 'Diffusion des notifications', dataTypeLabel: 'Oui / Non', defaultValueLabel: 'Non', required: true, proofLabel: 'Canal officiel reconnu par la plateforme.', allowedValues: [true, false] },
  { key: 'notifications.providers.push.enabled', label: 'Notifications push', description: 'Active les notifications push lorsque ce canal est disponible.', categoryLabel: 'Diffusion des notifications', dataTypeLabel: 'Oui / Non', defaultValueLabel: 'Non', required: true, proofLabel: 'Canal officiel reconnu par la plateforme.', allowedValues: [true, false] },
  { key: 'notifications.providers.webhook.enabled', label: 'Diffusion vers les services connectés', description: 'Active les transmissions vers les services externes déjà configurés.', categoryLabel: 'Diffusion des notifications', dataTypeLabel: 'Oui / Non', defaultValueLabel: 'Non', required: true, proofLabel: 'Canal officiel reconnu par la plateforme.', allowedValues: [true, false] },
  { key: 'notifications.retry.enabled', label: 'Reprise des notifications échouées', description: 'Autorise la reprise automatique des notifications qui peuvent être renvoyées.', categoryLabel: 'Diffusion des notifications', dataTypeLabel: 'Oui / Non', defaultValueLabel: 'Oui', required: true, proofLabel: 'Réglage officiel initialisé par la plateforme.', allowedValues: [true, false] },
  { key: 'notifications.retry.maxAttempts', label: 'Tentatives de reprise des notifications', description: "Nombre maximal de tentatives avant de déclarer l'envoi en échec.", categoryLabel: 'Diffusion des notifications', dataTypeLabel: 'Nombre', defaultValueLabel: '5 tentatives', required: true, proofLabel: 'Réglage officiel initialisé par la plateforme.', minimum: 1, maximum: 20, unit: 'tentatives' },
  { key: 'notifications.retry.defaultBackoffMs', label: 'Délai entre deux tentatives', description: "Temps d'attente appliqué entre deux tentatives d'envoi.", categoryLabel: 'Diffusion des notifications', dataTypeLabel: 'Nombre de millisecondes', defaultValueLabel: '60 000 millisecondes', required: true, proofLabel: 'Réglage officiel initialisé par la plateforme.', minimum: 1000, maximum: 86400000, unit: 'millisecondes' },
  { key: 'notifications.replay.enabled', label: 'Relecture des notifications', description: 'Autorise la reprise des notifications marquées comme pouvant être renvoyées.', categoryLabel: 'Diffusion des notifications', dataTypeLabel: 'Oui / Non', defaultValueLabel: 'Oui', required: true, proofLabel: 'Réglage officiel initialisé par la plateforme.', allowedValues: [true, false] },
  { key: 'notifications.replay.batchSize', label: 'Notifications traitées par lot', description: 'Nombre maximal de notifications traitées ensemble lors d’une reprise.', categoryLabel: 'Diffusion des notifications', dataTypeLabel: 'Nombre', defaultValueLabel: '100 notifications', required: true, proofLabel: 'Réglage officiel initialisé par la plateforme.', minimum: 1, maximum: 1000, unit: 'notifications' },
];

export const officialUserConfigurationCatalog: readonly OfficialUserConfigurationDefinition[] = [
  {
    key: 'preferences.theme',
    label: "Thème de l'espace personnel",
    description: "Choisissez l'apparence utilisée dans votre espace personnel.",
    categoryLabel: 'Préférences personnelles',
    dataTypeLabel: 'Choix',
    defaultValueLabel: "Selon l'appareil",
    required: true,
    proofLabel: 'Préférence personnelle officielle.',
    allowedValues: ['light', 'dark', 'system'],
  },
  {
    key: 'notifications.preferences.muted',
    label: 'Suspendre les notifications personnelles',
    description: 'Permet de suspendre les notifications personnelles non critiques.',
    categoryLabel: 'Préférences de notification',
    dataTypeLabel: 'Oui / Non',
    defaultValueLabel: 'Non',
    required: true,
    proofLabel: 'Préférence personnelle officielle.',
    allowedValues: [true, false],
  },
  {
    key: 'notifications.preferences.preferredChannel',
    label: 'Canal de notification préféré',
    description: 'Choisissez le canal à privilégier lorsque plusieurs moyens de contact sont disponibles.',
    categoryLabel: 'Préférences de notification',
    dataTypeLabel: 'Choix',
    defaultValueLabel: "Dans l'application",
    required: true,
    proofLabel: 'Préférence personnelle officielle.',
    allowedValues: ['IN_APP', 'SMS', 'EMAIL', 'WHATSAPP', 'PUSH', 'WEBHOOK'],
  },
  {
    key: 'notifications.preferences.enabledChannels',
    label: 'Canaux de notification acceptés',
    description: 'Sélectionnez les canaux personnels que vous acceptez parmi ceux disponibles.',
    categoryLabel: 'Préférences de notification',
    dataTypeLabel: 'Liste de choix',
    defaultValueLabel: "Dans l'application et par e-mail",
    required: true,
    proofLabel: 'Préférence personnelle officielle.',
    allowedValues: ['IN_APP', 'SMS', 'EMAIL', 'WHATSAPP', 'PUSH', 'WEBHOOK'],
  },
] as const;

export function findOfficialSystemConfiguration(
  key: string,
): OfficialSystemConfigurationDefinition | undefined {
  return officialSystemConfigurationCatalog.find((entry) => entry.key === key);
}

export function findOfficialUserConfiguration(
  key: string,
): OfficialUserConfigurationDefinition | undefined {
  return officialUserConfigurationCatalog.find((entry) => entry.key === key);
}
