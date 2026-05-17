import { Entite } from '../../../../shared/domain/Entity';
import { ErreurClassementImpossible } from '../exceptions/ErreurClassementImpossible';
import { SexeEleve } from '../value-objects/SexeEleve';

// Cette entite represente une ligne de classement d'un eleve pour une colonne.
export class LigneClassementEleve extends Entite<string> {
  private idEleve: string;
  private sexe: SexeEleve;
  private totalObtenu?: number;
  private maximumGeneral?: number;
  private pourcentage?: number;
  private rang?: number;
  private estNonClasse: boolean;

  // Ce constructeur initialise l'etat d'une ligne de classement.
  constructor(params: {
    idLigneClassementEleve: string;
    idEleve: string;
    sexe: SexeEleve;
    totalObtenu?: number;
    maximumGeneral?: number;
    pourcentage?: number;
    rang?: number;
    estNonClasse: boolean;
  }) {
    super(params.idLigneClassementEleve);
    this.idEleve = params.idEleve;
    this.sexe = params.sexe;
    this.totalObtenu = params.totalObtenu;
    this.maximumGeneral = params.maximumGeneral;
    this.pourcentage = params.pourcentage;
    this.rang = params.rang;
    this.estNonClasse = params.estNonClasse;
    this.verifierCoherence();
  }

  // Cette methode expose l'identifiant de l'eleve.
  public obtenirIdEleve(): string {
    return this.idEleve;
  }

  // Cette methode expose le sexe pedagogique utilise pour les statistiques.
  public obtenirSexe(): SexeEleve {
    return this.sexe;
  }

  // Cette methode expose le total obtenu.
  public obtenirTotalObtenu(): number | undefined {
    return this.totalObtenu;
  }

  // Cette methode expose le maximum general.
  public obtenirMaximumGeneral(): number | undefined {
    return this.maximumGeneral;
  }

  // Cette methode expose le pourcentage de classement.
  public obtenirPourcentage(): number | undefined {
    return this.pourcentage;
  }

  // Cette methode expose le rang officiel.
  public obtenirRang(): number | undefined {
    return this.rang;
  }

  // Cette methode indique si l'eleve est non classe.
  public obtenirEstNonClasse(): boolean {
    return this.estNonClasse;
  }

  // Cette methode remplit les donnees d'un eleve classable.
  public classer(totalObtenu: number, maximumGeneral: number, pourcentage: number, rang: number): void {
    this.totalObtenu = totalObtenu;
    this.maximumGeneral = maximumGeneral;
    this.pourcentage = pourcentage;
    this.rang = rang;
    this.estNonClasse = false;
    this.verifierCoherence();
  }

  // Cette methode marque la ligne comme non classee.
  public marquerNonClasse(): void {
    this.estNonClasse = true;
    this.rang = undefined;
    this.pourcentage = undefined;
  }

  // Cette methode protege la coherence minimale de la ligne.
  private verifierCoherence(): void {
    if (this.estNonClasse) {
      if (this.rang !== undefined) {
        throw new ErreurClassementImpossible('Un eleve non classe ne peut pas recevoir de rang.');
      }

      return;
    }

    if (
      this.totalObtenu === undefined ||
      this.maximumGeneral === undefined ||
      this.pourcentage === undefined ||
      this.rang === undefined
    ) {
      throw new ErreurClassementImpossible('Une ligne classee doit porter total, maximum, pourcentage et rang.');
    }
  }
}
