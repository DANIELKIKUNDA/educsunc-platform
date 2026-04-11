import { UseCase } from '../../../../../shared/application/UseCase';
import { ErreurMigrationReferentielInvalide } from '../../../domain/exceptions/ErreurMigrationReferentielInvalide';
import { ErreurProgrammeInvalide } from '../../../domain/exceptions/ErreurProgrammeInvalide';
import { ErreurProgrammeNiveauInvalide } from '../../../domain/exceptions/ErreurProgrammeNiveauInvalide';
import { ErreurVersionReferentielInvalide } from '../../../domain/exceptions/ErreurVersionReferentielInvalide';
import { PolicyAudit } from '../../../domain/policies/PolicyAudit';
import { PolicyMigration } from '../../../domain/policies/PolicyMigration';
import { DepotMigrationReferentielProgramme } from '../../../domain/repositories/DepotMigrationReferentielProgramme';
import { DepotProgrammeNiveau } from '../../../domain/repositories/DepotProgrammeNiveau';
import { DepotReferentielProgramme } from '../../../domain/repositories/DepotReferentielProgramme';
import {
  DemandeTransformationNote,
  MoteurMigrationReferentiel,
} from '../../../domain/services/MoteurMigrationReferentiel';
import { MigrationReferentielProgrammeId } from '../../../domain/value-objects/MigrationReferentielProgrammeId';
import { VersionReferentielProgrammeId } from '../../../domain/value-objects/VersionReferentielProgrammeId';
import { AppliquerMigrationReferentielEntree } from '../../dto/input/AppliquerMigrationReferentielEntree';
import { DemandeTransformationNoteEntree } from '../../dto/input/DemandeTransformationNoteEntree';
import { MigrationReferentielProgrammeSortie } from '../../dto/output/MigrationReferentielProgrammeSortie';
import { ProgrammeNiveauSortie } from '../../dto/output/ProgrammeNiveauSortie';
import { MigrationReferentielProgrammeApplicationMapper } from '../../mappers/MigrationReferentielProgrammeApplicationMapper';
import { ProgrammeNiveauApplicationMapper } from '../../mappers/ProgrammeNiveauApplicationMapper';
import {
  ServiceJournalAuditReferentielAcademique,
  ServiceJournalAuditReferentielAcademiqueSansEffet,
} from '../../services/ServiceJournalAuditReferentielAcademique';
import {
  ServiceTransactionApplication,
  ServiceTransactionApplicationSansEffet,
} from '../../services/ServiceTransactionApplication';

// Cette interface represente la sortie du cas d'usage AppliquerMigrationReferentiel.
export interface SortieAppliquerMigrationReferentiel {
  migrationReferentielProgramme: MigrationReferentielProgrammeSortie;
  programmeNiveau: ProgrammeNiveauSortie;
}

// Ce cas d'usage orchestre l'application d'une migration de referentiel.
export class AppliquerMigrationReferentiel
  implements UseCase<AppliquerMigrationReferentielEntree, SortieAppliquerMigrationReferentiel>
{
  private readonly depotMigrationReferentielProgramme: DepotMigrationReferentielProgramme;
  private readonly depotProgrammeNiveau: DepotProgrammeNiveau;
  private readonly depotReferentielProgramme: DepotReferentielProgramme;
  private readonly moteurMigrationReferentiel: MoteurMigrationReferentiel;
  private readonly policyMigration: PolicyMigration;
  private readonly policyAudit: PolicyAudit;
  private readonly serviceJournalAudit: ServiceJournalAuditReferentielAcademique;
  private readonly serviceTransactionApplication: ServiceTransactionApplication;

  // Ce constructeur injecte les dependances applicatives necessaires a l'application d'une migration de referentiel.
  constructor(
    depotMigrationReferentielProgramme: DepotMigrationReferentielProgramme,
    depotProgrammeNiveau: DepotProgrammeNiveau,
    depotReferentielProgramme: DepotReferentielProgramme,
    moteurMigrationReferentiel: MoteurMigrationReferentiel = new MoteurMigrationReferentiel(),
    policyMigration: PolicyMigration = new PolicyMigration(),
    policyAudit: PolicyAudit = new PolicyAudit(),
    serviceJournalAudit: ServiceJournalAuditReferentielAcademique =
      new ServiceJournalAuditReferentielAcademiqueSansEffet(),
    serviceTransactionApplication: ServiceTransactionApplication = new ServiceTransactionApplicationSansEffet(),
  ) {
    this.depotMigrationReferentielProgramme = depotMigrationReferentielProgramme;
    this.depotProgrammeNiveau = depotProgrammeNiveau;
    this.depotReferentielProgramme = depotReferentielProgramme;
    this.moteurMigrationReferentiel = moteurMigrationReferentiel;
    this.policyMigration = policyMigration;
    this.policyAudit = policyAudit;
    this.serviceJournalAudit = serviceJournalAudit;
    this.serviceTransactionApplication = serviceTransactionApplication;
  }

  // Cette methode applique une migration analysee sur le programme niveau cible.
  public async executer(
    entree: AppliquerMigrationReferentielEntree,
  ): Promise<SortieAppliquerMigrationReferentiel> {
    const entreeValidee = this.validerEntree(entree);
    return this.serviceTransactionApplication.executerDansTransaction(async () => {
      const horodatageApplication = new Date();

      this.policyAudit.verifierTracabiliteObligatoire(
        'APPLIQUER_MIGRATION_REFERENTIEL',
        entreeValidee.appliquePar,
        horodatageApplication,
      );

      const migrationReferentielProgramme = await this.depotMigrationReferentielProgramme.trouverParId(
        new MigrationReferentielProgrammeId(entreeValidee.idMigrationReferentielProgramme),
      );

      if (migrationReferentielProgramme === null) {
        throw new ErreurMigrationReferentielInvalide(
          'La migration de referentiel a appliquer est introuvable.',
        );
      }

      const programmeNiveau = await this.depotProgrammeNiveau.trouverParId(
        migrationReferentielProgramme.obtenirProgrammeNiveauId(),
      );

      if (programmeNiveau === null) {
        throw new ErreurProgrammeNiveauInvalide(
          "Le programme niveau cible de la migration est introuvable.",
        );
      }

      const nouveauReferentielProgramme = await this.depotReferentielProgramme.trouverParIdVersion(
        new VersionReferentielProgrammeId(
          migrationReferentielProgramme.obtenirNouvelleVersionReferentiel().obtenirValeur(),
        ),
      );

      if (nouveauReferentielProgramme === null) {
        throw new ErreurVersionReferentielInvalide(
          'La nouvelle version officielle de migration est introuvable.',
        );
      }

      const nouvelleVersion = nouveauReferentielProgramme.trouverVersionParId(
        new VersionReferentielProgrammeId(
          migrationReferentielProgramme.obtenirNouvelleVersionReferentiel().obtenirValeur(),
        ),
      );

      if (nouvelleVersion === null) {
        throw new ErreurVersionReferentielInvalide(
          'La nouvelle version officielle doit etre accessible depuis son referentiel parent.',
        );
      }

      if (
        !programmeNiveau
          .obtenirClasseAcademiqueId()
          .estEgal(nouveauReferentielProgramme.obtenirClasseAcademiqueId())
      ) {
        throw new ErreurProgrammeInvalide(
          'Le programme niveau et la nouvelle version de referentiel doivent viser la meme classe academique.',
        );
      }

      const demandesTransformationNotes = (entreeValidee.demandesTransformationNotes ?? []).map(
        (demandeTransformationNote) => this.mapperDemandeTransformation(demandeTransformationNote),
      );

      if (demandesTransformationNotes.length > 0) {
        this.moteurMigrationReferentiel.convertirNotes(
          migrationReferentielProgramme,
          demandesTransformationNotes,
        );
      }

      this.policyMigration.verifierTransformationObligatoire(migrationReferentielProgramme);
      this.moteurMigrationReferentiel.appliquerMigration(
        migrationReferentielProgramme,
        programmeNiveau,
        nouveauReferentielProgramme.obtenirId(),
        nouvelleVersion,
      );
      this.policyMigration.verifierHistoriqueComplet(migrationReferentielProgramme);

      await this.depotProgrammeNiveau.sauvegarder(programmeNiveau);
      await this.depotMigrationReferentielProgramme.sauvegarder(migrationReferentielProgramme);
      await this.serviceJournalAudit.journaliser({
        action: 'APPLIQUER_MIGRATION_REFERENTIEL',
        acteur: entreeValidee.appliquePar,
        typeRessource: 'MigrationReferentielProgramme',
        idRessource: migrationReferentielProgramme.obtenirId().obtenirValeur(),
        details: {
          idProgrammeNiveau: programmeNiveau.obtenirId().obtenirValeur(),
          idNouvelleVersionReferentiel: nouvelleVersion.obtenirId().obtenirValeur(),
          totalTransformationsNotes: migrationReferentielProgramme.obtenirTransformationsNotes().length,
        },
        creeLe: horodatageApplication,
      });

      return {
        migrationReferentielProgramme: MigrationReferentielProgrammeApplicationMapper.versSortie(
          migrationReferentielProgramme,
        ),
        programmeNiveau: ProgrammeNiveauApplicationMapper.versSortie(programmeNiveau),
      };
    });
  }

  private mapperDemandeTransformation(
    demandeTransformationNote: DemandeTransformationNoteEntree,
  ): DemandeTransformationNote {
    return {
      idNote: this.validerTexteObligatoire(demandeTransformationNote.idNote, 'demandeTransformationNote.idNote'),
      ancienneValeur: this.validerEntierPositifOuNul(
        demandeTransformationNote.ancienneValeur,
        'demandeTransformationNote.ancienneValeur',
      ),
      ancienMaximum: this.validerEntierPositif(
        demandeTransformationNote.ancienMaximum,
        'demandeTransformationNote.ancienMaximum',
      ),
      nouveauMaximum: this.validerEntierPositif(
        demandeTransformationNote.nouveauMaximum,
        'demandeTransformationNote.nouveauMaximum',
      ),
    };
  }

  private validerEntree(
    entree: AppliquerMigrationReferentielEntree,
  ): AppliquerMigrationReferentielEntree {
    if (entree === null || entree === undefined) {
      throw new ErreurMigrationReferentielInvalide(
        "L'entree du cas d'usage AppliquerMigrationReferentiel est obligatoire.",
      );
    }

    return {
      idMigrationReferentielProgramme: this.validerTexteObligatoire(
        entree.idMigrationReferentielProgramme,
        'idMigrationReferentielProgramme',
      ),
      demandesTransformationNotes: entree.demandesTransformationNotes?.map((demande) => ({
        idNote: this.validerTexteObligatoire(demande.idNote, 'demandeTransformationNote.idNote'),
        ancienneValeur: this.validerEntierPositifOuNul(
          demande.ancienneValeur,
          'demandeTransformationNote.ancienneValeur',
        ),
        ancienMaximum: this.validerEntierPositif(
          demande.ancienMaximum,
          'demandeTransformationNote.ancienMaximum',
        ),
        nouveauMaximum: this.validerEntierPositif(
          demande.nouveauMaximum,
          'demandeTransformationNote.nouveauMaximum',
        ),
      })),
      appliquePar: this.validerTexteObligatoire(entree.appliquePar, 'appliquePar'),
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

  private validerEntierPositif(valeur: number, nomChamp: string): number {
    if (!Number.isInteger(valeur) || valeur <= 0) {
      throw new ErreurMigrationReferentielInvalide(
        `Le champ "${nomChamp}" doit etre un entier strictement positif.`,
      );
    }

    return valeur;
  }

  private validerEntierPositifOuNul(valeur: number, nomChamp: string): number {
    if (!Number.isInteger(valeur) || valeur < 0) {
      throw new ErreurMigrationReferentielInvalide(
        `Le champ "${nomChamp}" doit etre un entier positif ou nul.`,
      );
    }

    return valeur;
  }
}
