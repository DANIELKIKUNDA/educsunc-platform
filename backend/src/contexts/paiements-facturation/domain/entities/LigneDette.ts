import { Money } from '../value-objects/Money';
import { ReferenceFrais } from '../value-objects/ReferenceFrais';
import { StatutDette } from '../value-objects/StatutDette';
import { TypeFrais } from '../value-objects/TypeFrais';

// Cette entite represente une ligne detaillee de dette pour une annee donnee.
export interface ProprietesLigneDette {
  idObligation: string;
  typeFrais: TypeFrais;
  referenceFrais: ReferenceFrais;
  libelle: string;
  montantDuHistorique: Money;
  montantPaye: Money;
  montantExonere: Money;
  solde: Money;
  statut: StatutDette;
}

export class LigneDette {
  private idObligation: string;
  private typeFrais: TypeFrais;
  private referenceFrais: ReferenceFrais;
  private libelle: string;
  private montantDuHistorique: Money;
  private montantPaye: Money;
  private montantExonere: Money;
  private solde: Money;
  private statut: StatutDette;

  constructor(proprietes: ProprietesLigneDette) {
    this.idObligation = LigneDette.validerTexte(proprietes.idObligation, 'idObligation');
    this.typeFrais = proprietes.typeFrais;
    this.referenceFrais = proprietes.referenceFrais;
    this.libelle = LigneDette.validerTexte(proprietes.libelle, 'libelle');
    this.montantDuHistorique = proprietes.montantDuHistorique;
    this.montantPaye = proprietes.montantPaye;
    this.montantExonere = proprietes.montantExonere;
    this.solde = proprietes.solde;
    this.statut = proprietes.statut;
    this.verifierCoherenceMontants();
  }

  public obtenirIdObligation(): string { return this.idObligation; }
  public obtenirTypeFrais(): TypeFrais { return this.typeFrais; }
  public obtenirReferenceFrais(): ReferenceFrais { return this.referenceFrais; }
  public obtenirLibelle(): string { return this.libelle; }
  public obtenirMontantDuHistorique(): Money { return this.montantDuHistorique; }
  public obtenirMontantPaye(): Money { return this.montantPaye; }
  public obtenirMontantExonere(): Money { return this.montantExonere; }
  public obtenirSolde(): Money { return this.solde; }
  public obtenirStatut(): StatutDette { return this.statut; }

  public verifierCoherenceMontants(): void {
    const totalCouvre = this.montantPaye.additionner(this.montantExonere).additionner(this.solde);

    if (!totalCouvre.estEgal(this.montantDuHistorique)) {
      throw new Error('La ligne de dette est incoherente avec son montant historique.');
    }
  }

  private static validerTexte(valeur: string, nomChamp: string): string {
    if (typeof valeur !== 'string' || valeur.trim().length === 0) {
      throw new Error(`Le champ ${nomChamp} est obligatoire.`);
    }

    return valeur.trim();
  }
}
