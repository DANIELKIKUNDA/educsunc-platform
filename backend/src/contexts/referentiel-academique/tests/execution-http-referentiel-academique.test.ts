import test from 'node:test';
import assert from 'node:assert/strict';
import Fastify, { type FastifyRequest } from 'fastify';
import { ValidationError } from '../../../shared/exceptions/ValidationError';
import type {
  CommandeEnregistrementIdempotence,
  EnregistrementIdempotence,
  IdempotencyStore,
} from 'shared/infrastructure/idempotency/IdempotencyStore';
import { ContexteExecutionTenantReferentielAcademique } from '../infrastructure/tenancy/ContexteExecutionTenantReferentielAcademique';
import {
  creerExecuteurRouteIdempotenteReferentielAcademique,
} from '../interfaces/http/routes/ExecutionRouteIdempotenteReferentielAcademique';
import {
  creerExecuteurRouteTenantReferentielAcademique,
} from '../interfaces/http/routes/ExecutionRouteTenantReferentielAcademique';

class StoreIdempotenceMemoire implements IdempotencyStore {
  private readonly enregistrements = new Map<string, EnregistrementIdempotence>();

  public async existe(cle: string): Promise<boolean> {
    return this.enregistrements.has(cle);
  }

  public async obtenir(cle: string): Promise<EnregistrementIdempotence | null> {
    return this.enregistrements.get(cle) ?? null;
  }

  public async enregistrer(cle: string): Promise<void>;
  public async enregistrer(commande: CommandeEnregistrementIdempotence): Promise<void>;
  public async enregistrer(
    cleOuCommande: string | CommandeEnregistrementIdempotence,
  ): Promise<void> {
    const commande = typeof cleOuCommande === 'string'
      ? {
        cle: cleOuCommande,
        statut: 'ENREGISTREE',
        operation: null,
        empreinteRequete: null,
        resultat: null,
        expireLe: null,
      }
      : {
        cle: cleOuCommande.cle,
        statut: cleOuCommande.statut,
        operation: cleOuCommande.operation ?? null,
        empreinteRequete: cleOuCommande.empreinteRequete ?? null,
        resultat: cleOuCommande.resultat ?? null,
        expireLe: cleOuCommande.expireLe ?? null,
      };

    if (this.enregistrements.has(commande.cle)) {
      return;
    }

    this.enregistrements.set(commande.cle, {
      cle: commande.cle,
      statut: commande.statut,
      operation: commande.operation,
      empreinteRequete: commande.empreinteRequete,
      resultat: commande.resultat,
      expireLe: commande.expireLe,
      creeLe: new Date(),
    });
  }

  public async marquerResultat(
    cle: string,
    statut: string,
    resultat: Record<string, unknown> | null = null,
  ): Promise<void> {
    const courant = this.enregistrements.get(cle);

    if (courant === undefined) {
      return;
    }

    this.enregistrements.set(cle, {
      ...courant,
      statut,
      resultat,
    });
  }

  public async supprimerExpirees(): Promise<number> {
    return 0;
  }
}

test('l executeur idempotent renvoie le resultat memorise sans rejouer l operation', async () => {
  const app = Fastify();
  const contexteExecutionTenant = new ContexteExecutionTenantReferentielAcademique();
  const executeurTenant = creerExecuteurRouteTenantReferentielAcademique(
    contexteExecutionTenant,
  );
  const executeurIdempotent = creerExecuteurRouteIdempotenteReferentielAcademique(
    new StoreIdempotenceMemoire(),
  );
  let nombreExecutions = 0;

  app.setErrorHandler((erreur, _requete, reponse) => {
    if (erreur instanceof ValidationError) {
      void reponse.code(400).send({ message: erreur.message });
      return;
    }

    void reponse.code(500).send({
      message: erreur instanceof Error ? erreur.message : 'Erreur inconnue',
    });
  });

  app.post('/api/referentiels/versions', async (requete, reponse) => {
    const resultat = await executeurIdempotent(
      requete,
      () => executeurTenant(
        requete,
        async () => {
          nombreExecutions += 1;
          return {
            donnee: {
              compteur: nombreExecutions,
            },
          };
        },
      ),
      {
        operation: 'PUBLIER_VERSION_REFERENTIEL',
      },
    );

    return reponse.code(200).send(resultat);
  });

  const premiereReponse = await app.inject({
    method: 'POST',
    url: '/api/referentiels/versions',
    headers: {
      'idempotency-key': 'idem-version-001',
    },
    payload: {
      idReferentielProgramme: 'ref-001',
    },
  });
  const secondeReponse = await app.inject({
    method: 'POST',
    url: '/api/referentiels/versions',
    headers: {
      'idempotency-key': 'idem-version-001',
    },
    payload: {
      idReferentielProgramme: 'ref-001',
    },
  });

  assert.equal(premiereReponse.statusCode, 200);
  assert.equal(secondeReponse.statusCode, 200);
  assert.deepEqual(premiereReponse.json(), secondeReponse.json());
  assert.equal(nombreExecutions, 1);

  await app.close();
});

test('l executeur tenant propage le tenant courant dans une route locale', async () => {
  const contexteExecutionTenant = new ContexteExecutionTenantReferentielAcademique();
  const executeurTenant = creerExecuteurRouteTenantReferentielAcademique(
    contexteExecutionTenant,
  );
  const requete = {
    headers: {
      'x-tenant-id': '00000000-0000-0000-0000-000000000777',
    },
    query: {},
    params: {},
    body: {},
  } as unknown as FastifyRequest;

  const etatObserve = await executeurTenant(
    requete,
    async () => contexteExecutionTenant.obtenirEtatCourant(),
    {
      mode: 'tenant_requis',
      clesTenant: ['idEcole'],
    },
  );

  assert.equal(etatObserve.idTenant, '00000000-0000-0000-0000-000000000777');
  assert.equal(etatObserve.lectureOrganisationnelle, false);
});
