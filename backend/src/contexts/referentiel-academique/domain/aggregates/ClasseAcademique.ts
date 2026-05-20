import { RacineAgregat } from '../../../../shared/domain/AggregateRoot';
import { ValidationError } from '../../../../shared/exceptions/ValidationError';
import { ClasseAcademiqueId } from '../value-objects/ClasseAcademiqueId';
import { OptionEtudeId } from '../value-objects/OptionEtudeId';
import { OrdreClasse } from '../value-objects/OrdreClasse';
import { SectionScolaireId } from '../value-objects/SectionScolaireId';
import { TypeStructureEvaluation } from '../value-objects/TypeStructureEvaluation';

// Cet agregat represente une classe officielle abstraite, distincte d'une classe pedagogique locale.
export class ClasseAcademique extends RacineAgregat<ClasseAcademiqueId> {
  private sectionScolaireId: SectionScolaireId;
  private optionEtudeId?: OptionEtudeId;
  private code: string;
  private libelle: string;
  private ordrePedagogique: OrdreClasse;
  private cycle: string;
  private accepteOptions: boolean;
  private optionObligatoire: boolean;
  private typeStructureEvaluation: TypeStructureEvaluation;
  private classeTENASOSP: boolean;
  private classeEXETAT: boolean;
  private classeFinaliste: boolean;
  private active: boolean;
  private creeLe: Date;
  private modifieLe?: Date;
  private version: number;

  // Ce constructeur initialise une classe academique et en valide la coherence structurelle.
  constructor(
    id: ClasseAcademiqueId,
    sectionScolaireId: SectionScolaireId,
    code: string,
    libelle: string,
    ordrePedagogique: OrdreClasse,
    cycle: string,
    accepteOptions: boolean,
    optionObligatoire: boolean,
    typeStructureEvaluation: TypeStructureEvaluation,
    optionEtudeId?: OptionEtudeId,
    active = true,
    creeLe: Date = new Date(),
    modifieLe?: Date,
    version = 1,
    classeTENASOSP = false,
    classeEXETAT = false,
    classeFinaliste = false,
  ) {
    super(id);

    this.sectionScolaireId = this.validerSectionScolaireId(sectionScolaireId);
    this.optionEtudeId = this.validerOptionEtudeId(optionEtudeId);
    this.code = this.validerTexteObligatoire(code, 'code');
    this.libelle = this.validerTexteObligatoire(libelle, 'libelle');
    this.ordrePedagogique = this.validerOrdrePedagogique(ordrePedagogique);
    this.cycle = this.validerTexteObligatoire(cycle, 'cycle');
    this.accepteOptions = this.validerBooleen(accepteOptions, 'accepteOptions');
    this.optionObligatoire = this.validerBooleen(optionObligatoire, 'optionObligatoire');
    this.typeStructureEvaluation = this.validerTypeStructureEvaluation(typeStructureEvaluation);
    this.classeTENASOSP = this.validerBooleen(classeTENASOSP, 'classeTENASOSP');
    this.classeEXETAT = this.validerBooleen(classeEXETAT, 'classeEXETAT');
    this.classeFinaliste = this.validerBooleen(classeFinaliste, 'classeFinaliste');
    this.active = this.validerBooleen(active, 'active');
    this.creeLe = this.validerDate(creeLe, 'creeLe');
    this.modifieLe = this.validerDateOptionnelle(modifieLe, 'modifieLe');
    this.version = this.validerVersion(version);
    this.verifierCoherenceAvecOption();
    this.verifierCoherenceAvecStructureEvaluation();
    this.verifierCoherenceExetatFinaliste();
  }

  // Cette methode retourne l'identifiant de la section scolaire de rattachement.
  public obtenirSectionScolaireId(): SectionScolaireId {
    return this.sectionScolaireId;
  }

  // Cette methode retourne l'identifiant d'option si il existe.
  public obtenirOptionEtudeId(): OptionEtudeId | undefined {
    return this.optionEtudeId;
  }

  // Cette methode retourne le code de la classe academique.
  public obtenirCode(): string {
    return this.code;
  }

  // Cette methode retourne le libelle courant de la classe academique.
  public obtenirLibelle(): string {
    return this.libelle;
  }

  // Cette methode retourne l'ordre pedagogique encapsule.
  public obtenirOrdrePedagogique(): OrdreClasse {
    return this.ordrePedagogique;
  }

  // Cette methode retourne la valeur numerique de l'ordre pedagogique.
  public obtenirOrdrePedagogiqueNumerique(): number {
    return this.ordrePedagogique.obtenirValeur();
  }

  // Cette methode retourne le cycle de rattachement de la classe academique.
  public obtenirCycle(): string {
    return this.cycle;
  }

  // Cette methode indique si la classe accepte des options.
  public accepteOptionsEtude(): boolean {
    return this.accepteOptions;
  }

  // Cette methode indique si une option est obligatoire pour la classe.
  public estOptionObligatoire(): boolean {
    return this.optionObligatoire;
  }

  // Cette methode retourne la structure d'evaluation attendue.
  public obtenirTypeStructureEvaluation(): TypeStructureEvaluation {
    return this.typeStructureEvaluation;
  }

  // Cette methode indique si la classe est concernee par le TENASOSP.
  public estClasseTENASOSP(): boolean {
    return this.classeTENASOSP;
  }

  // Cette methode indique si la classe est concernee par l'EXETAT.
  public estClasseEXETAT(): boolean {
    return this.classeEXETAT;
  }

  // Cette methode indique si la classe est une classe finaliste.
  public estClasseFinaliste(): boolean {
    return this.classeFinaliste;
  }

  // Cette methode indique si la classe academique est active.
  public estActive(): boolean {
    return this.active;
  }

  // Cette methode retourne la date de creation de la classe academique.
  public obtenirCreeLe(): Date {
    return new Date(this.creeLe.getTime());
  }

  // Cette methode retourne la date de derniere modification si elle existe.
  public obtenirModifieLe(): Date | undefined {
    return this.modifieLe === undefined ? undefined : new Date(this.modifieLe.getTime());
  }

  // Cette methode retourne la version metier courante de la classe academique.
  public obtenirVersion(): number {
    return this.version;
  }

  // Cette methode renomme la classe academique.
  public renommer(nouveauLibelle: string): void {
    this.libelle = this.validerTexteObligatoire(nouveauLibelle, 'libelle');
    this.marquerModification();
  }

  // Cette methode active la classe academique.
  public activer(): void {
    this.active = true;
    this.marquerModification();
  }

  // Cette methode desactive la classe academique.
  public desactiver(): void {
    this.active = false;
    this.marquerModification();
  }

  // Cette methode verifie la coherence entre option, acceptation d'option et obligation d'option.
  public verifierCoherenceAvecOption(): void {
    if (this.optionObligatoire && !this.accepteOptions) {
      throw new ValidationError(
        'Une classe a option obligatoire doit accepter les options.',
        'CLASSE_ACADEMIQUE_OPTION_INCOHERENTE',
      );
    }

    if (!this.accepteOptions && this.optionEtudeId !== undefined) {
      throw new ValidationError(
        "Une classe qui n'accepte pas d'option ne peut pas referencer d'option.",
        'CLASSE_ACADEMIQUE_OPTION_INTERDITE',
      );
    }
  }

  // Cette methode verifie la coherence entre la section et la structure d'evaluation.
  public verifierCoherenceAvecStructureEvaluation(): void {
    const valeurSection = this.sectionScolaireId.obtenirValeur().toUpperCase();

    if (valeurSection === 'PRIMAIRE' && this.typeStructureEvaluation !== TypeStructureEvaluation.TRIMESTRIEL) {
      throw new ValidationError(
        'Une classe primaire doit etre trimestrielle.',
        'CLASSE_ACADEMIQUE_STRUCTURE_INVALIDE',
      );
    }

    if (valeurSection === 'SECONDAIRE' && this.typeStructureEvaluation !== TypeStructureEvaluation.SEMESTRIEL) {
      throw new ValidationError(
        'Une classe secondaire doit etre semestrielle.',
        'CLASSE_ACADEMIQUE_STRUCTURE_INVALIDE',
      );
    }
  }

  // Cette methode garantit qu'une classe EXETAT est toujours une classe finaliste.
  public verifierCoherenceExetatFinaliste(): void {
    if (this.classeEXETAT && !this.classeFinaliste) {
      throw new ValidationError(
        'Une classe EXETAT doit aussi etre marquee comme classe finaliste.',
        'CLASSE_ACADEMIQUE_EXETAT_FINALISTE_INCOHERENT',
      );
    }
  }

  private validerSectionScolaireId(valeur: SectionScolaireId): SectionScolaireId {
    if (!(valeur instanceof SectionScolaireId)) {
      throw new ValidationError(
        "L'identifiant de section scolaire est obligatoire.",
        'CLASSE_ACADEMIQUE_SECTION_INVALIDE',
      );
    }

    return valeur;
  }

  private validerOptionEtudeId(valeur?: OptionEtudeId): OptionEtudeId | undefined {
    if (valeur === undefined) {
      return undefined;
    }

    if (!(valeur instanceof OptionEtudeId)) {
      throw new ValidationError(
        "L'identifiant d'option d'etude doit etre valide.",
        'CLASSE_ACADEMIQUE_OPTION_ETUDE_INVALIDE',
      );
    }

    return valeur;
  }

  private validerTexteObligatoire(valeur: string, nomChamp: string): string {
    const valeurNettoyee = valeur.trim();

    if (valeurNettoyee.length === 0) {
      throw new ValidationError(
        `Le champ "${nomChamp}" est obligatoire.`,
        'CLASSE_ACADEMIQUE_TEXTE_INVALIDE',
      );
    }

    return valeurNettoyee;
  }

  private validerOrdrePedagogique(valeur: OrdreClasse): OrdreClasse {
    if (!(valeur instanceof OrdreClasse)) {
      throw new ValidationError(
        "L'ordre pedagogique doit etre fourni sous forme d'objet valeur.",
        'CLASSE_ACADEMIQUE_ORDRE_INVALIDE',
      );
    }

    return valeur;
  }

  private validerBooleen(valeur: boolean, nomChamp: string): boolean {
    if (typeof valeur !== 'boolean') {
      throw new ValidationError(
        `Le champ "${nomChamp}" doit etre un booleen.`,
        'CLASSE_ACADEMIQUE_BOOLEEN_INVALIDE',
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
        'CLASSE_ACADEMIQUE_STRUCTURE_INVALIDE',
      );
    }

    return valeur;
  }

  private validerDate(valeur: Date, nomChamp: string): Date {
    if (!(valeur instanceof Date) || Number.isNaN(valeur.getTime())) {
      throw new ValidationError(
        `Le champ "${nomChamp}" doit etre une date valide.`,
        'CLASSE_ACADEMIQUE_DATE_INVALIDE',
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
        'La version de la classe academique doit etre un entier strictement positif.',
        'CLASSE_ACADEMIQUE_VERSION_INVALIDE',
      );
    }

    return valeur;
  }

  private marquerModification(): void {
    this.modifieLe = new Date();
    this.version += 1;
  }
}
