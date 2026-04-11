import { Entite } from '../../../../shared/domain/Entity';
import { ValidationError } from '../../../../shared/exceptions/ValidationError';
import { LigneReferentielProgrammeId } from '../value-objects/LigneReferentielProgrammeId';
import { PonderationEvaluation } from '../value-objects/PonderationEvaluation';
import { ReferentielCoursId } from '../value-objects/ReferentielCoursId';
import { SourceLigneProgramme } from '../value-objects/SourceLigneProgramme';
import { TypeStructureEvaluation } from '../value-objects/TypeStructureEvaluation';

// Cette entite represente une ligne officielle d'un referentiel de programme.
export class LigneReferentielProgramme extends Entite<LigneReferentielProgrammeId> {
  private referentielCoursId: ReferentielCoursId;
  private ordreAffichage: number;
  private obligatoire: boolean;
  private aExamen: boolean;
  private estCalculable: boolean;
  private sourceLigne: SourceLigneProgramme;
  private ponderation: PonderationEvaluation;

  // Ce constructeur initialise une ligne officielle et en valide les invariants.
  constructor(
    id: LigneReferentielProgrammeId,
    referentielCoursId: ReferentielCoursId,
    ordreAffichage: number,
    obligatoire: boolean,
    aExamen: boolean,
    estCalculable: boolean,
    sourceLigne: SourceLigneProgramme,
    ponderation: PonderationEvaluation,
  ) {
    super(id);

    this.referentielCoursId = this.validerReferentielCoursId(referentielCoursId);
    this.ordreAffichage = this.validerOrdreAffichage(ordreAffichage);
    this.obligatoire = this.validerBooleen(obligatoire, 'obligatoire');
    this.aExamen = this.validerBooleen(aExamen, 'aExamen');
    this.estCalculable = this.validerBooleen(estCalculable, 'estCalculable');
    this.sourceLigne = this.validerSourceLigne(sourceLigne);
    this.ponderation = this.validerPonderation(ponderation, this.aExamen);
  }

  // Cette methode retourne l'identifiant du cours officiel reference.
  public obtenirReferentielCoursId(): ReferentielCoursId {
    return this.referentielCoursId;
  }

  // Cette methode retourne l'ordre d'affichage officiel de la ligne.
  public obtenirOrdreAffichage(): number {
    return this.ordreAffichage;
  }

  // Cette methode indique si la ligne est obligatoire.
  public estObligatoire(): boolean {
    return this.obligatoire;
  }

  // Cette methode indique si la ligne comporte un examen.
  public aExamenAssocie(): boolean {
    return this.aExamen;
  }

  // Cette methode indique si la ligne participe aux calculs.
  public estCalculableDansProgramme(): boolean {
    return this.estCalculable;
  }

  // Cette methode retourne la source metier de la ligne.
  public obtenirSourceLigne(): SourceLigneProgramme {
    return this.sourceLigne;
  }

  // Cette methode retourne la ponderation officielle de la ligne.
  public obtenirPonderation(): PonderationEvaluation {
    return this.ponderation;
  }

  // Cette methode verifie la compatibilite de la ligne avec une structure d'evaluation.
  public verifierCompatibiliteAvecStructure(typeStructureEvaluation: TypeStructureEvaluation): void {
    this.ponderation.verifierCompatibiliteAvecStructure(typeStructureEvaluation);
  }

  // Cette methode valide la reference vers un cours officiel.
  private validerReferentielCoursId(valeur: ReferentielCoursId): ReferentielCoursId {
    if (!(valeur instanceof ReferentielCoursId)) {
      throw new ValidationError(
        "L'identifiant du cours officiel est obligatoire.",
        'LIGNE_REFERENTIEL_PROGRAMME_COURS_INVALIDE',
      );
    }

    return valeur;
  }

  // Cette methode valide l'ordre officiel de la ligne.
  private validerOrdreAffichage(valeur: number): number {
    if (!Number.isInteger(valeur) || valeur <= 0) {
      throw new ValidationError(
        "L'ordre d'affichage doit etre un entier strictement positif.",
        'LIGNE_REFERENTIEL_PROGRAMME_ORDRE_INVALIDE',
      );
    }

    return valeur;
  }

  // Cette methode valide une propriete booleenne de la ligne.
  private validerBooleen(valeur: boolean, nomChamp: string): boolean {
    if (typeof valeur !== 'boolean') {
      throw new ValidationError(
        `Le champ "${nomChamp}" doit etre un booleen.`,
        'LIGNE_REFERENTIEL_PROGRAMME_BOOLEEN_INVALIDE',
      );
    }

    return valeur;
  }

  // Cette methode valide la source metier de la ligne.
  private validerSourceLigne(valeur: SourceLigneProgramme): SourceLigneProgramme {
    if (!Object.values(SourceLigneProgramme).includes(valeur)) {
      throw new ValidationError(
        'La source de ligne doit etre valide.',
        'LIGNE_REFERENTIEL_PROGRAMME_SOURCE_INVALIDE',
      );
    }

    return valeur;
  }

  // Cette methode valide la ponderation de la ligne en tenant compte de la presence d'examen.
  private validerPonderation(
    valeur: PonderationEvaluation,
    aExamen: boolean,
  ): PonderationEvaluation {
    if (!(valeur instanceof PonderationEvaluation)) {
      throw new ValidationError(
        'La ponderation de ligne est obligatoire.',
        'LIGNE_REFERENTIEL_PROGRAMME_PONDERATION_INVALIDE',
      );
    }

    valeur.verifierCompatibiliteAvecExamen(aExamen);

    return valeur;
  }
}
