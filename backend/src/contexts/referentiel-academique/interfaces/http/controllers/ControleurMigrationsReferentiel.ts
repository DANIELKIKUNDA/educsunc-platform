import { ProgrammeNiveauSortie } from '../../../application/dto/output/ProgrammeNiveauSortie';
import {
  AnalyserMigrationReferentiel,
  AnnulerMigrationReferentiel,
  AppliquerMigrationReferentiel,
  ConsulterRapportMigration,
  ListerMigrationsReferentielParProgrammeNiveau,
  RelancerRecalculApresMigration,
} from '../../../application/use-cases/migrations';
import {
  MigrationReferentielPresenter,
  ReponseListeMigrationsReferentielHttp,
  ReponseMigrationReferentielHttp,
  ReponseRapportMigrationHttp,
} from '../presenters/MigrationReferentielPresenter';
import { ProgrammeNiveauPresenter } from '../presenters/ProgrammeNiveauPresenter';
import { ValidateurMigrationReferentielHttp } from '../validators/migration-referentiel.validator';

// Cette interface represente la reponse HTTP d'application d'une migration.
export interface ReponseApplicationMigrationReferentielHttp {
  donnee: {
    migrationReferentielProgramme: ReponseMigrationReferentielHttp['donnee'];
    programmeNiveau: ProgrammeNiveauSortie;
  };
}

// Ce controleur orchestre les entrees et sorties HTTP des migrations de referentiel.
export class ControleurMigrationsReferentiel {
  private readonly casUsageAnalyserMigrationReferentiel: AnalyserMigrationReferentiel;
  private readonly casUsageAppliquerMigrationReferentiel: AppliquerMigrationReferentiel;
  private readonly casUsageAnnulerMigrationReferentiel: AnnulerMigrationReferentiel;
  private readonly casUsageConsulterRapportMigration: ConsulterRapportMigration;
  private readonly casUsageListerMigrationsReferentielParProgrammeNiveau:
    ListerMigrationsReferentielParProgrammeNiveau;
  private readonly casUsageRelancerRecalculApresMigration: RelancerRecalculApresMigration;

  // Ce constructeur injecte les cas d'usage exposes par les routes de migration.
  constructor(
    casUsageAnalyserMigrationReferentiel: AnalyserMigrationReferentiel,
    casUsageAppliquerMigrationReferentiel: AppliquerMigrationReferentiel,
    casUsageAnnulerMigrationReferentiel: AnnulerMigrationReferentiel,
    casUsageConsulterRapportMigration: ConsulterRapportMigration,
    casUsageListerMigrationsReferentielParProgrammeNiveau:
      ListerMigrationsReferentielParProgrammeNiveau,
    casUsageRelancerRecalculApresMigration: RelancerRecalculApresMigration,
  ) {
    this.casUsageAnalyserMigrationReferentiel = casUsageAnalyserMigrationReferentiel;
    this.casUsageAppliquerMigrationReferentiel = casUsageAppliquerMigrationReferentiel;
    this.casUsageAnnulerMigrationReferentiel = casUsageAnnulerMigrationReferentiel;
    this.casUsageConsulterRapportMigration = casUsageConsulterRapportMigration;
    this.casUsageListerMigrationsReferentielParProgrammeNiveau =
      casUsageListerMigrationsReferentielParProgrammeNiveau;
    this.casUsageRelancerRecalculApresMigration = casUsageRelancerRecalculApresMigration;
  }

  // Cette methode traite le listage HTTP des migrations d'un programme niveau.
  public async listerMigrationsReferentielParProgrammeNiveau(
    query: unknown,
  ): Promise<ReponseListeMigrationsReferentielHttp> {
    const entree = ValidateurMigrationReferentielHttp.validerListe(query);
    const sortie = await this.casUsageListerMigrationsReferentielParProgrammeNiveau
      .executer(entree);

    return MigrationReferentielPresenter.presenterListeMigrationsReferentiel(sortie);
  }

  // Cette methode traite l'analyse HTTP d'une migration de referentiel.
  public async analyserMigrationReferentiel(
    corps: unknown,
  ): Promise<ReponseRapportMigrationHttp> {
    const entree = ValidateurMigrationReferentielHttp.validerAnalyse(corps);
    const sortie = await this.casUsageAnalyserMigrationReferentiel.executer(entree);

    return MigrationReferentielPresenter.presenterRapportMigration(sortie.rapportMigration);
  }

  // Cette methode traite l'application HTTP d'une migration de referentiel.
  public async appliquerMigrationReferentiel(
    corps: unknown,
  ): Promise<ReponseApplicationMigrationReferentielHttp> {
    const entree = ValidateurMigrationReferentielHttp.validerApplication(corps);
    const sortie = await this.casUsageAppliquerMigrationReferentiel.executer(entree);

    return {
      donnee: {
        migrationReferentielProgramme:
          MigrationReferentielPresenter.presenterMigrationReferentiel(
            sortie.migrationReferentielProgramme,
          ).donnee,
        programmeNiveau: ProgrammeNiveauPresenter.presenterProgrammeNiveau(
          sortie.programmeNiveau,
        ).donnee,
      },
    };
  }

  // Cette methode traite l'annulation HTTP d'une migration de referentiel.
  public async annulerMigrationReferentiel(
    parametres: unknown,
    corps: unknown,
  ): Promise<ReponseMigrationReferentielHttp> {
    const entree = ValidateurMigrationReferentielHttp.validerAnnulation(parametres, corps);
    const sortie = await this.casUsageAnnulerMigrationReferentiel.executer(entree);

    return MigrationReferentielPresenter.presenterMigrationReferentiel(
      sortie.migrationReferentielProgramme,
    );
  }

  // Cette methode traite la consultation HTTP du rapport d'une migration.
  public async consulterRapportMigration(
    parametres: unknown,
  ): Promise<ReponseRapportMigrationHttp> {
    const entree = ValidateurMigrationReferentielHttp.validerConsultation(parametres);
    const sortie = await this.casUsageConsulterRapportMigration.executer(entree);

    return MigrationReferentielPresenter.presenterRapportMigration(sortie.rapportMigration);
  }

  // Cette methode traite la relance HTTP des recalculs apres une migration.
  public async relancerRecalculApresMigration(
    parametres: unknown,
    corps: unknown,
  ): Promise<ReponseMigrationReferentielHttp> {
    const entree = ValidateurMigrationReferentielHttp.validerRelanceRecalcul(
      parametres,
      corps,
    );
    const sortie = await this.casUsageRelancerRecalculApresMigration.executer(entree);

    return MigrationReferentielPresenter.presenterMigrationReferentiel(
      sortie.migrationReferentielProgramme,
    );
  }
}
