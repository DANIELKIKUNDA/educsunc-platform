import test from 'node:test';
import assert from 'node:assert/strict';
import type { RequestContext } from 'shared/context';
import { ControleurReferentielsAcademiques } from '../interfaces/http/controllers/ControleurReferentielsAcademiques';

test('le controleur de creation de version de travail impose creePar depuis le contexte authentifie', async () => {
  const entreesRecues: Array<{ creePar: string; idVersionSource: string }> = [];

  const controleur = new ControleurReferentielsAcademiques(
    {
      async importerSectionsDepuisJson() { return { sectionsImportees: 0 }; },
      async importerOptionsDepuisJson() { return { optionsImportees: 0 }; },
      async importerClassesAcademiquesDepuisJson() { return { classesAcademiquesImportees: 0 }; },
      async importerCoursAcademiquesDepuisJson() { return { coursImportes: 0 }; },
      async importerProgrammesAcademiquesDepuisJson() { return { programmesImportes: 0 }; },
      async importerLignesProgrammeDepuisJson() { return { lignesImportees: 0 }; },
    } as never,
    { executer: async () => ({ versionReferentielProgramme: {} }) } as never,
    { executer: async () => ({ versionReferentielProgramme: {} }) } as never,
    { executer: async () => ({}) } as never,
    { executer: async () => ({ referentielProgramme: {} }) } as never,
    { executer: async () => ({ referentielsProgrammes: [], total: 0, page: 1, taillePage: 20 }) } as never,
    { executer: async () => ({ referentielsCours: [], total: 0, page: 1, taillePage: 20 }) } as never,
    {
      async verifierMutationImportReferentiel() {},
    } as never,
    {
      async verifierMutationPublicationReferentiel() {},
    } as never,
    {
      async verifierMutationActivationReferentiel() {},
    } as never,
    undefined as never,
    undefined as never,
    {
      async executer(entree: { creePar: string; idVersionSource: string }) {
        entreesRecues.push(entree);
        return { versionReferentielProgramme: {} };
      },
    } as never,
  );

  await controleur.creerVersionTravailReferentielDepuisVersion(
    { id: 'ref-1' },
    {
      idVersionSource: 'version-source-1',
      codeVersion: '2026-V2-WIP',
      anneeReference: '2026',
      datePublication: '2026-07-10T00:00:00.000Z',
      creePar: 'valeur-ignoree',
    },
    {
      utilisateurId: 'user-manager',
      roleActif: 'MANAGER_SYSTEME',
    } as RequestContext,
  );

  assert.equal(entreesRecues.length, 1);
  assert.equal(entreesRecues[0].creePar, 'user-manager');
  assert.equal(entreesRecues[0].idVersionSource, 'version-source-1');
});
