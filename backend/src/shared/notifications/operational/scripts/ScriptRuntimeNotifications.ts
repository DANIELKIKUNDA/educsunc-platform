import { CoordinateurRuntimeNotifications, RegistreRuntimeNotifications } from '../../runtime';

// Ce fichier expose les operations runtime locales du module Notifications.

/** Cette classe propose des commandes simples pour demarrer, piloter et arreter le runtime. */
export class ScriptRuntimeNotifications {
  /** Ce constructeur relie le script au coordinateur principal et au registre runtime. */
  constructor(
    private readonly coordinateurRuntimeNotifications: CoordinateurRuntimeNotifications,
    private readonly registreRuntimeNotifications: RegistreRuntimeNotifications,
  ) {}

  /** Cette methode execute une passe globale du runtime Notifications. */
  public async executerCycleGlobal(): Promise<Awaited<ReturnType<CoordinateurRuntimeNotifications['executerCycleGlobal']>>> {
    return this.coordinateurRuntimeNotifications.executerCycleGlobal();
  }

  /** Cette methode arrete explicitement le runtime local. */
  public arreter(): ReturnType<RegistreRuntimeNotifications['observer']> {
    this.coordinateurRuntimeNotifications.arreter();
    return this.registreRuntimeNotifications.observer();
  }

  /** Cette methode retourne l etat courant du runtime sans relancer de travail. */
  public observerEtat(): ReturnType<RegistreRuntimeNotifications['observer']> {
    return this.registreRuntimeNotifications.observer();
  }
}
