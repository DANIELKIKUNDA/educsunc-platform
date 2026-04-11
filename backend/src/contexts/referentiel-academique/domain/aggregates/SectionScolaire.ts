import { RacineAgregat } from '../../../../shared/domain/AggregateRoot';
import { ValidationError } from '../../../../shared/exceptions/ValidationError';
import { SectionScolaireId } from '../value-objects/SectionScolaireId';

// Cet agregat represente un grand regroupement structurel du systeme educatif.
export class SectionScolaire extends RacineAgregat<SectionScolaireId> {
  private code: string;
  private libelle: string;
  private ordreAffichage: number;
  private active: boolean;
  private creeLe: Date;
  private modifieLe?: Date;
  private version: number;

  // Ce constructeur initialise une section scolaire globale du referentiel.
  constructor(
    id: SectionScolaireId,
    code: string,
    libelle: string,
    ordreAffichage: number,
    active = true,
    creeLe: Date = new Date(),
    modifieLe?: Date,
    version = 1,
  ) {
    super(id);

    this.code = this.validerTexteObligatoire(code, 'code');
    this.libelle = this.validerTexteObligatoire(libelle, 'libelle');
    this.ordreAffichage = this.validerOrdreAffichage(ordreAffichage);
    this.active = this.validerBooleen(active, 'active');
    this.creeLe = this.validerDate(creeLe, 'creeLe');
    this.modifieLe = this.validerDateOptionnelle(modifieLe, 'modifieLe');
    this.version = this.validerVersion(version);
  }

  // Cette methode retourne le code de la section.
  public obtenirCode(): string {
    return this.code;
  }

  // Cette methode retourne le libelle de la section.
  public obtenirLibelle(): string {
    return this.libelle;
  }

  // Cette methode retourne l'ordre d'affichage de la section.
  public obtenirOrdreAffichage(): number {
    return this.ordreAffichage;
  }

  // Cette methode indique si la section est active.
  public estActive(): boolean {
    return this.active;
  }

  // Cette methode retourne la date de creation de la section.
  public obtenirCreeLe(): Date {
    return new Date(this.creeLe.getTime());
  }

  // Cette methode retourne la date de derniere modification si elle existe.
  public obtenirModifieLe(): Date | undefined {
    return this.modifieLe === undefined ? undefined : new Date(this.modifieLe.getTime());
  }

  // Cette methode retourne la version metier courante de la section.
  public obtenirVersion(): number {
    return this.version;
  }

  // Cette methode renomme la section scolaire.
  public renommer(nouveauLibelle: string): void {
    this.libelle = this.validerTexteObligatoire(nouveauLibelle, 'libelle');
    this.marquerModification();
  }

  // Cette methode active la section scolaire.
  public activer(): void {
    this.active = true;
    this.marquerModification();
  }

  // Cette methode desactive la section scolaire.
  public desactiver(): void {
    this.active = false;
    this.marquerModification();
  }

  private validerTexteObligatoire(valeur: string, nomChamp: string): string {
    const valeurNettoyee = valeur.trim();

    if (valeurNettoyee.length === 0) {
      throw new ValidationError(
        `Le champ "${nomChamp}" est obligatoire.`,
        'SECTION_SCOLAIRE_TEXTE_INVALIDE',
      );
    }

    return valeurNettoyee;
  }

  private validerOrdreAffichage(valeur: number): number {
    if (!Number.isInteger(valeur) || valeur <= 0) {
      throw new ValidationError(
        "L'ordre d'affichage doit etre un entier strictement positif.",
        'SECTION_SCOLAIRE_ORDRE_INVALIDE',
      );
    }

    return valeur;
  }

  private validerBooleen(valeur: boolean, nomChamp: string): boolean {
    if (typeof valeur !== 'boolean') {
      throw new ValidationError(
        `Le champ "${nomChamp}" doit etre un booleen.`,
        'SECTION_SCOLAIRE_BOOLEEN_INVALIDE',
      );
    }

    return valeur;
  }

  private validerDate(valeur: Date, nomChamp: string): Date {
    if (!(valeur instanceof Date) || Number.isNaN(valeur.getTime())) {
      throw new ValidationError(
        `Le champ "${nomChamp}" doit etre une date valide.`,
        'SECTION_SCOLAIRE_DATE_INVALIDE',
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
        'La version de la section doit etre un entier strictement positif.',
        'SECTION_SCOLAIRE_VERSION_INVALIDE',
      );
    }

    return valeur;
  }

  private marquerModification(): void {
    this.modifieLe = new Date();
    this.version += 1;
  }
}
