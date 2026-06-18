import { SyntheseResultatsEcole } from '../../../domain/aggregates/SyntheseResultatsEcole';
import type { DepotSyntheseResultatsEcole } from '../../../domain/repositories/DepotSyntheseResultatsEcole';
import type { InitialiserSyntheseResultatsInput } from '../../dto/input/InitialiserSyntheseResultatsInput';
import type { SyntheseEcoleOutput } from '../../dto/output/SyntheseEcoleOutput';
import { ApplicationException } from '../../exceptions/ApplicationException';
import type { EventBusPort } from '../../ports/out/EventBusPort';
import type { AutorisationGenerationSynthesePort } from '../../ports/out/AutorisationGenerationSynthesePort';
import type { DepotProclamationClasse } from '../../../domain/repositories/DepotProclamationClasse';
import type { TransactionManagerPort } from '../../ports/out/TransactionManagerPort';
import { ServiceProjectionSynthese } from '../../services/ServiceProjectionSynthese';

// Ce use case initialise une synthese vide et unique avant sa generation officielle.
export class InitialiserSyntheseResultatsEcoleUseCase {
  constructor(
    private readonly depotSynthese: DepotSyntheseResultatsEcole,
    private readonly depotProclamation: DepotProclamationClasse,
    private readonly transactionManagerPort: TransactionManagerPort,
    private readonly autorisationGenerationSynthesePort?: AutorisationGenerationSynthesePort,
    private readonly serviceProjectionSynthese = new ServiceProjectionSynthese(),
    private readonly eventBusPort?: EventBusPort,
  ) {}

  public async executer(input: InitialiserSyntheseResultatsInput): Promise<SyntheseEcoleOutput> {
    return this.transactionManagerPort.executer(async () => {
      const proclamations = await this.depotProclamation.listerParEcoleEtColonne(
        input.idEcole,
        input.codeColonne,
        input.idAnneeScolaire,
      );
      const idClassesPedagogiques = Array.from(
        new Set(
          proclamations.map((proclamation) => proclamation.obtenirIdClassePedagogique()).filter((valeur) => valeur.trim().length > 0),
        ),
      );

      await this.autorisationGenerationSynthesePort?.verifierInitialisationSynthese({
        idUtilisateur: input.creePar,
        idEcole: input.idEcole,
        idAnneeScolaire: input.idAnneeScolaire,
        idClassesPedagogiques,
      });

      const syntheseExistante = await this.depotSynthese.trouverParEcoleEtColonne(
        input.idEcole,
        input.codeColonne,
        input.idAnneeScolaire,
      );

      if (syntheseExistante !== null) {
        throw new ApplicationException(
          'Une synthese active existe deja pour cette ecole, cette annee et cette colonne.',
          'BULLETINS_SYNTHESE_DEJA_INITIALISEE',
        );
      }

      const synthese = SyntheseResultatsEcole.initialiser({
        idSyntheseResultatsEcole: `synthese-${input.idEcole}-${input.idAnneeScolaire}-${input.codeColonne}`,
        idEcole: input.idEcole,
        idAnneeScolaire: input.idAnneeScolaire,
        codeColonne: input.codeColonne,
        typeSynthese: input.typeSynthese,
        creePar: input.creePar,
        creeLe: new Date(),
      });

      await this.depotSynthese.sauvegarder(synthese);
      await this.eventBusPort?.publier(synthese.recupererEvenements());
      const sortie = this.serviceProjectionSynthese.projeter(synthese);
      synthese.viderEvenements();
      return sortie;
    });
  }
}
