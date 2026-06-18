import type { AutorisationSituationFinanciereElevePort } from '../../contexts/paiements-facturation/application/ports/AutorisationSituationFinanciereElevePort';
import {
  AutorisationHistoriquePaiementsAdapter,
  type DependancesAutorisationHistoriquePaiementsAdapter,
} from './AutorisationHistoriquePaiementsAdapter';

// Cette classe reutilise exactement la doctrine PF-05 pour la lecture de dette et des frais exigibles.
export class AutorisationSituationFinanciereEleveAdapter
  implements AutorisationSituationFinanciereElevePort
{
  constructor(
    private readonly autorisationHistorique:
      AutorisationHistoriquePaiementsAdapter = new AutorisationHistoriquePaiementsAdapter(),
  ) {}

  public static avecDependancesTest(
    dependances: DependancesAutorisationHistoriquePaiementsAdapter,
  ): AutorisationSituationFinanciereEleveAdapter {
    return new AutorisationSituationFinanciereEleveAdapter(
      new AutorisationHistoriquePaiementsAdapter(dependances),
    );
  }

  public async verifierConsultationSituationFinanciereEleve(params: {
    idUtilisateur: string;
    idOrganisation: string;
    idEcole: string;
    idEleve: string;
  }): Promise<void> {
    await this.autorisationHistorique.verifierConsultationHistoriquePaiements(params);
  }

  public async fermer(): Promise<void> {
    await this.autorisationHistorique.fermer();
  }
}
