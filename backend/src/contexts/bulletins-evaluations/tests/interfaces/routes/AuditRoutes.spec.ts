import test from 'node:test';
import assert from 'node:assert/strict';
import Fastify from 'fastify';
import { creerAuditRoutes } from 'contexts/bulletins-evaluations/interfaces/http/routes/audit.routes';
import { AuditBulletinController } from 'contexts/bulletins-evaluations/interfaces/http/controllers/AuditBulletinController';
import { ApplicationException } from 'contexts/bulletins-evaluations/application/exceptions/ApplicationException';
import { PostgresDepotBulletinEleve } from 'contexts/bulletins-evaluations/infrastructure/persistence/postgres/depots/PostgresDepotBulletinEleve';
import { PostgresDepotClassementColonneClasse } from 'contexts/bulletins-evaluations/infrastructure/persistence/postgres/depots/PostgresDepotClassementColonneClasse';
import { PostgresDepotFicheCotationEleveCours } from 'contexts/bulletins-evaluations/infrastructure/persistence/postgres/depots/PostgresDepotFicheCotationEleveCours';
import { PostgresDepotResultatBulletinEleve } from 'contexts/bulletins-evaluations/infrastructure/persistence/postgres/depots/PostgresDepotResultatBulletinEleve';
import {
  creerBulletin,
  creerClassement,
  creerFicheCotation,
  creerHistoriqueGenerationBulletin,
  creerResultatBulletin,
} from 'contexts/bulletins-evaluations/tests/factories/BulletinsEvaluationsFactories';
import { ContexteTenant } from 'shared/tenancy/TenantContext';

class AutorisationAuditPedagogiqueMemoire {
  public contexteCotes: Record<string, unknown> | null = null;
  public contexteConduite: Record<string, unknown> | null = null;
  public contexteBulletins: Record<string, unknown> | null = null;
  public contexteClassements: Record<string, unknown> | null = null;

  constructor(
    private readonly erreurConduite?: Error,
  ) {}

  public async verifierLectureAuditCotes(params: Record<string, unknown>): Promise<void> {
    this.contexteCotes = params;
  }

  public async verifierLectureAuditConduite(params: Record<string, unknown>): Promise<void> {
    this.contexteConduite = params;

    if (this.erreurConduite) {
      throw this.erreurConduite;
    }
  }

  public async verifierLectureAuditBulletins(params: Record<string, unknown>): Promise<void> {
    this.contexteBulletins = params;
  }

  public async verifierLectureAuditClassements(params: Record<string, unknown>): Promise<void> {
    this.contexteClassements = params;
  }
}

function creerControleurAudit(
  autorisationAuditPedagogiqueAdapter = new AutorisationAuditPedagogiqueMemoire(),
) {
  const depotFicheCotation = new PostgresDepotFicheCotationEleveCours();
  const depotResultat = new PostgresDepotResultatBulletinEleve();
  const depotBulletin = new PostgresDepotBulletinEleve();
  const depotClassement = new PostgresDepotClassementColonneClasse();

  return {
    autorisationAuditPedagogiqueAdapter,
    depotFicheCotation,
    depotResultat,
    depotBulletin,
    depotClassement,
    controller: new AuditBulletinController(
      {
        async executer() { return [{ action: 'MODIFICATION_COTE' }]; },
      } as never,
      {
        async executer() { return [{ action: 'ENCODAGE_CONDUITE' }]; },
      } as never,
      {
        async executer() { return [creerHistoriqueGenerationBulletin()]; },
      } as never,
      depotClassement,
      depotFicheCotation,
      depotResultat,
      depotBulletin,
      autorisationAuditPedagogiqueAdapter as never,
    ),
  };
}

test("les routes d'audit pedagogique appliquent la securite et resolvent le perimetre metier", async () => {
  const serveur = Fastify();
  const contexteTenant = new ContexteTenant();
  const composition = creerControleurAudit();
  const fiche = creerFicheCotation({
    idFicheCotationEleveCours: 'fiche-1',
    idEcole: 'ecole-1',
    idClassePedagogique: 'classe-1',
    idAnneeScolaire: 'annee-1',
  });
  const resultat = creerResultatBulletin({
    idResultatBulletinEleve: 'resultat-1',
    idEcole: 'ecole-1',
    idClassePedagogique: 'classe-1',
    idAnneeScolaire: 'annee-1',
  });
  const bulletin = creerBulletin({
    idBulletinEleve: 'bulletin-1',
    idEcole: 'ecole-1',
    idClassePedagogique: 'classe-1',
    idAnneeScolaire: 'annee-1',
    historiqueGeneration: [creerHistoriqueGenerationBulletin()],
  });
  const classement = creerClassement({
    idClassementColonneClasse: 'classement-1',
    idEcole: 'ecole-1',
    idClassePedagogique: 'classe-1',
    idAnneeScolaire: 'annee-1',
  });

  await composition.depotFicheCotation.sauvegarder(fiche);
  await composition.depotResultat.sauvegarder(resultat);
  await composition.depotBulletin.sauvegarder(bulletin);
  await composition.depotClassement.sauvegarder(classement);

  await serveur.register(creerAuditRoutes({
    auditBulletinController: composition.controller,
    contexteTenant,
  } as never));

  assert.equal((await serveur.inject({
    method: 'GET',
    url: '/audit/cotes?idFicheCotationEleveCours=fiche-1',
    headers: {
      'x-user-id': 'user-1',
      'x-tenant-id': 'ecole-1',
      'x-organisation-id': 'org-1',
    },
  })).statusCode, 200);
  assert.deepEqual(composition.autorisationAuditPedagogiqueAdapter.contexteCotes, {
    idUtilisateur: 'user-1',
    idOrganisation: 'org-1',
    idEcole: 'ecole-1',
    idClassePedagogique: 'classe-1',
    idAnneeScolaire: 'annee-1',
  });

  assert.equal((await serveur.inject({
    method: 'GET',
    url: '/audit/conduite?idResultatBulletinEleve=resultat-1',
    headers: {
      'x-user-id': 'user-1',
      'x-tenant-id': 'ecole-1',
    },
  })).statusCode, 200);

  assert.equal((await serveur.inject({
    method: 'GET',
    url: '/audit/bulletins?idBulletinEleve=bulletin-1',
    headers: {
      'x-user-id': 'user-1',
      'x-tenant-id': 'ecole-1',
    },
  })).statusCode, 200);

  assert.equal((await serveur.inject({
    method: 'GET',
    url: '/audit/classements?idClassePedagogique=classe-1&idAnneeScolaire=annee-1&codeColonne=TOTAL_GENERAL',
    headers: {
      'x-user-id': 'user-1',
      'x-tenant-id': 'ecole-1',
    },
  })).statusCode, 200);
  assert.deepEqual(composition.autorisationAuditPedagogiqueAdapter.contexteClassements, {
    idUtilisateur: 'user-1',
    idOrganisation: undefined,
    idEcole: 'ecole-1',
    idClassePedagogique: 'classe-1',
    idAnneeScolaire: 'annee-1',
  });

  await serveur.close();
});

test("les routes d'audit refusent un acteur non autorise", async () => {
  const serveur = Fastify();
  const contexteTenant = new ContexteTenant();
  const composition = creerControleurAudit(
    new AutorisationAuditPedagogiqueMemoire(
      new ApplicationException(
        "L'utilisateur demandeur n'est pas autorise a consulter cet audit de conduite.",
        'BULLETINS_AUDIT_CONDUITE_ACCES_REFUSE',
      ),
    ),
  );
  const resultat = creerResultatBulletin({
    idResultatBulletinEleve: 'resultat-refuse',
    idEcole: 'ecole-1',
    idClassePedagogique: 'classe-1',
    idAnneeScolaire: 'annee-1',
  });
  await composition.depotResultat.sauvegarder(resultat);

  await serveur.register(creerAuditRoutes({
    auditBulletinController: composition.controller,
    contexteTenant,
  } as never));

  const reponse = await serveur.inject({
    method: 'GET',
    url: '/audit/conduite?idResultatBulletinEleve=resultat-refuse',
    headers: {
      'x-user-id': 'user-2',
      'x-tenant-id': 'ecole-1',
    },
  });

  assert.equal(reponse.statusCode, 400);
  assert.match(reponse.body, /BULLETINS_AUDIT_CONDUITE_ACCES_REFUSE/);

  await serveur.close();
});
