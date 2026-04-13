import {
  ActiverAnneeScolaire,
  ArchiverAnneeScolaire,
  BasculerAnneeScolaire,
  CloturerAnneeScolaire,
  ConsulterAnneeActiveParEcole,
  ConsulterAnneeScolaire,
  CreerAnneeScolaire,
  GarantirAnneeScolaireActiveParEcole,
  ListerAnneesScolairesParEcole,
  PreparerAnneeScolaireSuivante,
} from '../../../application/use-cases/annees';
import {
  AnneeScolairePresenter,
  ReponseAnneeScolaireHttp,
  ReponseAnneeScolaireOptionnelleHttp,
  ReponseBasculeAnneeScolaireHttp,
  ReponseGarantieAnneeActiveHttp,
  ReponseListeAnneesScolairesHttp,
  ReponsePreparationAnneeScolaireHttp,
} from '../presenters/AnneeScolairePresenter';
import { ValidateurAnneeScolaireHttp } from '../validators/annee-scolaire.validator';

// Ce controleur orchestre les entrees et sorties HTTP des annees scolaires.
export class ControleurAnneesScolaires {
  private readonly casUsageCreerAnneeScolaire: CreerAnneeScolaire;
  private readonly casUsageConsulterAnneeScolaire: ConsulterAnneeScolaire;
  private readonly casUsageListerAnneesScolairesParEcole: ListerAnneesScolairesParEcole;
  private readonly casUsageActiverAnneeScolaire: ActiverAnneeScolaire;
  private readonly casUsageCloturerAnneeScolaire: CloturerAnneeScolaire;
  private readonly casUsageArchiverAnneeScolaire: ArchiverAnneeScolaire;
  private readonly casUsageConsulterAnneeActiveParEcole: ConsulterAnneeActiveParEcole;
  private readonly casUsagePreparerAnneeScolaireSuivante: PreparerAnneeScolaireSuivante;
  private readonly casUsageGarantirAnneeScolaireActiveParEcole: GarantirAnneeScolaireActiveParEcole;
  private readonly casUsageBasculerAnneeScolaire: BasculerAnneeScolaire;

  // Ce constructeur injecte les cas d'usage exposes par les routes des annees scolaires.
  constructor(
    casUsageCreerAnneeScolaire: CreerAnneeScolaire,
    casUsageConsulterAnneeScolaire: ConsulterAnneeScolaire,
    casUsageListerAnneesScolairesParEcole: ListerAnneesScolairesParEcole,
    casUsageActiverAnneeScolaire: ActiverAnneeScolaire,
    casUsageCloturerAnneeScolaire: CloturerAnneeScolaire,
    casUsageArchiverAnneeScolaire: ArchiverAnneeScolaire,
    casUsageConsulterAnneeActiveParEcole: ConsulterAnneeActiveParEcole,
    casUsagePreparerAnneeScolaireSuivante: PreparerAnneeScolaireSuivante,
    casUsageGarantirAnneeScolaireActiveParEcole: GarantirAnneeScolaireActiveParEcole,
    casUsageBasculerAnneeScolaire: BasculerAnneeScolaire,
  ) {
    this.casUsageCreerAnneeScolaire = casUsageCreerAnneeScolaire;
    this.casUsageConsulterAnneeScolaire = casUsageConsulterAnneeScolaire;
    this.casUsageListerAnneesScolairesParEcole = casUsageListerAnneesScolairesParEcole;
    this.casUsageActiverAnneeScolaire = casUsageActiverAnneeScolaire;
    this.casUsageCloturerAnneeScolaire = casUsageCloturerAnneeScolaire;
    this.casUsageArchiverAnneeScolaire = casUsageArchiverAnneeScolaire;
    this.casUsageConsulterAnneeActiveParEcole = casUsageConsulterAnneeActiveParEcole;
    this.casUsagePreparerAnneeScolaireSuivante = casUsagePreparerAnneeScolaireSuivante;
    this.casUsageGarantirAnneeScolaireActiveParEcole =
      casUsageGarantirAnneeScolaireActiveParEcole;
    this.casUsageBasculerAnneeScolaire = casUsageBasculerAnneeScolaire;
  }

  // Cette methode traite la creation HTTP d'une annee scolaire.
  public async creerAnneeScolaire(corps: unknown): Promise<ReponseAnneeScolaireHttp> {
    const entree = ValidateurAnneeScolaireHttp.validerCreation(corps);
    const sortie = await this.casUsageCreerAnneeScolaire.executer(entree);

    return AnneeScolairePresenter.presenterAnneeScolaire(sortie.anneeScolaire);
  }

  // Cette methode traite la consultation HTTP d'une annee scolaire.
  public async consulterAnneeScolaire(
    parametres: unknown,
  ): Promise<ReponseAnneeScolaireHttp> {
    const entree = ValidateurAnneeScolaireHttp.validerConsultation(parametres);
    const sortie = await this.casUsageConsulterAnneeScolaire.executer(entree);

    return AnneeScolairePresenter.presenterAnneeScolaire(sortie.anneeScolaire);
  }

  // Cette methode traite la liste HTTP paginee des annees scolaires d'une ecole.
  public async listerAnneesScolaires(
    query: unknown,
  ): Promise<ReponseListeAnneesScolairesHttp> {
    const entree = ValidateurAnneeScolaireHttp.validerListe(query);
    const sortie = await this.casUsageListerAnneesScolairesParEcole.executer(entree);

    return AnneeScolairePresenter.presenterListeAnneesScolaires(sortie);
  }

  // Cette methode traite la consultation HTTP de l'annee active d'une ecole.
  public async consulterAnneeActiveParEcole(
    query: unknown,
  ): Promise<ReponseAnneeScolaireOptionnelleHttp> {
    const entree = ValidateurAnneeScolaireHttp.validerConsultationActive(query);
    const sortie = await this.casUsageConsulterAnneeActiveParEcole.executer(entree);

    return AnneeScolairePresenter.presenterAnneeScolaireOptionnelle(sortie.anneeScolaire);
  }

  // Cette methode traite la preparation HTTP de l'annee scolaire suivante.
  public async preparerAnneeScolaireSuivante(
    corps: unknown,
  ): Promise<ReponsePreparationAnneeScolaireHttp> {
    const entree = ValidateurAnneeScolaireHttp.validerPreparationSuivante(corps);
    const sortie = await this.casUsagePreparerAnneeScolaireSuivante.executer(entree);

    return AnneeScolairePresenter.presenterPreparationAnneeScolaire(
      sortie.anneeScolaire,
      sortie.dejaExistante,
    );
  }

  // Cette methode traite la garantie HTTP d'une annee scolaire active.
  public async garantirAnneeScolaireActiveParEcole(
    corps: unknown,
  ): Promise<ReponseGarantieAnneeActiveHttp> {
    const entree = ValidateurAnneeScolaireHttp.validerGarantieActive(corps);
    const sortie = await this.casUsageGarantirAnneeScolaireActiveParEcole.executer(entree);

    return AnneeScolairePresenter.presenterGarantieAnneeActive(
      sortie.anneeScolaire,
      sortie.action,
    );
  }

  // Cette methode traite la bascule HTTP d'une annee scolaire a la suivante.
  public async basculerAnneeScolaire(
    corps: unknown,
  ): Promise<ReponseBasculeAnneeScolaireHttp> {
    const entree = ValidateurAnneeScolaireHttp.validerBascule(corps);
    const sortie = await this.casUsageBasculerAnneeScolaire.executer(entree);

    return AnneeScolairePresenter.presenterBasculeAnneeScolaire(
      sortie.anneeCloturee,
      sortie.anneeActive,
      sortie.anneeSuivanteCreee,
    );
  }

  // Cette methode traite l'activation HTTP d'une annee scolaire.
  public async activerAnneeScolaire(
    parametres: unknown,
    corps: unknown,
  ): Promise<ReponseAnneeScolaireHttp> {
    const entree = ValidateurAnneeScolaireHttp.validerActivation(parametres, corps);
    const sortie = await this.casUsageActiverAnneeScolaire.executer(entree);

    return AnneeScolairePresenter.presenterAnneeScolaire(sortie.anneeScolaire);
  }

  // Cette methode traite la cloture HTTP d'une annee scolaire.
  public async cloturerAnneeScolaire(
    parametres: unknown,
    corps: unknown,
  ): Promise<ReponseAnneeScolaireHttp> {
    const entree = ValidateurAnneeScolaireHttp.validerCloture(parametres, corps);
    const sortie = await this.casUsageCloturerAnneeScolaire.executer(entree);

    return AnneeScolairePresenter.presenterAnneeScolaire(sortie.anneeScolaire);
  }

  // Cette methode traite l'archivage HTTP d'une annee scolaire.
  public async archiverAnneeScolaire(
    parametres: unknown,
    corps: unknown,
  ): Promise<ReponseAnneeScolaireHttp> {
    const entree = ValidateurAnneeScolaireHttp.validerArchivage(parametres, corps);
    const sortie = await this.casUsageArchiverAnneeScolaire.executer(entree);

    return AnneeScolairePresenter.presenterAnneeScolaire(sortie.anneeScolaire);
  }
}
