import type { BulletinEleveReadModel } from 'contexts/bulletins-evaluations/application/read-models/BulletinEleveReadModel';
import {
  obtenirMemoireTechniqueBulletins,
  type ArchiveBulletinPersistante,
} from '../persistence/postgres/depots/outilsDepotBulletin';
import { BulletinCompressionService } from './BulletinCompressionService';
import { BulletinStorageAdapter } from '../adapters/BulletinStorageAdapter';

// Ce fichier gere l'archivage local des bulletins et de leurs projections exportables.
export class BulletinArchiveService {
  // Ce constructeur accepte un stockage physique facultatif et un compresseur reutilisable.
  constructor(
    private readonly stockage: BulletinStorageAdapter,
    private readonly compression: BulletinCompressionService,
  ) {}

  // Cette methode archive un bulletin sous une forme compressee et memorisee localement.
  public async archiverBulletin(bulletin: BulletinEleveReadModel): Promise<ArchiveBulletinPersistante> {
    const contenu = this.compression.compresser(JSON.stringify(bulletin));
    const archive: ArchiveBulletinPersistante = {
      idArchive: `archive-${bulletin.idBulletinEleve}-${Date.now()}`,
      categorieArchive: 'BULLETIN',
      referenceMetier: bulletin.idBulletinEleve,
      contenu,
      dateArchivage: new Date(),
    };
    obtenirMemoireTechniqueBulletins().archivesBulletins.set(archive.idArchive, archive);
    await this.stockage.archiver({
      chemin: `archives/bulletins/${archive.idArchive}.json.gz`,
      contenu,
    });
    return archive;
  }
}
