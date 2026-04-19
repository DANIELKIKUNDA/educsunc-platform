import { RacineAgregat } from '../../../../shared/domain/AggregateRoot';
import { ValidationError } from '../../../../shared/exceptions/ValidationError';
import { AnneeScolaireId } from '../value-objects/AnneeScolaireId';
import { EcoleId } from '../value-objects/EcoleId';
import { StatutAnneeScolaire } from '../value-objects/StatutAnneeScolaire';

// Cet agregat represente le cadre annuel d'exploitation academique d'une ecole.
export class AnneeScolaire extends RacineAgregat<AnneeScolaireId> {
  private ecoleId: EcoleId;
  private code: string;
  private libelle: string;
  private dateDebut: Date;
  private dateFin: Date;
  private statut: StatutAnneeScolaire;
  private active: boolean;
  private dateActivation?: Date;
  private dateCloture?: Date;
  private dateArchivage?: Date;
  private creeLe: Date;
  private creePar?: string;
  private modifieLe?: Date;
  private modifiePar?: string;
  private version: number;

  // Ce constructeur initialise une annee scolaire et en valide l'etat courant.
  constructor(
    id: AnneeScolaireId,
    ecoleId: EcoleId,
    code: string,
    libelle: string,
    dateDebut: Date,
    dateFin: Date,
    creePar?: string,
    statut: StatutAnneeScolaire = StatutAnneeScolaire.PLANIFIEE,
    active = false,
    dateActivation?: Date,
    dateCloture?: Date,
    dateArchivage?: Date,
    creeLe: Date = new Date(),
    modifieLe?: Date,
    modifiePar?: string,
    version = 1,
  ) {
    super(id);

    this.ecoleId = this.validerEcoleId(ecoleId);
    this.code = this.validerTexteObligatoire(code, 'code');
    this.libelle = this.validerTexteObligatoire(libelle, 'libelle');
    this.dateDebut = this.validerDate(dateDebut, 'dateDebut');
    this.dateFin = this.validerDate(dateFin, 'dateFin');
    this.validerChronologie(this.dateDebut, this.dateFin);
    this.statut = this.validerStatut(statut);
    this.active = this.validerBooleen(active, 'active');
    this.dateActivation = this.validerDateOptionnelle(dateActivation, 'dateActivation');
    this.dateCloture = this.validerDateOptionnelle(dateCloture, 'dateCloture');
    this.dateArchivage = this.validerDateOptionnelle(dateArchivage, 'dateArchivage');
    this.creeLe = this.validerDate(creeLe, 'creeLe');
    this.creePar = this.validerTexteOptionnel(creePar);
    this.modifieLe = this.validerDateOptionnelle(modifieLe, 'modifieLe');
    this.modifiePar = this.validerTexteOptionnel(modifiePar);
    this.version = this.validerVersion(version);
    this.validerCoherenceEtat();
  }

  // Cette methode retourne l'ecole de rattachement de l'annee scolaire.
  public obtenirEcoleId(): EcoleId {
    return this.ecoleId;
  }

  // Cette methode retourne le code fonctionnel de l'annee scolaire.
  public obtenirCode(): string {
    return this.code;
  }

  // Cette methode retourne le libelle de l'annee scolaire.
  public obtenirLibelle(): string {
    return this.libelle;
  }

  // Cette methode retourne la date de debut de l'annee scolaire.
  public obtenirDateDebut(): Date {
    return new Date(this.dateDebut.getTime());
  }

  // Cette methode retourne la date de fin de l'annee scolaire.
  public obtenirDateFin(): Date {
    return new Date(this.dateFin.getTime());
  }

  // Cette methode retourne le statut courant de l'annee scolaire.
  public obtenirStatut(): StatutAnneeScolaire {
    return this.statut;
  }

  // Cette methode indique si l'annee scolaire est active.
  public estActive(): boolean {
    return this.active;
  }

  // Cette methode retourne la date d'activation si elle existe.
  public obtenirDateActivation(): Date | undefined {
    return this.dateActivation === undefined ? undefined : new Date(this.dateActivation.getTime());
  }

  // Cette methode retourne la date de cloture si elle existe.
  public obtenirDateCloture(): Date | undefined {
    return this.dateCloture === undefined ? undefined : new Date(this.dateCloture.getTime());
  }

  // Cette methode retourne la date d'archivage si elle existe.
  public obtenirDateArchivage(): Date | undefined {
    return this.dateArchivage === undefined ? undefined : new Date(this.dateArchivage.getTime());
  }

  // Cette methode retourne la date de creation de l'annee scolaire.
  public obtenirCreeLe(): Date {
    return new Date(this.creeLe.getTime());
  }

  // Cette methode retourne l'acteur de creation si il existe.
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

  // Cette methode retourne la version metier courante de l'annee scolaire.
  public obtenirVersion(): number {
    return this.version;
  }

  // Cette methode active l'annee scolaire.
  public activer(acteur?: string): void {
    this.verifierPeutEtreActivee(false);
    this.statut = StatutAnneeScolaire.ACTIVE;
    this.active = true;
    this.dateActivation = new Date();
    this.marquerModification(acteur);
  }

  // Cette methode cloture l'annee scolaire active.
  public cloturer(acteur?: string): void {
    if (this.statut !== StatutAnneeScolaire.ACTIVE) {
      throw new ValidationError(
        "Seule une annee scolaire active peut etre cloturee.",
        'ANNEE_SCOLAIRE_TRANSITION_INTERDITE',
      );
    }

    this.statut = StatutAnneeScolaire.CLOTUREE;
    this.active = false;
    this.dateCloture = new Date();
    this.marquerModification(acteur);
  }

  // Cette methode archive une annee scolaire cloturee.
  public archiver(acteur?: string): void {
    if (this.statut !== StatutAnneeScolaire.CLOTUREE) {
      throw new ValidationError(
        "Seule une annee scolaire cloturee peut etre archivee.",
        'ANNEE_SCOLAIRE_ARCHIVAGE_INTERDIT',
      );
    }

    this.statut = StatutAnneeScolaire.ARCHIVEE;
    this.active = false;
    this.dateArchivage = new Date();
    this.marquerModification(acteur);
  }

  // Cette methode modifie les informations administratives d'une annee encore planifiee.
  public modifierInformations(
    code: string,
    libelle: string,
    dateDebut: Date,
    dateFin: Date,
    acteur?: string,
  ): void {
    if (this.statut !== StatutAnneeScolaire.PLANIFIEE) {
      throw new ValidationError(
        "Seule une annee scolaire planifiee peut etre modifiee.",
        'ANNEE_SCOLAIRE_MODIFICATION_INTERDITE',
      );
    }

    const codeValide = this.validerTexteObligatoire(code, 'code');
    const libelleValide = this.validerTexteObligatoire(libelle, 'libelle');
    const dateDebutValidee = this.validerDate(dateDebut, 'dateDebut');
    const dateFinValidee = this.validerDate(dateFin, 'dateFin');

    this.validerChronologie(dateDebutValidee, dateFinValidee);

    this.code = codeValide;
    this.libelle = libelleValide;
    this.dateDebut = dateDebutValidee;
    this.dateFin = dateFinValidee;
    this.marquerModification(acteur);
  }

  // Cette methode indique si une date appartient a l'intervalle de l'annee scolaire.
  public contientDate(date: Date): boolean {
    const dateValidee = this.validerDate(date, 'date');

    return (
      dateValidee.getTime() >= this.dateDebut.getTime()
      && dateValidee.getTime() <= this.dateFin.getTime()
    );
  }

  // Cette methode verifie qu'une annee peut etre activee sans violer les regles de cycle de vie.
  public verifierPeutEtreActivee(aUneAutreAnneeActive: boolean): void {
    if (this.statut !== StatutAnneeScolaire.PLANIFIEE) {
      throw new ValidationError(
        "Seule une annee scolaire planifiee peut etre activee.",
        'ANNEE_SCOLAIRE_ACTIVATION_INTERDITE',
      );
    }

    if (aUneAutreAnneeActive) {
      throw new ValidationError(
        "Une autre annee scolaire est deja active pour cette ecole.",
        'ANNEE_SCOLAIRE_DEJA_ACTIVE',
      );
    }
  }

  private validerEcoleId(valeur: EcoleId): EcoleId {
    if (!(valeur instanceof EcoleId)) {
      throw new ValidationError(
        "L'identifiant d'ecole est obligatoire.",
        'ANNEE_SCOLAIRE_ECOLE_INVALIDE',
      );
    }

    return valeur;
  }

  private validerTexteObligatoire(valeur: string, nomChamp: string): string {
    const valeurNettoyee = valeur.trim();

    if (valeurNettoyee.length === 0) {
      throw new ValidationError(
        `Le champ "${nomChamp}" est obligatoire.`,
        'ANNEE_SCOLAIRE_TEXTE_INVALIDE',
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

  private validerDate(valeur: Date, nomChamp: string): Date {
    if (!(valeur instanceof Date) || Number.isNaN(valeur.getTime())) {
      throw new ValidationError(
        `Le champ "${nomChamp}" doit etre une date valide.`,
        'ANNEE_SCOLAIRE_DATE_INVALIDE',
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

  private validerStatut(valeur: StatutAnneeScolaire): StatutAnneeScolaire {
    if (!Object.values(StatutAnneeScolaire).includes(valeur)) {
      throw new ValidationError(
        "Le statut d'annee scolaire doit etre valide.",
        'ANNEE_SCOLAIRE_STATUT_INVALIDE',
      );
    }

    return valeur;
  }

  private validerBooleen(valeur: boolean, nomChamp: string): boolean {
    if (typeof valeur !== 'boolean') {
      throw new ValidationError(
        `Le champ "${nomChamp}" doit etre un booleen.`,
        'ANNEE_SCOLAIRE_BOOLEEN_INVALIDE',
      );
    }

    return valeur;
  }

  private validerVersion(valeur: number): number {
    if (!Number.isInteger(valeur) || valeur <= 0) {
      throw new ValidationError(
        "La version de l'annee scolaire doit etre un entier strictement positif.",
        'ANNEE_SCOLAIRE_VERSION_INVALIDE',
      );
    }

    return valeur;
  }

  private validerChronologie(dateDebut: Date, dateFin: Date): void {
    if (dateDebut.getTime() >= dateFin.getTime()) {
      throw new ValidationError(
        'La date de debut doit etre strictement anterieure a la date de fin.',
        'ANNEE_SCOLAIRE_CHRONOLOGIE_INVALIDE',
      );
    }
  }

  private validerCoherenceEtat(): void {
    if (this.active && this.statut !== StatutAnneeScolaire.ACTIVE) {
      throw new ValidationError(
        "Une annee marquee active doit porter le statut ACTIVE.",
        'ANNEE_SCOLAIRE_ETAT_INCOHERENT',
      );
    }

    if (this.statut === StatutAnneeScolaire.ACTIVE && !this.active) {
      throw new ValidationError(
        "Une annee au statut ACTIVE doit etre marquee active.",
        'ANNEE_SCOLAIRE_ETAT_INCOHERENT',
      );
    }

    if (this.statut === StatutAnneeScolaire.ACTIVE && this.dateActivation === undefined) {
      throw new ValidationError(
        'Une annee active doit avoir une date d activation.',
        'ANNEE_SCOLAIRE_DATE_ACTIVATION_OBLIGATOIRE',
      );
    }

    if (this.statut === StatutAnneeScolaire.CLOTUREE && this.dateCloture === undefined) {
      throw new ValidationError(
        'Une annee cloturee doit avoir une date de cloture.',
        'ANNEE_SCOLAIRE_DATE_CLOTURE_OBLIGATOIRE',
      );
    }

    if (this.statut === StatutAnneeScolaire.ARCHIVEE && this.dateArchivage === undefined) {
      throw new ValidationError(
        'Une annee archivee doit avoir une date d archivage.',
        'ANNEE_SCOLAIRE_DATE_ARCHIVAGE_OBLIGATOIRE',
      );
    }
  }

  private marquerModification(acteur?: string): void {
    this.modifieLe = new Date();
    this.modifiePar = this.validerTexteOptionnel(acteur);
    this.version += 1;
  }
}
