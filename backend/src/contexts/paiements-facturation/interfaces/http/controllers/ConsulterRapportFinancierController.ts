import { ConsulterFondsAnticipesUseCase } from '../../../application/use-cases/rapports/ConsulterFondsAnticipesUseCase';
import { ConsulterPaiementsParCaissierUseCase } from '../../../application/use-cases/rapports/ConsulterPaiementsParCaissierUseCase';
import { ConsulterPaiementsParTypeFraisUseCase } from '../../../application/use-cases/rapports/ConsulterPaiementsParTypeFraisUseCase';
import { ConsulterRegistreFinancierClasseUseCase } from '../../../application/use-cases/rapports/ConsulterRegistreFinancierClasseUseCase';
import { ConsulterSyntheseFinanciereClasseUseCase } from '../../../application/use-cases/rapports/ConsulterSyntheseFinanciereClasseUseCase';
import { ConsulterSyntheseFinanciereEcoleUseCase } from '../../../application/use-cases/rapports/ConsulterSyntheseFinanciereEcoleUseCase';
import { ConsulterSyntheseFinanciereOrganisationUseCase } from '../../../application/use-cases/rapports/ConsulterSyntheseFinanciereOrganisationUseCase';
import { ConsulterSyntheseFinanciereSectionUseCase } from '../../../application/use-cases/rapports/ConsulterSyntheseFinanciereSectionUseCase';
import { ConsulterRapportFinancierJournalierUseCase } from '../../../application/use-cases/rapports/ConsulterRapportFinancierJournalierUseCase';
import { FondsAnticipesPresenter } from '../presenters/FondsAnticipesPresenter';
import { PaiementsParCaissierPresenter } from '../presenters/PaiementsParCaissierPresenter';
import { PaiementsParTypeFraisPresenter } from '../presenters/PaiementsParTypeFraisPresenter';
import { RegistreFinancierClassePresenter } from '../presenters/RegistreFinancierClassePresenter';
import { RapportFinancierPresenter } from '../presenters/RapportFinancierPresenter';
import { SyntheseFinanciereClassePresenter } from '../presenters/SyntheseFinanciereClassePresenter';
import { SyntheseFinanciereEcolePresenter } from '../presenters/SyntheseFinanciereEcolePresenter';
import { SyntheseFinanciereOrganisationPresenter } from '../presenters/SyntheseFinanciereOrganisationPresenter';
import { SyntheseFinanciereSectionPresenter } from '../presenters/SyntheseFinanciereSectionPresenter';
import { ParamValidator } from '../validators/ParamValidator';

export class ConsulterRapportFinancierController {
  constructor(
    private readonly casUsage: ConsulterRapportFinancierJournalierUseCase,
    private readonly casUsagePaiementsParCaissier?: ConsulterPaiementsParCaissierUseCase,
    private readonly casUsagePaiementsParTypeFrais?: ConsulterPaiementsParTypeFraisUseCase,
    private readonly casUsageFondsAnticipes?: ConsulterFondsAnticipesUseCase,
    private readonly casUsageRegistreFinancierClasse?: ConsulterRegistreFinancierClasseUseCase,
    private readonly casUsageSyntheseFinanciereClasse?: ConsulterSyntheseFinanciereClasseUseCase,
    private readonly casUsageSyntheseFinanciereSection?: ConsulterSyntheseFinanciereSectionUseCase,
    private readonly casUsageSyntheseFinanciereEcole?: ConsulterSyntheseFinanciereEcoleUseCase,
    private readonly casUsageSyntheseFinanciereOrganisation?: ConsulterSyntheseFinanciereOrganisationUseCase,
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

  public async consulterRegistreFinancierClasse(
    query: unknown,
    headers: unknown,
  ): Promise<{ donnee: unknown }> {
    if (this.casUsageRegistreFinancierClasse === undefined) {
      throw new Error('La consultation du registre financier de classe nest pas configuree.');
    }

    const entree = ParamValidator.validerConsultationRegistreFinancierClasse(
      query,
      headers,
    );
    const sortie = await this.casUsageRegistreFinancierClasse.executer(entree);

    return RegistreFinancierClassePresenter.presenterLecture(sortie);
  }

  public async consulterSyntheseFinanciereClasse(
    query: unknown,
    headers: unknown,
  ): Promise<{ donnee: unknown }> {
    if (this.casUsageSyntheseFinanciereClasse === undefined) {
      throw new Error('La consultation de la synthese financiere de classe nest pas configuree.');
    }

    const entree = ParamValidator.validerConsultationSyntheseFinanciereClasse(
      query,
      headers,
    );
    const sortie = await this.casUsageSyntheseFinanciereClasse.executer(entree);

    return SyntheseFinanciereClassePresenter.presenterLecture(sortie);
  }

  public async consulterSyntheseFinanciereSection(
    query: unknown,
    headers: unknown,
  ): Promise<{ donnee: unknown }> {
    if (this.casUsageSyntheseFinanciereSection === undefined) {
      throw new Error('La consultation de la synthese financiere de section nest pas configuree.');
    }

    const entree = ParamValidator.validerConsultationSyntheseFinanciereSection(
      query,
      headers,
    );
    const sortie = await this.casUsageSyntheseFinanciereSection.executer(entree);

    return SyntheseFinanciereSectionPresenter.presenterLecture(sortie);
  }

  public async consulterSyntheseFinanciereEcole(
    query: unknown,
    headers: unknown,
  ): Promise<{ donnee: unknown }> {
    if (this.casUsageSyntheseFinanciereEcole === undefined) {
      throw new Error('La consultation de la synthese financiere d ecole nest pas configuree.');
    }

    const entree = ParamValidator.validerConsultationSyntheseFinanciereEcole(
      query,
      headers,
    );
    const sortie = await this.casUsageSyntheseFinanciereEcole.executer(entree);

    return SyntheseFinanciereEcolePresenter.presenterLecture(sortie);
  }

  public async consulterSyntheseFinanciereOrganisation(
    query: unknown,
    headers: unknown,
  ): Promise<{ donnee: unknown }> {
    if (this.casUsageSyntheseFinanciereOrganisation === undefined) {
      throw new Error('La consultation de la synthese financiere d organisation nest pas configuree.');
    }

    const entree = ParamValidator.validerConsultationSyntheseFinanciereOrganisation(
      query,
      headers,
    );
    const sortie = await this.casUsageSyntheseFinanciereOrganisation.executer(entree);

    return SyntheseFinanciereOrganisationPresenter.presenterLecture(sortie);
  }
}
