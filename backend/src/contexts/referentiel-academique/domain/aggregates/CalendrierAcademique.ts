import { RacineAgregat } from '../../../../shared/domain/AggregateRoot';
import { ValidationError } from '../../../../shared/exceptions/ValidationError';
import { PeriodeCalendrier } from '../entities/PeriodeCalendrier';
import { AnneeScolaireId } from '../value-objects/AnneeScolaireId';
import { CalendrierAcademiqueId } from '../value-objects/CalendrierAcademiqueId';
import { EcoleId } from '../value-objects/EcoleId';
import { TypePeriodeCalendrier } from '../value-objects/TypePeriodeCalendrier';
import { TypeStructureEvaluation } from '../value-objects/TypeStructureEvaluation';

// Cet agregat represente l'organisation reelle des periodes academiques pour une ecole et une annee.
export class CalendrierAcademique extends RacineAgregat<CalendrierAcademiqueId> {
  private ecoleId: EcoleId;
  private anneeScolaireId: AnneeScolaireId;
  private typeStructureEvaluation: TypeStructureEvaluation;
  private dateDebutAnnee: Date;
  private dateFinAnnee: Date;
  private creeLe: Date;
  private creePar?: string;
  private modifieLe?: Date;
  private modifiePar?: string;
  private version: number;
  private periodes: PeriodeCalendrier[];
  private verrouille: boolean;

  // Ce constructeur initialise un calendrier academique et en valide la structure.
  constructor(
    id: CalendrierAcademiqueId,
    ecoleId: EcoleId,
    anneeScolaireId: AnneeScolaireId,
    typeStructureEvaluation: TypeStructureEvaluation,
    dateDebutAnnee: Date,
    dateFinAnnee: Date,
    periodes: PeriodeCalendrier[] = [],
    creePar?: string,
    verrouille = false,
    creeLe: Date = new Date(),
    modifieLe?: Date,
    modifiePar?: string,
    version = 1,
  ) {
    super(id);

    this.ecoleId = this.validerEcoleId(ecoleId);
    this.anneeScolaireId = this.validerAnneeScolaireId(anneeScolaireId);
    this.typeStructureEvaluation = this.validerTypeStructureEvaluation(typeStructureEvaluation);
    this.dateDebutAnnee = this.validerDate(dateDebutAnnee, 'dateDebutAnnee');
    this.dateFinAnnee = this.validerDate(dateFinAnnee, 'dateFinAnnee');
    this.validerChronologieAnnuelle(this.dateDebutAnnee, this.dateFinAnnee);
    this.periodes = this.validerPeriodes(periodes);
    this.creePar = this.validerTexteOptionnel(creePar);
    this.verrouille = this.validerBooleen(verrouille, 'verrouille');
    this.creeLe = this.validerDate(creeLe, 'creeLe');
    this.modifieLe = this.validerDateOptionnelle(modifieLe, 'modifieLe');
    this.modifiePar = this.validerTexteOptionnel(modifiePar);
    this.version = this.validerVersion(version);
    this.validerCalendrier();
  }

  // Cette methode retourne l'ecole de rattachement du calendrier.
  public obtenirEcoleId(): EcoleId {
    return this.ecoleId;
  }

  // Cette methode retourne l'annee scolaire de rattachement.
  public obtenirAnneeScolaireId(): AnneeScolaireId {
    return this.anneeScolaireId;
  }

  // Cette methode retourne la structure d'evaluation du calendrier.
  public obtenirTypeStructureEvaluation(): TypeStructureEvaluation {
    return this.typeStructureEvaluation;
  }

  // Cette methode retourne la date de debut d'annee.
  public obtenirDateDebutAnnee(): Date {
    return new Date(this.dateDebutAnnee.getTime());
  }

  // Cette methode retourne la date de fin d'annee.
  public obtenirDateFinAnnee(): Date {
    return new Date(this.dateFinAnnee.getTime());
  }

  // Cette methode retourne les periodes du calendrier.
  public obtenirPeriodes(): PeriodeCalendrier[] {
    return [...this.periodes];
  }

  // Cette methode retourne la date de creation du calendrier.
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

  // Cette methode retourne la version metier courante du calendrier.
  public obtenirVersion(): number {
    return this.version;
  }

  // Cette methode indique si le calendrier est verrouille.
  public estVerrouille(): boolean {
    return this.verrouille;
  }

  // Cette methode modifie les bornes annuelles et, si besoin, les periodes du calendrier.
  public modifierDates(
    dateDebutAnnee: Date,
    dateFinAnnee: Date,
    periodes?: PeriodeCalendrier[],
    modifiePar?: string,
  ): void {
    this.verifierNonVerrouille();
    this.dateDebutAnnee = this.validerDate(dateDebutAnnee, 'dateDebutAnnee');
    this.dateFinAnnee = this.validerDate(dateFinAnnee, 'dateFinAnnee');
    this.validerChronologieAnnuelle(this.dateDebutAnnee, this.dateFinAnnee);

    if (periodes !== undefined) {
      this.periodes = this.validerPeriodes(periodes);
    }

    this.validerCalendrier();
    this.marquerModification(modifiePar);
  }

  // Cette methode valide la coherence complete du calendrier.
  public validerCalendrier(): void {
    const codesRencontres = new Set<string>();
    const ordresRencontres = new Set<number>();

    for (let index = 0; index < this.periodes.length; index += 1) {
      const periode = this.periodes[index];
      const code = periode.obtenirCode().toUpperCase();
      const ordre = periode.obtenirOrdre();

      if (codesRencontres.has(code)) {
        throw new ValidationError(
          'Le code de periode doit etre unique dans un calendrier.',
          'CALENDRIER_CODE_PERIODE_DUPLIQUE',
        );
      }

      if (ordresRencontres.has(ordre)) {
        throw new ValidationError(
          'L ordre d une periode doit etre unique dans un calendrier.',
          'CALENDRIER_ORDRE_PERIODE_DUPLIQUE',
        );
      }

      codesRencontres.add(code);
      ordresRencontres.add(ordre);

      if (periode.obtenirDateDebut().getTime() < this.dateDebutAnnee.getTime()
        || periode.obtenirDateFin().getTime() > this.dateFinAnnee.getTime()) {
        throw new ValidationError(
          'Chaque periode doit rester incluse dans les bornes de l annee.',
          'CALENDRIER_PERIODE_HORS_BORNE',
        );
      }

      if (periode.obtenirTypePeriode() === TypePeriodeCalendrier.PERIODE && !code.startsWith('P')) {
        throw new ValidationError(
          'Le code d une periode de type PERIODE doit commencer par P.',
          'CALENDRIER_CODE_PERIODE_INCOHERENT',
        );
      }

      if (periode.obtenirTypePeriode() === TypePeriodeCalendrier.EXAMEN && !code.startsWith('EX')) {
        throw new ValidationError(
          'Le code d une periode de type EXAMEN doit commencer par EX.',
          'CALENDRIER_CODE_EXAMEN_INCOHERENT',
        );
      }

      if (
        this.typeStructureEvaluation === TypeStructureEvaluation.SEMESTRIEL
        && (code === 'P5' || code === 'P6' || code === 'EX3')
      ) {
        throw new ValidationError(
          'Une structure semestrielle ne peut pas contenir P5, P6 ou EX3.',
          'CALENDRIER_STRUCTURE_SEMESTRIELLE_INVALIDE',
        );
      }

      for (let indexSuivant = index + 1; indexSuivant < this.periodes.length; indexSuivant += 1) {
        if (periode.seChevaucheAvec(this.periodes[indexSuivant])) {
          throw new ValidationError(
            'Deux periodes du calendrier ne peuvent pas se chevaucher.',
            'CALENDRIER_CHEVAUCHEMENT_PERIODES',
          );
        }
      }
    }
  }

  // Cette methode verrouille le calendrier apres validation.
  public verrouillerCalendrier(modifiePar?: string): void {
    this.validerCalendrier();
    this.verrouille = true;
    this.marquerModification(modifiePar);
  }

  private validerEcoleId(valeur: EcoleId): EcoleId {
    if (!(valeur instanceof EcoleId)) {
      throw new ValidationError(
        "L'identifiant d'ecole est obligatoire.",
        'CALENDRIER_ECOLE_INVALIDE',
      );
    }

    return valeur;
  }

  private validerAnneeScolaireId(valeur: AnneeScolaireId): AnneeScolaireId {
    if (!(valeur instanceof AnneeScolaireId)) {
      throw new ValidationError(
        "L'identifiant d'annee scolaire est obligatoire.",
        'CALENDRIER_ANNEE_SCOLAIRE_INVALIDE',
      );
    }

    return valeur;
  }

  private validerTypeStructureEvaluation(
    valeur: TypeStructureEvaluation,
  ): TypeStructureEvaluation {
    if (!Object.values(TypeStructureEvaluation).includes(valeur)) {
      throw new ValidationError(
        "Le type de structure d'evaluation doit etre valide.",
        'CALENDRIER_STRUCTURE_INVALIDE',
      );
    }

    return valeur;
  }

  private validerDate(valeur: Date, nomChamp: string): Date {
    if (!(valeur instanceof Date) || Number.isNaN(valeur.getTime())) {
      throw new ValidationError(
        `Le champ "${nomChamp}" doit etre une date valide.`,
        'CALENDRIER_DATE_INVALIDE',
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

  private validerTexteOptionnel(valeur?: string): string | undefined {
    if (valeur === undefined) {
      return undefined;
    }

    const valeurNettoyee = valeur.trim();

    return valeurNettoyee.length > 0 ? valeurNettoyee : undefined;
  }

  private validerPeriodes(valeur: PeriodeCalendrier[]): PeriodeCalendrier[] {
    if (!Array.isArray(valeur)) {
      throw new ValidationError(
        'Les periodes du calendrier doivent etre fournies sous forme de tableau.',
        'CALENDRIER_PERIODES_INVALIDES',
      );
    }

    for (const periode of valeur) {
      if (!(periode instanceof PeriodeCalendrier)) {
        throw new ValidationError(
          'Chaque periode doit etre une PeriodeCalendrier valide.',
          'CALENDRIER_PERIODE_INVALIDE',
        );
      }
    }

    return [...valeur];
  }

  private validerBooleen(valeur: boolean, nomChamp: string): boolean {
    if (typeof valeur !== 'boolean') {
      throw new ValidationError(
        `Le champ "${nomChamp}" doit etre un booleen.`,
        'CALENDRIER_BOOLEEN_INVALIDE',
      );
    }

    return valeur;
  }

  private validerVersion(valeur: number): number {
    if (!Number.isInteger(valeur) || valeur <= 0) {
      throw new ValidationError(
        'La version du calendrier doit etre un entier strictement positif.',
        'CALENDRIER_VERSION_INVALIDE',
      );
    }

    return valeur;
  }

  private validerChronologieAnnuelle(dateDebut: Date, dateFin: Date): void {
    if (dateDebut.getTime() >= dateFin.getTime()) {
      throw new ValidationError(
        'La date de debut d annee doit etre strictement anterieure a la date de fin.',
        'CALENDRIER_CHRONOLOGIE_ANNUELLE_INVALIDE',
      );
    }
  }

  private verifierNonVerrouille(): void {
    if (this.verrouille) {
      throw new ValidationError(
        'Un calendrier verrouille ne peut plus etre modifie librement.',
        'CALENDRIER_VERROUILLE',
      );
    }
  }

  private marquerModification(acteur?: string): void {
    this.modifieLe = new Date();
    this.modifiePar = this.validerTexteOptionnel(acteur);
    this.version += 1;
  }
}
