import { Entite } from '../../../domain/Entity';
import { CanalNotification, StatutNotification } from '../enumerations';

/**
 * Cette entite represente une tentative concrete de livraison sur un canal donne.
 */
export class TentativeLivraison extends Entite<string> {
  private readonly canal: CanalNotification;
  private readonly fournisseur?: string;
  private statut: StatutNotification;
  private compteurRetry: number;
  public resultat?: string;
  public erreur?: string;
  public readonly organisationId?: string;
  public readonly ecoleId?: string;
  public readonly creeLe: Date;
  public misAJourLe: Date;

  /**
   * Ce constructeur hydrate l'etat interne de la tentative.
   */
  constructor(
    identifiant: string,
    canal: CanalNotification,
    fournisseur: string | undefined,
    statut: StatutNotification,
    organisationId: string | undefined,
    ecoleId: string | undefined,
    compteurRetry: number,
    creeLe: Date,
    misAJourLe: Date,
  ) {
    super(identifiant);
    this.canal = canal;
    this.fournisseur = TentativeLivraison.nettoyer(fournisseur);
    this.statut = statut;
    this.organisationId = TentativeLivraison.nettoyer(organisationId);
    this.ecoleId = TentativeLivraison.nettoyer(ecoleId);
    this.compteurRetry = compteurRetry;
    this.creeLe = creeLe;
    this.misAJourLe = misAJourLe;
  }

  /**
   * Cette fabrique cree une tentative initiale prete a etre traitee.
   */
  public static creer(
    identifiant: string,
    canal: CanalNotification,
    fournisseur: string | undefined,
    organisationId: string | undefined,
    ecoleId: string | undefined,
    compteurRetry: number,
  ): TentativeLivraison {
    return new TentativeLivraison(
      identifiant,
      canal,
      fournisseur,
      'PROCESSING',
      organisationId,
      ecoleId,
      compteurRetry,
      new Date(),
      new Date(),
    );
  }

  /** Cette methode expose le canal vise par la tentative. */
  public obtenirCanal(): CanalNotification { return this.canal; }

  /** Cette methode expose le fournisseur technique associe, s'il existe. */
  public obtenirFournisseur(): string | undefined { return this.fournisseur; }

  /** Cette methode expose le statut courant de la tentative. */
  public obtenirStatut(): StatutNotification { return this.statut; }

  /** Cette methode expose le compteur de retry rattache a la tentative. */
  public obtenirCompteurRetry(): number { return this.compteurRetry; }

  /** Cette methode marque la tentative comme reussie. */
  public marquerSucces(resultat?: string): void {
    this.statut = 'SENT';
    this.resultat = TentativeLivraison.nettoyer(resultat);
    this.misAJourLe = new Date();
  }

  /** Cette methode marque la tentative comme echouee et incremente son compteur. */
  public marquerEchec(erreur: string): void {
    this.statut = 'FAILED';
    this.erreur = TentativeLivraison.nettoyer(erreur);
    this.compteurRetry += 1;
    this.misAJourLe = new Date();
  }

  /** Cette methode normalise les valeurs textuelles optionnelles. */
  private static nettoyer(valeur?: string): string | undefined {
    const propre = String(valeur ?? '').trim();
    return propre.length > 0 ? propre : undefined;
  }
}
