import { BulletinsEvaluationsPort } from '../../application/ports/BulletinsEvaluationsPort';
import { ClientHttpScolarite } from './ClientHttpScolarite';

// Ce fichier implemente le port vers le BC Bulletins et Evaluations.
export class BulletinEvaluationAdapter implements BulletinsEvaluationsPort {
  constructor(private readonly clientHttp: ClientHttpScolarite, private readonly urlBase: string) {}

  /** Notifie l'abandon d'un eleve. */
  public async notifierAbandonEleve(idEleve: string): Promise<void> {
    await this.clientHttp.post(`${this.urlBase}/eleves/${idEleve}/abandon`, {});
  }

  /** Notifie le transfert d'un eleve. */
  public async notifierTransfertEleve(idEleve: string): Promise<void> {
    await this.clientHttp.post(`${this.urlBase}/eleves/${idEleve}/transfert`, {});
  }

  /** Notifie un changement de classe. */
  public async notifierChangementClasse(idEleve: string, idNouvelleClassePedagogique: string): Promise<void> {
    await this.clientHttp.post(`${this.urlBase}/eleves/${idEleve}/changement-classe`, { idNouvelleClassePedagogique });
  }
}
