import { clientApi } from '../../../services/api';
import {
  construireEntetesPilotageActif,
  construireEntetesContexteActif,
  lireContexteApiActif,
  lireContexteApiPlateformeGlobal,
} from '../../../shared/session/api-context';
import type {
  ConfigurationApiEnvelope,
  ConfigurationDiffItem,
  ConfigurationItem,
  ConfigurationModuleCatalogItem,
  ConfigurationModulesResolution,
  ConfigurationScope,
  ConfigurationSnapshotItem,
  ConfigurationValidationItem,
  ConfigurationValue,
  EffectiveConfigurationItem,
} from '../models/configuration.model';

export interface ConfigurationApiContext {
  organisationId: string | null;
  ecoleId: string | null;
  utilisateurId: string | null;
}

function genererIdempotencyKey(prefixe: string): string {
  if (typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function') {
    return `${prefixe}-${crypto.randomUUID()}`;
  }

  return `${prefixe}-${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
}

function construireQueryString(query: Record<string, string | number | undefined>): string {
  const params = new URLSearchParams();

  Object.entries(query).forEach(([cle, valeur]) => {
    if (valeur !== undefined && String(valeur).trim().length > 0) {
      params.set(cle, String(valeur));
    }
  });

  const serialise = params.toString();
  return serialise.length > 0 ? `?${serialise}` : '';
}

function construireEntetesContexte(contexte: ConfigurationApiContext): Record<string, string> {
  if (
    contexte.organisationId === null
    || contexte.ecoleId === null
    || contexte.utilisateurId === null
  ) {
    throw new Error('Le contexte frontend configuration est incomplet.');
  }

  return construireEntetesContexteActif(contexte);
}

function construireEntetesSelonNiveau(
  contexte: ConfigurationApiContext,
  niveau?: ConfigurationScope['niveau'],
): Record<string, string> {
  if (niveau === 'SYSTEM') {
    return construireEntetesPilotageActif(lireContexteApiPlateformeGlobal());
  }

  return construireEntetesContexte(contexte);
}

function construireEntetesPorteeConfiguration(
  contexte: ConfigurationApiContext,
  scope: {
    niveau: ConfigurationScope['niveau'];
    organisationId?: string;
    ecoleId?: string;
  },
): Record<string, string> {
  if (scope.niveau === 'SYSTEM') {
    return construireEntetesPilotageActif(lireContexteApiPlateformeGlobal());
  }

  if (
    scope.niveau === 'ORGANIZATION'
    && scope.organisationId
    && contexte.ecoleId === null
  ) {
    return construireEntetesPilotageActif(lireContexteApiPlateformeGlobal(), {
      organisationId: scope.organisationId,
      lectureOrganisationnelle: true,
    });
  }

  if (
    scope.niveau === 'SCHOOL'
    && scope.organisationId
    && scope.ecoleId
    && contexte.ecoleId === null
  ) {
    return construireEntetesPilotageActif(lireContexteApiPlateformeGlobal(), {
      organisationId: scope.organisationId,
      ecoleId: scope.ecoleId,
    });
  }

  return construireEntetesContexte(contexte);
}

function construireEntetesMutation(
  contexte: ConfigurationApiContext,
  prefixe: string,
  niveau?: ConfigurationScope['niveau'],
): Record<string, string> {
  return {
    ...construireEntetesSelonNiveau(contexte, niveau),
    'idempotency-key': genererIdempotencyKey(prefixe),
  };
}

export function lireContexteApiConfiguration(): ConfigurationApiContext {
  return lireContexteApiActif();
}

export const configurationApi = {
  async creerConfiguration(
    payload: {
      configurationId?: string;
      key: string;
      value: ConfigurationValue;
      scope: ConfigurationScope;
      actorId?: string;
    },
    contexte: ConfigurationApiContext,
  ) {
    return clientApi.envoyer<ConfigurationApiEnvelope<ConfigurationItem>>({
      chemin: '/api/v1/configuration',
      methode: 'POST',
      corps: payload,
      entetes: construireEntetesMutation(contexte, 'configuration-create', payload.scope.niveau),
    });
  },

  async consulterConfiguration(id: string, contexte: ConfigurationApiContext) {
    return clientApi.envoyer<ConfigurationApiEnvelope<ConfigurationItem>>({
      chemin: `/api/v1/configuration/${id}`,
      entetes: construireEntetesContexte(contexte),
    });
  },

  async mettreAJourConfiguration(
    id: string,
    payload: {
      value: ConfigurationValue;
      actorId?: string;
      metadata?: Readonly<Record<string, unknown>>;
    },
    contexte: ConfigurationApiContext,
  ) {
    return clientApi.envoyer<ConfigurationApiEnvelope<ConfigurationItem>>({
      chemin: `/api/v1/configuration/${id}`,
      methode: 'PUT',
      corps: payload,
      entetes: construireEntetesMutation(contexte, 'configuration-update'),
    });
  },

  async supprimerConfiguration(
    id: string,
    payload: { actorId?: string; raison?: string },
    contexte: ConfigurationApiContext,
  ) {
    return clientApi.envoyer<ConfigurationApiEnvelope<{ configurationId: string; supprime: true }>>({
      chemin: `/api/v1/configuration/${id}`,
      methode: 'DELETE',
      corps: payload,
      entetes: construireEntetesMutation(contexte, 'configuration-delete'),
    });
  },

  async verrouillerConfiguration(
    id: string,
    payload: {
      niveauMinimalAutorise: ConfigurationScope['niveau'];
      actorId: string;
      raison?: string;
    },
    contexte: ConfigurationApiContext,
  ) {
    return clientApi.envoyer<ConfigurationApiEnvelope<ConfigurationItem>>({
      chemin: `/api/v1/configuration/${id}/lock`,
      methode: 'POST',
      corps: payload,
      entetes: construireEntetesMutation(contexte, 'configuration-lock'),
    });
  },

  async deverrouillerConfiguration(
    id: string,
    payload: { actorId?: string },
    contexte: ConfigurationApiContext,
  ) {
    return clientApi.envoyer<ConfigurationApiEnvelope<ConfigurationItem>>({
      chemin: `/api/v1/configuration/${id}/unlock`,
      methode: 'POST',
      corps: payload,
      entetes: construireEntetesMutation(contexte, 'configuration-unlock'),
    });
  },

  async consulterConfigurationEffective(
    query: {
      niveau: ConfigurationScope['niveau'];
      organisationId?: string;
      ecoleId?: string;
      utilisateurId?: string;
      keyPrefix?: string;
    },
    contexte: ConfigurationApiContext,
  ) {
    return clientApi.envoyer<ConfigurationApiEnvelope<EffectiveConfigurationItem | null>>({
      chemin: `/api/v1/configuration/effective${construireQueryString(query)}`,
      entetes: construireEntetesPorteeConfiguration(contexte, {
        niveau: query.niveau,
        organisationId: query.organisationId,
        ecoleId: query.ecoleId,
      }),
    });
  },

  async validerConfiguration(
    payload: {
      key: string;
      value: ConfigurationValue;
      scope?: ConfigurationScope;
    },
    contexte: ConfigurationApiContext,
  ) {
    return clientApi.envoyer<ConfigurationApiEnvelope<ConfigurationValidationItem>>({
      chemin: '/api/v1/configuration/validate',
      methode: 'POST',
      corps: payload,
      entetes: construireEntetesMutation(contexte, 'configuration-validate', payload.scope?.niveau),
    });
  },

  async creerSnapshotConfiguration(
    id: string,
    payload: { snapshotId?: string; actorId?: string },
    contexte: ConfigurationApiContext,
  ) {
    return clientApi.envoyer<ConfigurationApiEnvelope<ConfigurationSnapshotItem>>({
      chemin: `/api/v1/configuration/${id}/snapshots`,
      methode: 'POST',
      corps: payload,
      entetes: construireEntetesMutation(contexte, 'configuration-snapshot'),
    });
  },

  async comparerSnapshotsConfiguration(
    id: string,
    query: { sourceId: string; cibleId: string },
    contexte: ConfigurationApiContext,
  ) {
    return clientApi.envoyer<ConfigurationApiEnvelope<ConfigurationDiffItem>>({
      chemin: `/api/v1/configuration/${id}/snapshots/compare${construireQueryString(query)}`,
      entetes: construireEntetesContexte(contexte),
    });
  },

  async propagerConfiguration(
    id: string,
    payload: { actorId?: string; canauxCibles?: readonly string[] },
    contexte: ConfigurationApiContext,
  ) {
    return clientApi.envoyer<ConfigurationApiEnvelope<{ configurationId: string; propagationDemandee: true }>>({
      chemin: `/api/v1/configuration/${id}/propagate`,
      methode: 'POST',
      corps: payload,
      entetes: construireEntetesMutation(contexte, 'configuration-propagate'),
    });
  },

  async rechargerConfiguration(
    id: string,
    payload: { actorId?: string; forcer?: boolean },
    contexte: ConfigurationApiContext,
  ) {
    return clientApi.envoyer<ConfigurationApiEnvelope<{ configurationId: string; reloadDemande: true }>>({
      chemin: `/api/v1/configuration/${id}/reload`,
      methode: 'POST',
      corps: payload,
      entetes: construireEntetesMutation(contexte, 'configuration-reload'),
    });
  },

  async configurerModulesOrganisation(
    organisationId: string,
    payload: {
      modules: readonly string[];
      actorId?: string;
    },
    contexte: ConfigurationApiContext,
  ) {
    return clientApi.envoyer<ConfigurationApiEnvelope<{
      organisationId: string;
      configurationId: string;
      modules: readonly string[];
    }>>({
      chemin: `/api/v1/configuration/modules/organisations/${organisationId}`,
      methode: 'PUT',
      corps: payload,
      entetes: {
        ...construireEntetesPorteeConfiguration(contexte, {
          niveau: 'ORGANIZATION',
          organisationId,
        }),
        'idempotency-key': genererIdempotencyKey('configuration-modules-organization'),
      },
    });
  },

  async configurerModulesEcole(
    ecoleId: string,
    payload: {
      organisationId: string;
      modules: readonly string[];
      actorId?: string;
    },
    contexte: ConfigurationApiContext,
  ) {
    return clientApi.envoyer<ConfigurationApiEnvelope<{
      organisationId: string;
      ecoleId: string;
      configurationId: string;
      modules: readonly string[];
    }>>({
      chemin: `/api/v1/configuration/modules/ecoles/${ecoleId}`,
      methode: 'PUT',
      corps: payload,
      entetes: {
        ...construireEntetesPorteeConfiguration(contexte, {
          niveau: 'SCHOOL',
          organisationId: payload.organisationId,
          ecoleId,
        }),
        'idempotency-key': genererIdempotencyKey('configuration-modules-school'),
      },
    });
  },

  async resoudreModulesEffectifs(
    query: {
      organisationId: string;
      ecoleId: string;
    },
    contexte: ConfigurationApiContext,
  ) {
    return clientApi.envoyer<ConfigurationApiEnvelope<ConfigurationModulesResolution>>({
      chemin: `/api/v1/configuration/modules/effective${construireQueryString(query)}`,
      entetes: construireEntetesPorteeConfiguration(contexte, {
        niveau: 'SCHOOL',
        organisationId: query.organisationId,
        ecoleId: query.ecoleId,
      }),
    });
  },

  async consulterCatalogueModules(contexte: ConfigurationApiContext) {
    return clientApi.envoyer<ConfigurationApiEnvelope<{
      modules: readonly ConfigurationModuleCatalogItem[];
    }>>({
      chemin: '/api/v1/configuration/modules/catalogue',
      entetes: construireEntetesSelonNiveau(contexte, 'SYSTEM'),
    });
  },
};
