import test from 'node:test';
import assert from 'node:assert/strict';
import { SecurityCapacitesEffectivesService } from 'shared/security/application';
import { MoteurCapacitesEffectives } from 'shared/security/domain';
import { creerAffectationTitulariat, creerAffectationUtilisateur, creerRepositoriesMemoire, creerRole } from '../support/SecurityTestSupport';

test('ajoute les capacites titulariat a un enseignant responsable de classe primaire', async () => {
  const repositories = creerRepositoriesMemoire();
  const role = creerRole({
    codeRole: 'ENSEIGNANT',
    permissions: ['cotes.write', 'bulletins.read'],
  });

  await repositories.roleRepository.sauvegarder(role);
  await repositories.affectationRepository.sauvegarder(creerAffectationUtilisateur({
    idUtilisateur: 'enseignant-1',
    idRole: role.obtenirId(),
    idOrganisation: 'org-1',
    idEcole: 'ecole-1',
  }));

  const service = new SecurityCapacitesEffectivesService(
    repositories.roleRepository,
    repositories.affectationRepository,
    repositories.titulariatRepository,
    new MoteurCapacitesEffectives(),
    {
      consulterActiveParClasseEtAnnee: async () => ({
        idOrganisation: 'org-1',
        idEcole: 'ecole-1',
        idClassePedagogique: 'classe-1',
        idClasseAcademique: 'classe-acad-1',
        idSectionScolaire: 'section-primaire',
        sectionCode: 'PRIMAIRE',
        sectionLibelle: 'Primaire',
        idAnneeScolaire: 'annee-1',
        idUtilisateurEnseignant: 'enseignant-1',
        active: true,
      }),
    },
  );

  const resultat = await service.calculerPourUtilisateur({
    idUtilisateur: 'enseignant-1',
    idOrganisationActive: 'org-1',
    idEcoleActive: 'ecole-1',
    idClasse: 'classe-1',
    idAnneeScolaire: 'annee-1',
  });

  assert.equal(resultat.estTitulaireEffectif, true);
  assert.equal(resultat.sourceTitulariatEffectif, 'RESPONSABILITE_CLASSE');
  assert.ok(resultat.permissions.includes('cotes.write'));
  assert.ok(resultat.permissions.includes('bulletins.generate'));
  assert.ok(resultat.permissions.includes('proclamations.generate'));
});

test("refuse le titulariat effectif secondaire quand seule l'affectation explicite existe", async () => {
  const repositories = creerRepositoriesMemoire();
  const role = creerRole({
    codeRole: 'ENSEIGNANT',
    permissions: ['cotes.write', 'bulletins.read'],
  });

  await repositories.roleRepository.sauvegarder(role);
  await repositories.affectationRepository.sauvegarder(creerAffectationUtilisateur({
    idUtilisateur: 'enseignant-1',
    idRole: role.obtenirId(),
    idOrganisation: 'org-1',
    idEcole: 'ecole-1',
  }));
  await repositories.titulariatRepository.sauvegarder(creerAffectationTitulariat({
    idUtilisateur: 'enseignant-1',
    idOrganisation: 'org-1',
    idEcole: 'ecole-1',
    idClasse: 'classe-sec-1',
    idAnneeScolaire: 'annee-1',
  }));

  const service = new SecurityCapacitesEffectivesService(
    repositories.roleRepository,
    repositories.affectationRepository,
    repositories.titulariatRepository,
    new MoteurCapacitesEffectives(),
  );

  const resultat = await service.calculerPourUtilisateur({
    idUtilisateur: 'enseignant-1',
    idOrganisationActive: 'org-1',
    idEcoleActive: 'ecole-1',
    idClasse: 'classe-sec-1',
    idAnneeScolaire: 'annee-1',
  });

  assert.equal(resultat.estTitulaireEffectif, false);
  assert.equal(resultat.sourceTitulariatEffectif, 'AUCUNE');
  assert.equal(resultat.permissions.includes('bulletins.generate'), false);
  assert.equal(resultat.permissions.includes('proclamations.generate'), false);
});

test('accorde le titulariat effectif secondaire uniquement si responsabilite et titulariat explicite sont reunis', async () => {
  const repositories = creerRepositoriesMemoire();
  const role = creerRole({
    codeRole: 'ENSEIGNANT',
    permissions: ['cotes.write', 'bulletins.read'],
  });

  await repositories.roleRepository.sauvegarder(role);
  await repositories.affectationRepository.sauvegarder(creerAffectationUtilisateur({
    idUtilisateur: 'enseignant-1',
    idRole: role.obtenirId(),
    idOrganisation: 'org-1',
    idEcole: 'ecole-1',
  }));
  await repositories.titulariatRepository.sauvegarder(creerAffectationTitulariat({
    idUtilisateur: 'enseignant-1',
    idOrganisation: 'org-1',
    idEcole: 'ecole-1',
    idClasse: 'classe-sec-1',
    idAnneeScolaire: 'annee-1',
  }));

  const service = new SecurityCapacitesEffectivesService(
    repositories.roleRepository,
    repositories.affectationRepository,
    repositories.titulariatRepository,
    new MoteurCapacitesEffectives(),
    {
      consulterActiveParClasseEtAnnee: async () => ({
        idOrganisation: 'org-1',
        idEcole: 'ecole-1',
        idClassePedagogique: 'classe-sec-1',
        idClasseAcademique: 'classe-acad-sec-1',
        idSectionScolaire: 'section-secondaire',
        sectionCode: 'SECONDAIRE',
        sectionLibelle: 'Secondaire',
        idAnneeScolaire: 'annee-1',
        idUtilisateurEnseignant: 'enseignant-1',
        active: true,
      }),
    },
  );

  const resultat = await service.calculerPourUtilisateur({
    idUtilisateur: 'enseignant-1',
    idOrganisationActive: 'org-1',
    idEcoleActive: 'ecole-1',
    idClasse: 'classe-sec-1',
    idAnneeScolaire: 'annee-1',
  });

  assert.equal(resultat.estTitulaireEffectif, true);
  assert.equal(resultat.sourceTitulariatEffectif, 'AFFECTATION_TITULARIAT');
  assert.ok(resultat.permissions.includes('bulletins.generate'));
  assert.ok(resultat.permissions.includes('proclamations.generate'));
});
