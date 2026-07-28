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
      listerActivesParUtilisateur: async () => [{
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
      }],
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
      listerActivesParUtilisateur: async () => [{
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
      }],
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

test('projette les classes de titulariat effectif sans elever les permissions globales', async () => {
  const repositories = creerRepositoriesMemoire();
  const role = creerRole({
    codeRole: 'ENSEIGNANT',
    permissions: ['cotes.write', 'bulletins.read'],
  });
  await repositories.roleRepository.sauvegarder(role);
  await repositories.affectationRepository.sauvegarder(creerAffectationUtilisateur({
    idUtilisateur: 'enseignant-profil',
    idRole: role.obtenirId(),
    idOrganisation: 'org-1',
    idEcole: 'ecole-1',
  }));

  const responsabilite = {
    idOrganisation: 'org-1',
    idEcole: 'ecole-1',
    idClassePedagogique: 'classe-primaire',
    idClasseAcademique: 'classe-acad-primaire',
    idSectionScolaire: 'section-primaire',
    sectionCode: 'PRIMAIRE',
    sectionLibelle: 'Primaire',
    idAnneeScolaire: 'annee-1',
    idUtilisateurEnseignant: 'enseignant-profil',
    active: true,
  } as const;
  const service = new SecurityCapacitesEffectivesService(
    repositories.roleRepository,
    repositories.affectationRepository,
    repositories.titulariatRepository,
    new MoteurCapacitesEffectives(),
    {
      consulterActiveParClasseEtAnnee: async () => responsabilite,
      listerActivesParUtilisateur: async () => [responsabilite],
    },
  );

  const resultat = await service.calculerPourUtilisateur({
    idUtilisateur: 'enseignant-profil',
    idOrganisationActive: 'org-1',
    idEcoleActive: 'ecole-1',
    acteurCodePrefere: 'ENSEIGNANT',
  });

  assert.equal(resultat.estTitulaireEffectif, true);
  assert.deepEqual(resultat.titulariatsEffectifs, [{
    idOrganisation: 'org-1',
    idEcole: 'ecole-1',
    idClasse: 'classe-primaire',
    idAnneeScolaire: 'annee-1',
    idSectionScolaire: 'section-primaire',
    source: 'RESPONSABILITE_CLASSE',
  }]);
  assert.equal(resultat.permissions.includes('bulletins.generate'), false);
  assert.equal(resultat.permissions.includes('proclamations.generate'), false);
});

test('ne projette pas un titulariat secondaire sans responsabilite et affectation concordantes', async () => {
  const repositories = creerRepositoriesMemoire();
  const role = creerRole({
    codeRole: 'ENSEIGNANT',
    permissions: ['bulletins.read'],
  });
  await repositories.roleRepository.sauvegarder(role);
  await repositories.affectationRepository.sauvegarder(creerAffectationUtilisateur({
    idUtilisateur: 'enseignant-secondaire',
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
      consulterActiveParClasseEtAnnee: async () => null,
      listerActivesParUtilisateur: async () => [{
        idOrganisation: 'org-1',
        idEcole: 'ecole-1',
        idClassePedagogique: 'classe-secondaire',
        idClasseAcademique: 'classe-acad-secondaire',
        idSectionScolaire: 'section-secondaire',
        sectionCode: 'SECONDAIRE',
        sectionLibelle: 'Secondaire',
        idAnneeScolaire: 'annee-1',
        idUtilisateurEnseignant: 'enseignant-secondaire',
        active: true,
      }],
    },
  );

  const resultat = await service.calculerPourUtilisateur({
    idUtilisateur: 'enseignant-secondaire',
    idOrganisationActive: 'org-1',
    idEcoleActive: 'ecole-1',
  });

  assert.equal(resultat.estTitulaireEffectif, false);
  assert.deepEqual(resultat.titulariatsEffectifs, []);
});

test("isole les permissions de l'acteur actif lorsque plusieurs roles couvrent le meme contexte", async () => {
  const repositories = creerRepositoriesMemoire();
  const caissier = creerRole({
    codeRole: 'CAISSIER',
    permissions: ['paiements.read'],
  });
  const enseignant = creerRole({
    codeRole: 'ENSEIGNANT',
    permissions: ['cotes.read'],
  });
  await repositories.roleRepository.sauvegarder(caissier);
  await repositories.roleRepository.sauvegarder(enseignant);
  await repositories.affectationRepository.sauvegarder(creerAffectationUtilisateur({
    idUtilisateur: 'multi-role-1',
    idRole: caissier.obtenirId(),
    idOrganisation: 'org-1',
    idEcole: 'ecole-1',
  }));
  await repositories.affectationRepository.sauvegarder(creerAffectationUtilisateur({
    idUtilisateur: 'multi-role-1',
    idRole: enseignant.obtenirId(),
    idOrganisation: 'org-1',
    idEcole: 'ecole-1',
  }));

  const service = new SecurityCapacitesEffectivesService(
    repositories.roleRepository,
    repositories.affectationRepository,
    repositories.titulariatRepository,
    new MoteurCapacitesEffectives(),
  );
  const resultat = await service.calculerPourUtilisateur({
    idUtilisateur: 'multi-role-1',
    idOrganisationActive: 'org-1',
    idEcoleActive: 'ecole-1',
    acteurCodePrefere: 'CAISSIER',
  });

  assert.deepEqual(new Set(resultat.actorCodes), new Set(['CAISSIER', 'ENSEIGNANT']));
  assert.equal(resultat.acteurCodeActif, 'CAISSIER');
  assert.deepEqual(resultat.permissions, ['paiements.read']);
});

test("refuse de choisir implicitement un acteur lorsqu'un utilisateur a plusieurs roles", async () => {
  const repositories = creerRepositoriesMemoire();
  const caissier = creerRole({
    codeRole: 'CAISSIER',
    permissions: ['paiements.read'],
  });
  const enseignant = creerRole({
    codeRole: 'ENSEIGNANT',
    permissions: ['cotes.read'],
  });
  await repositories.roleRepository.sauvegarder(caissier);
  await repositories.roleRepository.sauvegarder(enseignant);
  for (const role of [caissier, enseignant]) {
    await repositories.affectationRepository.sauvegarder(creerAffectationUtilisateur({
      idUtilisateur: 'multi-role-sans-acteur',
      idRole: role.obtenirId(),
      idOrganisation: 'org-1',
      idEcole: 'ecole-1',
    }));
  }

  const service = new SecurityCapacitesEffectivesService(
    repositories.roleRepository,
    repositories.affectationRepository,
    repositories.titulariatRepository,
    new MoteurCapacitesEffectives(),
  );
  const resultat = await service.calculerPourUtilisateur({
    idUtilisateur: 'multi-role-sans-acteur',
    idOrganisationActive: 'org-1',
    idEcoleActive: 'ecole-1',
  });

  assert.equal(resultat.acteurCodeActif, undefined);
  assert.deepEqual(resultat.permissions, []);
  assert.deepEqual(resultat.scopes, []);
});

test("refuse un acteur prefere qui ne couvre pas le contexte actif", async () => {
  const repositories = creerRepositoriesMemoire();
  const caissier = creerRole({
    codeRole: 'CAISSIER',
    permissions: ['paiements.read'],
  });
  await repositories.roleRepository.sauvegarder(caissier);
  await repositories.affectationRepository.sauvegarder(creerAffectationUtilisateur({
    idUtilisateur: 'acteur-invalide',
    idRole: caissier.obtenirId(),
    idOrganisation: 'org-1',
    idEcole: 'ecole-1',
  }));

  const service = new SecurityCapacitesEffectivesService(
    repositories.roleRepository,
    repositories.affectationRepository,
    repositories.titulariatRepository,
    new MoteurCapacitesEffectives(),
  );
  const resultat = await service.calculerPourUtilisateur({
    idUtilisateur: 'acteur-invalide',
    idOrganisationActive: 'org-1',
    idEcoleActive: 'ecole-1',
    acteurCodePrefere: 'MANAGER_SYSTEME',
  });

  assert.equal(resultat.acteurCodeActif, undefined);
  assert.deepEqual(resultat.permissions, []);
});

test("projette uniquement les eleves autorises du parent dans l'ecole active", async () => {
  const repositories = creerRepositoriesMemoire();
  const parent = creerRole({
    codeRole: 'PARENT',
    permissions: ['paiements.read', 'bulletins.read'],
  });
  await repositories.roleRepository.sauvegarder(parent);
  await repositories.affectationRepository.sauvegarder(creerAffectationUtilisateur({
    idUtilisateur: 'parent-1',
    idRole: parent.obtenirId(),
    idOrganisation: 'org-1',
    idEcole: 'ecole-1',
  }));

  const service = new SecurityCapacitesEffectivesService(
    repositories.roleRepository,
    repositories.affectationRepository,
    repositories.titulariatRepository,
    new MoteurCapacitesEffectives(),
    undefined,
    {
      listerElevesAutorises: async (params) => {
        assert.deepEqual(params, {
          idUtilisateur: 'parent-1',
          idEcole: 'ecole-1',
        });
        return ['eleve-1', 'eleve-2'];
      },
    },
  );
  const resultat = await service.calculerPourUtilisateur({
    idUtilisateur: 'parent-1',
    idOrganisationActive: 'org-1',
    idEcoleActive: 'ecole-1',
    acteurCodePrefere: 'PARENT',
  });

  assert.deepEqual(resultat.elevesAutorises, ['eleve-1', 'eleve-2']);
});

test("n'assemble jamais une permission d'une autre ecole avec le scope courant", async () => {
  const repositories = creerRepositoriesMemoire();
  const caissier = creerRole({
    codeRole: 'CAISSIER',
    permissions: ['paiements.read'],
  });
  const enseignant = creerRole({
    codeRole: 'ENSEIGNANT',
    permissions: ['cotes.read'],
  });
  await repositories.roleRepository.sauvegarder(caissier);
  await repositories.roleRepository.sauvegarder(enseignant);
  await repositories.affectationRepository.sauvegarder(creerAffectationUtilisateur({
    idUtilisateur: 'multi-tenant-1',
    idRole: caissier.obtenirId(),
    idOrganisation: 'org-a',
    idEcole: 'ecole-a',
  }));
  await repositories.affectationRepository.sauvegarder(creerAffectationUtilisateur({
    idUtilisateur: 'multi-tenant-1',
    idRole: enseignant.obtenirId(),
    idOrganisation: 'org-b',
    idEcole: 'ecole-b',
  }));

  const service = new SecurityCapacitesEffectivesService(
    repositories.roleRepository,
    repositories.affectationRepository,
    repositories.titulariatRepository,
    new MoteurCapacitesEffectives(),
  );
  const resultat = await service.calculerPourUtilisateur({
    idUtilisateur: 'multi-tenant-1',
    idOrganisationActive: 'org-a',
    idEcoleActive: 'ecole-a',
    acteurCodePrefere: 'CAISSIER',
  });

  assert.deepEqual(resultat.actorCodes, ['CAISSIER']);
  assert.deepEqual(resultat.permissions, ['paiements.read']);
  assert.equal(
    resultat.scopes.some((scope) => scope.valeurScope === 'ecole-b'),
    false,
  );
});
