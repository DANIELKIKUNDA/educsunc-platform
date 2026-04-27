import { PaiementsFacturationPort } from '../ports/PaiementsFacturationPort';

// Ce fichier contient la saga d'inscription d'eleve.
/**
 * Cette saga prepare les reactions inter-BC futures liees a l'inscription.
 */
export class SagaInscriptionEleve {
  constructor(private readonly paiementsFacturationPort?: PaiementsFacturationPort) {}

  /** Notifie le BC Paiements quand une famille devient nombreuse. */
  public async notifierFamilleNombreuseSiNecessaire(idFamille: string, eligible: boolean): Promise<void> {
    await this.paiementsFacturationPort?.notifierFamilleNombreuse(idFamille, eligible);
  }
}
