import { RacineAgregat } from '../../../../shared/domain/AggregateRoot';
import { ValidationError } from '../../../../shared/exceptions/ValidationError';
import { LigneProgrammeNiveau } from '../entities/LigneProgrammeNiveau';
import { LigneReferentielProgramme } from '../entities/LigneReferentielProgramme';
import { AnneeScolaireId } from '../value-objects/AnneeScolaireId';
import { ClasseAcademiqueId } from '../value-objects/ClasseAcademiqueId';
import { EcoleId } from '../value-objects/EcoleId';
import { ProgrammeNiveauId } from '../value-objects/ProgrammeNiveauId';
import { ReferentielProgrammeId } from '../value-objects/ReferentielProgrammeId';
import { StatutProgrammeNiveau } from '../value-objects/StatutProgrammeNiveau';
import { TypeStructureEvaluation } from '../value-objects/TypeStructureEvaluation';
import { VersionReferentielProgrammeId } from '../value-objects/VersionReferentielProgrammeId';

// Cette interface represente l'etat local exploitable d'un programme de niveau.
export interface EtatLocalProgrammeNiveau {
  statut: StatutProgrammeNiveau;
  lignes: LigneProgrammeNiveau[];
  nombreLignesActivesDansEcole: number;
  nombreLignesNonCalculables: number;
  nombreLignesObsoletes: number;
}

// Cet agregat represente l'instance locale d'exploitation d'un programme officiel dans une ecole.
export class ProgrammeNiveau extends RacineAgregat<ProgrammeNiveauId> {
  private ecoleId: EcoleId;
  private anneeScolaireId: AnneeScolaireId;
  private classeAcademiqueId: ClasseAcademiqueId;
  private referentielProgrammeId: ReferentielProgrammeId;
  private versionReferentielProgrammeId: VersionReferentielProgrammeId;
  private statut: StatutProgrammeNiveau;
  private creeLe: Date;
  private creePar?: string;
  private valideLe?: Date;
  private validePar?: string;
  private archiveLe?: Date;
  private version: number;
  private lignes: LigneProgrammeNiveau[];

  // Ce constructeur initialise un programme local et ses lignes d'exploitation.
  constructor(
    id: ProgrammeNiveauId,
    ecoleId: EcoleId,
    anneeScolaireId: AnneeScolaireId,
    classeAcademiqueId: ClasseAcademiqueId,
    referentielProgrammeId: ReferentielProgrammeId,
    versionReferentielProgrammeId: VersionReferentielProgrammeId,
    statut: StatutProgrammeNiveau = StatutProgrammeNiveau.BROUILLON,
    lignes: LigneProgrammeNiveau[] = [],
    creePar?: string,
    valideLe?: Date,
    validePar?: string,
    archiveLe?: Date,
    creeLe: Date = new Date(),
    version = 1,
  ) {
    super(id);

    this.ecoleId = this.validerEcoleId(ecoleId);
    this.anneeScolaireId = this.validerAnneeScolaireId(anneeScolaireId);
    this.classeAcademiqueId = this.validerClasseAcademiqueId(classeAcademiqueId);
    this.referentielProgrammeId = this.validerReferentielProgrammeId(referentielProgrammeId);
    this.versionReferentielProgrammeId = this.validerVersionReferentielProgrammeId(
      versionReferentielProgrammeId,
    );
    this.statut = this.validerStatut(statut);
    this.lignes = this.validerLignes(lignes);
    this.creePar = this.validerTexteOptionnel(creePar);
    this.valideLe = this.validerDateOptionnelle(valideLe, 'valideLe');
    this.validePar = this.validerTexteOptionnel(validePar);
    this.archiveLe = this.validerDateOptionnelle(archiveLe, 'archiveLe');
    this.creeLe = this.validerDate(creeLe, 'creeLe');
    this.version = this.validerVersion(version);
    this.verifierCoherenceEtat();
  }

  // Cette methode retourne l'ecole de rattachement du programme local.
  public obtenirEcoleId(): EcoleId {
    return this.ecoleId;
  }

  // Cette methode retourne l'annee scolaire de rattachement.
  public obtenirAnneeScolaireId(): AnneeScolaireId {
    return this.anneeScolaireId;
  }

  // Cette methode retourne la classe academique ciblee.
  public obtenirClasseAcademiqueId(): ClasseAcademiqueId {
    return this.classeAcademiqueId;
  }

  // Cette methode retourne le referentiel programme source.
  public obtenirReferentielProgrammeId(): ReferentielProgrammeId {
    return this.referentielProgrammeId;
  }

  // Cette methode retourne la version officielle de referentiel utilisee.
  public obtenirVersionReferentielProgrammeId(): VersionReferentielProgrammeId {
    return this.versionReferentielProgrammeId;
  }

  // Cette methode retourne le statut courant du programme local.
  public obtenirStatut(): StatutProgrammeNiveau {
    return this.statut;
  }

  // Cette methode retourne la date de creation du programme local.
  public obtenirCreeLe(): Date {
    return new Date(this.creeLe.getTime());
  }

  // Cette methode retourne l'acteur de creation si il existe.
  public obtenirCreePar(): string | undefined {
    return this.creePar;
  }

  // Cette methode retourne la date de validation si elle existe.
  public obtenirValideLe(): Date | undefined {
    return this.valideLe === undefined ? undefined : new Date(this.valideLe.getTime());
  }

  // Cette methode retourne l'acteur de validation si il existe.
  public obtenirValidePar(): string | undefined {
    return this.validePar;
  }

  // Cette methode retourne la date d'archivage si elle existe.
  public obtenirArchiveLe(): Date | undefined {
    return this.archiveLe === undefined ? undefined : new Date(this.archiveLe.getTime());
  }

  // Cette methode retourne la version metier courante du programme local.
  public obtenirVersion(): number {
    return this.version;
  }

  // Cette methode retourne les lignes locales du programme.
  public obtenirLignes(): LigneProgrammeNiveau[] {
    return [...this.lignes];
  }

  // Cette methode initialise les lignes locales a partir du referentiel officiel.
  public initialiserDepuisReferentiel(lignesReferentiel: LigneReferentielProgramme[]): void {
    if (this.statut !== StatutProgrammeNiveau.BROUILLON) {
      throw new ValidationError(
        'Seul un programme brouillon peut etre initialise depuis le referentiel.',
        'PROGRAMME_NIVEAU_INITIALISATION_INTERDITE',
      );
    }

    this.lignes = lignesReferentiel.map((ligne) => LigneProgrammeNiveau.depuisLigneReferentielProgramme(ligne));
    this.verifierCoherenceLocale();
    this.version += 1;
  }

  // Cette methode valide le programme local pour exploitation.
  public valider(validePar?: string): void {
    if (this.statut !== StatutProgrammeNiveau.BROUILLON) {
      throw new ValidationError(
        'Seul un programme brouillon peut etre valide.',
        'PROGRAMME_NIVEAU_VALIDATION_INTERDITE',
      );
    }

    if (this.lignes.length === 0) {
      throw new ValidationError(
        'Un programme niveau ne peut pas etre valide sans lignes.',
        'PROGRAMME_NIVEAU_SANS_LIGNE',
      );
    }

    this.statut = StatutProgrammeNiveau.VALIDE;
    this.valideLe = new Date();
    this.validePar = this.validerTexteOptionnel(validePar);
    this.version += 1;
  }

  // Cette methode archive un programme local valide.
  public archiver(): void {
    if (this.statut !== StatutProgrammeNiveau.VALIDE) {
      throw new ValidationError(
        'Seul un programme valide peut etre archive.',
        'PROGRAMME_NIVEAU_ARCHIVAGE_INTERDIT',
      );
    }

    this.statut = StatutProgrammeNiveau.ARCHIVE;
    this.archiveLe = new Date();
    this.version += 1;
  }

  // Cette methode rattache le programme local a une nouvelle version officielle.
  public migrerVersNouvelleVersion(
    referentielProgrammeId: ReferentielProgrammeId,
    versionReferentielProgrammeId: VersionReferentielProgrammeId,
    lignes: LigneProgrammeNiveau[],
  ): void {
    if (this.statut === StatutProgrammeNiveau.ARCHIVE) {
      throw new ValidationError(
        'Un programme archive ne peut pas etre migre.',
        'PROGRAMME_NIVEAU_MIGRATION_INTERDITE',
      );
    }

    this.referentielProgrammeId = this.validerReferentielProgrammeId(referentielProgrammeId);
    this.versionReferentielProgrammeId = this.validerVersionReferentielProgrammeId(
      versionReferentielProgrammeId,
    );
    this.lignes = this.validerLignes(lignes);
    this.verifierCoherenceLocale();
    this.version += 1;
  }

  // Cette methode produit un etat local synthétique du programme.
  public produireEtatLocal(): EtatLocalProgrammeNiveau {
    return {
      statut: this.statut,
      lignes: [...this.lignes],
      nombreLignesActivesDansEcole: this.lignes.filter((ligne) => ligne.estActiveDansEcole()).length,
      nombreLignesNonCalculables: this.lignes.filter((ligne) => !ligne.estCalculableDansProgramme()).length,
      nombreLignesObsoletes: this.lignes.filter((ligne) => ligne.estObsolete()).length,
    };
  }

  // Cette methode verifie la coherence locale des lignes du programme.
  public verifierCoherenceLocale(typeStructureEvaluation?: TypeStructureEvaluation): void {
    const coursRencontres = new Set<string>();

    for (const ligne of this.lignes) {
      const idCours = ligne.obtenirReferentielCoursId().obtenirValeur();

      if (coursRencontres.has(idCours)) {
        throw new ValidationError(
          'Une seule ligne locale par cours est autorisee dans un programme de niveau.',
          'PROGRAMME_NIVEAU_COURS_DUPLIQUE',
        );
      }

      coursRencontres.add(idCours);

      if (typeStructureEvaluation !== undefined) {
        ligne.verifierCompatibiliteAvecStructure(typeStructureEvaluation);
      }
    }
  }

  private validerEcoleId(valeur: EcoleId): EcoleId {
    if (!(valeur instanceof EcoleId)) {
      throw new ValidationError(
        "L'identifiant d'ecole est obligatoire.",
        'PROGRAMME_NIVEAU_ECOLE_INVALIDE',
      );
    }

    return valeur;
  }

  private validerAnneeScolaireId(valeur: AnneeScolaireId): AnneeScolaireId {
    if (!(valeur instanceof AnneeScolaireId)) {
      throw new ValidationError(
        "L'identifiant d'annee scolaire est obligatoire.",
        'PROGRAMME_NIVEAU_ANNEE_SCOLAIRE_INVALIDE',
      );
    }

    return valeur;
  }

  private validerClasseAcademiqueId(valeur: ClasseAcademiqueId): ClasseAcademiqueId {
    if (!(valeur instanceof ClasseAcademiqueId)) {
      throw new ValidationError(
        "L'identifiant de classe academique est obligatoire.",
        'PROGRAMME_NIVEAU_CLASSE_ACADEMIQUE_INVALIDE',
      );
    }

    return valeur;
  }

  private validerReferentielProgrammeId(valeur: ReferentielProgrammeId): ReferentielProgrammeId {
    if (!(valeur instanceof ReferentielProgrammeId)) {
      throw new ValidationError(
        "L'identifiant de referentiel programme est obligatoire.",
        'PROGRAMME_NIVEAU_REFERENTIEL_PROGRAMME_INVALIDE',
      );
    }

    return valeur;
  }

  private validerVersionReferentielProgrammeId(
    valeur: VersionReferentielProgrammeId,
  ): VersionReferentielProgrammeId {
    if (!(valeur instanceof VersionReferentielProgrammeId)) {
      throw new ValidationError(
        "L'identifiant de version de referentiel programme est obligatoire.",
        'PROGRAMME_NIVEAU_VERSION_REFERENTIEL_INVALIDE',
      );
    }

    return valeur;
  }

  private validerStatut(valeur: StatutProgrammeNiveau): StatutProgrammeNiveau {
    if (!Object.values(StatutProgrammeNiveau).includes(valeur)) {
      throw new ValidationError(
        'Le statut du programme niveau doit etre valide.',
        'PROGRAMME_NIVEAU_STATUT_INVALIDE',
      );
    }

    return valeur;
  }

  private validerLignes(valeur: LigneProgrammeNiveau[]): LigneProgrammeNiveau[] {
    if (!Array.isArray(valeur)) {
      throw new ValidationError(
        'Les lignes locales doivent etre fournies sous forme de tableau.',
        'PROGRAMME_NIVEAU_LIGNES_INVALIDES',
      );
    }

    for (const ligne of valeur) {
      if (!(ligne instanceof LigneProgrammeNiveau)) {
        throw new ValidationError(
          'Chaque ligne locale doit etre une LigneProgrammeNiveau valide.',
          'PROGRAMME_NIVEAU_LIGNE_INVALIDE',
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

  private validerDate(valeur: Date, nomChamp: string): Date {
    if (!(valeur instanceof Date) || Number.isNaN(valeur.getTime())) {
      throw new ValidationError(
        `Le champ "${nomChamp}" doit etre une date valide.`,
        'PROGRAMME_NIVEAU_DATE_INVALIDE',
      );
    }

    return new Date(valeur.getTime());
  }

  private validerDateOptionnelle(valeur: Date | undefined, nomChamp: string): Date | undefined {
    if (valeur === undefined) {
      return undefined;
    }

    return this.validerDate(valeur, nomChamp);
  }

  private validerVersion(valeur: number): number {
    if (!Number.isInteger(valeur) || valeur <= 0) {
      throw new ValidationError(
        'La version du programme niveau doit etre un entier strictement positif.',
        'PROGRAMME_NIVEAU_VERSION_INVALIDE',
      );
    }

    return valeur;
  }

  private verifierCoherenceEtat(): void {
    if (this.statut === StatutProgrammeNiveau.VALIDE && this.valideLe === undefined) {
      throw new ValidationError(
        'Un programme valide doit avoir une date de validation.',
        'PROGRAMME_NIVEAU_VALIDATION_OBLIGATOIRE',
      );
    }

    if (this.statut === StatutProgrammeNiveau.ARCHIVE && this.archiveLe === undefined) {
      throw new ValidationError(
        'Un programme archive doit avoir une date d archivage.',
        'PROGRAMME_NIVEAU_ARCHIVAGE_OBLIGATOIRE',
      );
    }
  }
}
