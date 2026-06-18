import type {
  ProclamationPdfGenere,
  ProclamationPdfPort,
} from 'contexts/bulletins-evaluations/application/ports/out/ProclamationPdfPort';
import type { ProclamationClasseOutput } from 'contexts/bulletins-evaluations/application/dto/output/ProclamationClasseOutput';
import { PdfProclamationService } from '../services/PdfProclamationService';

// Cet adaptateur relie la generation technique du document au port applicatif de PDF proclamation.
export class ProclamationPdfAdapter implements ProclamationPdfPort {
  constructor(private readonly servicePdf: PdfProclamationService) {}

  public async genererProclamationPdf(proclamation: ProclamationClasseOutput): Promise<ProclamationPdfGenere> {
    return await this.servicePdf.genererDepuisSortie(proclamation);
  }
}
