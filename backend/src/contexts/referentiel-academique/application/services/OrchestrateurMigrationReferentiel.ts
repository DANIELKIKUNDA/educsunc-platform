import { AnalyserMigrationReferentielEntree } from '../dto/input/AnalyserMigrationReferentielEntree';
import { AnnulerMigrationReferentielEntree } from '../dto/input/AnnulerMigrationReferentielEntree';
import { AppliquerMigrationReferentielEntree } from '../dto/input/AppliquerMigrationReferentielEntree';
import { ConsulterRapportMigrationEntree } from '../dto/input/ConsulterRapportMigrationEntree';
import { RelancerRecalculApresMigrationEntree } from '../dto/input/RelancerRecalculApresMigrationEntree';
import {
  AnalyserMigrationReferentiel,
  SortieAnalyserMigrationReferentiel,
} from '../use-cases/migrations/AnalyserMigrationReferentiel';
import {
  AnnulerMigrationReferentiel,
  SortieAnnulerMigrationReferentiel,
} from '../use-cases/migrations/AnnulerMigrationReferentiel';
import {
  AppliquerMigrationReferentiel,
  SortieAppliquerMigrationReferentiel,
} from '../use-cases/migrations/AppliquerMigrationReferentiel';
import {
  ConsulterRapportMigration,
  SortieConsulterRapportMigration,
} from '../use-cases/migrations/ConsulterRapportMigration';
import {
  RelancerRecalculApresMigration,
  SortieRelancerRecalculApresMigration,
} from '../use-cases/migrations/RelancerRecalculApresMigration';

// Ce service applicatif regroupe les operations de migration de referentiel.
export class OrchestrateurMigrationReferentiel {
  private readonly casUsageAnalyserMigrationReferentiel: AnalyserMigrationReferentiel;
  private readonly casUsageAppliquerMigrationReferentiel: AppliquerMigrationReferentiel;
  private readonly casUsageAnnulerMigrationReferentiel: AnnulerMigrationReferentiel;
  private readonly casUsageConsulterRapportMigration: ConsulterRapportMigration;
  private readonly casUsageRelancerRecalculApresMigration: RelancerRecalculApresMigration;

  // Ce constructeur injecte les cas d'usage reutilises pendant le cycle de vie d'une migration de referentiel.
  constructor(
    casUsageAnalyserMigrationReferentiel: AnalyserMigrationReferentiel,
    casUsageAppliquerMigrationReferentiel: AppliquerMigrationReferentiel,
    casUsageAnnulerMigrationReferentiel: AnnulerMigrationReferentiel,
    casUsageConsulterRapportMigration: ConsulterRapportMigration,
    casUsageRelancerRecalculApresMigration: RelancerRecalculApresMigration,
  ) {
    this.casUsageAnalyserMigrationReferentiel = casUsageAnalyserMigrationReferentiel;
    this.casUsageAppliquerMigrationReferentiel = casUsageAppliquerMigrationReferentiel;
    this.casUsageAnnulerMigrationReferentiel = casUsageAnnulerMigrationReferentiel;
    this.casUsageConsulterRapportMigration = casUsageConsulterRapportMigration;
    this.casUsageRelancerRecalculApresMigration = casUsageRelancerRecalculApresMigration;
  }

  // Cette methode orchestre l'analyse d'une migration de referentiel.
  public analyserMigrationReferentiel(
    entree: AnalyserMigrationReferentielEntree,
  ): Promise<SortieAnalyserMigrationReferentiel> {
    return this.casUsageAnalyserMigrationReferentiel.executer(entree);
  }

  // Cette methode orchestre l'application d'une migration de referentiel.
  public appliquerMigrationReferentiel(
    entree: AppliquerMigrationReferentielEntree,
  ): Promise<SortieAppliquerMigrationReferentiel> {
    return this.casUsageAppliquerMigrationReferentiel.executer(entree);
  }

  // Cette methode orchestre l'annulation d'une migration de referentiel.
  public annulerMigrationReferentiel(
    entree: AnnulerMigrationReferentielEntree,
  ): Promise<SortieAnnulerMigrationReferentiel> {
    return this.casUsageAnnulerMigrationReferentiel.executer(entree);
  }

  // Cette methode orchestre la consultation d'un rapport de migration.
  public consulterRapportMigration(
    entree: ConsulterRapportMigrationEntree,
  ): Promise<SortieConsulterRapportMigration> {
    return this.casUsageConsulterRapportMigration.executer(entree);
  }

  // Cette methode orchestre la relance d'un recalcul apres migration.
  public relancerRecalculApresMigration(
    entree: RelancerRecalculApresMigrationEntree,
  ): Promise<SortieRelancerRecalculApresMigration> {
    return this.casUsageRelancerRecalculApresMigration.executer(entree);
  }
}
