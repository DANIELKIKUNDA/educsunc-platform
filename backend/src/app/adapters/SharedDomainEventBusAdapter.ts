import type { DomainEventBusPort } from '../../shared/application/DomainEventBusPort';
import type { EvenementDomaine } from '../../shared/domain/DomainEvent';
import { obtenirSharedEventBus } from '../../shared/infrastructure/bus';
import type { SharedBusEventMetadata } from '../../shared/infrastructure/bus';
import type { Journaliseur } from '../../shared/infrastructure/logger/Logger';

// Cet adaptateur publie des evenements de domaine vers le bus partage transverse.
export class SharedDomainEventBusAdapter implements DomainEventBusPort {
  constructor(
    private readonly journaliseur?: Journaliseur,
  ) {}

  public async publier(
    evenements: EvenementDomaine[],
    metadata: Partial<SharedBusEventMetadata> = {},
  ): Promise<void> {
    for (const evenement of evenements) {
      this.journaliseur?.info('Publication d un evenement de domaine vers le bus partage.', {
        nomEvenement: evenement.typeEvenement,
        evenement,
      });

      await obtenirSharedEventBus().publier(
        evenement.typeEvenement,
        evenement as unknown as Record<string, unknown>,
        {
          ...metadata,
          eventId: metadata.eventId ?? evenement.idEvenement,
          occurredAt: metadata.occurredAt ?? evenement.dateEvenement.toISOString(),
          organisationId: metadata.organisationId ?? this.extraireChamp(evenement, 'idOrganisation'),
          ecoleId: metadata.ecoleId ?? this.extraireChamp(evenement, 'idEcole'),
          utilisateurId: metadata.utilisateurId ?? this.extraireChamp(evenement, 'declenchePar'),
          correlationId: metadata.correlationId ?? evenement.idEvenement,
          requestId: metadata.requestId ?? evenement.idEvenement,
        },
      );
    }
  }

  private extraireChamp(evenement: EvenementDomaine, cle: string): string | undefined {
    const valeur = (evenement as unknown as Record<string, unknown>)[cle];
    return typeof valeur === 'string' ? valeur : undefined;
  }
}
