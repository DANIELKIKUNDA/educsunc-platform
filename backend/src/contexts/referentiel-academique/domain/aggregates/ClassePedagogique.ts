import { RacineAgregat } from '../../../../shared/domain/AggregateRoot';
import { ValidationError } from '../../../../shared/exceptions/ValidationError';
import { AnneeScolaireId } from '../value-objects/AnneeScolaireId';
import { ClasseAcademiqueId } from '../value-objects/ClasseAcademiqueId';
import { ClassePedagogiqueId } from '../value-objects/ClassePedagogiqueId';
import { EcoleId } from '../value-objects/EcoleId';

// Cet agregat represente la classe reelle ouverte dans une ecole pour une annee scolaire donnee.
export class ClassePedagogique extends RacineAgregat<ClassePedagogiqueId> {
  private ecoleId: EcoleId;
  private anneeScolaireId: AnneeScolaireId;
  private classeAcademiqueId: ClasseAcademiqueId;
  private suffixeParallele?: string;
  private code: string;
  private libelle: string;
  private capaciteAccueil?: number;
  private active: boolean;
  private archiveLe?: Date;
  private creeLe: Date;
  private modifieLe?: Date;
  private version: number;

  // Ce constructeur initialise une classe pedagogique locale et en valide la coherence minimale.
  constructor(
    id: ClassePedagogiqueId,
    ecoleId: EcoleId,
    anneeScolaireId: AnneeScolaireId,
    classeAcademiqueId: ClasseAcademiqueId,
    code: string,
    libelle: string,
    suffixeParallele?: string,
    capaciteAccueil?: number,
    active = true,
    archiveLe?: Date,
    creeLe: Date = new Date(),
    modifieLe?: Date,
    version = 1,
  ) {
    super(id);

    this.ecoleId = this.validerEcoleId(ecoleId);
    this.anneeScolaireId = this.validerAnneeScolaireId(anneeScolaireId);
    this.classeAcademiqueId = this.validerClasseAcademiqueId(classeAcademiqueId);
    this.suffixeParallele = this.validerSuffixeParallele(suffixeParallele);
    this.code = this.validerTexteObligatoire(code, 'code');
    this.libelle = this.validerTexteObligatoire(libelle, 'libelle');
    this.capaciteAccueil = this.validerCapaciteOptionnelle(capaciteAccueil);
    this.active = this.validerBooleen(active, 'active');
    this.archiveLe = this.validerDateOptionnelle(archiveLe, 'archiveLe');
    this.creeLe = this.validerDate(creeLe, 'creeLe');
    this.modifieLe = this.validerDateOptionnelle(modifieLe, 'modifieLe');
    this.version = this.validerVersion(version);
    this.verifierCoherenceSuffixeParallele();
    this.validerEtatArchivage();
  }

  // Cette methode retourne l'ecole de rattachement de la classe pedagogique.
  public obtenirEcoleId(): EcoleId {
    return this.ecoleId;
  }

  // Cette methode retourne l'annee scolaire de rattachement.
  public obtenirAnneeScolaireId(): AnneeScolaireId {
    return this.anneeScolaireId;
  }

  // Cette methode retourne la classe academique de rattachement.
  public obtenirClasseAcademiqueId(): ClasseAcademiqueId {
    return this.classeAcademiqueId;
  }

  // Cette methode retourne le suffixe parallele si il existe.
  public obtenirSuffixeParallele(): string | undefined {
    return this.suffixeParallele;
  }

  // Cette methode retourne le code local de la classe pedagogique.
  public obtenirCode(): string {
    return this.code;
  }

  // Cette methode retourne le libelle de la classe pedagogique.
  public obtenirLibelle(): string {
    return this.libelle;
  }

  // Cette methode retourne la capacite d'accueil si elle existe.
  public obtenirCapaciteAccueil(): number | undefined {
    return this.capaciteAccueil;
  }

  // Cette methode indique si la classe pedagogique est active.
  public estActive(): boolean {
    return this.active;
  }

  // Cette methode retourne la date d'archivage si elle existe.
  public obtenirArchiveLe(): Date | undefined {
    return this.archiveLe === undefined ? undefined : new Date(this.archiveLe.getTime());
  }

  // Cette methode retourne la date de creation de la classe pedagogique.
  public obtenirCreeLe(): Date {
    return new Date(this.creeLe.getTime());
  }

  // Cette methode retourne la date de derniere modification si elle existe.
  public obtenirModifieLe(): Date | undefined {
    return this.modifieLe === undefined ? undefined : new Date(this.modifieLe.getTime());
  }

  // Cette methode retourne la version metier courante de la classe pedagogique.
  public obtenirVersion(): number {
    return this.version;
  }

  // Cette methode renomme la classe pedagogique.
  public renommer(nouveauLibelle: string): void {
    this.libelle = this.validerTexteObligatoire(nouveauLibelle, 'libelle');
    this.marquerModification();
  }

  // Cette methode active la classe pedagogique.
  public activer(): void {
    if (this.archiveLe !== undefined) {
      throw new ValidationError(
        'Une classe archivee ne peut pas etre reactivee.',
        'CLASSE_PEDAGOGIQUE_ARCHIVEE',
      );
    }

    this.active = true;
    this.marquerModification();
  }

  // Cette methode desactive la classe pedagogique.
  public desactiver(): void {
    this.active = false;
    this.marquerModification();
  }

  // Cette methode archive definitivement la classe pedagogique.
  public archiver(): void {
    if (this.archiveLe !== undefined) {
      throw new ValidationError(
        'La classe pedagogique est deja archivee.',
        'CLASSE_PEDAGOGIQUE_DEJA_ARCHIVEE',
      );
    }

    this.active = false;
    this.archiveLe = new Date();
    this.marquerModification();
  }

  // Cette methode verifie la coherence du suffixe parallele lorsqu'il existe.
  public verifierCoherenceSuffixeParallele(): void {
    if (this.suffixeParallele === undefined) {
      return;
    }

    if (!/^[A-Z0-9]+$/i.test(this.suffixeParallele)) {
      throw new ValidationError(
        'Le suffixe parallele doit etre alphanumerique.',
        'CLASSE_PEDAGOGIQUE_SUFFIXE_INVALIDE',
      );
    }
  }

  // Cette methode verifie que la classe pedagogique reference une annee effectivement active.
  public verifierCoherenceAvecAnneeActive(estAnneeActive: boolean): void {
    if (!estAnneeActive) {
      throw new ValidationError(
        'La classe pedagogique doit etre rattachee a une annee scolaire active.',
        'CLASSE_PEDAGOGIQUE_ANNEE_INACTIVE',
      );
    }
  }

  private validerEcoleId(valeur: EcoleId): EcoleId {
    if (!(valeur instanceof EcoleId)) {
      throw new ValidationError(
        "L'identifiant d'ecole est obligatoire.",
        'CLASSE_PEDAGOGIQUE_ECOLE_INVALIDE',
      );
    }

    return valeur;
  }

  private validerAnneeScolaireId(valeur: AnneeScolaireId): AnneeScolaireId {
    if (!(valeur instanceof AnneeScolaireId)) {
      throw new ValidationError(
        "L'identifiant d'annee scolaire est obligatoire.",
        'CLASSE_PEDAGOGIQUE_ANNEE_INVALIDE',
      );
    }

    return valeur;
  }

  private validerClasseAcademiqueId(valeur: ClasseAcademiqueId): ClasseAcademiqueId {
    if (!(valeur instanceof ClasseAcademiqueId)) {
      throw new ValidationError(
        "L'identifiant de classe academique est obligatoire.",
        'CLASSE_PEDAGOGIQUE_CLASSE_ACADEMIQUE_INVALIDE',
      );
    }

    return valeur;
  }

  private validerSuffixeParallele(valeur?: string): string | undefined {
    if (valeur === undefined) {
      return undefined;
    }

    const valeurNettoyee = valeur.trim();

    if (valeurNettoyee.length === 0) {
      throw new ValidationError(
        'Le suffixe parallele ne peut pas etre vide.',
        'CLASSE_PEDAGOGIQUE_SUFFIXE_INVALIDE',
      );
    }

    return valeurNettoyee.toUpperCase();
  }

  private validerTexteObligatoire(valeur: string, nomChamp: string): string {
    const valeurNettoyee = valeur.trim();

    if (valeurNettoyee.length === 0) {
      throw new ValidationError(
        `Le champ "${nomChamp}" est obligatoire.`,
        'CLASSE_PEDAGOGIQUE_TEXTE_INVALIDE',
      );
    }

    return valeurNettoyee;
  }

  private validerCapaciteOptionnelle(valeur?: number): number | undefined {
    if (valeur === undefined) {
      return undefined;
    }

    if (!Number.isInteger(valeur) || valeur <= 0) {
      throw new ValidationError(
        "La capacite d'accueil doit etre un entier strictement positif.",
        'CLASSE_PEDAGOGIQUE_CAPACITE_INVALIDE',
      );
    }

    return valeur;
  }

  private validerBooleen(valeur: boolean, nomChamp: string): boolean {
    if (typeof valeur !== 'boolean') {
      throw new ValidationError(
        `Le champ "${nomChamp}" doit etre un booleen.`,
        'CLASSE_PEDAGOGIQUE_BOOLEEN_INVALIDE',
      );
    }

    return valeur;
  }

  private validerDate(valeur: Date, nomChamp: string): Date {
    if (!(valeur instanceof Date) || Number.isNaN(valeur.getTime())) {
      throw new ValidationError(
        `Le champ "${nomChamp}" doit etre une date valide.`,
        'CLASSE_PEDAGOGIQUE_DATE_INVALIDE',
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
        'La version de la classe pedagogique doit etre un entier strictement positif.',
        'CLASSE_PEDAGOGIQUE_VERSION_INVALIDE',
      );
    }

    return valeur;
  }

  private validerEtatArchivage(): void {
    if (this.archiveLe !== undefined && this.active) {
      throw new ValidationError(
        'Une classe archivee ne peut pas etre active.',
        'CLASSE_PEDAGOGIQUE_ARCHIVAGE_INCOHERENT',
      );
    }
  }

  private marquerModification(): void {
    this.modifieLe = new Date();
    this.version += 1;
  }
}
