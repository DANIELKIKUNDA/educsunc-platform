// Ce fichier declare la recuperation technique tenant-aware du moteur Notifications.

import { EnregistrementArchiveNotification, EnregistrementForensicNotification } from '../storage';
import { ChargeLivraisonNotification } from '../providers';
import { ContexteSecuriteNotification, GardeIsolationTenantNotification } from '../security';
import { OperationRecuperationNotification } from './TypesRecuperationNotifications';

/** Cette classe applique les controles d'isolation tenant avant toute reprise technique. */
export class RecuperationTenantNotifications {
  /** Ce constructeur relie la recuperation a la garde d'isolation tenant. */
  constructor(
    private readonly gardeIsolationTenantNotification: GardeIsolationTenantNotification,
  ) {}

  /** Cette methode controle qu'une charge provider reste recuperable dans le tenant courant. */
  public verifierCharge(
    contexte: ContexteSecuriteNotification,
    charge: ChargeLivraisonNotification,
  ): OperationRecuperationNotification {
    const resultat = this.gardeIsolationTenantNotification.verifierChargeProvider(contexte, charge);
    return this.construireOperation('charge-provider', resultat.autorise, resultat.raison);
  }

  /** Cette methode controle qu'une archive reste recuperable dans le tenant courant. */
  public verifierArchive(
    contexte: ContexteSecuriteNotification,
    archive: EnregistrementArchiveNotification,
  ): OperationRecuperationNotification {
    const resultat = this.gardeIsolationTenantNotification.verifierArchive(contexte, archive);
    return this.construireOperation('archive', resultat.autorise, resultat.raison);
  }

  /** Cette methode controle qu'une vue forensic reste recuperable dans le tenant courant. */
  public verifierForensic(
    contexte: ContexteSecuriteNotification,
    vue: EnregistrementForensicNotification,
  ): OperationRecuperationNotification {
    const resultat = this.gardeIsolationTenantNotification.verifierForensic(contexte, vue);
    return this.construireOperation('forensic', resultat.autorise, resultat.raison);
  }

  /** Cette methode construit une operation technique standardisee de recovery tenant. */
  private construireOperation(
    typeControle: string,
    succes: boolean,
    raison?: string,
  ): OperationRecuperationNotification {
    return {
      cible: 'TENANT',
      succes,
      recupereLe: new Date(),
      raison,
      elementsTraites: 1,
      metadata: {
        typeControle,
      },
    };
  }
}
