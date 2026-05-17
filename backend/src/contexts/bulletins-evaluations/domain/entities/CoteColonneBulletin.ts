import { Entite } from '../../../../shared/domain/Entity';
import { ErreurCoteHorsMaximum } from '../exceptions/ErreurCoteHorsMaximum';
import { CoteEntiereNaturelle } from '../value-objects/CoteEntiereNaturelle';
import { CodeColonneBulletin } from '../value-objects/CodeColonneBulletin';
import { MaximumColonne } from '../value-objects/MaximumColonne';
import { StyleAffichageCote } from '../value-objects/StyleAffichageCote';

// Cette entite represente la cote d'une colonne officielle sur une fiche de cotation.
export class CoteColonneBulletin extends Entite<string> {
  private codeColonne: CodeColonneBulletin;
  private coteObtenue: number | null;
  private maximumColonne: MaximumColonne;
  private estProclamee: boolean;
  private dateEncodage?: Date;
  private encodeePar?: string;
  private modifieePar?: string;
  private dateModification?: Date;
  private estEchec: boolean;
  private styleAffichage?: StyleAffichageCote;

  // Ce constructeur initialise une colonne de cote et verifie immediatement sa coherence.
  constructor(params: {
    idCoteColonneBulletin: string;
    codeColonne: CodeColonneBulletin;
    coteObtenue?: number | null;
    maximumColonne: number;
    estProclamee?: boolean;
    dateEncodage?: Date;
    encodeePar?: string;
    modifieePar?: string;
    dateModification?: Date;
    estEchec?: boolean;
    styleAffichage?: StyleAffichageCote;
  }) {
    super(params.idCoteColonneBulletin);
    this.codeColonne = params.codeColonne;
    this.maximumColonne = new MaximumColonne(params.maximumColonne);
    this.coteObtenue = null;
    this.estProclamee = params.estProclamee ?? false;
    this.dateEncodage = params.dateEncodage;
    this.encodeePar = params.encodeePar;
    this.modifieePar = params.modifieePar;
    this.dateModification = params.dateModification;
    this.estEchec = params.estEchec ?? false;
    this.styleAffichage = params.styleAffichage ?? StyleAffichageCote.NORMAL;

    if (params.coteObtenue !== undefined && params.coteObtenue !== null) {
      this.appliquerCoteValidee(params.coteObtenue);
    } else if (params.coteObtenue === null) {
      this.styleAffichage = StyleAffichageCote.NON_APPLICABLE;
    }
  }

  // Cette methode expose le code officiel de la colonne.
  public obtenirCodeColonne(): CodeColonneBulletin {
    return this.codeColonne;
  }

  // Cette methode retourne la cote actuellement enregistree.
  public obtenirCoteObtenue(): number | null {
    return this.coteObtenue;
  }

  // Cette methode retourne le maximum officiel de la colonne.
  public obtenirMaximumColonne(): number {
    return this.maximumColonne.obtenirValeur();
  }

  // Cette methode indique si la cote est deja marquee comme proclamee.
  public estDejaProclamee(): boolean {
    return this.estProclamee;
  }

  // Cette methode expose la date initiale d'encodage si elle existe.
  public obtenirDateEncodage(): Date | undefined {
    return this.dateEncodage;
  }

  // Cette methode expose l'utilisateur qui a encode la cote.
  public obtenirEncodeePar(): string | undefined {
    return this.encodeePar;
  }

  // Cette methode expose l'utilisateur qui a modifie la cote en dernier.
  public obtenirModifieePar(): string | undefined {
    return this.modifieePar;
  }

  // Cette methode expose la date de derniere modification.
  public obtenirDateModification(): Date | undefined {
    return this.dateModification;
  }

  // Cette methode indique si la cote est un echec.
  public obtenirEstEchec(): boolean {
    return this.estEchec;
  }

  // Cette methode expose le style visuel a utiliser sur le bulletin.
  public obtenirStyleAffichage(): StyleAffichageCote | undefined {
    return this.styleAffichage;
  }

  // Cette methode encode une cote manuelle en gardant la trace de l'auteur.
  public encoder(valeur: number, encodeePar: string, dateEncodage = new Date()): void {
    this.appliquerCoteValidee(valeur);
    this.encodeePar = encodeePar;
    this.dateEncodage = dateEncodage;
    this.modifieePar = encodeePar;
    this.dateModification = dateEncodage;
  }

  // Cette methode met a jour une cote existante en conservant l'historique de modification.
  public modifier(valeur: number, modifieePar: string, dateModification = new Date()): void {
    this.appliquerCoteValidee(valeur);
    this.modifieePar = modifieePar;
    this.dateModification = dateModification;
  }

  // Cette methode pose une valeur calculee automatiquement sur une colonne total.
  public appliquerValeurCalculee(valeur: number | null): void {
    if (valeur === null) {
      this.coteObtenue = null;
      this.estEchec = false;
      this.styleAffichage = StyleAffichageCote.CALCULE;
      return;
    }

    this.appliquerCoteValidee(valeur);
    this.styleAffichage = StyleAffichageCote.CALCULE;
  }

  // Cette methode vide la cote lorsqu'elle devient absente ou non applicable.
  public vider(styleAffichage = StyleAffichageCote.NON_APPLICABLE): void {
    this.coteObtenue = null;
    this.estEchec = false;
    this.styleAffichage = styleAffichage;
  }

  // Cette methode memorise qu'une colonne est proclamee.
  public marquerCommeProclamee(): void {
    this.estProclamee = true;
  }

  // Cette methode ajuste l'indicateur d'echec selon le bareme de la colonne.
  public recalculerEchec(): void {
    if (this.coteObtenue === null) {
      this.estEchec = false;
      return;
    }

    const seuilEchec = this.obtenirMaximumColonne() / 2;
    this.estEchec = this.coteObtenue < seuilEchec;
    this.styleAffichage = this.estEchec ? StyleAffichageCote.ECHEC_ROUGE : this.styleAffichage ?? StyleAffichageCote.NORMAL;
  }

  // Cette methode applique toutes les verifications de fond avant d'enregistrer une cote.
  private appliquerCoteValidee(valeur: number): void {
    const cote = new CoteEntiereNaturelle(valeur);

    if (cote.obtenirValeur() > this.maximumColonne.obtenirValeur()) {
      throw new ErreurCoteHorsMaximum();
    }

    this.coteObtenue = cote.obtenirValeur();
    this.styleAffichage = StyleAffichageCote.NORMAL;
    this.recalculerEchec();
  }
}
