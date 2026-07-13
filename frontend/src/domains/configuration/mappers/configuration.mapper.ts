import type {
  ConfigurationDiffItem,
  ConfigurationItem,
  ConfigurationScope,
  ConfigurationScopeLevel,
  ConfigurationValue,
  EffectiveConfigurationItem,
} from '../models/configuration.model';

export function formatConfigurationValue(value: ConfigurationValue): string {
  if (typeof value === 'string') {
    return value;
  }

  if (typeof value === 'number' || typeof value === 'boolean') {
    return String(value);
  }

  if (value === null) {
    return 'null';
  }

  return JSON.stringify(value, null, 2);
}

export function parseConfigurationValue(input: string): ConfigurationValue {
  const trimmed = input.trim();
  if (trimmed.length === 0) {
    return '';
  }

  if (trimmed === 'true') {
    return true;
  }

  if (trimmed === 'false') {
    return false;
  }

  if (trimmed === 'null') {
    return null;
  }

  const asNumber = Number(trimmed);
  if (!Number.isNaN(asNumber) && /^-?\d+(\.\d+)?$/.test(trimmed)) {
    return asNumber;
  }

  if ((trimmed.startsWith('{') && trimmed.endsWith('}')) || (trimmed.startsWith('[') && trimmed.endsWith(']'))) {
    return JSON.parse(trimmed) as ConfigurationValue;
  }

  return input;
}

export function formatScopeLabel(scope: ConfigurationScope): string {
  const parts: string[] = [scope.niveau];

  if (scope.organisationId) {
    parts.push(`org:${scope.organisationId}`);
  }

  if (scope.ecoleId) {
    parts.push(`ecole:${scope.ecoleId}`);
  }

  if (scope.utilisateurId) {
    parts.push(`user:${scope.utilisateurId}`);
  }

  return parts.join(' | ');
}

export function buildScopeFromLevel(
  niveau: ConfigurationScopeLevel,
  context: {
    organisationId: string;
    ecoleId: string;
    utilisateurId: string;
  },
): ConfigurationScope {
  if (niveau === 'SYSTEM') {
    return { niveau };
  }

  if (niveau === 'ORGANIZATION') {
    return {
      niveau,
      organisationId: context.organisationId,
    };
  }

  if (niveau === 'SCHOOL') {
    return {
      niveau,
      organisationId: context.organisationId,
      ecoleId: context.ecoleId,
    };
  }

  return {
    niveau,
    utilisateurId: context.utilisateurId,
  };
}

export function summarizeConfiguration(item: ConfigurationItem | null): string {
  if (!item) {
    return 'Aucune configuration chargee.';
  }

  return `${item.key} | ${item.statut} | ${formatScopeLabel(item.scope)}`;
}

export function summarizeEffectiveConfiguration(item: EffectiveConfigurationItem | null): string {
  if (!item || item.valeurs.length === 0) {
    return 'Aucune valeur effective resolue.';
  }

  return `${item.valeurs.length} valeur(s) effective(s) | ${formatScopeLabel(item.scope)}`;
}

export function summarizeDiff(diff: ConfigurationDiffItem | null): string {
  if (!diff) {
    return 'Aucune comparaison de snapshots.';
  }

  return `Ajouts ${diff.ajouts.length} | Suppressions ${diff.suppressions.length} | Modifications ${diff.modifications.length}`;
}
