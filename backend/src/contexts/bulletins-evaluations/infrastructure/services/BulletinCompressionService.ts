import { gzipSync } from 'node:zlib';

// Ce fichier centralise la compression technique des archives et exports du BC.
export class BulletinCompressionService {
  // Cette methode compresse un contenu binaire ou texte en format gzip.
  public compresser(contenu: Buffer | string): Buffer {
    return gzipSync(Buffer.isBuffer(contenu) ? contenu : Buffer.from(contenu, 'utf-8'));
  }
}
