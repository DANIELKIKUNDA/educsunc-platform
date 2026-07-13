import {
  getConfigurationFieldRegistryDefinition,
  type ConfigurationFieldDefinition,
} from '../forms/configuration-field-registry';

type CloseIntent = 'cancel' | 'escape' | 'backdrop' | 'button';
type CloseResolution = 'confirm' | 'ignore' | 'close';
type FormAction = 'create' | 'edit';

interface EvaluateConfigurationFormParams {
  readonly action: FormAction;
  readonly rawValue: string | number;
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

function normalizeBoolean(rawValue: string | number): boolean | null {
  if (String(rawValue) === 'true') {
    return true;
  }
  if (String(rawValue) === 'false') {
    return false;
  }
  return null;
}

function normalizeInteger(rawValue: string | number): number | null {
  const normalized = String(rawValue).trim();
  if (!/^-?\d+$/.test(normalized)) {
    return null;
  }

  return Number.parseInt(normalized, 10);
}

function normalizeValue(params: EvaluateConfigurationFormParams): {
  readonly normalizedValue: unknown;
  readonly validationError: string | null;
} {
  const { fieldDefinition, rawValue } = params;
  const rawText = String(rawValue ?? '');

  switch (fieldDefinition.control) {
    case 'integer-stepper': {
      const normalizedValue = normalizeInteger(rawValue);
      if (normalizedValue === null) {
        return { normalizedValue: null, validationError: 'Saisissez un nombre entier.' };
      }
      if (fieldDefinition.minimum !== undefined && normalizedValue < fieldDefinition.minimum) {
        return { normalizedValue, validationError: `La valeur minimale est ${fieldDefinition.minimum}.` };
      }
      if (fieldDefinition.maximum !== undefined && normalizedValue > fieldDefinition.maximum) {
        return { normalizedValue, validationError: `La valeur maximale est ${fieldDefinition.maximum}.` };
      }
      return { normalizedValue, validationError: null };
    }
    case 'boolean-toggle': {
      const normalizedValue = normalizeBoolean(rawValue);
      return normalizedValue === null
        ? { normalizedValue: null, validationError: 'Choisissez clairement Oui ou Non.' }
        : { normalizedValue, validationError: null };
    }
    case 'multi-checkbox': {
      try {
        const parsed = JSON.parse(rawText) as unknown;
        if (!Array.isArray(parsed) || !parsed.every((entry) => typeof entry === 'string')) {
          throw new Error('invalid-list');
        }
        const allowed = fieldDefinition.options;
        if (allowed && parsed.some((entry) => !allowed.includes(entry))) {
          return { normalizedValue: null, validationError: 'Une sélection proposée n’est pas reconnue.' };
        }
        return { normalizedValue: parsed, validationError: null };
      } catch {
        return { normalizedValue: null, validationError: 'Sélectionnez au moins les choix souhaités.' };
      }
    }
    default:
      return {
        normalizedValue: rawText.trim(),
        validationError: null,
      };
  }
}

function computeDisableReason(params: EvaluateConfigurationFormParams): string | null {
  if (params.isSubmitting) {
    return 'Enregistrement en cours.';
  }
  if (!params.canMutate) {
    return "Vous disposez d'un accès en lecture seule.";
  }
  if (params.locked) {
    return 'Ce réglage est verrouillé.';
  }
  if (params.conflictDetected) {
    return "Une modification plus récente doit être relue avant d'enregistrer.";
  }
  if (params.action === 'edit' && !params.isLoaded) {
    return "Ouvrez d'abord un réglage existant avant de le modifier.";
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
  if (typeof value === 'boolean') {
    return value ? 'true' : 'false';
  }

  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'number') {
    return String(value);
  }

  if (fieldDefinition.control === 'multi-checkbox' && Array.isArray(value)) {
    return JSON.stringify(value);
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
