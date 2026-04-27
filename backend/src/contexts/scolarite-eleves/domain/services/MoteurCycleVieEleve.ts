import { Eleve } from '../aggregates/Eleve';
import { UUID } from '../value-objects/TypesPrimitifs';

// Ce fichier contient le service de domaine qui orchestre les changements de statut d'un eleve.
/**
 * Ce moteur centralise les operations de cycle de vie exposees par l'agregat Eleve.
 */
export class MoteurCycleVieEleve {
  /** Declare officiellement un abandon scolaire. */
  public abandonner(eleve: Eleve, modifiePar: UUID): void { eleve.marquerAbandonne(modifiePar); }
  /** Declare officiellement un transfert sortant. */
  public transferer(eleve: Eleve, modifiePar: UUID): void { eleve.marquerTransfere(modifiePar); }
  /** Reactive un eleve quand la procedure administrative le permet. */
  public reintegrer(eleve: Eleve, modifiePar: UUID): void { eleve.reactiver(modifiePar); }
  /** Suspend temporairement un eleve. */
  public suspendre(eleve: Eleve, modifiePar: UUID): void { eleve.suspendre(modifiePar); }
  /** Declare le deces d'un eleve, et donc un etat final. */
  public declarerDeces(eleve: Eleve, modifiePar: UUID): void { eleve.marquerDecede(modifiePar); }
  /** Remet un eleve inactif ou suspendu dans le statut actif. */
  public reactiver(eleve: Eleve, modifiePar: UUID): void { eleve.reactiver(modifiePar); }
}
