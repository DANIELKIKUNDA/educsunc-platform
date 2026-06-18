import test from 'node:test';
import assert from 'node:assert/strict';
import type { RequestContext } from 'shared/context';
import { ControleurReferentielsAcademiques } from '../interfaces/http/controllers/ControleurReferentielsAcademiques';

test('le controleur d import referentiel impose importePar depuis le contexte authentifie', async () => {
  const entreesRecues: Array<{ importePar: string; sections: unknown[] }> = [];

  const controleur = new ControleurReferentielsAcademiques(
    {
      async importerSectionsDepuisJson(entree: { importePar: string; sections: unknown[] }) {
        entreesRecues.push(entree);
        return { sectionsImportees: entree.sections.length };
      },
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
  );

  await controleur.importerSectionsDepuisJson(
    {
      sections: [
        { code: 'SEC', libelle: 'Secondaire', ordreAffichage: 1 },
      ],
      importePar: 'valeur-libre-ignoree',
    },
    {
      utilisateurId: 'user-manager',
      roleActif: 'MANAGER_SYSTEME',
    } as RequestContext,
  );

  assert.equal(entreesRecues.length, 1);
  assert.equal(entreesRecues[0].importePar, 'user-manager');
});
