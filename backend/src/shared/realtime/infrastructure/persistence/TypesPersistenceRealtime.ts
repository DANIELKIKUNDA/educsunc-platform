import type { AbonnementTempsReel, ConnexionTempsReel, EvenementTempsReel } from '../../domain';

export interface EtatPersistenceRealtime {
  readonly connexions: Map<string, ConnexionTempsReel>;
  readonly abonnements: Map<string, AbonnementTempsReel>;
  readonly evenements: Map<string, EvenementTempsReel>;
}
