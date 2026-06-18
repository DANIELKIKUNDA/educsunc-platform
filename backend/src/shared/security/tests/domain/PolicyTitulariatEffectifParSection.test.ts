import test from 'node:test';
import assert from 'node:assert/strict';
import { PolicyTitulariatEffectifParSection } from 'shared/security/domain';

test('active le titulariat effectif pour une responsabilite primaire coherente', () => {
  const resultat = PolicyTitulariatEffectifParSection.estTitulariatEffectif({
    responsabiliteClassePedagogique: {
      idOrganisation: 'org-1',
      idEcole: 'ecole-1',
      idClassePedagogique: 'classe-1',
      idAnneeScolaire: 'annee-1',
      idUtilisateurEnseignant: 'enseignant-1',
      sectionCode: 'PRIMAIRE',
      sectionLibelle: 'Primaire',
      active: true,
    },
    idUtilisateur: 'enseignant-1',
    idOrganisation: 'org-1',
    idEcole: 'ecole-1',
    idClasse: 'classe-1',
    idAnneeScolaire: 'annee-1',
  });

  assert.equal(resultat, true);
});

test('refuse le titulariat effectif derive si la section ne releve pas de la maternelle ou du primaire', () => {
  const resultat = PolicyTitulariatEffectifParSection.estTitulariatEffectif({
    responsabiliteClassePedagogique: {
      idOrganisation: 'org-1',
      idEcole: 'ecole-1',
      idClassePedagogique: 'classe-1',
      idAnneeScolaire: 'annee-1',
      idUtilisateurEnseignant: 'enseignant-1',
      sectionCode: 'SECONDAIRE',
      sectionLibelle: 'Secondaire',
      active: true,
    },
    idUtilisateur: 'enseignant-1',
    idOrganisation: 'org-1',
    idEcole: 'ecole-1',
    idClasse: 'classe-1',
    idAnneeScolaire: 'annee-1',
  });

  assert.equal(resultat, false);
});
