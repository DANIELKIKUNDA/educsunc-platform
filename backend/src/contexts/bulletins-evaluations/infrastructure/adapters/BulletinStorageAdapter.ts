import type { ServiceStockageFichier } from 'shared/infrastructure/storage/FileStorageService';

// Cette interface decrit une archive physique geree par le stockage documentaire du BC.
export interface DocumentArchiveBulletin {
  chemin: string;
  contenu: Buffer | string;
}

// Ce fichier centralise le stockage technique des exports, snapshots et archives du BC.
export class BulletinStorageAdapter {
  // Ce constructeur accepte un stockage shared optionnel pour rester utilisable en local.
  constructor(private readonly stockage?: ServiceStockageFichier) {}

  // Cette methode archive un document si un stockage externe est configure.
  public async archiver(document: DocumentArchiveBulletin): Promise<string> {
    if (this.stockage === undefined) {
      return document.chemin;
    }

    return await this.stockage.televerser(document.chemin, document.contenu);
  }

  // Cette methode relit un document archive si le support existe.
  public async relire(chemin: string): Promise<Buffer | string | null> {
    if (this.stockage === undefined) {
      return null;
    }

    return await this.stockage.telecharger(chemin);
  }
}
