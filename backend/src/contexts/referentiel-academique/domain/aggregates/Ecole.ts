import { RacineAgregat } from '../../../../shared/domain/AggregateRoot';
import { ValidationError } from '../../../../shared/exceptions/ValidationError';
import { EcoleId } from '../value-objects/EcoleId';
import { ModeExploitation } from '../value-objects/ModeExploitation';
import { OrganisationId } from '../value-objects/OrganisationId';

// Cet agregat represente l'unite scolaire autonome qui sert de tenant operationnel dans le systeme.
export class Ecole extends RacineAgregat<EcoleId> {
  private organisationId: OrganisationId;
  private code: string;
  private nom: string;
  private sigle?: string;
  private modeExploitation: ModeExploitation;
  private actif: boolean;
  private adresse?: string;
  private telephone?: string;
  private email?: string;
  private provinceEducationnelle?: string;
  private ville?: string;
  private communeOuTerritoire?: string;
  private creeLe: Date;
  private creePar?: string;
  private modifieLe?: Date;
  private modifiePar?: string;
  private version: number;

  // Ce constructeur initialise l'ecole et ses metadonnees metier locales.
  constructor(
    id: EcoleId,
    organisationId: OrganisationId,
    code: string,
    nom: string,
    modeExploitation: ModeExploitation,
    sigle?: string,
    adresse?: string,
    telephone?: string,
    email?: string,
    provinceEducationnelle?: string,
    ville?: string,
    communeOuTerritoire?: string,
    creePar?: string,
    actif = true,
    creeLe: Date = new Date(),
    modifieLe?: Date,
    modifiePar?: string,
    version = 1,
  ) {
    super(id);

    this.organisationId = this.validerOrganisationId(organisationId);
    this.code = this.validerTexteObligatoire(code, 'code');
    this.nom = this.validerTexteObligatoire(nom, 'nom');
    this.sigle = this.validerTexteOptionnel(sigle);
    this.modeExploitation = this.validerModeExploitation(modeExploitation);
    this.actif = this.validerBooleen(actif, 'actif');
    this.adresse = this.validerTexteOptionnel(adresse);
    this.telephone = this.validerTexteOptionnel(telephone);
    this.email = this.validerEmailOptionnel(email);
    this.provinceEducationnelle = this.validerTexteOptionnel(provinceEducationnelle);
    this.ville = this.validerTexteOptionnel(ville);
    this.communeOuTerritoire = this.validerTexteOptionnel(communeOuTerritoire);
    this.creeLe = this.validerDate(creeLe, 'creeLe');
    this.creePar = this.validerTexteOptionnel(creePar);
    this.modifieLe = this.validerDateOptionnelle(modifieLe, 'modifieLe');
    this.modifiePar = this.validerTexteOptionnel(modifiePar);
    this.version = this.validerVersion(version);
  }

  // Cette methode retourne l'organisation de rattachement de l'ecole.
  public obtenirOrganisationId(): OrganisationId {
    return this.organisationId;
  }

  // Cette methode retourne le code metier de l'ecole.
  public obtenirCode(): string {
    return this.code;
  }

  // Cette methode retourne le nom courant de l'ecole.
  public obtenirNom(): string {
    return this.nom;
  }

  // Cette methode retourne le sigle de l'ecole si il existe.
  public obtenirSigle(): string | undefined {
    return this.sigle;
  }

  // Cette methode retourne le mode d'exploitation de l'ecole.
  public obtenirModeExploitation(): ModeExploitation {
    return this.modeExploitation;
  }

  // Cette methode indique si l'ecole est active.
  public estActif(): boolean {
    return this.actif;
  }

  // Cette methode retourne l'adresse de l'ecole si elle existe.
  public obtenirAdresse(): string | undefined {
    return this.adresse;
  }

  // Cette methode retourne le numero de telephone si il existe.
  public obtenirTelephone(): string | undefined {
    return this.telephone;
  }

  // Cette methode retourne l'email de l'ecole si il existe.
  public obtenirEmail(): string | undefined {
    return this.email;
  }

  // Cette methode retourne la province educationnelle si elle existe.
  public obtenirProvinceEducationnelle(): string | undefined {
    return this.provinceEducationnelle;
  }

  // Cette methode retourne la ville de l'ecole si elle existe.
  public obtenirVille(): string | undefined {
    return this.ville;
  }

  // Cette methode retourne la commune ou le territoire si il existe.
  public obtenirCommuneOuTerritoire(): string | undefined {
    return this.communeOuTerritoire;
  }

  // Cette methode met a jour les informations institutionnelles editables de l'ecole.
  public mettreAJourInformationsInstitutionnelles(
    informations: {
      sigle?: string;
      adresse?: string;
      telephone?: string;
      email?: string;
      provinceEducationnelle?: string;
      ville?: string;
      communeOuTerritoire?: string;
    },
    acteur?: string,
  ): void {
    this.sigle = this.validerTexteOptionnel(informations.sigle);
    this.adresse = this.validerTexteOptionnel(informations.adresse);
    this.telephone = this.validerTexteOptionnel(informations.telephone);
    this.email = this.validerEmailOptionnel(informations.email);
    this.provinceEducationnelle = this.validerTexteOptionnel(
      informations.provinceEducationnelle,
    );
    this.ville = this.validerTexteOptionnel(informations.ville);
    this.communeOuTerritoire = this.validerTexteOptionnel(
      informations.communeOuTerritoire,
    );
    this.marquerModification(acteur);
  }

  // Cette methode retourne la date de creation de l'ecole.
  public obtenirCreeLe(): Date {
    return new Date(this.creeLe.getTime());
  }

  // Cette methode retourne l'acteur qui a cree l'ecole si il existe.
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

  // Cette methode retourne la version metier courante de l'ecole.
  public obtenirVersion(): number {
    return this.version;
  }

  // Cette methode renomme l'ecole.
  public renommer(nouveauNom: string, acteur?: string): void {
    this.nom = this.validerTexteObligatoire(nouveauNom, 'nom');
    this.marquerModification(acteur);
  }

  // Cette methode change le mode d'exploitation de l'ecole.
  public changerModeExploitation(nouveauMode: ModeExploitation, acteur?: string): void {
    this.modeExploitation = this.validerModeExploitation(nouveauMode);
    this.marquerModification(acteur);
  }

  // Cette methode active l'ecole.
  public activer(acteur?: string): void {
    this.actif = true;
    this.marquerModification(acteur);
  }

  // Cette methode desactive l'ecole.
  public desactiver(acteur?: string): void {
    this.actif = false;
    this.marquerModification(acteur);
  }

  // Cette methode rattache l'ecole a une organisation.
  public rattacherOrganisation(organisationId: OrganisationId, acteur?: string): void {
    this.organisationId = this.validerOrganisationId(organisationId);
    this.marquerModification(acteur);
  }

  private validerOrganisationId(valeur: OrganisationId): OrganisationId {
    if (!(valeur instanceof OrganisationId)) {
      throw new ValidationError(
        "L'identifiant d'organisation est obligatoire.",
        'ECOLE_ORGANISATION_INVALIDE',
      );
    }

    return valeur;
  }

  private validerTexteObligatoire(valeur: string, nomChamp: string): string {
    const valeurNettoyee = valeur.trim();

    if (valeurNettoyee.length === 0) {
      throw new ValidationError(
        `Le champ "${nomChamp}" est obligatoire.`,
        'ECOLE_TEXTE_INVALIDE',
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

  private validerEmailOptionnel(valeur?: string): string | undefined {
    const valeurNettoyee = this.validerTexteOptionnel(valeur);

    if (valeurNettoyee === undefined) {
      return undefined;
    }

    if (!valeurNettoyee.includes('@')) {
      throw new ValidationError(
        "L'email de l'ecole doit etre valide.",
        'ECOLE_EMAIL_INVALIDE',
      );
    }

    return valeurNettoyee;
  }

  private validerModeExploitation(valeur: ModeExploitation): ModeExploitation {
    if (!Object.values(ModeExploitation).includes(valeur)) {
      throw new ValidationError(
        "Le mode d'exploitation doit etre valide.",
        'ECOLE_MODE_EXPLOITATION_INVALIDE',
      );
    }

    return valeur;
  }

  private validerBooleen(valeur: boolean, nomChamp: string): boolean {
    if (typeof valeur !== 'boolean') {
      throw new ValidationError(
        `Le champ "${nomChamp}" doit etre un booleen.`,
        'ECOLE_BOOLEEN_INVALIDE',
      );
    }

    return valeur;
  }

  private validerDate(valeur: Date, nomChamp: string): Date {
    if (!(valeur instanceof Date) || Number.isNaN(valeur.getTime())) {
      throw new ValidationError(
        `Le champ "${nomChamp}" doit etre une date valide.`,
        'ECOLE_DATE_INVALIDE',
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
        "La version de l'ecole doit etre un entier strictement positif.",
        'ECOLE_VERSION_INVALIDE',
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
