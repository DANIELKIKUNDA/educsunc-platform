import {
  ActiverEcole,
  ChangerModeExploitationEcole,
  ConsulterEcole,
  CreerEcole,
  DesactiverEcole,
  ListerEcoles,
  ListerEcolesParOrganisation,
  RenommerEcole,
} from '../../../application/use-cases/ecoles';
import {
  EcolePresenter,
  ReponseEcoleHttp,
  ReponseListeEcolesHttp,
} from '../presenters/EcolePresenter';
import { ValidateurEcoleHttp } from '../validators/ecole.validator';

// Ce controleur orchestre les entrees et sorties HTTP des ecoles.
export class ControleurEcoles {
  private readonly casUsageCreerEcole: CreerEcole;
  private readonly casUsageConsulterEcole: ConsulterEcole;
  private readonly casUsageListerEcoles: ListerEcoles;
  private readonly casUsageListerEcolesParOrganisation: ListerEcolesParOrganisation;
  private readonly casUsageChangerModeExploitationEcole: ChangerModeExploitationEcole;
  private readonly casUsageRenommerEcole: RenommerEcole;
  private readonly casUsageActiverEcole: ActiverEcole;
  private readonly casUsageDesactiverEcole: DesactiverEcole;

  // Ce constructeur injecte les cas d'usage exposes par les routes ecoles.
  constructor(
    casUsageCreerEcole: CreerEcole,
    casUsageConsulterEcole: ConsulterEcole,
    casUsageListerEcoles: ListerEcoles,
    casUsageListerEcolesParOrganisation: ListerEcolesParOrganisation,
    casUsageChangerModeExploitationEcole: ChangerModeExploitationEcole,
    casUsageRenommerEcole: RenommerEcole,
    casUsageActiverEcole: ActiverEcole,
    casUsageDesactiverEcole: DesactiverEcole,
  ) {
    this.casUsageCreerEcole = casUsageCreerEcole;
    this.casUsageConsulterEcole = casUsageConsulterEcole;
    this.casUsageListerEcoles = casUsageListerEcoles;
    this.casUsageListerEcolesParOrganisation = casUsageListerEcolesParOrganisation;
    this.casUsageChangerModeExploitationEcole = casUsageChangerModeExploitationEcole;
    this.casUsageRenommerEcole = casUsageRenommerEcole;
    this.casUsageActiverEcole = casUsageActiverEcole;
    this.casUsageDesactiverEcole = casUsageDesactiverEcole;
  }

  // Cette methode traite la creation HTTP d'une ecole.
  public async creerEcole(corps: unknown): Promise<ReponseEcoleHttp> {
    const entree = ValidateurEcoleHttp.validerCreation(corps);
    const sortie = await this.casUsageCreerEcole.executer(entree);

    return EcolePresenter.presenterEcole(sortie.ecole);
  }

  // Cette methode traite la consultation HTTP d'une ecole.
  public async consulterEcole(parametres: unknown): Promise<ReponseEcoleHttp> {
    const entree = ValidateurEcoleHttp.validerConsultation(parametres);
    const sortie = await this.casUsageConsulterEcole.executer(entree);

    return EcolePresenter.presenterEcole(sortie.ecole);
  }

  // Cette methode traite la liste HTTP des ecoles.
  public async listerEcoles(query: unknown): Promise<ReponseListeEcolesHttp> {
    const entree = ValidateurEcoleHttp.validerListe(query);

    if (entree.idOrganisation === undefined) {
      const sortie = await this.casUsageListerEcoles.executer({
        page: entree.page,
        taillePage: entree.taillePage,
      });

      return EcolePresenter.presenterListeEcoles(sortie);
    }

    const sortie = await this.casUsageListerEcolesParOrganisation.executer({
      idOrganisation: entree.idOrganisation,
      page: entree.page,
      taillePage: entree.taillePage,
    });

    return EcolePresenter.presenterListeEcoles(sortie);
  }

  // Cette methode traite la liste HTTP des ecoles rattachees a une organisation.
  public async listerEcolesParOrganisation(
    parametres: unknown,
    query: unknown,
  ): Promise<ReponseListeEcolesHttp> {
    const entree = ValidateurEcoleHttp.validerListeParOrganisation(parametres, query);
    const sortie = await this.casUsageListerEcolesParOrganisation.executer(entree);

    return EcolePresenter.presenterListeEcoles(sortie);
  }

  // Cette methode traite le changement HTTP du mode d'exploitation d'une ecole.
  public async changerModeExploitationEcole(
    parametres: unknown,
    corps: unknown,
  ): Promise<ReponseEcoleHttp> {
    const entree = ValidateurEcoleHttp.validerChangementMode(parametres, corps);
    const sortie = await this.casUsageChangerModeExploitationEcole.executer(entree);

    return EcolePresenter.presenterEcole(sortie.ecole);
  }

  // Cette methode traite le renommage HTTP d'une ecole.
  public async renommerEcole(
    parametres: unknown,
    corps: unknown,
  ): Promise<ReponseEcoleHttp> {
    const entree = ValidateurEcoleHttp.validerRenommage(parametres, corps);
    const sortie = await this.casUsageRenommerEcole.executer(entree);

    return EcolePresenter.presenterEcole(sortie.ecole);
  }

  // Cette methode traite l'activation HTTP d'une ecole.
  public async activerEcole(
    parametres: unknown,
    corps: unknown,
  ): Promise<ReponseEcoleHttp> {
    const entree = ValidateurEcoleHttp.validerActivation(parametres, corps);
    const sortie = await this.casUsageActiverEcole.executer(entree);

    return EcolePresenter.presenterEcole(sortie.ecole);
  }

  // Cette methode traite la desactivation HTTP d'une ecole.
  public async desactiverEcole(
    parametres: unknown,
    corps: unknown,
  ): Promise<ReponseEcoleHttp> {
    const entree = ValidateurEcoleHttp.validerDesactivation(parametres, corps);
    const sortie = await this.casUsageDesactiverEcole.executer(entree);

    return EcolePresenter.presenterEcole(sortie.ecole);
  }
}
