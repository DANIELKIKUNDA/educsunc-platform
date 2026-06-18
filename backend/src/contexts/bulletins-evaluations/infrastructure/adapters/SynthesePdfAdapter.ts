import type { SyntheseEcoleOutput } from 'contexts/bulletins-evaluations/application/dto/output/SyntheseEcoleOutput';
import type { SynthesePdfGenere, SynthesePdfPort } from 'contexts/bulletins-evaluations/application/ports/out/SynthesePdfPort';
import { PdfSyntheseService } from '../services/PdfSyntheseService';

// Cet adaptateur relie la generation technique du document au port applicatif de PDF synthese.
export class SynthesePdfAdapter implements SynthesePdfPort {
  constructor(private readonly servicePdf: PdfSyntheseService) {}

  public async genererSynthesePdf(synthese: SyntheseEcoleOutput): Promise<SynthesePdfGenere> {
    return await this.servicePdf.genererDepuisSortie(synthese);
  }
}
