import { clientApi } from '../../../../services/api';

export interface OptionsRequeteReferentiel {
  tenantId?: string;
  organisationId?: string;
  idempotencyKey?: string;
}

function construireEntetes(options?: OptionsRequeteReferentiel): Record<string, string> {
  const entetes: Record<string, string> = {};

  if (options?.tenantId) {
    entetes['x-tenant-id'] = options.tenantId;
  }

  if (options?.organisationId) {
    entetes['x-organisation-id'] = options.organisationId;
  }

  if (options?.idempotencyKey) {
    entetes['Idempotency-Key'] = options.idempotencyKey;
  }

  return entetes;
}

export const referentielApi = {
  async obtenir<TSortie>(chemin: string, options?: OptionsRequeteReferentiel): Promise<TSortie> {
    return clientApi.envoyer<TSortie>({
      chemin,
      entetes: construireEntetes(options),
    });
  },

  async envoyer<TEntree, TSortie>(
    chemin: string,
    corps: TEntree,
    options?: OptionsRequeteReferentiel,
  ): Promise<TSortie> {
    return clientApi.envoyer<TSortie>({
      chemin,
      methode: 'POST',
      corps,
      entetes: construireEntetes(options),
    });
  },

  async modifier<TEntree, TSortie>(
    chemin: string,
    corps: TEntree,
    options?: OptionsRequeteReferentiel,
  ): Promise<TSortie> {
    return clientApi.envoyer<TSortie>({
      chemin,
      methode: 'PATCH',
      corps,
      entetes: construireEntetes(options),
    });
  },
};
