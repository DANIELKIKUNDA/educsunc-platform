import { ArchiverProgrammeNiveauEntree } from '../dto/input/ArchiverProgrammeNiveauEntree';
import { ConsulterProgrammeNiveauEntree } from '../dto/input/ConsulterProgrammeNiveauEntree';
import { InitialiserProgrammeNiveauEntree } from '../dto/input/InitialiserProgrammeNiveauEntree';
import { ListerProgrammesNiveauParEcoleEtAnneeEntree } from '../dto/input/ListerProgrammesNiveauParEcoleEtAnneeEntree';
import { ProduireEtatLocalProgrammeEntree } from '../dto/input/ProduireEtatLocalProgrammeEntree';
import { ValiderProgrammeNiveauEntree } from '../dto/input/ValiderProgrammeNiveauEntree';
import { ListerProgrammesNiveauParEcoleEtAnneeSortie } from '../dto/output/ListerProgrammesNiveauParEcoleEtAnneeSortie';
import {
  ArchiverProgrammeNiveau,
  SortieArchiverProgrammeNiveau,
} from '../use-cases/programmes/ArchiverProgrammeNiveau';
import {
  ConsulterProgrammeNiveau,
  SortieConsulterProgrammeNiveau,
} from '../use-cases/programmes/ConsulterProgrammeNiveau';
import {
  InitialiserProgrammeNiveau,
  SortieInitialiserProgrammeNiveau,
} from '../use-cases/programmes/InitialiserProgrammeNiveau';
import { ListerProgrammesNiveauParEcoleEtAnnee } from '../use-cases/programmes/ListerProgrammesNiveauParEcoleEtAnnee';
import {
  ProduireEtatLocalProgramme,
  SortieProduireEtatLocalProgramme,
} from '../use-cases/programmes/ProduireEtatLocalProgramme';
import {
  SortieValiderProgrammeNiveau,
  ValiderProgrammeNiveau,
} from '../use-cases/programmes/ValiderProgrammeNiveau';

// Ce service applicatif regroupe les operations d'initialisation et d'exploitation locale des programmes niveau.
export class OrchestrateurInitialisationProgrammeNiveau {
  private readonly casUsageInitialiserProgrammeNiveau: InitialiserProgrammeNiveau;
  private readonly casUsageValiderProgrammeNiveau: ValiderProgrammeNiveau;
  private readonly casUsageArchiverProgrammeNiveau: ArchiverProgrammeNiveau;
  private readonly casUsageConsulterProgrammeNiveau: ConsulterProgrammeNiveau;
  private readonly casUsageListerProgrammesNiveauParEcoleEtAnnee: ListerProgrammesNiveauParEcoleEtAnnee;
  private readonly casUsageProduireEtatLocalProgramme: ProduireEtatLocalProgramme;

  // Ce constructeur injecte les cas d'usage reutilises pendant le cycle de vie des programmes niveau.
  constructor(
    casUsageInitialiserProgrammeNiveau: InitialiserProgrammeNiveau,
    casUsageValiderProgrammeNiveau: ValiderProgrammeNiveau,
    casUsageArchiverProgrammeNiveau: ArchiverProgrammeNiveau,
    casUsageConsulterProgrammeNiveau: ConsulterProgrammeNiveau,
    casUsageListerProgrammesNiveauParEcoleEtAnnee: ListerProgrammesNiveauParEcoleEtAnnee,
    casUsageProduireEtatLocalProgramme: ProduireEtatLocalProgramme,
  ) {
    this.casUsageInitialiserProgrammeNiveau = casUsageInitialiserProgrammeNiveau;
    this.casUsageValiderProgrammeNiveau = casUsageValiderProgrammeNiveau;
    this.casUsageArchiverProgrammeNiveau = casUsageArchiverProgrammeNiveau;
    this.casUsageConsulterProgrammeNiveau = casUsageConsulterProgrammeNiveau;
    this.casUsageListerProgrammesNiveauParEcoleEtAnnee = casUsageListerProgrammesNiveauParEcoleEtAnnee;
    this.casUsageProduireEtatLocalProgramme = casUsageProduireEtatLocalProgramme;
  }

  // Cette methode orchestre l'initialisation d'un programme niveau.
  public initialiserProgrammeNiveau(
    entree: InitialiserProgrammeNiveauEntree,
  ): Promise<SortieInitialiserProgrammeNiveau> {
    return this.casUsageInitialiserProgrammeNiveau.executer(entree);
  }

  // Cette methode orchestre la validation d'un programme niveau.
  public validerProgrammeNiveau(
    entree: ValiderProgrammeNiveauEntree,
  ): Promise<SortieValiderProgrammeNiveau> {
    return this.casUsageValiderProgrammeNiveau.executer(entree);
  }

  // Cette methode orchestre l'archivage d'un programme niveau.
  public archiverProgrammeNiveau(
    entree: ArchiverProgrammeNiveauEntree,
  ): Promise<SortieArchiverProgrammeNiveau> {
    return this.casUsageArchiverProgrammeNiveau.executer(entree);
  }

  // Cette methode orchestre la consultation d'un programme niveau.
  public consulterProgrammeNiveau(
    entree: ConsulterProgrammeNiveauEntree,
  ): Promise<SortieConsulterProgrammeNiveau> {
    return this.casUsageConsulterProgrammeNiveau.executer(entree);
  }

  // Cette methode orchestre le listage des programmes niveau d'une ecole pour une annee.
  public listerProgrammesNiveauParEcoleEtAnnee(
    entree: ListerProgrammesNiveauParEcoleEtAnneeEntree,
  ): Promise<ListerProgrammesNiveauParEcoleEtAnneeSortie> {
    return this.casUsageListerProgrammesNiveauParEcoleEtAnnee.executer(entree);
  }

  // Cette methode orchestre la production de l'etat local d'un programme niveau.
  public produireEtatLocalProgramme(
    entree: ProduireEtatLocalProgrammeEntree,
  ): Promise<SortieProduireEtatLocalProgramme> {
    return this.casUsageProduireEtatLocalProgramme.executer(entree);
  }
}
