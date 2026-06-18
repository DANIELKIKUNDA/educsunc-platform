import type { EventBusPort } from 'contexts/bulletins-evaluations/application/ports/out/EventBusPort';
import type { DomainEventBusPort } from 'shared/application/DomainEventBusPort';
import type { EvenementDomaine } from 'shared/domain/DomainEvent';
import type { Journaliseur } from 'shared/infrastructure/logger/Logger';
import { SharedDomainEventBusAdapter } from '../../../../app/adapters/SharedDomainEventBusAdapter';

// Ce fichier fournit un bus d'evenements simple pour publier les evenements du domaine.
export class BulletinEventBusAdapter implements EventBusPort {
  // Ce constructeur injecte un journaliseur pour tracer les publications sans coupler le BC a un broker.
  constructor(
    private readonly journaliseur: Journaliseur,
    private readonly domainEventBus: DomainEventBusPort = new SharedDomainEventBusAdapter(
      journaliseur,
    ),
  ) {}

  // Cette methode publie logiquement les evenements en attendant un bus distribue reel.
  public async publier(
    evenements: EvenementDomaine[],
    metadata?: Parameters<DomainEventBusPort['publier']>[1],
  ): Promise<void> {
    for (const evenement of evenements) {
      this.journaliseur.info('Publication d un evenement de domaine bulletin.', {
        nomEvenement: evenement.constructor.name,
        evenement,
      });
    }

    await this.domainEventBus.publier(evenements, metadata);
  }
}
