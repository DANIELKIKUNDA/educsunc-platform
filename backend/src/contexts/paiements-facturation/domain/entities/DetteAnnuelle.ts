import { LigneDette } from './LigneDette';
import { Money } from '../value-objects/Money';

// Cette entite represente le resume annuel des dettes d'un eleve.
export interface ProprietesDetteAnnuelle {
  idAnneeScolaire: string;
  statutAnnee: 'ACTIVE' | 'CLOTUREE';
  lignes: LigneDette[];
  totalDu: Money;
  totalPaye: Money;
  totalExonere: Money;
  soldeRestant: Money;
}

export class DetteAnnuelle {
  private idAnneeScolaire: string;
  private statutAnnee: 'ACTIVE' | 'CLOTUREE';
  private lignes: LigneDette[];
  private totalDu: Money;
  private totalPaye: Money;
  private totalExonere: Money;
  private soldeRestant: Money;

  constructor(proprietes: ProprietesDetteAnnuelle) {
    this.idAnneeScolaire = DetteAnnuelle.validerTexte(proprietes.idAnneeScolaire, 'idAnneeScolaire');
    this.statutAnnee = proprietes.statutAnnee;
    this.lignes = [...proprietes.lignes];
    this.totalDu = proprietes.totalDu;
    this.totalPaye = proprietes.totalPaye;
    this.totalExonere = proprietes.totalExonere;
    this.soldeRestant = proprietes.soldeRestant;
    this.verifierCoherence();
  }

  public obtenirIdAnneeScolaire(): string { return this.idAnneeScolaire; }
  public obtenirStatutAnnee(): 'ACTIVE' | 'CLOTUREE' { return this.statutAnnee; }
  public obtenirLignes(): LigneDette[] { return [...this.lignes]; }
  public obtenirTotalDu(): Money { return this.totalDu; }
  public obtenirTotalPaye(): Money { return this.totalPaye; }
  public obtenirTotalExonere(): Money { return this.totalExonere; }
  public obtenirSoldeRestant(): Money { return this.soldeRestant; }

  public verifierCoherence(): void {
    const devise = this.totalDu.obtenirDevise();
    const totalDuCalcule = this.lignes.reduce((courant, ligne) => courant.additionner(ligne.obtenirMontantDuHistorique()), Money.zero(devise));
    const totalPayeCalcule = this.lignes.reduce((courant, ligne) => courant.additionner(ligne.obtenirMontantPaye()), Money.zero(devise));
    const totalExonereCalcule = this.lignes.reduce((courant, ligne) => courant.additionner(ligne.obtenirMontantExonere()), Money.zero(devise));
    const soldeCalcule = this.lignes.reduce((courant, ligne) => courant.additionner(ligne.obtenirSolde()), Money.zero(devise));

    if (!this.totalDu.estEgal(totalDuCalcule)
      || !this.totalPaye.estEgal(totalPayeCalcule)
      || !this.totalExonere.estEgal(totalExonereCalcule)
      || !this.soldeRestant.estEgal(soldeCalcule)) {
      throw new Error('La dette annuelle est incoherente avec ses lignes.');
    }
  }

  private static validerTexte(valeur: string, nomChamp: string): string {
    if (typeof valeur !== 'string' || valeur.trim().length === 0) {
      throw new Error(`Le champ ${nomChamp} est obligatoire.`);
    }

    return valeur.trim();
  }
}
