import { Entite } from '../../../../shared/domain/Entity';
import { ErreurPourcentageInvalide } from '../exceptions/ErreurPourcentageInvalide';
import { ErreurRangInvalide } from '../exceptions/ErreurRangInvalide';
import { ErreurResultatBulletinIncoherent } from '../exceptions/ErreurResultatBulletinIncoherent';
import { CodeColonneBulletin } from '../value-objects/CodeColonneBulletin';
import { PourcentageBulletin } from '../value-objects/PourcentageBulletin';

// Cette entite represente le resultat consolide d'un eleve pour une colonne donnee.
export class ResultatColonneBulletin extends Entite<string> {
  private codeColonne: CodeColonneBulletin;
  private totalObtenu?: number;
  private maximumGeneral?: number;
  private pourcentage?: PourcentageBulletin;
  private rang?: number;
  private estClassable: boolean;
  private estNonClasse: boolean;

  // Ce constructeur initialise l'etat consolide d'une colonne de resultat.
  constructor(params: {
    idResultatColonneBulletin: string;
    codeColonne: CodeColonneBulletin;
    totalObtenu?: number;
    maximumGeneral?: number;
    pourcentage?: number;
    rang?: number;
    estClassable?: boolean;
    estNonClasse?: boolean;
  }) {
    super(params.idResultatColonneBulletin);
    this.codeColonne = params.codeColonne;
    this.estClassable = params.estClassable ?? true;
    this.estNonClasse = params.estNonClasse ?? false;
    this.totalObtenu = params.totalObtenu;
    this.maximumGeneral = params.maximumGeneral;
    this.pourcentage = params.pourcentage === undefined ? undefined : new PourcentageBulletin(params.pourcentage);
    this.rang = params.rang;
    this.verifierCoherence();
  }

  // Cette methode expose la colonne concernee.
  public obtenirCodeColonne(): CodeColonneBulletin {
    return this.codeColonne;
  }

  // Cette methode retourne le total obtenu.
  public obtenirTotalObtenu(): number | undefined {
    return this.totalObtenu;
  }

  // Cette methode retourne le maximum general.
  public obtenirMaximumGeneral(): number | undefined {
    return this.maximumGeneral;
  }

  // Cette methode retourne le pourcentage numerique si disponible.
  public obtenirPourcentage(): number | undefined {
    return this.pourcentage?.obtenirValeur();
  }

  // Cette methode retourne le rang eventuel.
  public obtenirRang(): number | undefined {
    return this.rang;
  }

  // Cette methode indique si le resultat peut etre classe.
  public obtenirEstClassable(): boolean {
    return this.estClassable;
  }

  // Cette methode indique si l'eleve est non classe sur cette colonne.
  public obtenirEstNonClasse(): boolean {
    return this.estNonClasse;
  }

  // Cette methode remplace le total, le maximum et le pourcentage calcules.
  public mettreAJourCalcul(totalObtenu: number, maximumGeneral: number, estClassable: boolean): void {
    this.verifierTotal(totalObtenu, maximumGeneral);
    this.totalObtenu = totalObtenu;
    this.maximumGeneral = maximumGeneral;
    this.estClassable = estClassable;
    this.estNonClasse = false;
    this.rang = undefined;
    this.pourcentage = maximumGeneral === 0
      ? new PourcentageBulletin(0)
      : new PourcentageBulletin(Number(((totalObtenu / maximumGeneral) * 100).toFixed(2)));
  }

  // Cette methode marque explicitement la colonne comme non classee.
  public marquerNonClasse(): void {
    this.estNonClasse = true;
    this.rang = undefined;
    this.pourcentage = undefined;
  }

  // Cette methode applique le rang officiel d'une colonne classable.
  public appliquerRang(rang: number): void {
    if (!Number.isInteger(rang) || rang <= 0) {
      throw new ErreurRangInvalide();
    }

    if (this.estNonClasse) {
      throw new ErreurResultatBulletinIncoherent('Un eleve non classe ne peut pas recevoir de rang.');
    }

    this.rang = rang;
  }

  // Cette methode verifie la coherence generale de l'etat porte par la colonne.
  private verifierCoherence(): void {
    if (this.estNonClasse) {
      if (this.rang !== undefined || this.pourcentage !== undefined) {
        throw new ErreurResultatBulletinIncoherent('Un non classe ne peut pas porter ni rang ni pourcentage.');
      }

      return;
    }

    if (this.totalObtenu !== undefined || this.maximumGeneral !== undefined) {
      this.verifierTotal(this.totalObtenu, this.maximumGeneral);
    }

    if (this.rang !== undefined && (!Number.isInteger(this.rang) || this.rang <= 0)) {
      throw new ErreurRangInvalide();
    }

    if (this.pourcentage !== undefined && !Number.isFinite(this.pourcentage.obtenirValeur())) {
      throw new ErreurPourcentageInvalide();
    }
  }

  // Cette methode protege la coherence entre total et maximum.
  private verifierTotal(totalObtenu?: number, maximumGeneral?: number): void {
    if (totalObtenu === undefined || maximumGeneral === undefined) {
      throw new ErreurResultatBulletinIncoherent('Le total et le maximum doivent etre fournis ensemble.');
    }

    if (!Number.isInteger(totalObtenu) || !Number.isInteger(maximumGeneral)) {
      throw new ErreurResultatBulletinIncoherent('Le total et le maximum doivent etre entiers.');
    }

    if (totalObtenu < 0 || maximumGeneral < 0 || totalObtenu > maximumGeneral) {
      throw new ErreurResultatBulletinIncoherent('Le total doit rester compris entre zero et le maximum.');
    }
  }
}
