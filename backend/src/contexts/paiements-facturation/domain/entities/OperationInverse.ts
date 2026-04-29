import { Money } from '../value-objects/Money';
import { ModePaiement } from '../value-objects/ModePaiement';
import { TypeOperationCaisse } from '../value-objects/TypeOperationCaisse';

// Cette entite represente une operation inverse creee pour corriger une operation anterieure.
export interface ProprietesOperationInverse {
  idOperationOrigine: string;
  idOperationInverse: string;
  typeOperation: TypeOperationCaisse;
  montant: Money;
  modePaiement: ModePaiement;
  creeLe: Date;
}

export class OperationInverse {
  private idOperationOrigine: string;
  private idOperationInverse: string;
  private typeOperation: TypeOperationCaisse;
  private montant: Money;
  private modePaiement: ModePaiement;
  private creeLe: Date;

  constructor(proprietes: ProprietesOperationInverse) {
    this.idOperationOrigine = OperationInverse.validerTexte(proprietes.idOperationOrigine, 'idOperationOrigine');
    this.idOperationInverse = OperationInverse.validerTexte(proprietes.idOperationInverse, 'idOperationInverse');
    this.typeOperation = proprietes.typeOperation;
    this.montant = proprietes.montant;
    this.modePaiement = proprietes.modePaiement;
    this.creeLe = OperationInverse.validerDate(proprietes.creeLe);
  }

  public obtenirIdOperationOrigine(): string { return this.idOperationOrigine; }
  public obtenirIdOperationInverse(): string { return this.idOperationInverse; }
  public obtenirTypeOperation(): TypeOperationCaisse { return this.typeOperation; }
  public obtenirMontant(): Money { return this.montant; }
  public obtenirModePaiement(): ModePaiement { return this.modePaiement; }
  public obtenirCreeLe(): Date { return new Date(this.creeLe.getTime()); }

  private static validerTexte(valeur: string, nomChamp: string): string {
    if (typeof valeur !== 'string' || valeur.trim().length === 0) {
      throw new Error(`Le champ ${nomChamp} est obligatoire.`);
    }

    return valeur.trim();
  }

  private static validerDate(valeur: Date): Date {
    if (!(valeur instanceof Date) || Number.isNaN(valeur.getTime())) {
      throw new Error('La date de creation de l operation inverse est invalide.');
    }

    return new Date(valeur.getTime());
  }
}
