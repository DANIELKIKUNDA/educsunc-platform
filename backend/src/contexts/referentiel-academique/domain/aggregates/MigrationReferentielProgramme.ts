import { RacineAgregat } from '../../../../shared/domain/AggregateRoot';
import { ValidationError } from '../../../../shared/exceptions/ValidationError';
import { LigneDiffMigration } from '../entities/LigneDiffMigration';
import { TransformationNote } from '../entities/TransformationNote';
import { MigrationReferentielProgrammeId } from '../value-objects/MigrationReferentielProgrammeId';
import { ProgrammeNiveauId } from '../value-objects/ProgrammeNiveauId';
import { StatutMigrationReferentiel } from '../value-objects/StatutMigrationReferentiel';
import { VersionReferentielProgrammeId } from '../value-objects/VersionReferentielProgrammeId';

// Cet agregat represente une migration historisee entre deux versions officielles appliquees a un programme local.
export class MigrationReferentielProgramme extends RacineAgregat<MigrationReferentielProgrammeId> {
  private programmeNiveauId: ProgrammeNiveauId;
  private ancienneVersionReferentiel: VersionReferentielProgrammeId;
  private nouvelleVersionReferentiel: VersionReferentielProgrammeId;
  private dateMigration: Date;
  private declenchePar?: string;
  private statut: StatutMigrationReferentiel;
  private resumeDiff: string;
  private version: number;
  private lignesDiffMigration: LigneDiffMigration[];
  private transformationsNotes: TransformationNote[];

  // Ce constructeur initialise une migration de referentiel et en valide la coherence initiale.
  constructor(
    id: MigrationReferentielProgrammeId,
    programmeNiveauId: ProgrammeNiveauId,
    ancienneVersionReferentiel: VersionReferentielProgrammeId,
    nouvelleVersionReferentiel: VersionReferentielProgrammeId,
    dateMigration: Date = new Date(),
    statut: StatutMigrationReferentiel = StatutMigrationReferentiel.BROUILLON,
    resumeDiff = '',
    lignesDiffMigration: LigneDiffMigration[] = [],
    transformationsNotes: TransformationNote[] = [],
    declenchePar?: string,
    version = 1,
  ) {
    super(id);

    this.programmeNiveauId = this.validerProgrammeNiveauId(programmeNiveauId);
    this.ancienneVersionReferentiel = this.validerVersionReferentielId(
      ancienneVersionReferentiel,
      'ancienneVersionReferentiel',
    );
    this.nouvelleVersionReferentiel = this.validerVersionReferentielId(
      nouvelleVersionReferentiel,
      'nouvelleVersionReferentiel',
    );
    this.validerVersionsDistinctes(this.ancienneVersionReferentiel, this.nouvelleVersionReferentiel);
    this.dateMigration = this.validerDate(dateMigration, 'dateMigration');
    this.statut = this.validerStatut(statut);
    this.resumeDiff = this.validerResumeDiff(resumeDiff, this.statut === StatutMigrationReferentiel.BROUILLON);
    this.lignesDiffMigration = this.validerLignesDiffMigration(lignesDiffMigration);
    this.transformationsNotes = this.validerTransformationsNotes(transformationsNotes);
    this.declenchePar = this.validerTexteOptionnel(declenchePar);
    this.version = this.validerVersion(version);
    this.verifierCoherenceEtat();
  }

  // Cette methode retourne le programme niveau rattache a la migration.
  public obtenirProgrammeNiveauId(): ProgrammeNiveauId {
    return this.programmeNiveauId;
  }

  // Cette methode retourne l'ancienne version officielle comparee.
  public obtenirAncienneVersionReferentiel(): VersionReferentielProgrammeId {
    return this.ancienneVersionReferentiel;
  }

  // Cette methode retourne la nouvelle version officielle comparee.
  public obtenirNouvelleVersionReferentiel(): VersionReferentielProgrammeId {
    return this.nouvelleVersionReferentiel;
  }

  // Cette methode retourne la date de migration.
  public obtenirDateMigration(): Date {
    return new Date(this.dateMigration.getTime());
  }

  // Cette methode retourne l'acteur ayant declenche la migration si il existe.
  public obtenirDeclenchePar(): string | undefined {
    return this.declenchePar;
  }

  // Cette methode retourne le statut courant de la migration.
  public obtenirStatut(): StatutMigrationReferentiel {
    return this.statut;
  }

  // Cette methode retourne le resume textuel des differences.
  public obtenirResumeDiff(): string {
    return this.resumeDiff;
  }

  // Cette methode retourne la version metier courante de la migration.
  public obtenirVersion(): number {
    return this.version;
  }

  // Cette methode retourne les differences detectees entre les versions.
  public obtenirLignesDiffMigration(): LigneDiffMigration[] {
    return [...this.lignesDiffMigration];
  }

  // Cette methode retourne les transformations de notes associees.
  public obtenirTransformationsNotes(): TransformationNote[] {
    return [...this.transformationsNotes];
  }

  // Cette methode lance l'analyse de migration.
  public lancerAnalyse(): void {
    if (this.statut !== StatutMigrationReferentiel.BROUILLON) {
      throw new ValidationError(
        'Seule une migration brouillon peut lancer son analyse.',
        'MIGRATION_REFERENTIEL_ANALYSE_INTERDITE',
      );
    }

    this.statut = StatutMigrationReferentiel.ANALYSEE;
    this.version += 1;
  }

  // Cette methode enregistre les differences detectees entre les deux versions.
  public detecterDifferences(differences: LigneDiffMigration[], resumeDiff?: string): void {
    if (
      this.statut !== StatutMigrationReferentiel.BROUILLON
      && this.statut !== StatutMigrationReferentiel.ANALYSEE
    ) {
      throw new ValidationError(
        'Les differences ne peuvent etre detectees que sur une migration non terminale.',
        'MIGRATION_REFERENTIEL_DIFF_INTERDITE',
      );
    }

    this.lignesDiffMigration = this.validerLignesDiffMigration(differences);
    this.resumeDiff = this.validerResumeDiff(
      resumeDiff ?? `Differences detectees: ${this.lignesDiffMigration.length}`,
      false,
    );
    this.version += 1;
  }

  // Cette methode attache les transformations de notes produites par la migration.
  public convertirNotes(transformationsNotes: TransformationNote[]): void {
    if (this.statut !== StatutMigrationReferentiel.ANALYSEE) {
      throw new ValidationError(
        'Les notes ne peuvent etre converties qu apres analyse.',
        'MIGRATION_REFERENTIEL_CONVERSION_INTERDITE',
      );
    }

    this.transformationsNotes = this.validerTransformationsNotes(transformationsNotes);
    this.version += 1;
  }

  // Cette methode trace un recalcul metier apres analyse ou conversion.
  public recalculer(): void {
    if (this.statut !== StatutMigrationReferentiel.ANALYSEE) {
      throw new ValidationError(
        'Le recalcul n est possible que pour une migration analysee.',
        'MIGRATION_REFERENTIEL_RECALCUL_INTERDIT',
      );
    }

    this.version += 1;
  }

  // Cette methode applique la migration analysee.
  public appliquerMigration(): void {
    if (this.statut !== StatutMigrationReferentiel.ANALYSEE) {
      throw new ValidationError(
        'Seule une migration analysee peut etre appliquee.',
        'MIGRATION_REFERENTIEL_APPLICATION_INTERDITE',
      );
    }

    this.statut = StatutMigrationReferentiel.APPLIQUEE;
    this.version += 1;
  }

  // Cette methode cloture une migration deja appliquee.
  public cloturerMigration(): void {
    if (this.statut !== StatutMigrationReferentiel.APPLIQUEE) {
      throw new ValidationError(
        'Seule une migration appliquee peut etre cloturee.',
        'MIGRATION_REFERENTIEL_CLOTURE_INTERDITE',
      );
    }
  }

  // Cette methode annule une migration non appliquee.
  public annulerMigration(): void {
    if (this.statut === StatutMigrationReferentiel.APPLIQUEE) {
      throw new ValidationError(
        'Une migration deja appliquee ne peut plus etre annulee.',
        'MIGRATION_REFERENTIEL_ANNULATION_INTERDITE',
      );
    }

    this.statut = StatutMigrationReferentiel.ANNULEE;
    this.version += 1;
  }

  private validerProgrammeNiveauId(valeur: ProgrammeNiveauId): ProgrammeNiveauId {
    if (!(valeur instanceof ProgrammeNiveauId)) {
      throw new ValidationError(
        "L'identifiant de programme niveau est obligatoire.",
        'MIGRATION_REFERENTIEL_PROGRAMME_NIVEAU_INVALIDE',
      );
    }

    return valeur;
  }

  private validerVersionReferentielId(
    valeur: VersionReferentielProgrammeId,
    nomChamp: string,
  ): VersionReferentielProgrammeId {
    if (!(valeur instanceof VersionReferentielProgrammeId)) {
      throw new ValidationError(
        `Le champ "${nomChamp}" doit etre un identifiant de version valide.`,
        'MIGRATION_REFERENTIEL_VERSION_INVALIDE',
      );
    }

    return valeur;
  }

  private validerVersionsDistinctes(
    ancienneVersionReferentiel: VersionReferentielProgrammeId,
    nouvelleVersionReferentiel: VersionReferentielProgrammeId,
  ): void {
    if (ancienneVersionReferentiel.estEgal(nouvelleVersionReferentiel)) {
      throw new ValidationError(
        'Une migration doit comparer deux versions distinctes.',
        'MIGRATION_REFERENTIEL_VERSIONS_IDENTIQUES',
      );
    }
  }

  private validerDate(valeur: Date, nomChamp: string): Date {
    if (!(valeur instanceof Date) || Number.isNaN(valeur.getTime())) {
      throw new ValidationError(
        `Le champ "${nomChamp}" doit etre une date valide.`,
        'MIGRATION_REFERENTIEL_DATE_INVALIDE',
      );
    }

    return new Date(valeur.getTime());
  }

  private validerStatut(valeur: StatutMigrationReferentiel): StatutMigrationReferentiel {
    if (!Object.values(StatutMigrationReferentiel).includes(valeur)) {
      throw new ValidationError(
        'Le statut de migration doit etre valide.',
        'MIGRATION_REFERENTIEL_STATUT_INVALIDE',
      );
    }

    return valeur;
  }

  private validerResumeDiff(valeur: string, autoriserVide: boolean): string {
    const valeurNettoyee = valeur.trim();

    if (!autoriserVide && valeurNettoyee.length === 0) {
      throw new ValidationError(
        'Le resume des differences est obligatoire.',
        'MIGRATION_REFERENTIEL_RESUME_DIFF_INVALIDE',
      );
    }

    return valeurNettoyee;
  }

  private validerLignesDiffMigration(valeur: LigneDiffMigration[]): LigneDiffMigration[] {
    if (!Array.isArray(valeur)) {
      throw new ValidationError(
        'Les lignes de diff doivent etre fournies sous forme de tableau.',
        'MIGRATION_REFERENTIEL_DIFF_INVALIDES',
      );
    }

    for (const ligne of valeur) {
      if (!(ligne instanceof LigneDiffMigration)) {
        throw new ValidationError(
          'Chaque difference doit etre une LigneDiffMigration valide.',
          'MIGRATION_REFERENTIEL_DIFF_INVALIDE',
        );
      }
    }

    return [...valeur];
  }

  private validerTransformationsNotes(valeur: TransformationNote[]): TransformationNote[] {
    if (!Array.isArray(valeur)) {
      throw new ValidationError(
        'Les transformations de notes doivent etre fournies sous forme de tableau.',
        'MIGRATION_REFERENTIEL_TRANSFORMATIONS_INVALIDES',
      );
    }

    for (const transformation of valeur) {
      if (!(transformation instanceof TransformationNote)) {
        throw new ValidationError(
          'Chaque transformation doit etre une TransformationNote valide.',
          'MIGRATION_REFERENTIEL_TRANSFORMATION_INVALIDE',
        );
      }
    }

    return [...valeur];
  }

  private validerTexteOptionnel(valeur?: string): string | undefined {
    if (valeur === undefined) {
      return undefined;
    }

    const valeurNettoyee = valeur.trim();

    return valeurNettoyee.length > 0 ? valeurNettoyee : undefined;
  }

  private validerVersion(valeur: number): number {
    if (!Number.isInteger(valeur) || valeur <= 0) {
      throw new ValidationError(
        'La version de migration doit etre un entier strictement positif.',
        'MIGRATION_REFERENTIEL_VERSION_METIER_INVALIDE',
      );
    }

    return valeur;
  }

  private verifierCoherenceEtat(): void {
    if (
      this.statut !== StatutMigrationReferentiel.BROUILLON
      && this.resumeDiff.length === 0
    ) {
      throw new ValidationError(
        'Une migration non brouillon doit porter un resume de differences.',
        'MIGRATION_REFERENTIEL_ETAT_INCOHERENT',
      );
    }
  }
}
