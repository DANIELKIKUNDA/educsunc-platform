import { StatutNotification, TypeNotification } from '../../domain';

// Ce fichier decrit le modele de lecture d'une liste de notifications.

/** Cette interface represente une ligne de liste de notifications. */
export interface ElementListeNotifications {
  readonly identifiant: string;
  readonly type: TypeNotification;
  readonly statut: StatutNotification;
  readonly titre?: string;
  readonly messageResume: string;
  readonly creeLe: Date;
}

/** Cette interface represente un resultat pagine de liste de notifications. */
export interface ModeleLectureListeNotifications {
  readonly elements: readonly ElementListeNotifications[];
  readonly page: number;
  readonly taillePage: number;
  readonly total: number;
}
