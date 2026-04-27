import { PaiementsFacturationPort } from '../../application/ports/PaiementsFacturationPort';
import { ClientHttpScolarite } from './ClientHttpScolarite';

// Ce fichier implemente le port vers le BC Paiements et Facturation.
export class PaiementFacturationAdapter implements PaiementsFacturationPort {
  constructor(private readonly clientHttp: ClientHttpScolarite, private readonly urlBase: string) {}

  /** Notifie le statut famille nombreuse au BC Paiements. */
  public async notifierFamilleNombreuse(idFamille: string, eligible: boolean): Promise<void> {
    await this.clientHttp.post(`${this.urlBase}/familles/${idFamille}/famille-nombreuse`, { eligible });
  }

  /** Notifie un abandon d'eleve au BC Paiements. */
  public async notifierAbandonEleve(idEleve: string): Promise<void> {
    await this.clientHttp.post(`${this.urlBase}/eleves/${idEleve}/abandon`, {});
  }

  /** Notifie un transfert d'eleve au BC Paiements. */
  public async notifierTransfertEleve(idEleve: string): Promise<void> {
    await this.clientHttp.post(`${this.urlBase}/eleves/${idEleve}/transfert`, {});
  }
}
