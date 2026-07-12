import {
  getConfigurationFieldRegistryDefinition,
  type ConfigurationFieldDefinition,
} from '../forms/configuration-field-registry';

type CloseIntent = 'cancel' | 'escape' | 'backdrop' | 'button';
type CloseResolution = 'confirm' | 'ignore' | 'close';
type FormAction = 'create' | 'edit';

interface EvaluateConfigurationFormParams {
  readonly action: FormAction;
  readonly rawValue: string;
  readonly initialValue: unknown;
  readonly fieldDefinition: ConfigurationFieldDefinition;
  readonly isLoaded: boolean;
  readonly canMutate: boolean;
  readonly locked: boolean;
  readonly isSubmitting: boolean;
  readonly conflictDetected: boolean;
}

interface EvaluateConfigurationFormResult {
  readonly canSubmit: boolean;
  readonly normalizedValue: unknown;
  readonly validationError: string | null;
  readonly disableReason: string | null;
  readonly isDirty: boolean;
}

function normalizeBoolean(rawValue: string): boolean | null {
  if (rawValue === 'true') {
    return true;
  }
  if (rawValue === 'false') {
    return false;
  }
  return null;
}

function normalizeInteger(rawValue: string): number | null {
  if (!/^-?\d+$/.test(rawValue.trim())) {
    return null;
  }

  return Number.parseInt(rawValue.trim(), 10);
}

function normalizeDuration(rawValue: string): number | null {
  const trimmed = rawValue.trim();
  const [amountPart, unitPart] = trimmed.split('|');

  if (!amountPart || !unitPart) {
    return normalizeInteger(trimmed);
  }

  const amount = normalizeInteger(amountPart);
  if (amount === null) {
    return null;
  }

  switch (unitPart.trim()) {
    case 'seconds':
      return amount;
    case 'minutes':
      return amount * 60;
    case 'hours':
      return amount * 3600;
    default:
      return null;
  }
}

function normalizeValue(params: EvaluateConfigurationFormParams): {
  readonly normalizedValue: unknown;
  readonly validationError: string | null;
} {
  const { fieldDefinition, rawValue } = params;

  switch (fieldDefinition.control) {
    case 'color': {
      const trimmed = rawValue.trim();
      if (/^#[0-9a-fA-F]{6}$/.test(trimmed)) {
        return { normalizedValue: trimmed.toLowerCase(), validationError: null };
      }
      return {
        normalizedValue: null,
        validationError: 'Saisissez une couleur hexadecimale valide, par exemple #1d4ed8.',
      };
    }
    case 'integer-stepper': {
      if (fieldDefinition.key === 'runtime.cache.ttlSeconds') {
        const normalizedValue = normalizeDuration(rawValue);
        return normalizedValue === null
          ? { normalizedValue: null, validationError: 'Saisissez une duree entiere.' }
          : { normalizedValue, validationError: null };
      }

      const normalizedValue = normalizeInteger(rawValue);
      return normalizedValue === null
        ? { normalizedValue: null, validationError: 'Saisissez une valeur entiere.' }
        : { normalizedValue, validationError: null };
    }
    case 'boolean-toggle': {
      const normalizedValue = normalizeBoolean(rawValue);
      return normalizedValue === null
        ? { normalizedValue: null, validationError: 'Choisissez clairement Oui ou Non.' }
        : { normalizedValue, validationError: null };
    }
    default:
      return {
        normalizedValue: rawValue.trim(),
        validationError: null,
      };
  }
}

function computeDisableReason(params: EvaluateConfigurationFormParams): string | null {
  if (params.isSubmitting) {
    return 'Enregistrement en cours.';
  }
  if (!params.canMutate) {
    return "Vous disposez d'un acces en lecture seule.";
  }
  if (params.locked) {
    return 'Ce reglage est verrouille.';
  }
  if (params.conflictDetected) {
    return "Une autre modification plus recente doit etre relue avant d'enregistrer.";
  }
  if (params.action === 'edit' && !params.isLoaded) {
    return "Ouvrez d'abord un reglage existant avant de le modifier.";
  }
  return null;
}

function areValuesEqual(left: unknown, right: unknown): boolean {
  return JSON.stringify(left) === JSON.stringify(right);
}

export function getConfigurationFieldDefinition(
  key: string,
  dataTypeLabel: string,
  label: string,
): ConfigurationFieldDefinition {
  return getConfigurationFieldRegistryDefinition(key, dataTypeLabel, label);
}

export function formatConfigurationValueForForm(
  value: unknown,
  fieldDefinition: ConfigurationFieldDefinition,
): string {
  if (fieldDefinition.key === 'runtime.cache.ttlSeconds' && typeof value === 'number') {
    if (value % 3600 === 0) {
      return `${value / 3600}|hours`;
    }
    if (value % 60 === 0) {
      return `${value / 60}|minutes`;
    }
    return `${value}|seconds`;
  }

  if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  }

  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'number') {
    return String(value);
  }

  return '';
}

export function evaluateConfigurationForm(
  params: EvaluateConfigurationFormParams,
): EvaluateConfigurationFormResult {
  const { normalizedValue, validationError } = normalizeValue(params);
  const disableReason = computeDisableReason(params);
  const isDirty = !areValuesEqual(normalizedValue, params.initialValue);

  return {
    canSubmit: validationError === null && disableReason === null,
    normalizedValue,
    validationError,
    disableReason,
    isDirty,
  };
}

export function shouldKeepLocalDraft(hasDraft: boolean, nonDestructiveReload: boolean): boolean {
  return hasDraft && nonDestructiveReload;
}

export function resolveCloseBehavior(
  intent: CloseIntent,
  hasDraft: boolean,
  isSubmitting: boolean,
): CloseResolution {
  if (isSubmitting) {
    return 'ignore';
  }

  if (hasDraft && (intent === 'cancel' || intent === 'escape' || intent === 'backdrop')) {
    return 'confirm';
  }

  return 'close';
}
