import { ProgrammeNiveauSortie } from '../../../application/dto/output/ProgrammeNiveauSortie';
import {
  AnalyserMigrationReferentiel,
  AnnulerMigrationReferentiel,
  AppliquerMigrationReferentiel,
  ConsulterRapportMigration,
} from '../../../application/use-cases/migrations';
import {
  MigrationReferentielPresenter,
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

  // Ce constructeur injecte les cas d'usage exposes par les routes de migration.
  constructor(
    casUsageAnalyserMigrationReferentiel: AnalyserMigrationReferentiel,
    casUsageAppliquerMigrationReferentiel: AppliquerMigrationReferentiel,
    casUsageAnnulerMigrationReferentiel: AnnulerMigrationReferentiel,
    casUsageConsulterRapportMigration: ConsulterRapportMigration,
  ) {
    this.casUsageAnalyserMigrationReferentiel = casUsageAnalyserMigrationReferentiel;
    this.casUsageAppliquerMigrationReferentiel = casUsageAppliquerMigrationReferentiel;
    this.casUsageAnnulerMigrationReferentiel = casUsageAnnulerMigrationReferentiel;
    this.casUsageConsulterRapportMigration = casUsageConsulterRapportMigration;
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
}
