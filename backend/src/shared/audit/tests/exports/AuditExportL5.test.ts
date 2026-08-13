import assert from 'node:assert/strict';
import { mkdtemp, readFile, rm } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import test from 'node:test';
import type { AuditEntryOutput } from '../../application/dto/outputs/AuditEntryOutput';
import type { AuditReadRepositoryPort } from '../../application/ports/outbound/AuditReadRepositoryPort';
import { AuditExportFileGenerator } from '../../infrastructure/exports/industrialized/AuditExportFileGenerator';
import { AuditExportWorker } from '../../infrastructure/exports/industrialized/AuditExportWorker';
import { PrivateAuditExportFileStore } from '../../infrastructure/exports/industrialized/PrivateAuditExportFileStore';
import type { AuditExportJob } from '../../infrastructure/exports/industrialized/PostgresAuditExportJobStore';

function entree(id: string, action: string): AuditEntryOutput {
  return {
    idAuditEntry: id, action, typePrincipal: 'SECURITE', typeAuditPrincipal: 'SECURITE',
    categories: ['SECURITE'], gravite: 'INFO', resultat: 'SUCCES',
    acteur: { idUtilisateur: 'acteur-a', roleActif: 'MANAGER_SYSTEME' },
    ressource: { typeRessource: 'TEST', libelle: 'Ressource' },
    tenant: { organisationId: 'org-a', ecoleId: 'ecole-a', scope: 'ECOLE' },
    contexte: { sourceAudit: 'TEST', modeOffline: false, correlationId: 'corr-a' },
    organisationId: 'org-a', ecoleId: 'ecole-a', correlationId: 'corr-a',
    createdAt: '2026-01-01T00:00:00.000Z', dateAction: `2026-01-01T00:00:0${id}.000Z`,
  };
}

test('exporte le CSV par lots et neutralise les formules tableur', async () => {
  const racine = await mkdtemp(join(tmpdir(), 'educsyn-audit-export-'));
  const appels: Array<{ organisationId?: string; ecoleId?: string }> = [];
  const lectures: AuditReadRepositoryPort = {
    async rechercher(filtres, page) {
      appels.push({ organisationId: filtres.organisationId, ecoleId: filtres.ecoleId });
      if (!page.position) return { items: [entree('1', '=DANGEREUX')], hasNextPage: true };
      return { items: [entree('2', 'LECTURE')], hasNextPage: false };
    },
    async obtenirParId() { return null; },
    async compter() { return { total: 0, critiques: 0, echecs: 0, exports: 0, securite: 0, replays: 0, retries: 0 }; },
  };
  try {
    const sortie = await new AuditExportFileGenerator(lectures, new PrivateAuditExportFileStore(racine)).generer({
      idExport: '00000000-0000-0000-0000-000000000001', requesterId: 'acteur-a', scope: 'ECOLE',
      organisationId: 'org-a', ecoleId: 'ecole-a', format: 'CSV', statut: 'PROCESSING', filtres: {},
      nombreElements: 0, expireLe: '2026-12-01T00:00:00.000Z', demandeLe: '2026-01-01T00:00:00.000Z',
      tentativeCount: 1,
    });
    const contenu = await readFile(join(racine, sortie.fileKey), 'utf8');
    assert.equal(sortie.nombreElements, 2);
    assert.equal(appels.length, 2);
    assert.deepEqual(appels[0], { organisationId: 'org-a', ecoleId: 'ecole-a' });
    assert.match(contenu, /"'=DANGEREUX"/);
    assert.equal(sortie.checksum.length, 64);
  } finally {
    await rm(racine, { recursive: true, force: true });
  }
});

test('le stockage prive refuse tout chemin manipulable', async () => {
  const racine = await mkdtemp(join(tmpdir(), 'educsyn-audit-path-'));
  try {
    await assert.rejects(() => new PrivateAuditExportFileStore(racine).ouvrirLecture('../../secret.txt'), /invalide/);
  } finally {
    await rm(racine, { recursive: true, force: true });
  }
});

test('genere un JSON versionne et un vrai PDF', async () => {
  const racine = await mkdtemp(join(tmpdir(), 'educsyn-audit-formats-'));
  const lectures: AuditReadRepositoryPort = {
    async rechercher() { return { items: [entree('3', 'LECTURE')], hasNextPage: false }; },
    async obtenirParId() { return null; },
    async compter() { return { total: 1, critiques: 0, echecs: 0, exports: 0, securite: 1, replays: 0, retries: 0 }; },
  };
  const base: Omit<AuditExportJob, 'format' | 'idExport'> = {
    requesterId: 'acteur-a', scope: 'ECOLE', organisationId: 'org-a', ecoleId: 'ecole-a',
    statut: 'PROCESSING', filtres: {}, nombreElements: 0, tentativeCount: 1,
    expireLe: '2026-12-01T00:00:00.000Z', demandeLe: '2026-01-01T00:00:00.000Z',
  };
  try {
    const generateur = new AuditExportFileGenerator(lectures, new PrivateAuditExportFileStore(racine));
    const json = await generateur.generer({ ...base, idExport: '00000000-0000-0000-0000-000000000002', format: 'JSON' });
    const pdf = await generateur.generer({ ...base, idExport: '00000000-0000-0000-0000-000000000003', format: 'PDF' });
    const contenuJson = JSON.parse(await readFile(join(racine, json.fileKey), 'utf8')) as { version: number; nombreElements: number };
    const contenuPdf = await readFile(join(racine, pdf.fileKey));
    assert.deepEqual(contenuJson, { ...contenuJson, version: 1, nombreElements: 1 });
    assert.equal(contenuPdf.subarray(0, 4).toString(), '%PDF');
    assert.equal(pdf.nombreElements, 1);
  } finally {
    await rm(racine, { recursive: true, force: true });
  }
});

test('le worker attend le traitement actif lors de son arret gracieux', async () => {
  let terminerGeneration: (() => void) | undefined;
  let termine = false;
  const travail = {
    idExport: '00000000-0000-0000-0000-000000000004', requesterId: 'acteur-a', scope: 'PLATEFORME' as const,
    format: 'CSV' as const, statut: 'PROCESSING' as const, filtres: {}, nombreElements: 0,
    expireLe: '2026-12-01T00:00:00.000Z', demandeLe: '2026-01-01T00:00:00.000Z', tentativeCount: 1,
  };
  let reclame = false;
  const travaux = {
    async reprendreTravauxInterrompus() {},
    async reclamerSuivant() { if (reclame) return null; reclame = true; return travail; },
    async terminer() { termine = true; },
    async reessayer() {},
    async echouer() {},
  };
  const generateur = {
    async generer() {
      await new Promise<void>((resolve) => {
        terminerGeneration = resolve;
      });
      return { fileKey: 'export.csv', fileName: 'export.csv', mimeType: 'text/csv', tailleOctets: 1, nombreElements: 1, checksum: 'a'.repeat(64) };
    },
  };
  const worker = new AuditExportWorker(travaux as never, generateur as never, 60_000);
  await worker.start();
  await new Promise<void>((resolve) => {
    setImmediate(resolve);
  });
  const arret = worker.stop();
  assert.equal(termine, false);
  terminerGeneration?.();
  await arret;
  assert.equal(termine, true);
});
