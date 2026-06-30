import assert from 'node:assert/strict';
import test from 'node:test';
import { AutorisationGenerationBulletinAdapter } from '../../../app/adapters/AutorisationGenerationBulletinAdapter';
import { AutorisationGenerationProclamationAdapter } from '../../../app/adapters/AutorisationGenerationProclamationAdapter';
import { AutorisationGenerationSyntheseAdapter } from '../../../app/adapters/AutorisationGenerationSyntheseAdapter';

function creerDependancesGeneration() {
  return {
    securityFacade: {
      async verifierAcces() {
        return { autorise: true } as never;
      },
    },
    securityCapacitesEffectivesService: {
      async calculerPourUtilisateur(params: { idUtilisateur: string }) {
        if (params.idUtilisateur === 'titulaire-1') {
          return {
            permissions: ['bulletins.generate', 'proclamations.generate'],
            restrictions: [],
            estTitulaireEffectif: true,
            titulariatsActifs: [],
            sourceTitulariatEffectif: 'AFFECTATION_TITULARIAT',
          } as never;
        }

        return {
          permissions: ['bulletins.generate', 'proclamations.generate'],
          restrictions: [],
          estTitulaireEffectif: false,
          titulariatsActifs: [],
          sourceTitulariatEffectif: 'AFFECTATION_TITULARIAT',
        } as never;
      },
    },
  };
}

test('SECURITY reserve les generations pedagogiques locales au titulaire effectif', async () => {
  const dependances = creerDependancesGeneration();
  const autorisationBulletin = new AutorisationGenerationBulletinAdapter(dependances);
  const autorisationProclamation = new AutorisationGenerationProclamationAdapter(dependances);
  const autorisationSynthese = new AutorisationGenerationSyntheseAdapter(dependances);

  await assert.doesNotReject(() => autorisationBulletin.verifierGenerationBulletin({
    idUtilisateur: 'titulaire-1',
    idOrganisation: 'org-1',
    idEcole: 'ecole-1',
    idClassePedagogique: 'classe-1',
    idAnneeScolaire: 'annee-1',
  }));

  await assert.doesNotReject(() => autorisationProclamation.verifierGenerationProclamation({
    idUtilisateur: 'titulaire-1',
    idOrganisation: 'org-1',
    idEcole: 'ecole-1',
    idClassePedagogique: 'classe-1',
    idAnneeScolaire: 'annee-1',
  }));

  await assert.doesNotReject(() => autorisationSynthese.verifierGenerationSynthese({
    idUtilisateur: 'titulaire-1',
    idOrganisation: 'org-1',
    idEcole: 'ecole-1',
    idAnneeScolaire: 'annee-1',
    idClassesPedagogiques: ['classe-1'],
  }));

  await autorisationBulletin.fermer();
  await autorisationProclamation.fermer();
  await autorisationSynthese.fermer();
});

test('SECURITY refuse un administrateur ecole sans titulariat effectif sur les generations pedagogiques locales', async () => {
  const dependances = creerDependancesGeneration();
  const autorisationBulletin = new AutorisationGenerationBulletinAdapter(dependances);
  const autorisationProclamation = new AutorisationGenerationProclamationAdapter(dependances);
  const autorisationSynthese = new AutorisationGenerationSyntheseAdapter(dependances);

  await assert.rejects(
    () => autorisationBulletin.verifierGenerationBulletin({
      idUtilisateur: 'admin-ecole-1',
      idOrganisation: 'org-1',
      idEcole: 'ecole-1',
      idClassePedagogique: 'classe-1',
      idAnneeScolaire: 'annee-1',
    }),
    /pas autorise/i,
  );

  await assert.rejects(
    () => autorisationProclamation.verifierGenerationProclamation({
      idUtilisateur: 'admin-ecole-1',
      idOrganisation: 'org-1',
      idEcole: 'ecole-1',
      idClassePedagogique: 'classe-1',
      idAnneeScolaire: 'annee-1',
    }),
    /pas autorise/i,
  );

  await assert.rejects(
    () => autorisationSynthese.verifierGenerationSynthese({
      idUtilisateur: 'admin-ecole-1',
      idOrganisation: 'org-1',
      idEcole: 'ecole-1',
      idAnneeScolaire: 'annee-1',
      idClassesPedagogiques: ['classe-1'],
    }),
    /pas autorise/i,
  );

  await autorisationBulletin.fermer();
  await autorisationProclamation.fermer();
  await autorisationSynthese.fermer();
});
