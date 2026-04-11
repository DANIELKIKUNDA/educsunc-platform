import { UseCase } from '../../../../../shared/application/UseCase';
import { ErreurMigrationReferentielInvalide } from '../../../domain/exceptions/ErreurMigrationReferentielInvalide';
import { PolicyAudit } from '../../../domain/policies/PolicyAudit';
import { PolicyMigration } from '../../../domain/policies/PolicyMigration';
import { DepotMigrationReferentielProgramme } from '../../../domain/repositories/DepotMigrationReferentielProgramme';
import { MoteurMigrationReferentiel } from '../../../domain/services/MoteurMigrationReferentiel';
import { MigrationReferentielProgrammeId } from '../../../domain/value-objects/MigrationReferentielProgrammeId';
import { AnnulerMigrationReferentielEntree } from '../../dto/input/AnnulerMigrationReferentielEntree';
import { MigrationReferentielProgrammeSortie } from '../../dto/output/MigrationReferentielProgrammeSortie';
import { MigrationReferentielProgrammeApplicationMapper } from '../../mappers/MigrationReferentielProgrammeApplicationMapper';
import {
  ServiceJournalAuditReferentielAcademique,
  ServiceJournalAuditReferentielAcademiqueSansEffet,
} from '../../services/ServiceJournalAuditReferentielAcademique';

// Cette interface represente la sortie du cas d'usage AnnulerMigrationReferentiel.
export interface SortieAnnulerMigrationReferentiel {
  migrationReferentielProgramme: MigrationReferentielProgrammeSortie;
}

// Ce cas d'usage orchestre l'annulation d'une migration de referentiel.
export class AnnulerMigrationReferentiel
  implements UseCase<AnnulerMigrationReferentielEntree, SortieAnnulerMigrationReferentiel>
{
  private readonly depotMigrationReferentielProgramme: DepotMigrationReferentielProgramme;
  private readonly moteurMigrationReferentiel: MoteurMigrationReferentiel;
  private readonly policyMigration: PolicyMigration;
  private readonly policyAudit: PolicyAudit;
  private readonly serviceJournalAudit: ServiceJournalAuditReferentielAcademique;

  // Ce constructeur injecte les dependances applicatives necessaires a l'annulation d'une migration de referentiel.
  constructor(
    depotMigrationReferentielProgramme: DepotMigrationReferentielProgramme,
    moteurMigrationReferentiel: MoteurMigrationReferentiel = new MoteurMigrationReferentiel(),
    policyMigration: PolicyMigration = new PolicyMigration(),
    policyAudit: PolicyAudit = new PolicyAudit(),
    serviceJournalAudit: ServiceJournalAuditReferentielAcademique =
      new ServiceJournalAuditReferentielAcademiqueSansEffet(),
  ) {
    this.depotMigrationReferentielProgramme = depotMigrationReferentielProgramme;
    this.moteurMigrationReferentiel = moteurMigrationReferentiel;
    this.policyMigration = policyMigration;
    this.policyAudit = policyAudit;
    this.serviceJournalAudit = serviceJournalAudit;
  }

  // Cette methode annule une migration de referentiel non encore appliquee.
  public async executer(
    entree: AnnulerMigrationReferentielEntree,
  ): Promise<SortieAnnulerMigrationReferentiel> {
    const entreeValidee = this.validerEntree(entree);
    const horodatageAnnulation = new Date();

    this.policyAudit.verifierTracabiliteObligatoire(
      'ANNULER_MIGRATION_REFERENTIEL',
      entreeValidee.annulePar,
      horodatageAnnulation,
    );

    const migrationReferentielProgramme = await this.depotMigrationReferentielProgramme.trouverParId(
      new MigrationReferentielProgrammeId(entreeValidee.idMigrationReferentielProgramme),
    );

    if (migrationReferentielProgramme === null) {
      throw new ErreurMigrationReferentielInvalide(
        'La migration de referentiel a annuler est introuvable.',
      );
    }

    this.moteurMigrationReferentiel.annulerMigration(migrationReferentielProgramme);
    this.policyMigration.verifierHistoriqueComplet(migrationReferentielProgramme);
    await this.depotMigrationReferentielProgramme.sauvegarder(migrationReferentielProgramme);
    await this.serviceJournalAudit.journaliser({
      action: 'ANNULER_MIGRATION_REFERENTIEL',
      acteur: entreeValidee.annulePar,
      typeRessource: 'MigrationReferentielProgramme',
      idRessource: migrationReferentielProgramme.obtenirId().obtenirValeur(),
      details: {
        idProgrammeNiveau: migrationReferentielProgramme.obtenirProgrammeNiveauId().obtenirValeur(),
      },
      creeLe: horodatageAnnulation,
    });

    return {
      migrationReferentielProgramme: MigrationReferentielProgrammeApplicationMapper.versSortie(
        migrationReferentielProgramme,
      ),
    };
  }

  private validerEntree(
    entree: AnnulerMigrationReferentielEntree,
  ): AnnulerMigrationReferentielEntree {
    if (entree === null || entree === undefined) {
      throw new ErreurMigrationReferentielInvalide(
        "L'entree du cas d'usage AnnulerMigrationReferentiel est obligatoire.",
      );
    }

    return {
      idMigrationReferentielProgramme: this.validerTexteObligatoire(
        entree.idMigrationReferentielProgramme,
        'idMigrationReferentielProgramme',
      ),
      annulePar: this.validerTexteObligatoire(entree.annulePar, 'annulePar'),
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
