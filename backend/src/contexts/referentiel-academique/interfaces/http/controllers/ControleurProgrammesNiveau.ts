import {
  ArchiverProgrammeNiveau,
  ConsulterProgrammeNiveau,
  InitialiserProgrammeNiveau,
  ListerProgrammesNiveauParEcoleEtAnnee,
  ValiderProgrammeNiveau,
} from '../../../application/use-cases/programmes';
import {
  ProgrammeNiveauPresenter,
  ReponseListeProgrammesNiveauHttp,
  ReponseProgrammeNiveauHttp,
} from '../presenters/ProgrammeNiveauPresenter';
import { ValidateurProgrammeNiveauHttp } from '../validators/programme-niveau.validator';

// Ce controleur orchestre les entrees et sorties HTTP des programmes niveau.
export class ControleurProgrammesNiveau {
  private readonly casUsageInitialiserProgrammeNiveau: InitialiserProgrammeNiveau;
  private readonly casUsageConsulterProgrammeNiveau: ConsulterProgrammeNiveau;
  private readonly casUsageValiderProgrammeNiveau: ValiderProgrammeNiveau;
  private readonly casUsageArchiverProgrammeNiveau: ArchiverProgrammeNiveau;
  private readonly casUsageListerProgrammesNiveauParEcoleEtAnnee:
    ListerProgrammesNiveauParEcoleEtAnnee;

  // Ce constructeur injecte les cas d'usage exposes par les routes programmes niveau.
  constructor(
    casUsageInitialiserProgrammeNiveau: InitialiserProgrammeNiveau,
    casUsageConsulterProgrammeNiveau: ConsulterProgrammeNiveau,
    casUsageValiderProgrammeNiveau: ValiderProgrammeNiveau,
    casUsageArchiverProgrammeNiveau: ArchiverProgrammeNiveau,
    casUsageListerProgrammesNiveauParEcoleEtAnnee: ListerProgrammesNiveauParEcoleEtAnnee,
  ) {
    this.casUsageInitialiserProgrammeNiveau = casUsageInitialiserProgrammeNiveau;
    this.casUsageConsulterProgrammeNiveau = casUsageConsulterProgrammeNiveau;
    this.casUsageValiderProgrammeNiveau = casUsageValiderProgrammeNiveau;
    this.casUsageArchiverProgrammeNiveau = casUsageArchiverProgrammeNiveau;
    this.casUsageListerProgrammesNiveauParEcoleEtAnnee =
      casUsageListerProgrammesNiveauParEcoleEtAnnee;
  }

  // Cette methode traite l'initialisation HTTP d'un programme niveau.
  public async initialiserProgrammeNiveau(
    corps: unknown,
  ): Promise<ReponseProgrammeNiveauHttp> {
    const entree = ValidateurProgrammeNiveauHttp.validerInitialisation(corps);
    const sortie = await this.casUsageInitialiserProgrammeNiveau.executer(entree);

    return ProgrammeNiveauPresenter.presenterProgrammeNiveau(sortie.programmeNiveau);
  }

  // Cette methode traite la consultation HTTP d'un programme niveau.
  public async consulterProgrammeNiveau(
    parametres: unknown,
  ): Promise<ReponseProgrammeNiveauHttp> {
    const entree = ValidateurProgrammeNiveauHttp.validerConsultation(parametres);
    const sortie = await this.casUsageConsulterProgrammeNiveau.executer(entree);

    return ProgrammeNiveauPresenter.presenterProgrammeNiveau(sortie.programmeNiveau);
  }

  // Cette methode traite la validation HTTP d'un programme niveau.
  public async validerProgrammeNiveau(
    parametres: unknown,
    corps: unknown,
  ): Promise<ReponseProgrammeNiveauHttp> {
    const entree = ValidateurProgrammeNiveauHttp.validerValidation(parametres, corps);
    const sortie = await this.casUsageValiderProgrammeNiveau.executer(entree);

    return ProgrammeNiveauPresenter.presenterProgrammeNiveau(sortie.programmeNiveau);
  }

  // Cette methode traite l'archivage HTTP d'un programme niveau.
  public async archiverProgrammeNiveau(
    parametres: unknown,
    corps: unknown,
  ): Promise<ReponseProgrammeNiveauHttp> {
    const entree = ValidateurProgrammeNiveauHttp.validerArchivage(parametres, corps);
    const sortie = await this.casUsageArchiverProgrammeNiveau.executer(entree);

    return ProgrammeNiveauPresenter.presenterProgrammeNiveau(sortie.programmeNiveau);
  }

  // Cette methode traite la liste HTTP paginee des programmes niveau.
  public async listerProgrammesNiveau(
    query: unknown,
  ): Promise<ReponseListeProgrammesNiveauHttp> {
    const entree = ValidateurProgrammeNiveauHttp.validerListe(query);
    const sortie = await this.casUsageListerProgrammesNiveauParEcoleEtAnnee.executer(entree);

    return ProgrammeNiveauPresenter.presenterListeProgrammesNiveau(sortie);
  }
}
