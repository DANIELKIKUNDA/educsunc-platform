import type { ConfigurationContext } from '../../../context';
import type { ConfigurationRuntimeSignal } from '../ConfigurationRuntimeIntegrationTypes';

// Ce fichier declare le mapper vers Runtime.

export class ConfigurationRuntimeMapper {
  public static creerSignal(
    type: ConfigurationRuntimeSignal['type'],
    contexte: ConfigurationContext,
    force = false,
    metadata: Readonly<Record<string, unknown>> = {},
  ): ConfigurationRuntimeSignal {
    return {
      type,
      contexte,
      force,
      metadata,
    };
  }
}
