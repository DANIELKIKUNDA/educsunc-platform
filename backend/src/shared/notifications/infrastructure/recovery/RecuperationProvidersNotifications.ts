// Ce fichier declare la recuperation technique des providers du moteur Notifications.

import { ProviderNotificationTechnique, RapportSanteProviderNotification } from '../providers';
import { OperationRecuperationNotification } from './TypesRecuperationNotifications';

/** Cette classe centralise la verification et la reprise de sante des providers techniques. */
export class RecuperationProvidersNotifications {
  /** Ce constructeur assemble les providers techniques a controler. */
  constructor(private readonly providers: readonly ProviderNotificationTechnique[]) {}

  /** Cette methode controle l'etat de sante global des providers connus. */
  public async verifierSante(): Promise<OperationRecuperationNotification> {
    const rapports = await Promise.all(this.providers.map((provider) => provider.verifierSante()));
    const succes = rapports.every((rapport) => rapport.etat !== 'INDISPONIBLE');

    return {
      cible: 'PROVIDERS',
      succes,
      recupereLe: new Date(),
      raison: succes ? undefined : 'Au moins un provider est indisponible.',
      elementsTraites: rapports.length,
      metadata: {
        rapports,
      },
    };
  }

  /** Cette methode retourne les providers encore recuperables localement. */
  public async listerProvidersRecuperables(): Promise<readonly RapportSanteProviderNotification[]> {
    const rapports = await Promise.all(this.providers.map((provider) => provider.verifierSante()));
    return rapports.filter((rapport) => rapport.etat !== 'INDISPONIBLE');
  }
}
