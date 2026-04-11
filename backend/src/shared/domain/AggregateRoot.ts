import { Entite } from './Entity';
import { EvenementDomaine } from './DomainEvent';

// Une racine d'agregat porte les invariants principaux et protege la coherence d'un ensemble d'objets.
export abstract class RacineAgregat<T> extends Entite<T> {
  // Cette liste garde les evenements de domaine emis pendant le cycle de vie de l'agregat.
  private evenementsDomaine: EvenementDomaine[] = [];

  // Le constructeur transmet simplement l'identifiant a l'entite de base.
  constructor(id: T) {
    super(id);
  }

  // Cette methode enregistre un evenement afin qu'il puisse etre publie ou traite plus tard.
  public ajouterEvenement(evenement: EvenementDomaine): void {
    this.evenementsDomaine.push(evenement);
  }

  // Cette methode retourne tous les evenements actuellement collectes par l'agregat.
  public recupererEvenements(): EvenementDomaine[] {
    return [...this.evenementsDomaine];
  }

  // Cette methode vide la liste apres publication ou traitement des evenements.
  public viderEvenements(): void {
    this.evenementsDomaine = [];
  }
}
