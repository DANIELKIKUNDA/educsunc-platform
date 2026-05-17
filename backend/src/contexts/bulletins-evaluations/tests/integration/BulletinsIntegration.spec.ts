import test from 'node:test';
import assert from 'node:assert/strict';
import { EncoderCoteUseCase } from 'contexts/bulletins-evaluations/application/use-cases/EncoderCote/EncoderCoteUseCase';
import { PostgresDepotFicheCotationEleveCours } from 'contexts/bulletins-evaluations/infrastructure/persistence/postgres/depots/PostgresDepotFicheCotationEleveCours';
import { CodeColonneBulletin } from 'contexts/bulletins-evaluations/domain/value-objects/CodeColonneBulletin';
import { TransactionManagerMemoire } from '../mocks/BulletinsEvaluationsMocks';
import { creerFicheCotation } from '../factories/BulletinsEvaluationsFactories';

// Ce fichier couvre un flux transversal simple entre couche application et infrastructure locale.
test('un encodage traverse application et depot local sans perdre la coherence', async () => {
  const depot = new PostgresDepotFicheCotationEleveCours();
  const fiche = creerFicheCotation();
  await depot.sauvegarder(fiche);

  const useCase = new EncoderCoteUseCase(depot, new TransactionManagerMemoire());
  const sortie = await useCase.executer({
    idFicheCotationEleveCours: fiche.obtenirId(),
    codeColonne: CodeColonneBulletin.P1,
    cote: 9,
    versionAttendue: fiche.obtenirVersion(),
    idUtilisateur: 'user-1',
  });

  assert.equal(sortie.colonnes[0].coteObtenue, 9);
});
