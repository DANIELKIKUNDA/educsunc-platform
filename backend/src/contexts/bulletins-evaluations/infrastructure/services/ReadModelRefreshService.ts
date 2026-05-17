import type { Journaliseur } from 'shared/infrastructure/logger/Logger';
import { obtenirMemoireTechniqueBulletins } from '../persistence/postgres/depots/outilsDepotBulletin';

// Ce fichier journalise et date les rafraichissements de read models du BC.
export class ReadModelRefreshService {
  // Ce constructeur injecte un journaliseur pour tracer chaque rafraichissement.
  constructor(private readonly journaliseur: Journaliseur) {}

  // Cette methode memorise la date de rafraichissement puis ecrit une trace technique claire.
  public async rafraichirProjection(nomProjection: string, referenceMetier: string): Promise<void> {
    obtenirMemoireTechniqueBulletins().journauxProjection.set(`${nomProjection}:${referenceMetier}`, new Date());
    this.journaliseur.info('Rafraichissement d une projection de lecture bulletin.', {
      nomProjection,
      referenceMetier,
    });
  }
}
