import assert from 'node:assert/strict';
import test from 'node:test';
import { RequestContextFactory } from 'shared/context';
import { AuditController } from '../../interfaces/http/controllers/AuditController';
import {
  enrichirTenant,
  extraireContexteRuntime,
} from '../../interfaces/http/controllers/AuditControllerSupport';
import { AuditExportsController } from '../../interfaces/http/controllers/AuditExportsController';
import type {
  AuditControllerRuntimeContext,
  AuditExecutable,
} from '../../interfaces/http/controllers/HttpAuditControllerTypes';

function creerContexte(params: {
  organisationId?: string;
  ecoleId?: string;
  permissions?: string[];
}) {
  const initial = RequestContextFactory.creerContexteInitial({ requestId: 'request-l1' });
  const authentifie = RequestContextFactory.enrichirAuth(initial, {
    utilisateurId: 'utilisateur-l1',
    sessionId: 'session-l1',
    roleActif: 'MANAGER_SYSTEME',
    organisationActiveId: params.organisationId,
    ecoleActiveId: params.ecoleId,
    modeOffline: false,
  });
  return RequestContextFactory.enrichirSecurity(authentifie, {
    permissions: params.permissions ?? ['audit.read'],
  });
}

function contexteRuntime(
  authorizedScope: AuditControllerRuntimeContext['authorizedScope'],
  organisationId?: string,
  ecoleId?: string,
): AuditControllerRuntimeContext {
  return {
    requestId: 'request-l1',
    organisationId,
    ecoleId,
    scope: authorizedScope,
    authorizedScope,
    modeOffline: false,
    utilisateurId: 'utilisateur-l1',
  };
}

function capturer<TInput>(
  captures: TInput[],
  sortie: unknown = { items: [], total: 0, page: 1, taillePage: 25, totalPages: 0 },
): AuditExecutable<TInput, unknown> {
  return {
    executer: async (input) => {
      captures.push(input);
      return sortie;
    },
  };
}

test('le contexte authentifie ignore les en-tetes tenant forges', () => {
  const contexte = extraireContexteRuntime({
    context: creerContexte({}),
    headers: {
      'x-organisation-id': 'organisation-devinee',
      'x-ecole-id': 'ecole-devinee',
    },
    authorizedScope: 'PLATEFORME',
  });

  assert.equal(contexte.organisationId, undefined);
  assert.equal(contexte.ecoleId, undefined);
  assert.equal(contexte.authorizedScope, 'PLATEFORME');
});

test('une lecture plateforme reste globale malgre un ancien contexte tenant de session', () => {
  const resultat = enrichirTenant(
    { organisationId: 'organisation-b', ecoleId: 'ecole-b' },
    contexteRuntime('PLATEFORME', 'organisation-a', 'ecole-a'),
  );

  assert.equal(resultat.organisationId, 'organisation-b');
  assert.equal(resultat.ecoleId, 'ecole-b');
});

test('un filtre organisation forge ne remplace jamais l organisation de session', () => {
  const resultat = enrichirTenant(
    { organisationId: 'organisation-b', ecoleId: 'ecole-b' },
    contexteRuntime('ORGANISATION', 'organisation-a'),
  );

  assert.equal(resultat.organisationId, 'organisation-a');
  assert.equal(resultat.ecoleId, 'ecole-b');
});

test('un filtre ecole forge ne remplace jamais l ecole de session', () => {
  const resultat = enrichirTenant(
    { organisationId: 'organisation-b', ecoleId: 'ecole-b' },
    contexteRuntime('ECOLE', 'organisation-a', 'ecole-a'),
  );

  assert.equal(resultat.organisationId, 'organisation-a');
  assert.equal(resultat.ecoleId, 'ecole-a');
});

test('les recherches et identifiants modifies restent bornes au tenant autorise', async () => {
  const captures: Array<Record<string, unknown>> = [];
  const liste = capturer<Record<string, unknown>>(captures);
  const detail = capturer<Record<string, unknown>>(captures, {
    idAuditEntry: 'audit-devine',
    action: 'LECTURE',
    typePrincipal: 'AUDIT',
    typeAuditPrincipal: 'AUDIT',
    categories: [],
    gravite: 'INFO',
    resultat: 'SUCCES',
    acteur: {},
    tenant: {},
    contexte: { sourceAudit: 'TEST', modeOffline: false },
    createdAt: new Date(0).toISOString(),
    dateAction: new Date(0).toISOString(),
  });
  const controller = new AuditController(
    liste as never,
    detail as never,
    liste as never,
    liste as never,
    liste as never,
  );
  const context = creerContexte({ organisationId: 'organisation-a', ecoleId: 'ecole-a' });

  await controller.lister({
    query: {
      organisationId: 'organisation-b',
      ecoleId: 'ecole-b',
      acteurId: 'utilisateur-devine',
    },
    context,
    authorizedScope: 'ECOLE',
  });
  await controller.consulterParId({
    params: { id: 'audit-devine' },
    query: { organisationId: 'organisation-b', ecoleId: 'ecole-b' },
    context,
    authorizedScope: 'ECOLE',
  });

  assert.deepEqual(
    captures.map(({ organisationId, ecoleId }) => ({ organisationId, ecoleId })),
    [
      { organisationId: 'organisation-a', ecoleId: 'ecole-a' },
      { organisationId: 'organisation-a', ecoleId: 'ecole-a' },
    ],
  );
  assert.equal(captures[0]?.acteurId, 'utilisateur-devine');
  assert.equal(captures[1]?.idAuditEntry, 'audit-devine');
});

test('les filtres d export sont remplaces par le perimetre ecole authentifie', async () => {
  const captures: Array<Record<string, unknown>> = [];
  const exporteur = capturer<Record<string, unknown>>(captures);
  const controller = new AuditExportsController(
    exporteur as never,
    exporteur as never,
    exporteur as never,
    exporteur as never,
  );

  await controller.exporterAudit({
    body: {
      format: 'JSON',
      filtres: {
        organisationId: 'organisation-b',
        ecoleId: 'ecole-b',
        acteurId: 'utilisateur-devine',
      },
    },
    context: creerContexte({ organisationId: 'organisation-a', ecoleId: 'ecole-a' }),
    authorizedScope: 'ECOLE',
  });

  const filtres = captures[0]?.filtres as Record<string, unknown>;
  assert.equal(filtres.organisationId, 'organisation-a');
  assert.equal(filtres.ecoleId, 'ecole-a');
  assert.equal(filtres.acteurId, 'utilisateur-devine');
});

test('le statut d un export devine est toujours relu avec le tenant authentifie', async () => {
  const captures: Array<Record<string, unknown>> = [];
  const exporteur = capturer<Record<string, unknown>>(captures);
  let perimetreRecu: Record<string, unknown> | undefined;
  const controller = new AuditExportsController(
    exporteur as never,
    exporteur as never,
    exporteur as never,
    exporteur as never,
    async (exportId, contexte) => {
      perimetreRecu = {
        exportId,
        organisationId: contexte.organisationId,
        ecoleId: contexte.ecoleId,
        authorizedScope: contexte.authorizedScope,
      };
      return { statut: 'INCONNU' };
    },
  );

  await controller.obtenirStatut({
    params: { id: 'export-devine' },
    context: creerContexte({ organisationId: 'organisation-a', ecoleId: 'ecole-a' }),
    authorizedScope: 'ECOLE',
  });

  assert.deepEqual(perimetreRecu, {
    exportId: 'export-devine',
    organisationId: 'organisation-a',
    ecoleId: 'ecole-a',
    authorizedScope: 'ECOLE',
  });
});
