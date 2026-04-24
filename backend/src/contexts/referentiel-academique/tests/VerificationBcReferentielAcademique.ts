import assert from 'node:assert/strict';
import Fastify, { type FastifyRequest } from 'fastify';
import { ValidationError } from '../../../shared/exceptions/ValidationError';
import { ContexteTenant } from '../../../shared/tenancy/TenantContext';
import { Pagination, ResultatPagine } from '../../../shared/application/Pagination';
import { migrationsPostgresReferentielAcademique } from '../infrastructure/persistence/postgres/migrations';
import { AnneeScolaireId } from '../domain/value-objects/AnneeScolaireId';
import { DepotAnneeScolairePostgres } from '../infrastructure/persistence/postgres/depots/DepotAnneeScolairePostgres';
import type {
  ClientPostgresReferentielAcademique,
  ResultatExecutionPostgres,
} from '../infrastructure/persistence/postgres/depots/ClientPostgresReferentielAcademique';
import { ContexteExecutionTenantReferentielAcademique } from '../infrastructure/tenancy/ContexteExecutionTenantReferentielAcademique';
import { ReferentielProgramme } from '../domain/aggregates/ReferentielProgramme';
import { VersionReferentielProgramme } from '../domain/aggregates/VersionReferentielProgramme';
import { LigneReferentielProgramme } from '../domain/entities/LigneReferentielProgramme';
import { DepotReferentielProgramme } from '../domain/repositories/DepotReferentielProgramme';
import { ClasseAcademiqueId } from '../domain/value-objects/ClasseAcademiqueId';
import { LigneReferentielProgrammeId } from '../domain/value-objects/LigneReferentielProgrammeId';
import { PonderationEvaluation } from '../domain/value-objects/PonderationEvaluation';
import { ReferentielCoursId } from '../domain/value-objects/ReferentielCoursId';
import { ReferentielProgrammeId } from '../domain/value-objects/ReferentielProgrammeId';
import { SourceLigneProgramme } from '../domain/value-objects/SourceLigneProgramme';
import { SourceReferentiel } from '../domain/value-objects/SourceReferentiel';
import { TypeStructureEvaluation } from '../domain/value-objects/TypeStructureEvaluation';
import { PublierVersionReferentiel } from '../application/use-cases/referentiels/PublierVersionReferentiel';
import type { EntreeJournalAuditReferentielAcademique } from '../application/services/ServiceJournalAuditReferentielAcademique';
import { ServiceJournalAuditReferentielAcademique } from '../application/services/ServiceJournalAuditReferentielAcademique';
import { VersionReferentielProgrammeId } from '../domain/value-objects/VersionReferentielProgrammeId';
import type {
  CommandeEnregistrementIdempotence,
  EnregistrementIdempotence,
  IdempotencyStore,
} from 'shared/infrastructure/idempotency/IdempotencyStore';
import { creerExecuteurRouteIdempotenteReferentielAcademique } from '../interfaces/http/routes/ExecutionRouteIdempotenteReferentielAcademique';
import { creerExecuteurRouteTenantReferentielAcademique } from '../interfaces/http/routes/ExecutionRouteTenantReferentielAcademique';

interface RequeteCapturee {
  requeteSql: string;
  parametres: readonly unknown[];
}

class FauxClientPostgresReferentielAcademique
  implements ClientPostgresReferentielAcademique
{
  public readonly requetes: RequeteCapturee[] = [];

  public async executer<TLigne extends object = Record<string, unknown>>(
    requeteSql: string,
    parametres: readonly unknown[] = [],
  ): Promise<ResultatExecutionPostgres<TLigne>> {
    this.requetes.push({ requeteSql, parametres });

    return {
      lignes: [],
      nombreLignesAffectees: 0,
    };
  }
}

class FauxDepotReferentielProgramme implements DepotReferentielProgramme {
  public readonly referentielProgramme: ReferentielProgramme;
  public nombreSauvegardes = 0;

  constructor(referentielProgramme: ReferentielProgramme) {
    this.referentielProgramme = referentielProgramme;
  }

  public async trouverParId(
    idReferentielProgramme: ReferentielProgrammeId,
  ): Promise<ReferentielProgramme | null> {
    return this.referentielProgramme.obtenirId().estEgal(idReferentielProgramme)
      ? this.referentielProgramme
      : null;
  }

  public async trouverParClasseAcademique(): Promise<ReferentielProgramme | null> {
    return this.referentielProgramme;
  }

  public async trouverParIdVersion(
    idVersionReferentielProgramme: VersionReferentielProgrammeId,
  ): Promise<ReferentielProgramme | null> {
    return this.referentielProgramme.trouverVersionParId(idVersionReferentielProgramme) === null
      ? null
      : this.referentielProgramme;
  }

  public async listerParClasseAcademique(
    _idClasseAcademique: ClasseAcademiqueId,
    pagination: Pagination,
  ): Promise<ResultatPagine<ReferentielProgramme>> {
    return {
      donnees: [this.referentielProgramme],
      total: 1,
      page: pagination.page,
      taillePage: pagination.taillePage,
    };
  }

  public async sauvegarder(): Promise<void> {
    this.nombreSauvegardes += 1;
  }
}

class FauxServiceJournalAuditReferentielAcademique
  implements ServiceJournalAuditReferentielAcademique
{
  public readonly entrees: EntreeJournalAuditReferentielAcademique[] = [];

  public async journaliser(entree: EntreeJournalAuditReferentielAcademique): Promise<void> {
    this.entrees.push(entree);
  }
}

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

function creerVersionPublieeDeTest(): VersionReferentielProgramme {
  const ligne = new LigneReferentielProgramme(
    new LigneReferentielProgrammeId('00000000-0000-0000-0000-000000000401'),
    new ReferentielCoursId('00000000-0000-0000-0000-000000000402'),
    1,
    true,
    false,
    true,
    SourceLigneProgramme.OFFICIEL,
    new PonderationEvaluation({
      maxP1: 10,
      maxP2: 0,
      maxEX1: 0,
      maxP3: 0,
      maxP4: 0,
      maxEX2: 0,
      maxP5: 0,
      maxP6: 0,
      maxEX3: 0,
    }),
  );
  const version = new VersionReferentielProgramme(
    new VersionReferentielProgrammeId('00000000-0000-0000-0000-000000000300'),
    '2026-V1',
    '2026',
    new Date('2026-03-31T00:00:00.000Z'),
    SourceReferentiel.JSON_OFFICIEL,
    'Publication officielle',
    false,
    new Date('2026-03-31T00:00:00.000Z'),
    [ligne],
  );

  version.publierVersion();

  return version;
}

async function verifierMigrationsRls(): Promise<void> {
  const migrationRls = migrationsPostgresReferentielAcademique.find(
    (migration) => migration.idMigration === '006_rls_tables_locales_referentiel_academique',
  );

  assert.ok(migrationRls);

  const sqlMontee = migrationRls.genererSqlMontee().join('\n');

  assert.match(sqlMontee, /ENABLE ROW LEVEL SECURITY/);
  assert.match(sqlMontee, /CREATE POLICY "rls_annees_scolaires_lecture"/);
}

async function verifierIsolationDepotAnneeScolaire(): Promise<void> {
  const clientPostgres = new FauxClientPostgresReferentielAcademique();
  const contexteExecutionTenant = new ContexteExecutionTenantReferentielAcademique();
  const depot = new DepotAnneeScolairePostgres(
    clientPostgres,
    undefined,
    contexteExecutionTenant,
  );
  const contexteTenant = new ContexteTenant();

  contexteTenant.definirTenant('00000000-0000-0000-0000-000000000111');

  await contexteExecutionTenant.executerAvecContexte(contexteTenant, async () => {
    await depot.trouverParId(new AnneeScolaireId('00000000-0000-0000-0000-000000000222'));
  });

  assert.equal(clientPostgres.requetes.length, 1);
  assert.match(clientPostgres.requetes[0].requeteSql, /"id_ecole" = \$2/);
}

async function verifierPublicationAvecAudit(): Promise<void> {
  const referentielProgramme = new ReferentielProgramme(
    new ReferentielProgrammeId('00000000-0000-0000-0000-000000000100'),
    new ClasseAcademiqueId('00000000-0000-0000-0000-000000000200'),
    TypeStructureEvaluation.TRIMESTRIEL,
  );
  referentielProgramme.ajouterVersion(creerVersionPublieeDeTest());
  const depotReferentielProgramme = new FauxDepotReferentielProgramme(referentielProgramme);
  const serviceJournalAudit = new FauxServiceJournalAuditReferentielAcademique();
  const casUsage = new PublierVersionReferentiel(
    depotReferentielProgramme,
    undefined,
    serviceJournalAudit,
  );

  await casUsage.executer({
    idReferentielProgramme: referentielProgramme.obtenirId().obtenirValeur(),
    codeVersion: '2026-V1',
    anneeReference: '2026',
    datePublication: new Date('2026-03-31T00:00:00.000Z'),
    sourceImport: SourceReferentiel.JSON_OFFICIEL,
    motifPublication: 'Publication officielle',
    publiePar: 'responsable.referentiel',
  });

  assert.equal(depotReferentielProgramme.nombreSauvegardes, 0);
  assert.ok(referentielProgramme.trouverVersionParCode('2026-V1'));
  assert.equal(serviceJournalAudit.entrees.length, 1);
}

async function verifierExecutionHttpIdempotente(): Promise<void> {
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
}

async function verifierExecutionTenantHttp(): Promise<void> {
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
}

async function executerVerification(
  libelle: string,
  verification: () => Promise<void>,
): Promise<void> {
  await verification();
  console.log(`[OK] ${libelle}`);
}

async function main(): Promise<void> {
  await executerVerification('Migrations RLS', verifierMigrationsRls);
  await executerVerification('Isolation depot annee scolaire', verifierIsolationDepotAnneeScolaire);
  await executerVerification('Publication avec audit', verifierPublicationAvecAudit);
  await executerVerification('Execution HTTP idempotente', verifierExecutionHttpIdempotente);
  await executerVerification('Execution tenant HTTP', verifierExecutionTenantHttp);
}

void main().catch((erreur: unknown) => {
  const message = erreur instanceof Error ? erreur.stack ?? erreur.message : String(erreur);
  console.error(`[ECHEC] ${message}`);
  process.exitCode = 1;
});
