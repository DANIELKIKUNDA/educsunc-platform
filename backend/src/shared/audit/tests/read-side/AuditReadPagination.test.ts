import assert from 'node:assert/strict';
import test from 'node:test';
import type {
  AuditReadFilters,
  AuditReadPageRequest,
  AuditReadRepositoryPort,
} from '../../application/ports/outbound/AuditReadRepositoryPort';
import type { AuditEntryOutput } from '../../application/dto/outputs/AuditEntryOutput';
import { AuditSearchApplicationService } from '../../application/services/AuditSearchApplicationService';
import { AuditReadCursorCodec } from '../../application/services/AuditReadCursorCodec';

function entree(id: string, dateAction: string): AuditEntryOutput {
  return {
    idAuditEntry: id,
    action: 'CONSULTATION',
    typePrincipal: 'LECTURE',
    typeAuditPrincipal: 'LECTURE',
    categories: ['CONSULTATION'],
    gravite: 'INFO',
    resultat: 'SUCCES',
    acteur: { idUtilisateur: 'acteur-l3', typeActeur: 'UTILISATEUR' },
    tenant: { organisationId: 'org-a', ecoleId: 'ecole-a', scope: 'ECOLE' },
    contexte: { sourceAudit: 'HTTP', modeOffline: false },
    organisationId: 'org-a',
    ecoleId: 'ecole-a',
    createdAt: dateAction,
    dateAction,
  };
}

class DepotMemoire implements AuditReadRepositoryPort {
  public readonly appels: Array<{ filtres: AuditReadFilters; pagination: AuditReadPageRequest }> = [];
  public constructor(private readonly donnees: readonly AuditEntryOutput[]) {}

  public async rechercher(filtres: AuditReadFilters, pagination: AuditReadPageRequest) {
    this.appels.push({ filtres, pagination });
    const debut = pagination.position
      ? this.donnees.findIndex((item) => item.idAuditEntry === pagination.position?.idAuditEntry) + 1
      : 0;
    const page = this.donnees.slice(debut, debut + pagination.limite);
    return { items: page, hasNextPage: debut + pagination.limite < this.donnees.length };
  }

  public async obtenirParId(filtres: AuditReadFilters) {
    return this.donnees.find((item) => item.idAuditEntry === filtres.idAuditEntry
      && item.organisationId === filtres.organisationId
      && item.ecoleId === filtres.ecoleId) ?? null;
  }

  public async compter() {
    return { total: this.donnees.length, critiques: 0, echecs: 0, exports: 0, securite: 0, replays: 0, retries: 0 };
  }
}

test('la pagination par curseur est stable et sans doublon avec des dates identiques', async () => {
  const date = '2026-08-11T10:00:00.000Z';
  const depot = new DepotMemoire([entree('audit-3', date), entree('audit-2', date), entree('audit-1', date)]);
  const service = new AuditSearchApplicationService(depot);
  const premiere = await service.rechercherAudits({ organisationId: 'org-a', ecoleId: 'ecole-a', taillePage: 2 });
  const suivante = await service.rechercherAudits({
    organisationId: 'org-a', ecoleId: 'ecole-a', taillePage: 2, cursor: premiere.nextCursor,
  });

  assert.deepEqual(premiere.items.map((item) => item.idAuditEntry), ['audit-3', 'audit-2']);
  assert.deepEqual(suivante.items.map((item) => item.idAuditEntry), ['audit-1']);
  assert.equal(new Set([...premiere.items, ...suivante.items].map((item) => item.idAuditEntry)).size, 3);
  assert.equal(suivante.hasNextPage, false);
});

test('un curseur ne peut pas etre reutilise dans un autre tenant ou filtre', async () => {
  const depot = new DepotMemoire([entree('audit-1', '2026-08-11T10:00:00.000Z')]);
  const codec = new AuditReadCursorCodec();
  const filtresA = { organisationId: 'org-a', scope: 'ORGANISATION' };
  const cursor = codec.encoder(
    { idAuditEntry: 'audit-1', dateAction: '2026-08-11T10:00:00.000Z' },
    codec.empreinte(filtresA),
  );

  await assert.rejects(
    new AuditSearchApplicationService(depot).rechercherAudits({ organisationId: 'org-b', cursor }),
    /curseur de pagination est invalide/,
  );
});

test('la taille demandee est bornee a cent elements sans COUNT global', async () => {
  const depot = new DepotMemoire([]);
  const resultat = await new AuditSearchApplicationService(depot).rechercherAudits({ taillePage: 500 });

  assert.equal(depot.appels[0]?.pagination.limite, 100);
  assert.equal(resultat.total, 0);
  assert.equal(resultat.hasNextPage, false);
});
