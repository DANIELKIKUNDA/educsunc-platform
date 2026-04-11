import {
  ConsulterOrganisation,
  CreerOrganisation,
  ListerOrganisations,
} from '../../../application/use-cases/organisations';
import {
  OrganisationPresenter,
  ReponseListeOrganisationsHttp,
  ReponseOrganisationHttp,
} from '../presenters/OrganisationPresenter';
import { ValidateurOrganisationHttp } from '../validators/organisation.validator';

// Ce controleur orchestre les entrees et sorties HTTP des organisations.
export class ControleurOrganisations {
  private readonly casUsageCreerOrganisation: CreerOrganisation;
  private readonly casUsageConsulterOrganisation: ConsulterOrganisation;
  private readonly casUsageListerOrganisations: ListerOrganisations;

  // Ce constructeur injecte les cas d'usage exposes par les routes organisations.
  constructor(
    casUsageCreerOrganisation: CreerOrganisation,
    casUsageConsulterOrganisation: ConsulterOrganisation,
    casUsageListerOrganisations: ListerOrganisations,
  ) {
    this.casUsageCreerOrganisation = casUsageCreerOrganisation;
    this.casUsageConsulterOrganisation = casUsageConsulterOrganisation;
    this.casUsageListerOrganisations = casUsageListerOrganisations;
  }

  // Cette methode traite la creation HTTP d'une organisation.
  public async creerOrganisation(corps: unknown): Promise<ReponseOrganisationHttp> {
    const entree = ValidateurOrganisationHttp.validerCreation(corps);
    const sortie = await this.casUsageCreerOrganisation.executer(entree);

    return OrganisationPresenter.presenterOrganisation(sortie.organisation);
  }

  // Cette methode traite la consultation HTTP d'une organisation.
  public async consulterOrganisation(parametres: unknown): Promise<ReponseOrganisationHttp> {
    const entree = ValidateurOrganisationHttp.validerConsultation(parametres);
    const sortie = await this.casUsageConsulterOrganisation.executer(entree);

    return OrganisationPresenter.presenterOrganisation(sortie.organisation);
  }

  // Cette methode traite la liste HTTP paginee des organisations.
  public async listerOrganisations(query: unknown): Promise<ReponseListeOrganisationsHttp> {
    const entree = ValidateurOrganisationHttp.validerListe(query);
    const sortie = await this.casUsageListerOrganisations.executer(entree);

    return OrganisationPresenter.presenterListeOrganisations(sortie);
  }
}
