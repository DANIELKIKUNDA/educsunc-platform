import { ValidationError } from '../../../../shared/exceptions/ValidationError';

// Cette entite interne trace la conversion d'une note ancienne vers une nouvelle note.
export class TransformationNote {
  private idNote: string;
  private ancienneValeur: number;
  private nouvelleValeur: number;
  private ancienMaximum: number;
  private nouveauMaximum: number;
  private regleAppliquee: string;
  private dateTransformation: Date;

  // Ce constructeur initialise la transformation et verifie la regle de calcul verrouillee.
  constructor(
    idNote: string,
    ancienneValeur: number,
    nouvelleValeur: number,
    ancienMaximum: number,
    nouveauMaximum: number,
    regleAppliquee: string,
    dateTransformation: Date,
  ) {
    this.idNote = this.validerIdNote(idNote);
    this.ancienMaximum = this.validerMaximum(ancienMaximum, 'ancienMaximum');
    this.nouveauMaximum = this.validerMaximum(nouveauMaximum, 'nouveauMaximum');
    this.ancienneValeur = this.validerNote(ancienneValeur, this.ancienMaximum, 'ancienneValeur');
    this.nouvelleValeur = this.validerNote(nouvelleValeur, this.nouveauMaximum, 'nouvelleValeur');
    this.regleAppliquee = this.validerRegleAppliquee(regleAppliquee);
    this.dateTransformation = this.validerDateTransformation(dateTransformation);
    this.validerRegleVerrouillee();
  }

  // Cette methode cree une transformation en calculant automatiquement la nouvelle note.
  public static creerDepuisValeurAncienne(
    idNote: string,
    ancienneValeur: number,
    ancienMaximum: number,
    nouveauMaximum: number,
    regleAppliquee = 'arrondi((noteAncienne / maxAncien) * maxNouveau)',
    dateTransformation: Date = new Date(),
  ): TransformationNote {
    const valeurCalculee = Math.round((ancienneValeur / ancienMaximum) * nouveauMaximum);

    return new TransformationNote(
      idNote,
      ancienneValeur,
      valeurCalculee,
      ancienMaximum,
      nouveauMaximum,
      regleAppliquee,
      dateTransformation,
    );
  }

  // Cette methode retourne l'identifiant de la note transformee.
  public obtenirIdNote(): string {
    return this.idNote;
  }

  // Cette methode retourne l'ancienne valeur de la note.
  public obtenirAncienneValeur(): number {
    return this.ancienneValeur;
  }

  // Cette methode retourne la nouvelle valeur calculee.
  public obtenirNouvelleValeur(): number {
    return this.nouvelleValeur;
  }

  // Cette methode retourne l'ancien maximum de reference.
  public obtenirAncienMaximum(): number {
    return this.ancienMaximum;
  }

  // Cette methode retourne le nouveau maximum de reference.
  public obtenirNouveauMaximum(): number {
    return this.nouveauMaximum;
  }

  // Cette methode retourne la regle appliquee a la transformation.
  public obtenirRegleAppliquee(): string {
    return this.regleAppliquee;
  }

  // Cette methode retourne la date de transformation de la note.
  public obtenirDateTransformation(): Date {
    return new Date(this.dateTransformation.getTime());
  }

  // Cette methode valide l'identifiant de la note source.
  private validerIdNote(valeur: string): string {
    const valeurNettoyee = valeur.trim();

    if (valeurNettoyee.length === 0) {
      throw new ValidationError(
        "L'identifiant de note est obligatoire.",
        'TRANSFORMATION_NOTE_ID_INVALIDE',
      );
    }

    return valeurNettoyee;
  }

  // Cette methode valide un maximum de note.
  private validerMaximum(valeur: number, nomChamp: string): number {
    if (!Number.isInteger(valeur) || valeur <= 0) {
      throw new ValidationError(
        `Le champ "${nomChamp}" doit etre un entier strictement positif.`,
        'TRANSFORMATION_NOTE_MAXIMUM_INVALIDE',
      );
    }

    return valeur;
  }

  // Cette methode valide une valeur de note entiere dans ses bornes.
  private validerNote(valeur: number, maximum: number, nomChamp: string): number {
    if (!Number.isInteger(valeur) || valeur < 0 || valeur > maximum) {
      throw new ValidationError(
        `Le champ "${nomChamp}" doit etre un entier compris entre 0 et ${maximum}.`,
        'TRANSFORMATION_NOTE_VALEUR_INVALIDE',
      );
    }

    return valeur;
  }

  // Cette methode valide la regle textuelle de transformation.
  private validerRegleAppliquee(valeur: string): string {
    const valeurNettoyee = valeur.trim();

    if (valeurNettoyee.length === 0) {
      throw new ValidationError(
        'La regle appliquee est obligatoire.',
        'TRANSFORMATION_NOTE_REGLE_INVALIDE',
      );
    }

    return valeurNettoyee;
  }

  // Cette methode valide la date de transformation.
  private validerDateTransformation(valeur: Date): Date {
    if (!(valeur instanceof Date) || Number.isNaN(valeur.getTime())) {
      throw new ValidationError(
        'La date de transformation doit etre valide.',
        'TRANSFORMATION_NOTE_DATE_INVALIDE',
      );
    }

    return new Date(valeur.getTime());
  }

  // Cette methode controle la formule officielle de recalcul de note.
  private validerRegleVerrouillee(): void {
    const valeurAttendue = Math.round((this.ancienneValeur / this.ancienMaximum) * this.nouveauMaximum);

    if (this.nouvelleValeur !== valeurAttendue) {
      throw new ValidationError(
        'La nouvelle note ne respecte pas la formule de transformation officielle.',
        'TRANSFORMATION_NOTE_FORMULE_INVALIDE',
      );
    }
  }
}
