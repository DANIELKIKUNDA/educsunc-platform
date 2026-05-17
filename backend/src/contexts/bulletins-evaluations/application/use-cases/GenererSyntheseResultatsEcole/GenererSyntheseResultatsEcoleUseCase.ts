import { LigneSyntheseResultatsClasse } from '../../../domain/entities/LigneSyntheseResultatsClasse';
import type { DepotProclamationClasse } from '../../../domain/repositories/DepotProclamationClasse';
import type { DepotSyntheseResultatsEcole } from '../../../domain/repositories/DepotSyntheseResultatsEcole';
import type { GenererSyntheseEcoleInput } from '../../dto/input/GenererSyntheseEcoleInput';
import type { SyntheseEcoleOutput } from '../../dto/output/SyntheseEcoleOutput';
import { ApplicationException } from '../../exceptions/ApplicationException';
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

      const proclamations = await this.depotProclamation.listerParClasseEtAnnee('', input.idAnneeScolaire);
      const lignes = proclamations
        .filter((proclamation) => proclamation.obtenirStatistiquesProclamation() !== undefined)
        .map((proclamation, index) => new LigneSyntheseResultatsClasse({
          idClassePedagogique: `CLASSE-${index + 1}`,
          libelleClasse: `Classe ${index + 1}`,
          statistiques: proclamation.obtenirStatistiquesProclamation()!,
        }));

      this.serviceStatistiques.calculerSynthese(synthese, lignes);
      await this.depotSynthese.sauvegarder(synthese);
      return this.serviceProjectionSynthese.projeter(synthese);
    });
  }
}
