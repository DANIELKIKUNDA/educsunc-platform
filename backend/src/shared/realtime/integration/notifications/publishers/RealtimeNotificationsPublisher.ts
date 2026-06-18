import type { PublierEvenementTempsReelCommand } from '../../../application';

const journal: PublierEvenementTempsReelCommand[] = [];

export class RealtimeNotificationsPublisher {
  public async publier(commande: PublierEvenementTempsReelCommand): Promise<void> {
    journal.push(commande);
  }

  public journal(): readonly PublierEvenementTempsReelCommand[] {
    return [...journal];
  }
}
