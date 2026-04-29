import { Money } from '../value-objects/Money';
import { OrigineAffectation } from '../value-objects/OrigineAffectation';

// Cette entite represente une affectation detaillee d'un paiement sur une obligation.
export interface ProprietesRepartitionPaiement {
  idRepartition: string;
  idPaiement: string;
  idObligation: string;
  montantAffecte: Money;
  ordreAffectation: number;
  origineAffectation: OrigineAffectation;
}

export class RepartitionPaiement {
  private idRepartition: string;
  private idPaiement: string;
  private idObligation: string;
  private montantAffecte: Money;
  private ordreAffectation: number;
  private origineAffectation: OrigineAffectation;

  constructor(proprietes: ProprietesRepartitionPaiement) {
    this.idRepartition = RepartitionPaiement.validerTexte(proprietes.idRepartition, 'idRepartition');
    this.idPaiement = RepartitionPaiement.validerTexte(proprietes.idPaiement, 'idPaiement');
    this.idObligation = RepartitionPaiement.validerTexte(proprietes.idObligation, 'idObligation');
    this.montantAffecte = proprietes.montantAffecte;
    this.ordreAffectation = RepartitionPaiement.validerOrdre(proprietes.ordreAffectation);
    this.origineAffectation = proprietes.origineAffectation;
  }

  public obtenirIdRepartition(): string { return this.idRepartition; }
  public obtenirIdPaiement(): string { return this.idPaiement; }
  public obtenirIdObligation(): string { return this.idObligation; }
  public obtenirMontantAffecte(): Money { return this.montantAffecte; }
  public obtenirOrdreAffectation(): number { return this.ordreAffectation; }
  public obtenirOrigineAffectation(): OrigineAffectation { return this.origineAffectation; }

  private static validerTexte(valeur: string, nomChamp: string): string {
    if (typeof valeur !== 'string' || valeur.trim().length === 0) {
      throw new Error(`Le champ ${nomChamp} est obligatoire.`);
    }

    return valeur.trim();
  }

  private static validerOrdre(ordre: number): number {
    if (!Number.isInteger(ordre) || ordre <= 0) {
      throw new Error('L ordre d affectation doit etre un entier positif.');
    }

    return ordre;
  }
}
