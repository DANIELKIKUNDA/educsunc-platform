import type { ProclamationClasseOutput } from 'contexts/bulletins-evaluations/application/dto/output/ProclamationClasseOutput';
import type { ProclamationPdfGenere } from 'contexts/bulletins-evaluations/application/ports/out/ProclamationPdfPort';

// Ce presenter transforme une proclamation en reponse HTTP standard.
export class ProclamationPresenter {
  // Cette methode enveloppe la proclamation dans un objet simple.
  public static presenter(
    proclamation: ProclamationClasseOutput | ProclamationPdfGenere,
  ): { donnee: ProclamationClasseOutput | ProclamationPdfGenere } {
    return { donnee: proclamation };
  }
}
