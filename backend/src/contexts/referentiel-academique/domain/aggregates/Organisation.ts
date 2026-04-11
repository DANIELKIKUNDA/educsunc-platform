import { RacineAgregat } from '../../../../shared/domain/AggregateRoot';
import { ValidationError } from '../../../../shared/exceptions/ValidationError';
import { OrganisationId } from '../value-objects/OrganisationId';
import { TypeOrganisation } from '../value-objects/TypeOrganisation';

// Cet agregat represente l'entite institutionnelle qui regroupe une ou plusieurs ecoles.
export class Organisation extends RacineAgregat<OrganisationId> {
  private code: string;
  private nom: string;
  private typeOrganisation: TypeOrganisation;
  private actif: boolean;
  private description?: string;
  private creeLe: Date;
  private creePar?: string;
  private modifieLe?: Date;
  private modifiePar?: string;
  private version: number;

  // Ce constructeur initialise une organisation en respectant les attributs du modele metier.
  constructor(
    id: OrganisationId,
    code: string,
    nom: string,
    typeOrganisation: TypeOrganisation,
    description?: string,
    creePar?: string,
    actif = true,
    creeLe: Date = new Date(),
    modifieLe?: Date,
    modifiePar?: string,
    version = 1,
  ) {
    super(id);

    this.code = this.validerTexteObligatoire(code, 'code');
    this.nom = this.validerTexteObligatoire(nom, 'nom');
    this.typeOrganisation = this.validerTypeOrganisation(typeOrganisation);
    this.description = this.validerTexteOptionnel(description);
    this.creeLe = this.validerDate(creeLe, 'creeLe');
    this.creePar = this.validerTexteOptionnel(creePar);
    this.modifieLe = this.validerDateOptionnelle(modifieLe, 'modifieLe');
    this.modifiePar = this.validerTexteOptionnel(modifiePar);
    this.actif = this.validerBooleen(actif, 'actif');
    this.version = this.validerVersion(version);
  }

  // Cette methode retourne le code fonctionnel de l'organisation.
  public obtenirCode(): string {
    return this.code;
  }

  // Cette methode retourne le nom courant de l'organisation.
  public obtenirNom(): string {
    return this.nom;
  }

  // Cette methode retourne la nature institutionnelle de l'organisation.
  public obtenirTypeOrganisation(): TypeOrganisation {
    return this.typeOrganisation;
  }

  // Cette methode indique si l'organisation est active.
  public estActif(): boolean {
    return this.actif;
  }

  // Cette methode retourne la description de l'organisation si elle existe.
  public obtenirDescription(): string | undefined {
    return this.description;
  }

  // Cette methode retourne la date de creation de l'organisation.
  public obtenirCreeLe(): Date {
    return new Date(this.creeLe.getTime());
  }

  // Cette methode retourne l'acteur qui a cree l'organisation si il existe.
  public obtenirCreePar(): string | undefined {
    return this.creePar;
  }

  // Cette methode retourne la date de derniere modification si elle existe.
  public obtenirModifieLe(): Date | undefined {
    return this.modifieLe === undefined ? undefined : new Date(this.modifieLe.getTime());
  }

  // Cette methode retourne l'acteur de derniere modification si il existe.
  public obtenirModifiePar(): string | undefined {
    return this.modifiePar;
  }

  // Cette methode retourne la version metier courante de l'agregat.
  public obtenirVersion(): number {
    return this.version;
  }

  // Cette methode renomme l'organisation.
  public renommer(nouveauNom: string, acteur?: string): void {
    this.nom = this.validerTexteObligatoire(nouveauNom, 'nom');
    this.marquerModification(acteur);
  }

  // Cette methode reactive une organisation precedemment desactivee.
  public activer(acteur?: string): void {
    this.actif = true;
    this.marquerModification(acteur);
  }

  // Cette methode desactive l'organisation tout en conservant son historique.
  public desactiver(acteur?: string): void {
    this.actif = false;
    this.marquerModification(acteur);
  }

  // Cette methode change le type d'organisation lorsque la politique metier l'autorise.
  public changerType(nouveauType: TypeOrganisation, acteur?: string): void {
    this.typeOrganisation = this.validerTypeOrganisation(nouveauType);
    this.marquerModification(acteur);
  }

  // Cette methode verifie qu'une organisation peut recevoir une nouvelle ecole.
  public verifierPeutRecevoirEcole(): void {
    if (!this.actif) {
      throw new ValidationError(
        "Une organisation inactive ne peut pas recevoir de nouvelle ecole.",
        'ORGANISATION_INACTIVE',
      );
    }
  }

  private validerTexteObligatoire(valeur: string, nomChamp: string): string {
    const valeurNettoyee = valeur.trim();

    if (valeurNettoyee.length === 0) {
      throw new ValidationError(
        `Le champ "${nomChamp}" est obligatoire.`,
        'ORGANISATION_TEXTE_INVALIDE',
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

  private validerTypeOrganisation(valeur: TypeOrganisation): TypeOrganisation {
    if (!Object.values(TypeOrganisation).includes(valeur)) {
      throw new ValidationError(
        "Le type d'organisation doit etre valide.",
        'ORGANISATION_TYPE_INVALIDE',
      );
    }

    return valeur;
  }

  private validerDate(valeur: Date, nomChamp: string): Date {
    if (!(valeur instanceof Date) || Number.isNaN(valeur.getTime())) {
      throw new ValidationError(
        `Le champ "${nomChamp}" doit etre une date valide.`,
        'ORGANISATION_DATE_INVALIDE',
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

  private validerBooleen(valeur: boolean, nomChamp: string): boolean {
    if (typeof valeur !== 'boolean') {
      throw new ValidationError(
        `Le champ "${nomChamp}" doit etre un booleen.`,
        'ORGANISATION_BOOLEEN_INVALIDE',
      );
    }

    return valeur;
  }

  private validerVersion(valeur: number): number {
    if (!Number.isInteger(valeur) || valeur <= 0) {
      throw new ValidationError(
        'La version de l organisation doit etre un entier strictement positif.',
        'ORGANISATION_VERSION_INVALIDE',
      );
    }

    return valeur;
  }

  private marquerModification(acteur?: string): void {
    this.modifieLe = new Date();
    this.modifiePar = this.validerTexteOptionnel(acteur);
    this.version += 1;
  }
}
