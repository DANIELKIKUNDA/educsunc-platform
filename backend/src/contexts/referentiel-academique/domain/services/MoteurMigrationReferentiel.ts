import { ProgrammeNiveau } from '../aggregates/ProgrammeNiveau';
import { MigrationReferentielProgramme } from '../aggregates/MigrationReferentielProgramme';
import { VersionReferentielProgramme } from '../aggregates/VersionReferentielProgramme';
import { LigneDiffMigration } from '../entities/LigneDiffMigration';
import { LigneProgrammeNiveau } from '../entities/LigneProgrammeNiveau';
import { TransformationNote } from '../entities/TransformationNote';
import { ErreurComparaisonVersionsImpossible } from '../exceptions/ErreurComparaisonVersionsImpossible';
import { ErreurMigrationDejaAppliquee } from '../exceptions/ErreurMigrationDejaAppliquee';
import { ErreurMigrationReferentielInvalide } from '../exceptions/ErreurMigrationReferentielInvalide';
import { ErreurTransformationNoteImpossible } from '../exceptions/ErreurTransformationNoteImpossible';
import { ReferentielProgrammeId } from '../value-objects/ReferentielProgrammeId';
import { TypeDiffReferentiel } from '../value-objects/TypeDiffReferentiel';
import { MoteurPonderation } from './MoteurPonderation';

// Cette demande represente une conversion de note a executer pendant une migration.
export interface DemandeTransformationNote {
  idNote: string;
  ancienneValeur: number;
  ancienMaximum: number;
  nouveauMaximum: number;
}

// Cette interface decrit le resultat exploitable d'une analyse de migration.
export interface RapportAnalyseMigration {
  differences: LigneDiffMigration[];
  resumeDiff: string;
  totalDifferences: number;
}

// Ce moteur pilote les comparaisons, conversions et applications d'une migration de referentiel.
export class MoteurMigrationReferentiel {
  private readonly moteurPonderation: MoteurPonderation;

  // Ce constructeur permet d'injecter un moteur de ponderation de domaine reutilisable.
  constructor(moteurPonderation: MoteurPonderation = new MoteurPonderation()) {
    this.moteurPonderation = moteurPonderation;
  }

  // Cette methode analyse une migration a partir de deux versions officielles.
  public analyserMigration(
    migration: MigrationReferentielProgramme,
    ancienneVersion: VersionReferentielProgramme,
    nouvelleVersion: VersionReferentielProgramme,
  ): RapportAnalyseMigration {
    this.verifierComparabiliteDesVersions(ancienneVersion, nouvelleVersion);

    const differences = nouvelleVersion.produireUnDiff(ancienneVersion);
    const resumeDiff = this.construireResumeDiff(differences);

    migration.detecterDifferences(differences, resumeDiff);
    migration.lancerAnalyse();

    return {
      differences,
      resumeDiff,
      totalDifferences: differences.length,
    };
  }

  // Cette methode convertit un lot de notes en respectant la formule officielle.
  public convertirNotes(
    migration: MigrationReferentielProgramme,
    demandes: readonly DemandeTransformationNote[],
  ): TransformationNote[] {
    try {
      const transformations = demandes.map((demande) =>
        this.moteurPonderation.preparerTransformationNote(
          demande.idNote,
          demande.ancienneValeur,
          demande.ancienMaximum,
          demande.nouveauMaximum,
        ));

      migration.convertirNotes(transformations);

      return transformations;
    } catch (erreur) {
      const message = erreur instanceof Error
        ? erreur.message
        : 'La transformation des notes de migration a echoue.';

      throw new ErreurTransformationNoteImpossible(message);
    }
  }

  // Cette methode applique une migration analysee a un programme local existant.
  public appliquerMigration(
    migration: MigrationReferentielProgramme,
    programmeNiveau: ProgrammeNiveau,
    idNouveauReferentielProgramme: ReferentielProgrammeId,
    nouvelleVersion: VersionReferentielProgramme,
  ): void {
    if (migration.obtenirStatut() === 'APPLIQUEE') {
      throw new ErreurMigrationDejaAppliquee(
        'Cette migration de referentiel a deja ete appliquee.',
      );
    }

    if (!migration.obtenirProgrammeNiveauId().estEgal(programmeNiveau.obtenirId())) {
      throw new ErreurMigrationReferentielInvalide(
        'La migration doit cibler exactement le programme niveau fourni.',
      );
    }

    const lignesLocales = nouvelleVersion
      .obtenirLignes()
      .map((ligne) => LigneProgrammeNiveau.depuisLigneReferentielProgramme(ligne));

    programmeNiveau.migrerVersNouvelleVersion(
      idNouveauReferentielProgramme,
      migration.obtenirNouvelleVersionReferentiel(),
      lignesLocales,
    );
    migration.appliquerMigration();
  }

  // Cette methode cloture une migration deja appliquee sans perdre son historique.
  public cloturerMigration(migration: MigrationReferentielProgramme): void {
    migration.cloturerMigration();
  }

  // Cette methode annule proprement une migration encore reversible.
  public annulerMigration(migration: MigrationReferentielProgramme): void {
    migration.annulerMigration();
  }

  private verifierComparabiliteDesVersions(
    ancienneVersion: VersionReferentielProgramme,
    nouvelleVersion: VersionReferentielProgramme,
  ): void {
    if (
      ancienneVersion.obtenirCodeVersion().trim().toUpperCase()
      === nouvelleVersion.obtenirCodeVersion().trim().toUpperCase()
    ) {
      throw new ErreurComparaisonVersionsImpossible(
        'La comparaison de migration exige deux versions officielles distinctes.',
      );
    }
  }

  private construireResumeDiff(differences: readonly LigneDiffMigration[]): string {
    if (differences.length === 0) {
      return 'Aucune difference detectee entre les deux versions officielles.';
    }

    const compteurParType = new Map<TypeDiffReferentiel, number>();

    for (const difference of differences) {
      const type = difference.obtenirTypeDiff();
      compteurParType.set(type, (compteurParType.get(type) ?? 0) + 1);
    }

    return [...compteurParType.entries()]
      .map(([type, nombre]) => `${type}:${nombre}`)
      .join(' | ');
  }
}
