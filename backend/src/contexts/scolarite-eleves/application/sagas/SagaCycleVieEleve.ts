import { BulletinsEvaluationsPort } from '../ports/BulletinsEvaluationsPort';
import { PaiementsFacturationPort } from '../ports/PaiementsFacturationPort';

// Ce fichier contient la saga de cycle de vie d'un eleve.
/**
 * Cette saga relaie les evenements abandon/transfert/deces vers les BC concernes.
 */
export class SagaCycleVieEleve {
  constructor(
    private readonly paiementsFacturationPort?: PaiementsFacturationPort,
    private readonly bulletinsEvaluationsPort?: BulletinsEvaluationsPort,
  ) {}

  /** Notifie les BC externes lorsqu'un eleve abandonne. */
  public async notifierAbandon(idEleve: string): Promise<void> {
    await this.paiementsFacturationPort?.notifierAbandonEleve(idEleve);
    await this.bulletinsEvaluationsPort?.notifierAbandonEleve(idEleve);
  }

  /** Notifie les BC externes lorsqu'un eleve est transfere. */
  public async notifierTransfert(idEleve: string): Promise<void> {
    await this.paiementsFacturationPort?.notifierTransfertEleve(idEleve);
    await this.bulletinsEvaluationsPort?.notifierTransfertEleve(idEleve);
  }
}
