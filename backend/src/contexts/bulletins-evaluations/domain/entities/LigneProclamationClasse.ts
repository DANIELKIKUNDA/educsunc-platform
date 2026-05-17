import { Entite } from '../../../../shared/domain/Entity';
import { ErreurProclamationIncoherente } from '../exceptions/ErreurProclamationIncoherente';
import { SexeEleve } from '../value-objects/SexeEleve';
import { StatutProclamationEleve } from '../value-objects/StatutProclamationEleve';

// Cette entite represente une ligne officielle de proclamation pour un eleve.
export class LigneProclamationClasse extends Entite<string> {
  private rang?: number;
  private idEleve: string;
  private nomComplet: string;
  private sexe: SexeEleve;
  private totalObtenu?: number;
  private maximumGeneral?: number;
  private pourcentage?: number;
  private observation?: string;
  private statutProclamation: StatutProclamationEleve;

  // Ce constructeur initialise une ligne de proclamation et en verifie la coherence.
  constructor(params: {
    idLigneProclamationClasse: string;
    rang?: number;
    idEleve: string;
    nomComplet: string;
    sexe: SexeEleve;
    totalObtenu?: number;
    maximumGeneral?: number;
    pourcentage?: number;
    observation?: string;
    statutProclamation: StatutProclamationEleve;
  }) {
    super(params.idLigneProclamationClasse);
    this.rang = params.rang;
    this.idEleve = params.idEleve;
    this.nomComplet = params.nomComplet;
    this.sexe = params.sexe;
    this.totalObtenu = params.totalObtenu;
    this.maximumGeneral = params.maximumGeneral;
    this.pourcentage = params.pourcentage;
    this.observation = params.observation;
    this.statutProclamation = params.statutProclamation;
    this.verifierCoherence();
  }

  // Cette methode expose le rang officiel si l'eleve est classe.
  public obtenirRang(): number | undefined {
    return this.rang;
  }

  // Cette methode expose l'identifiant de l'eleve.
  public obtenirIdEleve(): string {
    return this.idEleve;
  }

  // Cette methode expose le nom complet affiche dans la proclamation.
  public obtenirNomComplet(): string {
    return this.nomComplet;
  }

  // Cette methode expose le sexe de l'eleve.
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

  // Cette methode expose le pourcentage de proclamation.
  public obtenirPourcentage(): number | undefined {
    return this.pourcentage;
  }

  // Cette methode expose l'observation pedagogique eventuelle.
  public obtenirObservation(): string | undefined {
    return this.observation;
  }

  // Cette methode expose le statut de proclamation.
  public obtenirStatutProclamation(): StatutProclamationEleve {
    return this.statutProclamation;
  }

  // Cette methode ajoute ou remplace l'observation libre.
  public definirObservation(observation?: string): void {
    this.observation = observation;
  }

  // Cette methode protege les combinaisons autorisees dans la proclamation.
  private verifierCoherence(): void {
    if (this.statutProclamation === StatutProclamationEleve.CLASSE) {
      if (
        this.rang === undefined ||
        this.totalObtenu === undefined ||
        this.maximumGeneral === undefined ||
        this.pourcentage === undefined
      ) {
        throw new ErreurProclamationIncoherente('Un eleve classe doit porter rang, total, maximum et pourcentage.');
      }

      return;
    }

    if (this.rang !== undefined) {
      throw new ErreurProclamationIncoherente('Un eleve non classe ou abandon ne peut pas porter de rang.');
    }
  }
}
