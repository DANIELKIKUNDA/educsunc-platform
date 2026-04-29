import type { AppliquerLissageFraisInput } from 'contexts/paiements-facturation/application/dto/input/PaiementsEntreeDTO';
import { MoteurLissageFrais } from 'contexts/paiements-facturation/domain/services/MoteurLissageFrais';
import type { DepotPlanAnticipationFrais } from 'contexts/paiements-facturation/domain/repositories/DepotPlanAnticipationFrais';
import type { Money } from 'contexts/paiements-facturation/domain/value-objects/Money';

export class AppliquerLissageFraisUseCase {
  constructor(
    private readonly depotPlanAnticipationFrais: DepotPlanAnticipationFrais,
    private readonly moteurLissageFrais = new MoteurLissageFrais(),
  ) {}

  public async executer(input: AppliquerLissageFraisInput): Promise<Map<string, Money>> {
    const plans = await this.depotPlanAnticipationFrais.listerActifsParEcoleEtAnnee(input.idEcole, '');
    const plan = plans.find((element) => element.obtenirActif());
    if (plan === undefined) {
      return new Map();
    }
    return new Map(this.moteurLissageFrais.repartirEquitablement(input.montant, plan.obtenirMoisSupports()));
  }
}
