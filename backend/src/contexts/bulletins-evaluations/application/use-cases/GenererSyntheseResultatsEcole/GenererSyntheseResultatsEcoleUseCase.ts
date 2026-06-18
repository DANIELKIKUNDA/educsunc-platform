import { LigneSyntheseResultatsClasse } from '../../../domain/entities/LigneSyntheseResultatsClasse';
import { EtatProclamation } from '../../../domain/value-objects/EtatProclamation';
import type { DepotProclamationClasse } from '../../../domain/repositories/DepotProclamationClasse';
import type { DepotSyntheseResultatsEcole } from '../../../domain/repositories/DepotSyntheseResultatsEcole';
import type { GenererSyntheseEcoleInput } from '../../dto/input/GenererSyntheseEcoleInput';
import type { SyntheseEcoleOutput } from '../../dto/output/SyntheseEcoleOutput';
import { ApplicationException } from '../../exceptions/ApplicationException';
import type { AutorisationGenerationSynthesePort } from '../../ports/out/AutorisationGenerationSynthesePort';
import type { ScolariteElevesPort } from '../../ports/out/ScolariteElevesPort';
import type { TransactionManagerPort } from '../../ports/out/TransactionManagerPort';
import { ServiceProjectionSynthese } from '../../services/ServiceProjectionSynthese';
import { ServiceStatistiques } from '../../services/ServiceStatistiques';

// Ce use case orchestre la generation applicative d'une synthese ecole.
export class GenererSyntheseResultatsEcoleUseCase {
  constructor(
    private readonly depotSynthese: DepotSyntheseResultatsEcole,
    private readonly depotProclamation: DepotProclamationClasse,
    private readonly transactionManagerPort: TransactionManagerPort,
    private readonly autorisationGenerationSynthesePort?: AutorisationGenerationSynthesePort,
    private readonly serviceProjectionSynthese = new ServiceProjectionSynthese(),
    private readonly serviceStatistiques = new ServiceStatistiques(),
    private readonly scolariteElevesPort?: ScolariteElevesPort,
  ) {}

  // Cette methode genere la synthese puis renvoie sa projection.
  public async executer(input: GenererSyntheseEcoleInput): Promise<SyntheseEcoleOutput> {
    return this.transactionManagerPort.executer(async () => {
      const synthese = await this.depotSynthese.trouverParEcoleEtColonne(input.idEcole, input.codeColonne, input.idAnneeScolaire);
      if (synthese === null) {
        throw new ApplicationException('La synthese demandee est introuvable.', 'BULLETINS_SYNTHESE_INTROUVABLE');
      }

      const proclamations = await this.depotProclamation.listerParEcoleEtColonne(
        input.idEcole,
        input.codeColonne,
        input.idAnneeScolaire,
      );
      const proclamationsExploitables = proclamations.filter((proclamation) =>
        proclamation.obtenirEtatProclamation() !== EtatProclamation.ANNULEE
        && proclamation.obtenirStatistiquesProclamation() !== undefined,
      );

      if (proclamationsExploitables.length === 0) {
        throw new ApplicationException(
          'Aucune proclamation exploitable n existe pour generer la synthese demandee.',
          'BULLETINS_PROCLAMATIONS_SOURCE_INTROUVABLES',
        );
      }

      await this.autorisationGenerationSynthesePort?.verifierGenerationSynthese({
        idUtilisateur: input.idUtilisateur,
        idEcole: input.idEcole,
        idAnneeScolaire: input.idAnneeScolaire,
        idClassesPedagogiques: proclamationsExploitables.map((proclamation) =>
          proclamation.obtenirIdClassePedagogique()),
      });

      const lignes = await Promise.all(proclamationsExploitables.map(async (proclamation) => {
        const classePedagogique = await this.scolariteElevesPort?.consulterClassePedagogique(
          proclamation.obtenirIdClassePedagogique(),
        );

        if (classePedagogique === null || classePedagogique === undefined) {
          throw new ApplicationException(
            `La classe pedagogique "${proclamation.obtenirIdClassePedagogique()}" rattachee a la proclamation est introuvable.`,
            'BULLETINS_CLASSE_PEDAGOGIQUE_INTROUVABLE',
          );
        }

        return new LigneSyntheseResultatsClasse({
          idClassePedagogique: proclamation.obtenirIdClassePedagogique(),
          libelleClasse: classePedagogique.libelleClasse,
          statistiques: proclamation.obtenirStatistiquesProclamation()!,
        });
      }));

      this.serviceStatistiques.calculerSynthese(synthese, lignes);
      await this.depotSynthese.sauvegarder(synthese);
      return this.serviceProjectionSynthese.projeter(synthese);
    });
  }
}
