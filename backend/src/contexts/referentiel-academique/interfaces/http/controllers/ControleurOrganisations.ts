import {
  ActiverOrganisation,
  ConsulterOrganisation,
  CreerOrganisation,
  DesactiverOrganisation,
  ListerOrganisations,
  MettreAJourOrganisation,
  RenommerOrganisation,
} from '../../../application/use-cases/organisations';
import {
  OrganisationPresenter,
  ReponseHistoriqueOrganisationHttp,
  ReponseIndicateursOrganisationHttp,
  ReponseListeOrganisationsHttp,
  ReponseOrganisationHttp,
} from '../presenters/OrganisationPresenter';
import { ValidateurOrganisationHttp } from '../validators/organisation.validator';
import type { RequestContext } from '../../../../../shared/context';
import { AutorisationOrganisationSystemeAdapter } from '../../../../../app/adapters/AutorisationOrganisationSystemeAdapter';

interface IndicateursOrganisationBruts {
  organisationId: string;
  totalUtilisateursActifs: number;
  responsablePrincipal?: {
    utilisateurId?: string;
    etatCompte: string;
    dernierAccesLe?: string;
    dernierLoginLe?: string;
  };
}

interface DependancesIndicateursOrganisation {
  consulter: (idOrganisation: string, idResponsablePrincipal?: string) => Promise<IndicateursOrganisationBruts>;
}

interface HistoriqueOrganisationBrut {
  id: string;
  action: string;
  acteur?: string;
  description: string;
  creeLe: string;
  details?: Readonly<Record<string, unknown>>;
}

interface DependancesHistoriqueOrganisation {
  lister: (idOrganisation: string) => Promise<readonly HistoriqueOrganisationBrut[]>;
}

// Ce controleur orchestre les entrees et sorties HTTP des organisations.
export class ControleurOrganisations {
  private readonly casUsageCreerOrganisation: CreerOrganisation;
  private readonly casUsageConsulterOrganisation: ConsulterOrganisation;
  private readonly casUsageListerOrganisations: ListerOrganisations;
  private readonly casUsageMettreAJourOrganisation: MettreAJourOrganisation;
  private readonly casUsageRenommerOrganisation: RenommerOrganisation;
  private readonly casUsageActiverOrganisation: ActiverOrganisation;
  private readonly casUsageDesactiverOrganisation: DesactiverOrganisation;
  private readonly autorisationOrganisationSysteme: AutorisationOrganisationSystemeAdapter;
  private readonly dependancesIndicateursOrganisation?: DependancesIndicateursOrganisation;
  private readonly dependancesHistoriqueOrganisation?: DependancesHistoriqueOrganisation;

  // Ce constructeur injecte les cas d'usage exposes par les routes organisations.
  constructor(
    casUsageCreerOrganisation: CreerOrganisation,
    casUsageConsulterOrganisation: ConsulterOrganisation,
    casUsageListerOrganisations: ListerOrganisations,
    casUsageMettreAJourOrganisation: MettreAJourOrganisation,
    casUsageRenommerOrganisation: RenommerOrganisation,
    casUsageActiverOrganisation: ActiverOrganisation,
    casUsageDesactiverOrganisation: DesactiverOrganisation,
    autorisationOrganisationSysteme: AutorisationOrganisationSystemeAdapter =
      new AutorisationOrganisationSystemeAdapter(),
    dependancesIndicateursOrganisation?: DependancesIndicateursOrganisation,
    dependancesHistoriqueOrganisation?: DependancesHistoriqueOrganisation,
  ) {
    this.casUsageCreerOrganisation = casUsageCreerOrganisation;
    this.casUsageConsulterOrganisation = casUsageConsulterOrganisation;
    this.casUsageListerOrganisations = casUsageListerOrganisations;
    this.casUsageMettreAJourOrganisation = casUsageMettreAJourOrganisation;
    this.casUsageRenommerOrganisation = casUsageRenommerOrganisation;
    this.casUsageActiverOrganisation = casUsageActiverOrganisation;
    this.casUsageDesactiverOrganisation = casUsageDesactiverOrganisation;
    this.autorisationOrganisationSysteme = autorisationOrganisationSysteme;
    this.dependancesIndicateursOrganisation = dependancesIndicateursOrganisation;
    this.dependancesHistoriqueOrganisation = dependancesHistoriqueOrganisation;
  }

  // Cette methode traite la creation HTTP d'une organisation.
  public async creerOrganisation(
    corps: unknown,
    contexte?: RequestContext,
  ): Promise<ReponseOrganisationHttp> {
    const idUtilisateur = await this.verifierMutationOrganisation(contexte);
    const entree = ValidateurOrganisationHttp.validerCreation(corps, idUtilisateur);
    const sortie = await this.casUsageCreerOrganisation.executer(entree);

    return OrganisationPresenter.presenterOrganisation(sortie.organisation);
  }

  // Cette methode traite la consultation HTTP d'une organisation.
  public async consulterOrganisation(
    parametres: unknown,
    contexte?: RequestContext,
  ): Promise<ReponseOrganisationHttp> {
    await this.verifierLectureOrganisation(contexte);
    const entree = ValidateurOrganisationHttp.validerConsultation(parametres);
    const sortie = await this.casUsageConsulterOrganisation.executer(entree);

    return OrganisationPresenter.presenterOrganisation(sortie.organisation);
  }

  // Cette methode traite la liste HTTP paginee des organisations.
  public async listerOrganisations(
    query: unknown,
    contexte?: RequestContext,
  ): Promise<ReponseListeOrganisationsHttp> {
    await this.verifierLectureOrganisation(contexte);
    const entree = ValidateurOrganisationHttp.validerListe(query);
    const sortie = await this.casUsageListerOrganisations.executer(entree);

    return OrganisationPresenter.presenterListeOrganisations(sortie);
  }

  public async consulterIndicateursOrganisation(
    parametres: unknown,
    contexte?: RequestContext,
  ): Promise<ReponseIndicateursOrganisationHttp> {
    await this.verifierLectureOrganisation(contexte);

    if (!this.dependancesIndicateursOrganisation) {
      throw new Error("La lecture des indicateurs d'organisation n'est pas disponible.");
    }

    const entree = ValidateurOrganisationHttp.validerConsultation(parametres);
    const sortieOrganisation = await this.casUsageConsulterOrganisation.executer(entree);
    const indicateurs = await this.dependancesIndicateursOrganisation.consulter(
      entree.idOrganisation,
      sortieOrganisation.organisation.promoteurPrincipal?.utilisateurId,
    );

    return OrganisationPresenter.presenterIndicateursOrganisation(indicateurs);
  }

  public async consulterHistoriqueOrganisation(
    parametres: unknown,
    contexte?: RequestContext,
  ): Promise<ReponseHistoriqueOrganisationHttp> {
    await this.verifierLectureOrganisation(contexte);

    if (!this.dependancesHistoriqueOrganisation) {
      throw new Error("La lecture de l'historique d'organisation n'est pas disponible.");
    }

    const entree = ValidateurOrganisationHttp.validerConsultation(parametres);
    const historique = await this.dependancesHistoriqueOrganisation.lister(entree.idOrganisation);

    return OrganisationPresenter.presenterHistoriqueOrganisation(historique);
  }

  // Cette methode traite le renommage HTTP d'une organisation.
  public async renommerOrganisation(
    parametres: unknown,
    corps: unknown,
    contexte?: RequestContext,
  ): Promise<ReponseOrganisationHttp> {
    const idUtilisateur = await this.verifierMutationOrganisation(contexte);
    const entree = ValidateurOrganisationHttp.validerRenommage(
      parametres,
      corps,
      idUtilisateur,
    );
    const sortie = await this.casUsageRenommerOrganisation.executer(entree);

    return OrganisationPresenter.presenterOrganisation(sortie.organisation);
  }

  public async mettreAJourOrganisation(
    parametres: unknown,
    corps: unknown,
    contexte?: RequestContext,
  ): Promise<ReponseOrganisationHttp> {
    const idUtilisateur = await this.verifierMutationOrganisation(contexte);
    const entree = ValidateurOrganisationHttp.validerMiseAJour(
      parametres,
      corps,
      idUtilisateur,
    );
    const sortie = await this.casUsageMettreAJourOrganisation.executer(entree);

    return OrganisationPresenter.presenterOrganisation(sortie.organisation);
  }

  // Cette methode traite l'activation HTTP d'une organisation.
  public async activerOrganisation(
    parametres: unknown,
    corps: unknown,
    contexte?: RequestContext,
  ): Promise<ReponseOrganisationHttp> {
    const idUtilisateur = await this.verifierMutationOrganisation(contexte);
    const entree = ValidateurOrganisationHttp.validerActivation(
      parametres,
      corps,
      idUtilisateur,
    );
    const sortie = await this.casUsageActiverOrganisation.executer(entree);

    return OrganisationPresenter.presenterOrganisation(sortie.organisation);
  }

  // Cette methode traite la desactivation HTTP d'une organisation.
  public async desactiverOrganisation(
    parametres: unknown,
    corps: unknown,
    contexte?: RequestContext,
  ): Promise<ReponseOrganisationHttp> {
    const idUtilisateur = await this.verifierMutationOrganisation(contexte);
    const entree = ValidateurOrganisationHttp.validerDesactivation(
      parametres,
      corps,
      idUtilisateur,
    );
    const sortie = await this.casUsageDesactiverOrganisation.executer(entree);

    return OrganisationPresenter.presenterOrganisation(sortie.organisation);
  }

  private async verifierLectureOrganisation(contexte?: RequestContext): Promise<string> {
    const idUtilisateur = contexte?.utilisateurId;

    if (!idUtilisateur) {
      throw new Error("L'utilisateur courant est requis pour consulter les organisations.");
    }

    await this.autorisationOrganisationSysteme.verifierLectureOrganisation({
      idUtilisateur,
      roleActif: contexte?.roleActif,
    });

    return idUtilisateur;
  }

  private async verifierMutationOrganisation(contexte?: RequestContext): Promise<string> {
    const idUtilisateur = contexte?.utilisateurId;

    if (!idUtilisateur) {
      throw new Error("L'utilisateur courant est requis pour administrer les organisations.");
    }

    await this.autorisationOrganisationSysteme.verifierMutationOrganisation({
      idUtilisateur,
      roleActif: contexte?.roleActif,
    });

    return idUtilisateur;
  }
}
