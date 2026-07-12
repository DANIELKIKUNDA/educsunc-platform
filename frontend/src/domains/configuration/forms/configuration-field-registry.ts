export type ConfigurationFieldControl =
  | 'text'
  | 'textarea'
  | 'color'
  | 'integer-stepper'
  | 'boolean-toggle'
  | 'radio-group';

export interface ConfigurationFieldDefinition {
  readonly key: string;
  readonly label: string;
  readonly dataTypeLabel: string;
  readonly control: ConfigurationFieldControl;
  readonly covered: boolean;
  readonly helper?: string;
  readonly options?: readonly string[];
}

const COVERED_CONFIGURATION_FIELD_KEYS = [
  'runtime.retry.maxAttempts',
  'runtime.replay.enabled',
  'runtime.cache.ttlSeconds',
  'preferences.theme',
  'branding.logo.primary',
  'branding.colors.primary',
  'branding.colors.secondary',
  'branding.footer',
  'branding.palette',
  'notifications.quotas.sms',
  'notifications.templates.default',
  'policies.branding.sigle',
  'policies.notifications.digest',
  'school.theme',
  'modules.allowed',
  'modules.enabled',
] as const;

const EXACT_DEFINITIONS: Readonly<Record<string, Omit<ConfigurationFieldDefinition, 'key' | 'label' | 'dataTypeLabel'>>> = {
  'runtime.retry.maxAttempts': {
    control: 'integer-stepper',
    covered: true,
    helper: 'Saisissez un nombre entier de tentatives.',
  },
  'runtime.replay.enabled': {
    control: 'boolean-toggle',
    covered: true,
    helper: 'Active ou coupe la relecture automatique.',
  },
  'runtime.cache.ttlSeconds': {
    control: 'integer-stepper',
    covered: true,
    helper: 'La valeur est saisie sous une duree simple puis convertie proprement.',
  },
  'preferences.theme': {
    control: 'radio-group',
    covered: true,
    options: ['light', 'dark', 'system'],
  },
  'branding.logo.primary': {
    control: 'text',
    covered: true,
  },
  'branding.colors.primary': {
    control: 'color',
    covered: true,
  },
  'branding.colors.secondary': {
    control: 'color',
    covered: true,
  },
  'branding.footer': {
    control: 'textarea',
    covered: true,
  },
  'branding.palette': {
    control: 'text',
    covered: true,
  },
  'notifications.quotas.sms': {
    control: 'integer-stepper',
    covered: true,
  },
  'notifications.templates.default': {
    control: 'textarea',
    covered: true,
  },
  'policies.branding.sigle': {
    control: 'text',
    covered: true,
  },
  'policies.notifications.digest': {
    control: 'text',
    covered: true,
  },
  'school.theme': {
    control: 'text',
    covered: true,
  },
  'modules.allowed': {
    control: 'text',
    covered: true,
  },
  'modules.enabled': {
    control: 'text',
    covered: true,
  },
};

const PREFIX_DEFINITIONS: ReadonlyArray<{
  readonly prefix: string;
  readonly control: ConfigurationFieldControl;
  readonly covered: boolean;
}> = [
  { prefix: 'branding.signataires.', control: 'text', covered: true },
  { prefix: 'branding.header.', control: 'textarea', covered: true },
  { prefix: 'branding.communication.', control: 'textarea', covered: true },
  { prefix: 'branding.slogan', control: 'text', covered: true },
  { prefix: 'user.preferences.', control: 'text', covered: true },
  { prefix: 'notifications.preferences.', control: 'boolean-toggle', covered: true },
];

function fallbackControl(dataTypeLabel: string): ConfigurationFieldControl {
  const normalized = dataTypeLabel.toLowerCase();

  if (normalized.includes('couleur')) {
    return 'color';
  }
  if (normalized.includes('texte long')) {
    return 'textarea';
  }
  if (normalized.includes('oui / non')) {
    return 'boolean-toggle';
  }
  if (normalized.includes('nombre')) {
    return 'integer-stepper';
  }
  return 'text';
}

export function listCoveredConfigurationFieldKeys(): readonly string[] {
  return COVERED_CONFIGURATION_FIELD_KEYS;
}

export function getConfigurationFieldRegistryDefinition(
  key: string,
  dataTypeLabel: string,
  label: string,
): ConfigurationFieldDefinition {
  const exact = EXACT_DEFINITIONS[key];
  if (exact) {
    return {
      key,
      label,
      dataTypeLabel,
      ...exact,
    };
  }

  const prefixed = PREFIX_DEFINITIONS.find((entry) => key.startsWith(entry.prefix));
  if (prefixed) {
    return {
      key,
      label,
      dataTypeLabel,
      control: prefixed.control,
      covered: prefixed.covered,
    };
  }

  return {
    key,
    label,
    dataTypeLabel,
    control: fallbackControl(dataTypeLabel),
    covered: false,
  };
}
