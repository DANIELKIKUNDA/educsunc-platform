import { UseCase } from '../../../../../shared/application/UseCase';
import { ErreurMigrationReferentielInvalide } from '../../../domain/exceptions/ErreurMigrationReferentielInvalide';
import { PolicyAudit } from '../../../domain/policies/PolicyAudit';
import { PolicyMigration } from '../../../domain/policies/PolicyMigration';
import { DepotMigrationReferentielProgramme } from '../../../domain/repositories/DepotMigrationReferentielProgramme';
import { MigrationReferentielProgrammeId } from '../../../domain/value-objects/MigrationReferentielProgrammeId';
import { RelancerRecalculApresMigrationEntree } from '../../dto/input/RelancerRecalculApresMigrationEntree';
import { MigrationReferentielProgrammeSortie } from '../../dto/output/MigrationReferentielProgrammeSortie';
import { MigrationReferentielProgrammeApplicationMapper } from '../../mappers/MigrationReferentielProgrammeApplicationMapper';

// Cette interface represente la sortie du cas d'usage RelancerRecalculApresMigration.
export interface SortieRelancerRecalculApresMigration {
  migrationReferentielProgramme: MigrationReferentielProgrammeSortie;
}

// Ce cas d'usage orchestre la relance de recalculs apres une migration.
export class RelancerRecalculApresMigration
  implements UseCase<RelancerRecalculApresMigrationEntree, SortieRelancerRecalculApresMigration>
{
  private readonly depotMigrationReferentielProgramme: DepotMigrationReferentielProgramme;
  private readonly policyMigration: PolicyMigration;
  private readonly policyAudit: PolicyAudit;

  // Ce constructeur injecte les dependances applicatives necessaires a la relance des recalculs post-migration.
  constructor(
    depotMigrationReferentielProgramme: DepotMigrationReferentielProgramme,
    policyMigration: PolicyMigration = new PolicyMigration(),
    policyAudit: PolicyAudit = new PolicyAudit(),
  ) {
    this.depotMigrationReferentielProgramme = depotMigrationReferentielProgramme;
    this.policyMigration = policyMigration;
    this.policyAudit = policyAudit;
  }

  // Cette methode relance le recalcul metier d'une migration analysee et met a jour son historique.
  public async executer(
    entree: RelancerRecalculApresMigrationEntree,
  ): Promise<SortieRelancerRecalculApresMigration> {
    const entreeValidee = this.validerEntree(entree);
    const horodatageRecalcul = new Date();

    this.policyAudit.verifierTracabiliteObligatoire(
      'RELANCER_RECALCUL_APRES_MIGRATION',
      entreeValidee.relancePar,
      horodatageRecalcul,
    );

    const migrationReferentielProgramme = await this.depotMigrationReferentielProgramme.trouverParId(
      new MigrationReferentielProgrammeId(entreeValidee.idMigrationReferentielProgramme),
    );

    if (migrationReferentielProgramme === null) {
      throw new ErreurMigrationReferentielInvalide(
        'La migration de referentiel a recalculer est introuvable.',
      );
    }

    migrationReferentielProgramme.recalculer();
    this.policyMigration.verifierHistoriqueComplet(migrationReferentielProgramme);
    await this.depotMigrationReferentielProgramme.sauvegarder(migrationReferentielProgramme);

    return {
      migrationReferentielProgramme: MigrationReferentielProgrammeApplicationMapper.versSortie(
        migrationReferentielProgramme,
      ),
    };
  }

  private validerEntree(
    entree: RelancerRecalculApresMigrationEntree,
  ): RelancerRecalculApresMigrationEntree {
    if (entree === null || entree === undefined) {
      throw new ErreurMigrationReferentielInvalide(
        "L'entree du cas d'usage RelancerRecalculApresMigration est obligatoire.",
      );
    }

    return {
      idMigrationReferentielProgramme: this.validerTexteObligatoire(
        entree.idMigrationReferentielProgramme,
        'idMigrationReferentielProgramme',
      ),
      relancePar: this.validerTexteObligatoire(entree.relancePar, 'relancePar'),
    };
  }

  private validerTexteObligatoire(valeur: string, nomChamp: string): string {
    if (typeof valeur !== 'string') {
      throw new ErreurMigrationReferentielInvalide(
        `Le champ "${nomChamp}" doit etre une chaine de caracteres.`,
      );
    }

    const valeurNettoyee = valeur.trim();

    if (valeurNettoyee.length === 0) {
      throw new ErreurMigrationReferentielInvalide(
        `Le champ "${nomChamp}" est obligatoire.`,
      );
    }

    return valeurNettoyee;
  }
}
