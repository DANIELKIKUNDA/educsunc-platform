import { RacineAgregat } from '../../../../shared/domain/AggregateRoot';
import { ValidationError } from '../../../../shared/exceptions/ValidationError';
import { OptionEtudeId } from '../value-objects/OptionEtudeId';
import { CodeOption } from '../value-objects/CodeOption';

export type CategorieTechniqueOption = 'GROUPE_1' | 'GROUPE_2';

// Cet agregat represente une filiere ou orientation academique exploitable dans le referentiel.
export class OptionEtude extends RacineAgregat<OptionEtudeId> {
  private code: CodeOption;
  private libelle: string;
  private typeOption?: string;
  private abreviation?: string;
  private active: boolean;
  private technique: boolean;
  private categorieTechnique: CategorieTechniqueOption | null;
  private ordreAffichage?: number;
  private creeLe: Date;
  private modifieLe?: Date;
  private version: number;

  // Ce constructeur initialise une option d'etude en conservant l'extension validee CodeOption.
  constructor(
    id: OptionEtudeId,
    code: CodeOption,
    libelle: string,
    typeOption?: string,
    ordreAffichage?: number,
    abreviation?: string,
    active = true,
    creeLe: Date = new Date(),
    modifieLe?: Date,
    version = 1,
    technique = false,
    categorieTechnique: CategorieTechniqueOption | null = null,
  ) {
    super(id);

    this.code = this.validerCode(code);
    this.libelle = this.validerTexteObligatoire(libelle, 'libelle');
    this.typeOption = this.validerTexteOptionnel(typeOption);
    this.abreviation = this.validerTexteOptionnel(abreviation);
    this.ordreAffichage = this.validerOrdreOptionnel(ordreAffichage);
    this.active = this.validerBooleen(active, 'active');
    this.technique = this.validerBooleen(technique, 'technique');
    this.categorieTechnique = this.validerCategorieTechnique(categorieTechnique);
    this.creeLe = this.validerDate(creeLe, 'creeLe');
    this.modifieLe = this.validerDateOptionnelle(modifieLe, 'modifieLe');
    this.version = this.validerVersion(version);
    this.verifierCoherenceTechnique();
  }

  // Cette methode retourne le code officiel encapsule de l'option.
  public obtenirCode(): CodeOption {
    return this.code;
  }

  // Cette methode retourne la valeur numerique du code d'option.
  public obtenirCodeNumerique(): number {
    return this.code.obtenirValeur();
  }

  // Cette methode retourne le libelle de l'option.
  public obtenirLibelle(): string {
    return this.libelle;
  }

  // Cette methode retourne le type d'option si il existe.
  public obtenirTypeOption(): string | undefined {
    return this.typeOption;
  }

  // Cette methode retourne l'abreviation officielle ou locale de l'option.
  public obtenirAbreviation(): string | undefined {
    return this.abreviation;
  }

  // Cette methode retourne l'ordre d'affichage si il existe.
  public obtenirOrdreAffichage(): number | undefined {
    return this.ordreAffichage;
  }

  // Cette methode indique si l'option est active.
  public estActive(): boolean {
    return this.active;
  }

  // Cette methode indique si l'option correspond a une filiere technique.
  public estTechnique(): boolean {
    return this.technique;
  }

  // Cette methode retourne la categorie technique de l'option si elle est technique.
  public obtenirCategorieTechnique(): CategorieTechniqueOption | null {
    return this.categorieTechnique;
  }

  // Cette methode retourne la date de creation de l'option.
  public obtenirCreeLe(): Date {
    return new Date(this.creeLe.getTime());
  }

  // Cette methode retourne la date de derniere modification si elle existe.
  public obtenirModifieLe(): Date | undefined {
    return this.modifieLe === undefined ? undefined : new Date(this.modifieLe.getTime());
  }

  // Cette methode retourne la version metier courante de l'option.
  public obtenirVersion(): number {
    return this.version;
  }

  // Cette methode renomme l'option d'etude.
  public renommer(nouveauLibelle: string): void {
    this.libelle = this.validerTexteObligatoire(nouveauLibelle, 'libelle');
    this.marquerModification();
  }

  // Cette methode active l'option d'etude.
  public activer(): void {
    this.active = true;
    this.marquerModification();
  }

  // Cette methode desactive l'option d'etude.
  public desactiver(): void {
    this.active = false;
    this.marquerModification();
  }

  private validerCode(valeur: CodeOption): CodeOption {
    if (!(valeur instanceof CodeOption)) {
      throw new ValidationError(
        "Le code officiel de l'option doit etre un CodeOption valide.",
        'OPTION_ETUDE_CODE_INVALIDE',
      );
    }

    return valeur;
  }

  private validerTexteObligatoire(valeur: string, nomChamp: string): string {
    const valeurNettoyee = valeur.trim();

    if (valeurNettoyee.length === 0) {
      throw new ValidationError(
        `Le champ "${nomChamp}" est obligatoire.`,
        'OPTION_ETUDE_TEXTE_INVALIDE',
      );
    }

    return valeurNettoyee;
  }

  private validerTexteOptionnel(valeur?: string): string | undefined {
    if (valeur === undefined) {
      return undefined;
    }

    const valeurNettoyee = valeur.trim();

    return valeurNettoyee.length > 0 ? valeurNettoyee : undefined;
  }

  private validerOrdreOptionnel(valeur?: number): number | undefined {
    if (valeur === undefined) {
      return undefined;
    }

    if (!Number.isInteger(valeur) || valeur <= 0) {
      throw new ValidationError(
        "L'ordre d'affichage doit etre un entier strictement positif.",
        'OPTION_ETUDE_ORDRE_INVALIDE',
      );
    }

    return valeur;
  }

  private validerBooleen(valeur: boolean, nomChamp: string): boolean {
    if (typeof valeur !== 'boolean') {
      throw new ValidationError(
        `Le champ "${nomChamp}" doit etre un booleen.`,
        'OPTION_ETUDE_BOOLEEN_INVALIDE',
      );
    }

    return valeur;
  }

  private validerCategorieTechnique(
    valeur: CategorieTechniqueOption | null,
  ): CategorieTechniqueOption | null {
    if (valeur === null) {
      return null;
    }

    if (valeur !== 'GROUPE_1' && valeur !== 'GROUPE_2') {
      throw new ValidationError(
        'La categorie technique doit etre GROUPE_1 ou GROUPE_2.',
        'OPTION_ETUDE_CATEGORIE_TECHNIQUE_INVALIDE',
      );
    }

    return valeur;
  }

  private verifierCoherenceTechnique(): void {
    if (!this.technique && this.categorieTechnique !== null) {
      throw new ValidationError(
        'Une option non technique ne doit pas avoir de categorie technique.',
        'OPTION_ETUDE_CATEGORIE_TECHNIQUE_INTERDITE',
      );
    }

    if (this.technique && this.categorieTechnique === null) {
      throw new ValidationError(
        'Une option technique doit avoir une categorie technique.',
        'OPTION_ETUDE_CATEGORIE_TECHNIQUE_OBLIGATOIRE',
      );
    }
  }

  private validerDate(valeur: Date, nomChamp: string): Date {
    if (!(valeur instanceof Date) || Number.isNaN(valeur.getTime())) {
      throw new ValidationError(
        `Le champ "${nomChamp}" doit etre une date valide.`,
        'OPTION_ETUDE_DATE_INVALIDE',
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
        "La version de l'option d'etude doit etre un entier strictement positif.",
        'OPTION_ETUDE_VERSION_INVALIDE',
      );
    }

    return valeur;
  }

  private marquerModification(): void {
    this.modifieLe = new Date();
    this.version += 1;
  }
}
