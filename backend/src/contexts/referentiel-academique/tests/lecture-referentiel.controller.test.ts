import test from 'node:test';
import assert from 'node:assert/strict';
import type { RequestContext } from 'shared/context';
import { ControleurReferentielsAcademiques } from '../interfaces/http/controllers/ControleurReferentielsAcademiques';

test('le controleur de lecture referentiel reapplique la securite locale avant les lectures officielles', async () => {
  const appels: string[] = [];

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
    { executer: async () => ({ differences: [] }) } as never,
    {
      async executer() {
        appels.push('consulter');
        return { referentielProgramme: {} };
      },
    } as never,
    {
      async executer() {
        appels.push('lister-programmes');
        return { referentielsProgrammes: [], total: 0, page: 1, taillePage: 20 };
      },
    } as never,
    {
      async executer() {
        appels.push('lister-cours');
        return { referentielsCours: [], total: 0, page: 1, taillePage: 20 };
      },
    } as never,
    { async verifierMutationImportReferentiel() {} } as never,
    { async verifierMutationPublicationReferentiel() {} } as never,
    { async verifierMutationActivationReferentiel() {} } as never,
    { async verifierLectureComparaisonReferentiel() {} } as never,
    {
      async verifierLectureReferentiel() {
        appels.push('security');
      },
    } as never,
  );

  const contexte = {
    utilisateurId: 'user-manager',
    roleActif: 'MANAGER_SYSTEME',
  } as RequestContext;

  await controleur.listerReferentielsProgrammes(
    { idClasseAcademique: 'classe-1', page: 1, taillePage: 20 },
    contexte,
  );
  await controleur.listerReferentielsCours(
    { page: 1, taillePage: 20 },
    contexte,
  );
  await controleur.consulterReferentielProgramme(
    { id: 'programme-1' },
    contexte,
  );

  assert.deepEqual(appels, [
    'security',
    'lister-programmes',
    'security',
    'lister-cours',
    'security',
    'consulter',
  ]);
});
