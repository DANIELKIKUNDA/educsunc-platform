import test from 'node:test';
import assert from 'node:assert/strict';
import { ConsulterConduiteClasseUseCase } from 'contexts/bulletins-evaluations/application/use-cases/ConsulterConduiteClasse/ConsulterConduiteClasseUseCase';
import { AutorisationConduitePortMemoire } from '../../mocks/BulletinsEvaluationsMocks';

test("la lecture de conduite par classe verifie localement le perimetre puis relit la projection", async () => {
  const autorisation = new AutorisationConduitePortMemoire();
  const useCase = new ConsulterConduiteClasseUseCase(
    {
      async executer(idClassePedagogique, idAnneeScolaire) {
        return {
          idClassePedagogique,
          idAnneeScolaire,
          lignes: [{
            idResultatBulletinEleve: 'resultat-1',
            idEleve: 'eleve-1',
            nomComplet: 'Eleve 1',
            sexe: 'M',
            applications: [],
          }],
        };
      },
    },
    autorisation,
  );

  const sortie = await useCase.executer({
    idClassePedagogique: 'classe-1',
    idAnneeScolaire: 'annee-1',
    idEcole: 'ecole-1',
    idUtilisateur: 'user-1',
    idOrganisation: 'org-1',
  });

  assert.equal(sortie.lignes[0]?.nomComplet, 'Eleve 1');
  assert.deepEqual(autorisation.dernierContexte, {
    idUtilisateur: 'user-1',
    idOrganisation: 'org-1',
    idEcole: 'ecole-1',
    idClassePedagogique: 'classe-1',
    idAnneeScolaire: 'annee-1',
  });
});
