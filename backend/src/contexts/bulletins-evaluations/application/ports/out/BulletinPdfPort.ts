import type { BulletinEleveReadModel } from '../../read-models/BulletinEleveReadModel';

// Ce port prepare ou genere une representation PDF officielle du bulletin.
export interface BulletinPdfPort {
  genererBulletinPdf(bulletin: BulletinEleveReadModel): Promise<BulletinPdfGenere>;
}

export interface BulletinPdfGenere {
  nomFichier: string;
  contenu: Uint8Array | Buffer;
  mimeType: string;
}
