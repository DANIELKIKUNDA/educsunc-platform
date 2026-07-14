import test from 'node:test';
import assert from 'node:assert/strict';
import { ControleurEcoles } from '../interfaces/http/controllers/ControleurEcoles';

test('la consultation ecole enrichit les auteurs techniques avec leurs noms humains', async () => {
  const ecole = {
    id: 'ecole-1',
    idOrganisation: 'org-1',
    code: 'ECO-1',
    nom: 'Ecole Exemple',
    modeExploitation: 'SYNC',
    actif: true,
    creeLe: '2026-07-14T08:00:00.000Z',
    version: 2,
    creePar: 'user-createur',
    modifieLe: '2026-07-14T09:00:00.000Z',
    modifiePar: 'user-modificateur',
  };
  const casUsageInutilise = { async executer() { return { ecole }; } };
  const controleur = new ControleurEcoles(
    casUsageInutilise as never,
    { async executer() { return { ecole }; } } as never,
    casUsageInutilise as never,
    casUsageInutilise as never,
    casUsageInutilise as never,
    casUsageInutilise as never,
    casUsageInutilise as never,
    casUsageInutilise as never,
    casUsageInutilise as never,
    {
      async verifierLectureSocleAcademique() {},
      async verifierMutationSocleAcademique() {},
    } as never,
    async (idUtilisateur) => ({
      'user-createur': 'Nadia Ilunga',
      'user-modificateur': 'Daniel Ngwej',
    })[idUtilisateur],
  );

  const resultat = await controleur.consulterEcole(
    { id: 'ecole-1' },
    { utilisateurId: 'manager-1', roleActif: 'MANAGER_SYSTEME' } as never,
  );

  assert.equal(resultat.donnee.creePar, 'user-createur');
  assert.equal(resultat.donnee.creeParNom, 'Nadia Ilunga');
  assert.equal(resultat.donnee.modifiePar, 'user-modificateur');
  assert.equal(resultat.donnee.modifieParNom, 'Daniel Ngwej');
});
