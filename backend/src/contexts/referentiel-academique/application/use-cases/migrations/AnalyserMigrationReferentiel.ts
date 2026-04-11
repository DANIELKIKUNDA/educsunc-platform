import { UseCase } from '../../../../../shared/application/UseCase';
import { MigrationReferentielProgramme } from '../../../domain/aggregates/MigrationReferentielProgramme';
import { ErreurComparaisonVersionsImpossible } from '../../../domain/exceptions/ErreurComparaisonVersionsImpossible';
import { ErreurMigrationReferentielInvalide } from '../../../domain/exceptions/ErreurMigrationReferentielInvalide';
import { ErreurProgrammeInvalide } from '../../../domain/exceptions/ErreurProgrammeInvalide';
import { ErreurProgrammeNiveauInvalide } from '../../../domain/exceptions/ErreurProgrammeNiveauInvalide';
import { ErreurVersionReferentielInvalide } from '../../../domain/exceptions/ErreurVersionReferentielInvalide';
import { PolicyAudit } from '../../../domain/policies/PolicyAudit';
import { PolicyMigration } from '../../../domain/policies/PolicyMigration';
import { DepotMigrationReferentielProgramme } from '../../../domain/repositories/DepotMigrationReferentielProgramme';
import { DepotProgrammeNiveau } from '../../../domain/repositories/DepotProgrammeNiveau';
import { DepotReferentielProgramme } from '../../../domain/repositories/DepotReferentielProgramme';
import { MoteurMigrationReferentiel } from '../../../domain/services/MoteurMigrationReferentiel';
import { MigrationReferentielProgrammeId } from '../../../domain/value-objects/MigrationReferentielProgrammeId';
import { ProgrammeNiveauId } from '../../../domain/value-objects/ProgrammeNiveauId';
import { StatutMigrationReferentiel } from '../../../domain/value-objects/StatutMigrationReferentiel';
import { VersionReferentielProgrammeId } from '../../../domain/value-objects/VersionReferentielProgrammeId';
import { AnalyserMigrationReferentielEntree } from '../../dto/input/AnalyserMigrationReferentielEntree';
import { RapportMigrationSortie } from '../../dto/output/RapportMigrationSortie';
import { MigrationReferentielProgrammeApplicationMapper } from '../../mappers/MigrationReferentielProgrammeApplicationMapper';
import {
  ServiceJournalAuditReferentielAcademique,
  ServiceJournalAuditReferentielAcademiqueSansEffet,
} from '../../services/ServiceJournalAuditReferentielAcademique';

// Cette interface represente la sortie du cas d'usage AnalyserMigrationReferentiel.
export interface SortieAnalyserMigrationReferentiel {
  rapportMigration: RapportMigrationSortie;
}

// Ce cas d'usage orchestre l'analyse d'une migration de referentiel.
export class AnalyserMigrationReferentiel
  implements UseCase<AnalyserMigrationReferentielEntree, SortieAnalyserMigrationReferentiel>
{
  private readonly depotMigrationReferentielProgramme: DepotMigrationReferentielProgramme;
  private readonly depotProgrammeNiveau: DepotProgrammeNiveau;
  private readonly depotReferentielProgramme: DepotReferentielProgramme;
  private readonly moteurMigrationReferentiel: MoteurMigrationReferentiel;
  private readonly policyMigration: PolicyMigration;
  private readonly policyAudit: PolicyAudit;
  private readonly serviceJournalAudit: ServiceJournalAuditReferentielAcademique;

  // Ce constructeur injecte les dependances applicatives necessaires a l'analyse d'une migration de referentiel.
  constructor(
    depotMigrationReferentielProgramme: DepotMigrationReferentielProgramme,
    depotProgrammeNiveau: DepotProgrammeNiveau,
    depotReferentielProgramme: DepotReferentielProgramme,
    moteurMigrationReferentiel: MoteurMigrationReferentiel = new MoteurMigrationReferentiel(),
    policyMigration: PolicyMigration = new PolicyMigration(),
    policyAudit: PolicyAudit = new PolicyAudit(),
    serviceJournalAudit: ServiceJournalAuditReferentielAcademique =
      new ServiceJournalAuditReferentielAcademiqueSansEffet(),
  ) {
    this.depotMigrationReferentielProgramme = depotMigrationReferentielProgramme;
    this.depotProgrammeNiveau = depotProgrammeNiveau;
    this.depotReferentielProgramme = depotReferentielProgramme;
    this.moteurMigrationReferentiel = moteurMigrationReferentiel;
    this.policyMigration = policyMigration;
    this.policyAudit = policyAudit;
    this.serviceJournalAudit = serviceJournalAudit;
  }

  // Cette methode analyse la migration entre deux versions officielles pour un programme niveau.
  public async executer(
    entree: AnalyserMigrationReferentielEntree,
  ): Promise<SortieAnalyserMigrationReferentiel> {
    const entreeValidee = this.validerEntree(entree);
    const horodatageAnalyse = new Date();

    this.policyAudit.verifierTracabiliteObligatoire(
      'ANALYSER_MIGRATION_REFERENTIEL',
      entreeValidee.declenchePar,
      horodatageAnalyse,
    );

    const programmeNiveau = await this.depotProgrammeNiveau.trouverParId(
      new ProgrammeNiveauId(entreeValidee.idProgrammeNiveau),
    );

    if (programmeNiveau === null) {
      throw new ErreurProgrammeNiveauInvalide(
        "Le programme niveau cible de la migration est introuvable.",
      );
    }

    const ancienReferentielProgramme = await this.depotReferentielProgramme.trouverParIdVersion(
      new VersionReferentielProgrammeId(entreeValidee.idAncienneVersionReferentiel),
    );
    const nouveauReferentielProgramme = await this.depotReferentielProgramme.trouverParIdVersion(
      new VersionReferentielProgrammeId(entreeValidee.idNouvelleVersionReferentiel),
    );

    if (ancienReferentielProgramme === null || nouveauReferentielProgramme === null) {
      throw new ErreurVersionReferentielInvalide(
        'Les deux versions officielles de migration doivent exister.',
      );
    }

    const ancienneVersion = ancienReferentielProgramme.trouverVersionParId(
      new VersionReferentielProgrammeId(entreeValidee.idAncienneVersionReferentiel),
    );
    const nouvelleVersion = nouveauReferentielProgramme.trouverVersionParId(
      new VersionReferentielProgrammeId(entreeValidee.idNouvelleVersionReferentiel),
    );

    if (ancienneVersion === null || nouvelleVersion === null) {
      throw new ErreurVersionReferentielInvalide(
        'Les deux versions officielles de migration doivent etre chargees depuis leur referentiel parent.',
      );
    }

    if (ancienneVersion.obtenirId().estEgal(nouvelleVersion.obtenirId())) {
      throw new ErreurComparaisonVersionsImpossible(
        'La migration exige deux versions officielles distinctes.',
      );
    }

    if (
      !ancienReferentielProgramme
        .obtenirClasseAcademiqueId()
        .estEgal(nouveauReferentielProgramme.obtenirClasseAcademiqueId())
    ) {
      throw new ErreurComparaisonVersionsImpossible(
        'Deux versions de referentiel ne sont comparables que pour une meme classe academique.',
      );
    }

    if (
      !programmeNiveau
        .obtenirClasseAcademiqueId()
        .estEgal(ancienReferentielProgramme.obtenirClasseAcademiqueId())
    ) {
      throw new ErreurProgrammeInvalide(
        'Le programme niveau et les versions de referentiel doivent viser la meme classe academique.',
      );
    }

    const migrationReferentielProgramme = new MigrationReferentielProgramme(
      new MigrationReferentielProgrammeId(),
      programmeNiveau.obtenirId(),
      ancienneVersion.obtenirId(),
      nouvelleVersion.obtenirId(),
      horodatageAnalyse,
      StatutMigrationReferentiel.BROUILLON,
      '',
      [],
      [],
      entreeValidee.declenchePar,
    );

    const rapportAnalyse = this.moteurMigrationReferentiel.analyserMigration(
      migrationReferentielProgramme,
      ancienneVersion,
      nouvelleVersion,
    );

    this.policyMigration.verifierHistoriqueComplet(migrationReferentielProgramme);
    await this.depotMigrationReferentielProgramme.sauvegarder(migrationReferentielProgramme);
    await this.serviceJournalAudit.journaliser({
      action: 'ANALYSER_MIGRATION_REFERENTIEL',
      acteur: entreeValidee.declenchePar,
      typeRessource: 'MigrationReferentielProgramme',
      idRessource: migrationReferentielProgramme.obtenirId().obtenirValeur(),
      details: {
        idProgrammeNiveau: programmeNiveau.obtenirId().obtenirValeur(),
        idAncienneVersionReferentiel: ancienneVersion.obtenirId().obtenirValeur(),
        idNouvelleVersionReferentiel: nouvelleVersion.obtenirId().obtenirValeur(),
        totalDifferences: rapportAnalyse.totalDifferences,
      },
      creeLe: horodatageAnalyse,
    });

    return {
      rapportMigration: {
        migrationReferentielProgramme: MigrationReferentielProgrammeApplicationMapper.versSortie(
          migrationReferentielProgramme,
        ),
        totalDifferences: rapportAnalyse.totalDifferences,
        totalTransformationsNotes: migrationReferentielProgramme.obtenirTransformationsNotes().length,
      },
    };
  }

  private validerEntree(
    entree: AnalyserMigrationReferentielEntree,
  ): AnalyserMigrationReferentielEntree {
    if (entree === null || entree === undefined) {
      throw new ErreurMigrationReferentielInvalide(
        "L'entree du cas d'usage AnalyserMigrationReferentiel est obligatoire.",
      );
    }

    return {
      idProgrammeNiveau: this.validerTexteObligatoire(entree.idProgrammeNiveau, 'idProgrammeNiveau'),
      idAncienneVersionReferentiel: this.validerTexteObligatoire(
        entree.idAncienneVersionReferentiel,
        'idAncienneVersionReferentiel',
      ),
      idNouvelleVersionReferentiel: this.validerTexteObligatoire(
        entree.idNouvelleVersionReferentiel,
        'idNouvelleVersionReferentiel',
      ),
      declenchePar: this.validerTexteObligatoire(entree.declenchePar, 'declenchePar'),
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
