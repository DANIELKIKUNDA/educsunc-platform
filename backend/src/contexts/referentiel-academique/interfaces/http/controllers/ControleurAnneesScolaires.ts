import {
  ActiverAnneeScolaire,
  ArchiverAnneeScolaire,
  CloturerAnneeScolaire,
  ConsulterAnneeScolaire,
  CreerAnneeScolaire,
  ListerAnneesScolairesParEcole,
} from '../../../application/use-cases/annees';
import {
  AnneeScolairePresenter,
  ReponseAnneeScolaireHttp,
  ReponseListeAnneesScolairesHttp,
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

  // Ce constructeur injecte les cas d'usage exposes par les routes des annees scolaires.
  constructor(
    casUsageCreerAnneeScolaire: CreerAnneeScolaire,
    casUsageConsulterAnneeScolaire: ConsulterAnneeScolaire,
    casUsageListerAnneesScolairesParEcole: ListerAnneesScolairesParEcole,
    casUsageActiverAnneeScolaire: ActiverAnneeScolaire,
    casUsageCloturerAnneeScolaire: CloturerAnneeScolaire,
    casUsageArchiverAnneeScolaire: ArchiverAnneeScolaire,
  ) {
    this.casUsageCreerAnneeScolaire = casUsageCreerAnneeScolaire;
    this.casUsageConsulterAnneeScolaire = casUsageConsulterAnneeScolaire;
    this.casUsageListerAnneesScolairesParEcole = casUsageListerAnneesScolairesParEcole;
    this.casUsageActiverAnneeScolaire = casUsageActiverAnneeScolaire;
    this.casUsageCloturerAnneeScolaire = casUsageCloturerAnneeScolaire;
    this.casUsageArchiverAnneeScolaire = casUsageArchiverAnneeScolaire;
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
