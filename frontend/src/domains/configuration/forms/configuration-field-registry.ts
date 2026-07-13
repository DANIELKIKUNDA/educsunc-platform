export type ConfigurationFieldControl =
  | 'text'
  | 'textarea'
  | 'integer-stepper'
  | 'boolean-toggle'
  | 'radio-group'
  | 'select'
  | 'multi-checkbox';

export interface ConfigurationFieldDefinition {
  readonly key: string;
  readonly label: string;
  readonly dataTypeLabel: string;
  readonly control: ConfigurationFieldControl;
  readonly covered: boolean;
  readonly helper?: string;
  readonly options?: readonly string[];
  readonly minimum?: number;
  readonly maximum?: number;
  readonly step?: number;
  readonly unit?: string;
}

type RegistryEntry = Omit<ConfigurationFieldDefinition, 'key' | 'label' | 'dataTypeLabel'>;

const BOOLEAN_ENTRY: RegistryEntry = {
  control: 'boolean-toggle',
  covered: true,
  helper: 'Choisissez clairement Oui ou Non.',
};

const CHANNELS = ['IN_APP', 'SMS', 'EMAIL', 'WHATSAPP', 'PUSH', 'WEBHOOK'] as const;

const EXACT_DEFINITIONS: Readonly<Record<string, RegistryEntry>> = {
  'runtime.retry.maxAttempts': { control: 'integer-stepper', covered: true, minimum: 1, maximum: 10, step: 1, unit: 'tentatives' },
  'runtime.replay.enabled': BOOLEAN_ENTRY,
  'runtime.cache.ttlSeconds': { control: 'integer-stepper', covered: true, minimum: 30, maximum: 86400, step: 1, unit: 'secondes' },
  'notifications.providers.in_app.enabled': BOOLEAN_ENTRY,
  'notifications.providers.sms.enabled': BOOLEAN_ENTRY,
  'notifications.providers.email.enabled': BOOLEAN_ENTRY,
  'notifications.providers.whatsapp.enabled': BOOLEAN_ENTRY,
  'notifications.providers.push.enabled': BOOLEAN_ENTRY,
  'notifications.providers.webhook.enabled': BOOLEAN_ENTRY,
  'notifications.retry.enabled': BOOLEAN_ENTRY,
  'notifications.retry.maxAttempts': { control: 'integer-stepper', covered: true, minimum: 1, maximum: 20, step: 1, unit: 'tentatives' },
  'notifications.retry.defaultBackoffMs': { control: 'integer-stepper', covered: true, minimum: 1000, maximum: 86400000, step: 1000, unit: 'millisecondes' },
  'notifications.replay.enabled': BOOLEAN_ENTRY,
  'notifications.replay.batchSize': { control: 'integer-stepper', covered: true, minimum: 1, maximum: 1000, step: 1, unit: 'notifications' },
  'modules.allowed': { control: 'multi-checkbox', covered: true },
  'modules.enabled': { control: 'multi-checkbox', covered: true },
  'preferences.theme': { control: 'radio-group', covered: true, options: ['light', 'dark', 'system'] },
  'notifications.preferences.muted': BOOLEAN_ENTRY,
  'notifications.preferences.preferredChannel': { control: 'select', covered: true, options: CHANNELS },
  'notifications.preferences.enabledChannels': { control: 'multi-checkbox', covered: true, options: CHANNELS },
};

export function listCoveredConfigurationFieldKeys(): readonly string[] {
  return Object.keys(EXACT_DEFINITIONS);
}

export function getConfigurationFieldRegistryDefinition(
  key: string,
  dataTypeLabel: string,
  label: string,
): ConfigurationFieldDefinition {
  const exact = EXACT_DEFINITIONS[key];

  return {
    key,
    label,
    dataTypeLabel,
    control: exact?.control ?? 'text',
    covered: exact?.covered ?? false,
    helper: exact?.helper,
    options: exact?.options,
    minimum: exact?.minimum,
    maximum: exact?.maximum,
    step: exact?.step,
    unit: exact?.unit,
  };
}
