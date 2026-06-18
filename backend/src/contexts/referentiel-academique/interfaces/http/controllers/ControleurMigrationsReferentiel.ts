import type { RequestContext } from 'shared/context';
import { AutorisationMigrationReferentielAdapter } from '../../../../../app/adapters/AutorisationMigrationReferentielAdapter';
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
  private readonly autorisationMigrationReferentiel: AutorisationMigrationReferentielAdapter;

  // Ce constructeur injecte les cas d'usage exposes par les routes de migration.
  constructor(
    casUsageAnalyserMigrationReferentiel: AnalyserMigrationReferentiel,
    casUsageAppliquerMigrationReferentiel: AppliquerMigrationReferentiel,
    casUsageAnnulerMigrationReferentiel: AnnulerMigrationReferentiel,
    casUsageConsulterRapportMigration: ConsulterRapportMigration,
    casUsageListerMigrationsReferentielParProgrammeNiveau:
      ListerMigrationsReferentielParProgrammeNiveau,
    casUsageRelancerRecalculApresMigration: RelancerRecalculApresMigration,
    autorisationMigrationReferentiel: AutorisationMigrationReferentielAdapter =
      new AutorisationMigrationReferentielAdapter(),
  ) {
    this.casUsageAnalyserMigrationReferentiel = casUsageAnalyserMigrationReferentiel;
    this.casUsageAppliquerMigrationReferentiel = casUsageAppliquerMigrationReferentiel;
    this.casUsageAnnulerMigrationReferentiel = casUsageAnnulerMigrationReferentiel;
    this.casUsageConsulterRapportMigration = casUsageConsulterRapportMigration;
    this.casUsageListerMigrationsReferentielParProgrammeNiveau =
      casUsageListerMigrationsReferentielParProgrammeNiveau;
    this.casUsageRelancerRecalculApresMigration = casUsageRelancerRecalculApresMigration;
    this.autorisationMigrationReferentiel = autorisationMigrationReferentiel;
  }

  // Cette methode traite le listage HTTP des migrations d'un programme niveau.
  public async listerMigrationsReferentielParProgrammeNiveau(
    query: unknown,
    contexte?: RequestContext,
  ): Promise<ReponseListeMigrationsReferentielHttp> {
    await this.verifierLectureMigrationReferentiel(contexte);
    const entree = ValidateurMigrationReferentielHttp.validerListe(query);
    const sortie = await this.casUsageListerMigrationsReferentielParProgrammeNiveau
      .executer(entree);

    return MigrationReferentielPresenter.presenterListeMigrationsReferentiel(sortie);
  }

  // Cette methode traite l'analyse HTTP d'une migration de referentiel.
  public async analyserMigrationReferentiel(
    corps: unknown,
    contexte?: RequestContext,
  ): Promise<ReponseRapportMigrationHttp> {
    const utilisateurId = await this.verifierMutationMigrationReferentiel(contexte);
    const entree = ValidateurMigrationReferentielHttp.validerAnalyse(corps, utilisateurId);
    const sortie = await this.casUsageAnalyserMigrationReferentiel.executer(entree);

    return MigrationReferentielPresenter.presenterRapportMigration(sortie.rapportMigration);
  }

  // Cette methode traite l'application HTTP d'une migration de referentiel.
  public async appliquerMigrationReferentiel(
    corps: unknown,
    contexte?: RequestContext,
  ): Promise<ReponseApplicationMigrationReferentielHttp> {
    const utilisateurId = await this.verifierMutationMigrationReferentiel(contexte);
    const entree = ValidateurMigrationReferentielHttp.validerApplication(corps, utilisateurId);
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
    contexte?: RequestContext,
  ): Promise<ReponseMigrationReferentielHttp> {
    const utilisateurId = await this.verifierMutationMigrationReferentiel(contexte);
    const entree = ValidateurMigrationReferentielHttp.validerAnnulation(
      parametres,
      corps,
      utilisateurId,
    );
    const sortie = await this.casUsageAnnulerMigrationReferentiel.executer(entree);

    return MigrationReferentielPresenter.presenterMigrationReferentiel(
      sortie.migrationReferentielProgramme,
    );
  }

  // Cette methode traite la consultation HTTP du rapport d'une migration.
  public async consulterRapportMigration(
    parametres: unknown,
    contexte?: RequestContext,
  ): Promise<ReponseRapportMigrationHttp> {
    await this.verifierLectureMigrationReferentiel(contexte);
    const entree = ValidateurMigrationReferentielHttp.validerConsultation(parametres);
    const sortie = await this.casUsageConsulterRapportMigration.executer(entree);

    return MigrationReferentielPresenter.presenterRapportMigration(sortie.rapportMigration);
  }

  // Cette methode traite la relance HTTP des recalculs apres une migration.
  public async relancerRecalculApresMigration(
    parametres: unknown,
    corps: unknown,
    contexte?: RequestContext,
  ): Promise<ReponseMigrationReferentielHttp> {
    const utilisateurId = await this.verifierMutationMigrationReferentiel(contexte);
    const entree = ValidateurMigrationReferentielHttp.validerRelanceRecalcul(
      parametres,
      corps,
      utilisateurId,
    );
    const sortie = await this.casUsageRelancerRecalculApresMigration.executer(entree);

    return MigrationReferentielPresenter.presenterMigrationReferentiel(
      sortie.migrationReferentielProgramme,
    );
  }

  private async verifierLectureMigrationReferentiel(contexte?: RequestContext): Promise<void> {
    const idUtilisateur = contexte?.utilisateurId;

    if (!idUtilisateur) {
      throw new Error("L'utilisateur courant est requis pour consulter les migrations.");
    }

    await this.autorisationMigrationReferentiel.verifierLectureMigrationReferentiel({
      idUtilisateur,
      roleActif: contexte?.roleActif,
    });
  }

  private async verifierMutationMigrationReferentiel(
    contexte?: RequestContext,
  ): Promise<string> {
    const idUtilisateur = contexte?.utilisateurId;

    if (!idUtilisateur) {
      throw new Error("L'utilisateur courant est requis pour muter une migration.");
    }

    await this.autorisationMigrationReferentiel.verifierMutationMigrationReferentiel({
      idUtilisateur,
      roleActif: contexte?.roleActif,
    });

    return idUtilisateur;
  }
}
