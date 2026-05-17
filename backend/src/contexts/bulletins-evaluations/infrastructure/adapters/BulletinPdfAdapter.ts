import type {
  BulletinPdfGenere,
  BulletinPdfPort,
} from 'contexts/bulletins-evaluations/application/ports/out/BulletinPdfPort';
import type { BulletinEleveReadModel } from 'contexts/bulletins-evaluations/application/read-models/BulletinEleveReadModel';
import { PdfBulletinService } from '../services/PdfBulletinService';

// Ce fichier relie la generation technique du document au port applicatif de PDF.
export class BulletinPdfAdapter implements BulletinPdfPort {
  // Ce constructeur injecte le service technique specialise de generation.
  constructor(private readonly servicePdf: PdfBulletinService) {}

  // Cette methode genere un document exportable a partir d'un bulletin pret a afficher.
  public async genererBulletinPdf(bulletin: BulletinEleveReadModel): Promise<BulletinPdfGenere> {
    return await this.servicePdf.genererDepuisReadModel(bulletin);
  }
}
