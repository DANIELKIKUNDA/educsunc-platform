import { Entite } from '../../../../shared/domain/Entity';
import { ValidationError } from '../../../../shared/exceptions/ValidationError';
import { PeriodeCalendrierId } from '../value-objects/PeriodeCalendrierId';
import { TypePeriodeCalendrier } from '../value-objects/TypePeriodeCalendrier';

// Cette entite represente une periode ou un examen dans le calendrier academique.
export class PeriodeCalendrier extends Entite<PeriodeCalendrierId> {
  private code: string;
  private libelle: string;
  private ordre: number;
  private typePeriode: TypePeriodeCalendrier;
  private dateDebut: Date;
  private dateFin: Date;

  // Ce constructeur initialise une periode de calendrier et en valide la coherence.
  constructor(
    id: PeriodeCalendrierId,
    code: string,
    libelle: string,
    ordre: number,
    typePeriode: TypePeriodeCalendrier,
    dateDebut: Date,
    dateFin: Date,
  ) {
    super(id);

    this.code = this.validerTexte(code, 'code');
    this.libelle = this.validerTexte(libelle, 'libelle');
    this.ordre = this.validerOrdre(ordre);
    this.typePeriode = this.validerTypePeriode(typePeriode);
    this.dateDebut = this.validerDate(dateDebut, 'dateDebut');
    this.dateFin = this.validerDate(dateFin, 'dateFin');
    this.validerChronologie(this.dateDebut, this.dateFin);
  }

  // Cette methode retourne le code fonctionnel de la periode.
  public obtenirCode(): string {
    return this.code;
  }

  // Cette methode retourne le libelle de la periode.
  public obtenirLibelle(): string {
    return this.libelle;
  }

  // Cette methode retourne l'ordre legal de la periode.
  public obtenirOrdre(): number {
    return this.ordre;
  }

  // Cette methode retourne le type de la periode.
  public obtenirTypePeriode(): TypePeriodeCalendrier {
    return this.typePeriode;
  }

  // Cette methode retourne la date de debut de la periode.
  public obtenirDateDebut(): Date {
    return new Date(this.dateDebut.getTime());
  }

  // Cette methode retourne la date de fin de la periode.
  public obtenirDateFin(): Date {
    return new Date(this.dateFin.getTime());
  }

  // Cette methode indique si une date donnee tombe dans la periode, bornes incluses.
  public contientDate(dateReference: Date): boolean {
    const date = this.validerDate(dateReference, 'dateReference');
    return date.getTime() >= this.dateDebut.getTime() && date.getTime() <= this.dateFin.getTime();
  }

  // Cette methode indique si deux periodes se chevauchent.
  public seChevaucheAvec(autrePeriode: PeriodeCalendrier): boolean {
    return (
      this.dateDebut.getTime() <= autrePeriode.obtenirDateFin().getTime()
      && this.dateFin.getTime() >= autrePeriode.obtenirDateDebut().getTime()
    );
  }

  // Cette methode valide qu'un texte obligatoire est present.
  private validerTexte(valeur: string, nomChamp: string): string {
    const valeurNettoyee = valeur.trim();

    if (valeurNettoyee.length === 0) {
      throw new ValidationError(
        `Le champ "${nomChamp}" est obligatoire.`,
        'PERIODE_CALENDRIER_TEXTE_INVALIDE',
      );
    }

    return valeurNettoyee;
  }

  // Cette methode valide l'ordre de la periode.
  private validerOrdre(valeur: number): number {
    if (!Number.isInteger(valeur) || valeur <= 0) {
      throw new ValidationError(
        "L'ordre d'une periode doit etre un entier strictement positif.",
        'PERIODE_CALENDRIER_ORDRE_INVALIDE',
      );
    }

    return valeur;
  }

  // Cette methode valide le type de periode.
  private validerTypePeriode(valeur: TypePeriodeCalendrier): TypePeriodeCalendrier {
    if (!Object.values(TypePeriodeCalendrier).includes(valeur)) {
      throw new ValidationError(
        'Le type de periode doit etre valide.',
        'PERIODE_CALENDRIER_TYPE_INVALIDE',
      );
    }

    return valeur;
  }

  // Cette methode valide une date de periode.
  private validerDate(valeur: Date, nomChamp: string): Date {
    if (!(valeur instanceof Date) || Number.isNaN(valeur.getTime())) {
      throw new ValidationError(
        `Le champ "${nomChamp}" doit etre une date valide.`,
        'PERIODE_CALENDRIER_DATE_INVALIDE',
      );
    }

    return new Date(valeur.getTime());
  }

  // Cette methode impose la chronologie minimale de la periode.
  private validerChronologie(dateDebut: Date, dateFin: Date): void {
    if (dateDebut.getTime() > dateFin.getTime()) {
      throw new ValidationError(
        'La date de debut doit etre anterieure ou egale a la date de fin.',
        'PERIODE_CALENDRIER_CHRONOLOGIE_INVALIDE',
      );
    }
  }
}
