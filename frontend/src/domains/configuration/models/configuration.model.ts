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
  {
    key: 'runtime.retry.maxAttempts',
    label: 'Tentatives de reprise',
    description: 'Definit le nombre maximal de reprises automatiques lorsque la plateforme doit relancer un traitement.',
    categoryLabel: 'Parametres de la plateforme',
    dataTypeLabel: 'Nombre',
    defaultValueLabel: 'Aucune valeur initiale imposee',
    required: false,
    proofLabel: 'Cle reconnue par la liste officielle et classee SYSTEM par la politique de configuration.',
  },
  {
    key: 'runtime.replay.enabled',
    label: 'Relecture automatique',
    description: 'Indique si la plateforme peut relancer automatiquement une operation de reprise deja prevue.',
    categoryLabel: 'Parametres de la plateforme',
    dataTypeLabel: 'Oui / Non',
    defaultValueLabel: 'Aucune valeur initiale imposee',
    required: false,
    proofLabel: 'Cle reconnue par la liste officielle et classee SYSTEM par la politique de configuration.',
  },
  {
    key: 'runtime.cache.ttlSeconds',
    label: 'Duree du cache',
    description: 'Definit la duree de conservation du cache de plateforme lorsqu une valeur est explicitement renseignee.',
    categoryLabel: 'Parametres de la plateforme',
    dataTypeLabel: 'Nombre de secondes',
    defaultValueLabel: 'Aucune valeur initiale imposee',
    required: false,
    proofLabel: 'Cle reconnue par la liste officielle et classee SYSTEM par la politique de configuration.',
  },
  {
    key: 'branding.logo.primary',
    label: 'Logo principal',
    description: "Reference du logo principal utilise dans l'identite visuelle de l'ecole.",
    categoryLabel: 'Identite visuelle',
    dataTypeLabel: 'Texte court',
    defaultValueLabel: 'Aucune valeur initiale imposee',
    required: false,
    proofLabel: "Cle officiellement reconnue pour l'identite visuelle des etablissements.",
  },
  {
    key: 'branding.colors.primary',
    label: 'Couleur principale',
    description: "Couleur principale appliquee a l'identite visuelle de l'ecole.",
    categoryLabel: 'Identite visuelle',
    dataTypeLabel: 'Couleur',
    defaultValueLabel: 'Aucune valeur initiale imposee',
    required: false,
    proofLabel: "Cle officiellement reconnue pour l'identite visuelle des etablissements.",
  },
  {
    key: 'branding.colors.secondary',
    label: 'Couleur secondaire',
    description: "Couleur secondaire appliquee a l'identite visuelle de l'ecole.",
    categoryLabel: 'Identite visuelle',
    dataTypeLabel: 'Couleur',
    defaultValueLabel: 'Aucune valeur initiale imposee',
    required: false,
    proofLabel: "Cle officiellement reconnue pour l'identite visuelle des etablissements.",
  },
  {
    key: 'branding.footer',
    label: 'Message de bas de page',
    description: "Texte de bas de page utilise dans les documents et supports de l'ecole.",
    categoryLabel: 'Identite visuelle',
    dataTypeLabel: 'Texte long',
    defaultValueLabel: 'Aucune valeur initiale imposee',
    required: false,
    proofLabel: "Cle effectivement relue dans les scenarios d'integration de configuration.",
  },
  {
    key: 'branding.palette',
    label: 'Palette visuelle',
    description: "Nom ou description courte de la palette visuelle retenue pour l'identite de l'ecole.",
    categoryLabel: 'Identite visuelle',
    dataTypeLabel: 'Texte court',
    defaultValueLabel: 'Aucune valeur initiale imposee',
    required: false,
    proofLabel: "Cle effectivement relue dans les scenarios d'integration de configuration.",
  },
  {
    key: 'notifications.quotas.sms',
    label: 'Quota SMS',
    description: 'Nombre de SMS pouvant etre mobilises dans le niveau courant.',
    categoryLabel: 'Notifications',
    dataTypeLabel: 'Nombre',
    defaultValueLabel: 'Aucune valeur initiale imposee',
    required: false,
    proofLabel: 'Cle reconnue par la liste officielle de configuration.',
  },
  {
    key: 'notifications.templates.default',
    label: 'Message par defaut',
    description: "Modele de message utilise lorsqu'aucun contenu local n'a encore ete personnalise.",
    categoryLabel: 'Notifications',
    dataTypeLabel: 'Texte long',
    defaultValueLabel: 'Aucune valeur initiale imposee',
    required: false,
    proofLabel: 'Cle officiellement reconnue pour les communications configurees.',
  },
  {
    key: 'policies.branding.sigle',
    label: 'Sigle de communication',
    description: "Sigle commun utilise par l'organisation dans les communications partagees.",
    categoryLabel: 'Politiques organisationnelles',
    dataTypeLabel: 'Texte court',
    defaultValueLabel: 'Aucune valeur initiale imposee',
    required: false,
    proofLabel: "Cle effectivement relue dans les scenarios d'integration de configuration.",
  },
  {
    key: 'policies.notifications.digest',
    label: 'Frequence du digest',
    description: "Rythme de synthese des notifications partagees par l'organisation.",
    categoryLabel: 'Politiques organisationnelles',
    dataTypeLabel: 'Texte court',
    defaultValueLabel: 'Aucune valeur initiale imposee',
    required: false,
    proofLabel: "Cle effectivement relue dans les scenarios d'integration de configuration.",
  },
  {
    key: 'school.theme',
    label: "Theme de l'ecole",
    description: "Variation de presentation locale lorsque l'ecole applique un habillage particulier.",
    categoryLabel: "Reglages propres a l'ecole",
    dataTypeLabel: 'Texte court',
    defaultValueLabel: 'Aucune valeur initiale imposee',
    required: false,
    proofLabel: "Cle effectivement relue dans les scenarios d'integration de configuration.",
  },
] as const;

export const officialUserConfigurationCatalog: readonly OfficialUserConfigurationDefinition[] = [
  {
    key: 'preferences.theme',
    label: "Theme de l'espace personnel",
    description: "Permet a l'utilisateur de conserver sa preference d'affichage personnelle pour son propre compte.",
    categoryLabel: 'Preferences personnelles',
    dataTypeLabel: 'Texte court',
    defaultValueLabel: 'Aucune valeur initiale imposee',
    required: false,
    proofLabel: "Preference officielle disponible pour l'espace personnel.",
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
