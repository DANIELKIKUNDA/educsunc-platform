import { ActiverVersionReferentielEntree } from '../dto/input/ActiverVersionReferentielEntree';
import { ComparerDeuxVersionsReferentielEntree } from '../dto/input/ComparerDeuxVersionsReferentielEntree';
import { ConsulterReferentielProgrammeEntree } from '../dto/input/ConsulterReferentielProgrammeEntree';
import { ListerReferentielsParClasseAcademiqueEntree } from '../dto/input/ListerReferentielsParClasseAcademiqueEntree';
import { PublierVersionReferentielEntree } from '../dto/input/PublierVersionReferentielEntree';
import { ListerReferentielsParClasseAcademiqueSortie } from '../dto/output/ListerReferentielsParClasseAcademiqueSortie';
import {
  ActiverVersionReferentiel,
  SortieActiverVersionReferentiel,
} from '../use-cases/referentiels/ActiverVersionReferentiel';
import {
  ComparerDeuxVersionsReferentiel,
  SortieComparerDeuxVersionsReferentiel,
} from '../use-cases/referentiels/ComparerDeuxVersionsReferentiel';
import {
  ConsulterReferentielProgramme,
  SortieConsulterReferentielProgramme,
} from '../use-cases/referentiels/ConsulterReferentielProgramme';
import { ListerReferentielsParClasseAcademique } from '../use-cases/referentiels/ListerReferentielsParClasseAcademique';
import {
  PublierVersionReferentiel,
  SortiePublierVersionReferentiel,
} from '../use-cases/referentiels/PublierVersionReferentiel';

// Ce service applicatif regroupe les operations utiles a la synchronisation du referentiel academique.
export class OrchestrateurSynchronisationReferentiel {
  private readonly casUsagePublierVersionReferentiel: PublierVersionReferentiel;
  private readonly casUsageActiverVersionReferentiel: ActiverVersionReferentiel;
  private readonly casUsageConsulterReferentielProgramme: ConsulterReferentielProgramme;
  private readonly casUsageListerReferentielsParClasseAcademique: ListerReferentielsParClasseAcademique;
  private readonly casUsageComparerDeuxVersionsReferentiel: ComparerDeuxVersionsReferentiel;

  // Ce constructeur injecte les cas d'usage reutilises pendant les synchronisations de referentiel.
  constructor(
    casUsagePublierVersionReferentiel: PublierVersionReferentiel,
    casUsageActiverVersionReferentiel: ActiverVersionReferentiel,
    casUsageConsulterReferentielProgramme: ConsulterReferentielProgramme,
    casUsageListerReferentielsParClasseAcademique: ListerReferentielsParClasseAcademique,
    casUsageComparerDeuxVersionsReferentiel: ComparerDeuxVersionsReferentiel,
  ) {
    this.casUsagePublierVersionReferentiel = casUsagePublierVersionReferentiel;
    this.casUsageActiverVersionReferentiel = casUsageActiverVersionReferentiel;
    this.casUsageConsulterReferentielProgramme = casUsageConsulterReferentielProgramme;
    this.casUsageListerReferentielsParClasseAcademique = casUsageListerReferentielsParClasseAcademique;
    this.casUsageComparerDeuxVersionsReferentiel = casUsageComparerDeuxVersionsReferentiel;
  }

  // Cette methode orchestre la publication d'une version de referentiel.
  public publierVersionReferentiel(
    entree: PublierVersionReferentielEntree,
  ): Promise<SortiePublierVersionReferentiel> {
    return this.casUsagePublierVersionReferentiel.executer(entree);
  }

  // Cette methode orchestre l'activation d'une version de referentiel.
  public activerVersionReferentiel(
    entree: ActiverVersionReferentielEntree,
  ): Promise<SortieActiverVersionReferentiel> {
    return this.casUsageActiverVersionReferentiel.executer(entree);
  }

  // Cette methode orchestre la consultation d'un referentiel programme.
  public consulterReferentielProgramme(
    entree: ConsulterReferentielProgrammeEntree,
  ): Promise<SortieConsulterReferentielProgramme> {
    return this.casUsageConsulterReferentielProgramme.executer(entree);
  }

  // Cette methode orchestre le listage des referentiels programmes d'une classe academique.
  public listerReferentielsParClasseAcademique(
    entree: ListerReferentielsParClasseAcademiqueEntree,
  ): Promise<ListerReferentielsParClasseAcademiqueSortie> {
    return this.casUsageListerReferentielsParClasseAcademique.executer(entree);
  }

  // Cette methode orchestre la comparaison de deux versions de referentiel.
  public comparerDeuxVersionsReferentiel(
    entree: ComparerDeuxVersionsReferentielEntree,
  ): Promise<SortieComparerDeuxVersionsReferentiel> {
    return this.casUsageComparerDeuxVersionsReferentiel.executer(entree);
  }
}
