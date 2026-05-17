import type { BulletinEleveReadModel } from 'contexts/bulletins-evaluations/application/read-models/BulletinEleveReadModel';
import type { BulletinPdfGenere } from 'contexts/bulletins-evaluations/application/ports/out/BulletinPdfPort';
import { PdfBulletinService } from './PdfBulletinService';

// Ce fichier centralise les exports documentaires du BC a partir des read models.
export class BulletinExportService {
  // Ce constructeur injecte le service PDF pour eviter la duplication des regles d'export.
  constructor(private readonly pdfBulletinService: PdfBulletinService) {}

  // Cette methode produit l'export PDF principal du bulletin.
  public async exporterBulletinPdf(bulletin: BulletinEleveReadModel): Promise<BulletinPdfGenere> {
    return await this.pdfBulletinService.genererDepuisReadModel(bulletin);
  }
}
