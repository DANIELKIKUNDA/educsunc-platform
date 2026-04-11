import { RacineAgregat } from '../../../../shared/domain/AggregateRoot';
import { ValidationError } from '../../../../shared/exceptions/ValidationError';
import { ReferentielCoursId } from '../value-objects/ReferentielCoursId';

// Cet agregat represente un cours officiel du referentiel academique global.
export class ReferentielCours extends RacineAgregat<ReferentielCoursId> {
  private code: string;
  private libelle: string;
  private abreviation?: string;
  private domaine?: string;
  private sousDomaine?: string;
  private actif: boolean;
  private creeLe: Date;
  private modifieLe?: Date;
  private version: number;

  // Ce constructeur initialise un cours officiel et sa tracabilite minimale.
  constructor(
    id: ReferentielCoursId,
    code: string,
    libelle: string,
    abreviation?: string,
    domaine?: string,
    sousDomaine?: string,
    actif = true,
    creeLe: Date = new Date(),
    modifieLe?: Date,
    version = 1,
  ) {
    super(id);

    this.code = this.validerTexteObligatoire(code, 'code');
    this.libelle = this.validerTexteObligatoire(libelle, 'libelle');
    this.abreviation = this.validerTexteOptionnel(abreviation);
    this.domaine = this.validerTexteOptionnel(domaine);
    this.sousDomaine = this.validerTexteOptionnel(sousDomaine);
    this.actif = this.validerBooleen(actif, 'actif');
    this.creeLe = this.validerDate(creeLe, 'creeLe');
    this.modifieLe = this.validerDateOptionnelle(modifieLe, 'modifieLe');
    this.version = this.validerVersion(version);
    this.validerCoherenceDomaine();
  }

  // Cette methode charge un cours depuis un referentiel officiel.
  public static chargerDepuisReferentiel(
    id: ReferentielCoursId,
    code: string,
    libelle: string,
    abreviation?: string,
    domaine?: string,
    sousDomaine?: string,
    actif = true,
  ): ReferentielCours {
    return new ReferentielCours(id, code, libelle, abreviation, domaine, sousDomaine, actif);
  }

  // Cette methode retourne le code du cours officiel.
  public obtenirCode(): string {
    return this.code;
  }

  // Cette methode retourne le libelle du cours officiel.
  public obtenirLibelle(): string {
    return this.libelle;
  }

  // Cette methode retourne l'abreviation du cours si elle existe.
  public obtenirAbreviation(): string | undefined {
    return this.abreviation;
  }

  // Cette methode retourne le domaine du cours si il existe.
  public obtenirDomaine(): string | undefined {
    return this.domaine;
  }

  // Cette methode retourne le sous-domaine du cours si il existe.
  public obtenirSousDomaine(): string | undefined {
    return this.sousDomaine;
  }

  // Cette methode indique si le cours est actif.
  public estActif(): boolean {
    return this.actif;
  }

  // Cette methode retourne la date de creation du cours officiel.
  public obtenirCreeLe(): Date {
    return new Date(this.creeLe.getTime());
  }

  // Cette methode retourne la date de derniere modification si elle existe.
  public obtenirModifieLe(): Date | undefined {
    return this.modifieLe === undefined ? undefined : new Date(this.modifieLe.getTime());
  }

  // Cette methode retourne la version metier courante du cours.
  public obtenirVersion(): number {
    return this.version;
  }

  // Cette methode renomme le cours si la politique metier l'autorise.
  public renommer(nouveauLibelle: string): void {
    this.libelle = this.validerTexteObligatoire(nouveauLibelle, 'libelle');
    this.marquerModification();
  }

  // Cette methode reactive logiquement un cours officiel.
  public activer(): void {
    this.actif = true;
    this.marquerModification();
  }

  // Cette methode desactive logiquement un cours officiel.
  public desactiver(): void {
    this.actif = false;
    this.marquerModification();
  }

  // Cette methode versionne explicitement le cours lorsque la politique applicative le demande.
  public versionnerSiNecessaire(): void {
    this.marquerModification();
  }

  private validerTexteObligatoire(valeur: string, nomChamp: string): string {
    const valeurNettoyee = valeur.trim();

    if (valeurNettoyee.length === 0) {
      throw new ValidationError(
        `Le champ "${nomChamp}" est obligatoire.`,
        'REFERENTIEL_COURS_TEXTE_INVALIDE',
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

  private validerBooleen(valeur: boolean, nomChamp: string): boolean {
    if (typeof valeur !== 'boolean') {
      throw new ValidationError(
        `Le champ "${nomChamp}" doit etre un booleen.`,
        'REFERENTIEL_COURS_BOOLEEN_INVALIDE',
      );
    }

    return valeur;
  }

  private validerDate(valeur: Date, nomChamp: string): Date {
    if (!(valeur instanceof Date) || Number.isNaN(valeur.getTime())) {
      throw new ValidationError(
        `Le champ "${nomChamp}" doit etre une date valide.`,
        'REFERENTIEL_COURS_DATE_INVALIDE',
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
        'La version du cours officiel doit etre un entier strictement positif.',
        'REFERENTIEL_COURS_VERSION_INVALIDE',
      );
    }

    return valeur;
  }

  private validerCoherenceDomaine(): void {
    if (this.sousDomaine !== undefined && this.domaine === undefined) {
      throw new ValidationError(
        'Un sous-domaine ne peut pas etre renseigne sans domaine.',
        'REFERENTIEL_COURS_DOMAINE_INCOHERENT',
      );
    }
  }

  private marquerModification(): void {
    this.modifieLe = new Date();
    this.version += 1;
  }
}
