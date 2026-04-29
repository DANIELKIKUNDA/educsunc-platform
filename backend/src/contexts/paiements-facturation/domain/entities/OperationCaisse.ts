import { Money } from '../value-objects/Money';
import { ModePaiement } from '../value-objects/ModePaiement';
import { TypeOperationCaisse } from '../value-objects/TypeOperationCaisse';

// Cette entite represente une operation inscrite dans la caisse du jour.
export interface ProprietesOperationCaisse {
  idOperation: string;
  idPaiement?: string;
  idRestitution?: string;
  idAnnulation?: string;
  typeOperation: TypeOperationCaisse;
  montant: Money;
  modePaiement: ModePaiement;
  idCaissier: string;
  dateOperation: Date;
}

export class OperationCaisse {
  private idOperation: string;
  private idPaiement?: string;
  private idRestitution?: string;
  private idAnnulation?: string;
  private typeOperation: TypeOperationCaisse;
  private montant: Money;
  private modePaiement: ModePaiement;
  private idCaissier: string;
  private dateOperation: Date;

  constructor(proprietes: ProprietesOperationCaisse) {
    this.idOperation = OperationCaisse.validerTexte(proprietes.idOperation, 'idOperation');
    this.idPaiement = OperationCaisse.nettoyerTexteOptionnel(proprietes.idPaiement);
    this.idRestitution = OperationCaisse.nettoyerTexteOptionnel(proprietes.idRestitution);
    this.idAnnulation = OperationCaisse.nettoyerTexteOptionnel(proprietes.idAnnulation);
    this.typeOperation = proprietes.typeOperation;
    this.montant = proprietes.montant;
    this.modePaiement = proprietes.modePaiement;
    this.idCaissier = OperationCaisse.validerTexte(proprietes.idCaissier, 'idCaissier');
    this.dateOperation = OperationCaisse.validerDate(proprietes.dateOperation, 'dateOperation');
    this.verifierReferenceMetier();
  }

  public obtenirIdOperation(): string { return this.idOperation; }
  public obtenirIdPaiement(): string | undefined { return this.idPaiement; }
  public obtenirIdRestitution(): string | undefined { return this.idRestitution; }
  public obtenirIdAnnulation(): string | undefined { return this.idAnnulation; }
  public obtenirTypeOperation(): TypeOperationCaisse { return this.typeOperation; }
  public obtenirMontant(): Money { return this.montant; }
  public obtenirModePaiement(): ModePaiement { return this.modePaiement; }
  public obtenirIdCaissier(): string { return this.idCaissier; }
  public obtenirDateOperation(): Date { return new Date(this.dateOperation.getTime()); }

  private verifierReferenceMetier(): void {
    const references = [this.idPaiement, this.idRestitution, this.idAnnulation].filter((valeur) => valeur !== undefined);

    if (references.length === 0) {
      throw new Error('Une operation de caisse doit reference r un paiement, une restitution ou une annulation.');
    }
  }

  private static validerTexte(valeur: string, nomChamp: string): string {
    if (typeof valeur !== 'string' || valeur.trim().length === 0) {
      throw new Error(`Le champ ${nomChamp} est obligatoire.`);
    }

    return valeur.trim();
  }

  private static nettoyerTexteOptionnel(valeur?: string): string | undefined {
    if (valeur === undefined) {
      return undefined;
    }

    const valeurNettoyee = valeur.trim();
    return valeurNettoyee.length === 0 ? undefined : valeurNettoyee;
  }

  private static validerDate(valeur: Date, nomChamp: string): Date {
    if (!(valeur instanceof Date) || Number.isNaN(valeur.getTime())) {
      throw new Error(`Le champ ${nomChamp} doit etre une date valide.`);
    }

    return new Date(valeur.getTime());
  }
}
