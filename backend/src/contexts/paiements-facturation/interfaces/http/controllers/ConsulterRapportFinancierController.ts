import { ConsulterFondsAnticipesUseCase } from '../../../application/use-cases/rapports/ConsulterFondsAnticipesUseCase';
import { ConsulterPaiementsParCaissierUseCase } from '../../../application/use-cases/rapports/ConsulterPaiementsParCaissierUseCase';
import { ConsulterPaiementsParTypeFraisUseCase } from '../../../application/use-cases/rapports/ConsulterPaiementsParTypeFraisUseCase';
import { ConsulterRapportFinancierJournalierUseCase } from '../../../application/use-cases/rapports/ConsulterRapportFinancierJournalierUseCase';
import { FondsAnticipesPresenter } from '../presenters/FondsAnticipesPresenter';
import { PaiementsParCaissierPresenter } from '../presenters/PaiementsParCaissierPresenter';
import { PaiementsParTypeFraisPresenter } from '../presenters/PaiementsParTypeFraisPresenter';
import { RapportFinancierPresenter } from '../presenters/RapportFinancierPresenter';
import { ParamValidator } from '../validators/ParamValidator';

export class ConsulterRapportFinancierController {
  constructor(
    private readonly casUsage: ConsulterRapportFinancierJournalierUseCase,
    private readonly casUsagePaiementsParCaissier?: ConsulterPaiementsParCaissierUseCase,
    private readonly casUsagePaiementsParTypeFrais?: ConsulterPaiementsParTypeFraisUseCase,
    private readonly casUsageFondsAnticipes?: ConsulterFondsAnticipesUseCase,
  ) {}

  public async consulterJournalier(
    query: unknown,
    headers: unknown,
  ): Promise<{ donnee: unknown }> {
    const entree = ParamValidator.validerConsultationRapportFinancierJournalier(
      query,
      headers,
    );
    const sortie = await this.casUsage.executer(entree);

    return RapportFinancierPresenter.presenterRapport(sortie);
  }

  public async consulterPaiementsParCaissier(
    query: unknown,
    headers: unknown,
  ): Promise<{ donnee: unknown }> {
    if (this.casUsagePaiementsParCaissier === undefined) {
      throw new Error('La consultation des paiements par caissier nest pas configuree.');
    }

    const entree = ParamValidator.validerConsultationPaiementsParCaissier(
      query,
      headers,
    );
    const sortie = await this.casUsagePaiementsParCaissier.executer(entree);

    return PaiementsParCaissierPresenter.presenterLecture(sortie);
  }

  public async consulterPaiementsParTypeFrais(
    query: unknown,
    headers: unknown,
  ): Promise<{ donnee: unknown }> {
    if (this.casUsagePaiementsParTypeFrais === undefined) {
      throw new Error('La consultation des paiements par type de frais nest pas configuree.');
    }

    const entree = ParamValidator.validerConsultationPaiementsParTypeFrais(
      query,
      headers,
    );
    const sortie = await this.casUsagePaiementsParTypeFrais.executer(entree);

    return PaiementsParTypeFraisPresenter.presenterLecture(sortie);
  }

  public async consulterFondsAnticipes(
    query: unknown,
    headers: unknown,
  ): Promise<{ donnee: unknown }> {
    if (this.casUsageFondsAnticipes === undefined) {
      throw new Error('La consultation des fonds anticipes nest pas configuree.');
    }

    const entree = ParamValidator.validerConsultationFondsAnticipes(
      query,
      headers,
    );
    const sortie = await this.casUsageFondsAnticipes.executer(entree);

    return FondsAnticipesPresenter.presenterLecture(sortie);
  }
}
