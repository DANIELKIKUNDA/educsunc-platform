import { RacineAgregat } from '../../../../shared/domain/AggregateRoot';
import { LigneClassementEleve } from '../entities/LigneClassementEleve';
import { ClassementColonneRecalcule } from '../events/ClassementColonneRecalcule';
import { ElevesNonClassesExclusClassement } from '../events/ElevesNonClassesExclusClassement';
import { RangsAttribues } from '../events/RangsAttribues';
import { CodeColonneBulletin } from '../value-objects/CodeColonneBulletin';
import { TypeStructureEvaluation } from '../value-objects/TypeStructureEvaluation';

// Cet agregat porte le classement officiel d'une classe pour une colonne donnee.
export class ClassementColonneClasse extends RacineAgregat<string> {
  private idEcole: string;
  private idClassePedagogique: string;
  private idAnneeScolaire: string;
  private codeColonne: CodeColonneBulletin;
  private typeStructureEvaluation: TypeStructureEvaluation;
  private dateCalcul: Date;
  private version: number;
  private lignesClassement: LigneClassementEleve[];

  // Ce constructeur initialise ou reconstitue un classement de classe.
  constructor(params: {
    idClassementColonneClasse: string;
    idEcole: string;
    idClassePedagogique: string;
    idAnneeScolaire: string;
    codeColonne: CodeColonneBulletin;
    typeStructureEvaluation: TypeStructureEvaluation;
    dateCalcul: Date;
    version?: number;
    lignesClassement?: LigneClassementEleve[];
  }) {
    super(params.idClassementColonneClasse);
    this.idEcole = params.idEcole;
    this.idClassePedagogique = params.idClassePedagogique;
    this.idAnneeScolaire = params.idAnneeScolaire;
    this.codeColonne = params.codeColonne;
    this.typeStructureEvaluation = params.typeStructureEvaluation;
    this.dateCalcul = params.dateCalcul;
    this.version = params.version ?? 1;
    this.lignesClassement = [...(params.lignesClassement ?? [])];
  }

  // Cette methode expose les lignes de classement portees par l'agregat.
  public obtenirLignesClassement(): LigneClassementEleve[] {
    return [...this.lignesClassement];
  }

  // Cette methode expose l'identifiant de la classe pedagogique.
  public obtenirIdClassePedagogique(): string {
    return this.idClassePedagogique;
  }

  // Cette methode expose l'identifiant de l'ecole du classement.
  public obtenirIdEcole(): string {
    return this.idEcole;
  }

  // Cette methode expose l'annee scolaire du classement.
  public obtenirIdAnneeScolaire(): string {
    return this.idAnneeScolaire;
  }

  // Cette methode expose la colonne officielle sur laquelle porte le classement.
  public obtenirCodeColonne(): CodeColonneBulletin {
    return this.codeColonne;
  }

  // Cette methode expose la structure d'evaluation calculee.
  public obtenirTypeStructureEvaluation(): TypeStructureEvaluation {
    return this.typeStructureEvaluation;
  }

  // Cette methode expose la date du dernier calcul de classement.
  public obtenirDateCalcul(): Date {
    return this.dateCalcul;
  }

  // Cette methode expose la version technique du classement persiste.
  public obtenirVersion(): number {
    return this.version;
  }

  // Cette methode recalcule et ordonne toutes les lignes classees.
  public recalculerClassement(lignes: LigneClassementEleve[]): void {
    this.lignesClassement = this.exclureNonClasses(lignes);
    this.ordonnerEleves();
    this.attribuerRangs();
    this.dateCalcul = new Date();
    this.version += 1;
    this.ajouterEvenement(new ClassementColonneRecalcule(this.obtenirId(), this.codeColonne));
    this.ajouterEvenement(new RangsAttribues(this.obtenirId()));
  }

  // Cette methode retire du classement les eleves declares non classes.
  public exclureNonClasses(lignes: LigneClassementEleve[]): LigneClassementEleve[] {
    const lignesClassees = lignes.filter((ligne) => !ligne.obtenirEstNonClasse());
    if (lignesClassees.length !== lignes.length) {
      this.ajouterEvenement(new ElevesNonClassesExclusClassement(this.obtenirId()));
    }

    return lignesClassees;
  }

  // Cette methode ordonne les eleves par total puis pourcentage.
  public ordonnerEleves(): void {
    this.lignesClassement.sort((a, b) => {
      const totalB = b.obtenirTotalObtenu() ?? 0;
      const totalA = a.obtenirTotalObtenu() ?? 0;
      if (totalB !== totalA) {
        return totalB - totalA;
      }

      return (b.obtenirPourcentage() ?? 0) - (a.obtenirPourcentage() ?? 0);
    });
  }

  // Cette methode attribue les rangs en tenant compte des egalites de resultat.
  public attribuerRangs(): void {
    let rangCourant = 1;
    for (let index = 0; index < this.lignesClassement.length; index += 1) {
      const ligne = this.lignesClassement[index];
      if (index > 0) {
        const precedente = this.lignesClassement[index - 1];
        const memeTotal = precedente.obtenirTotalObtenu() === ligne.obtenirTotalObtenu();
        const memePourcentage = precedente.obtenirPourcentage() === ligne.obtenirPourcentage();
        if (!(memeTotal && memePourcentage)) {
          rangCourant = index + 1;
        }
      }

      ligne.classer(
        ligne.obtenirTotalObtenu() ?? 0,
        ligne.obtenirMaximumGeneral() ?? 0,
        ligne.obtenirPourcentage() ?? 0,
        rangCourant,
      );
    }
  }
}
