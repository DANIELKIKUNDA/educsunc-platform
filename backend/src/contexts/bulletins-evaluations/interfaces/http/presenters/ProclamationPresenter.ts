import type { ProclamationClasseOutput } from 'contexts/bulletins-evaluations/application/dto/output/ProclamationClasseOutput';

// Ce presenter transforme une proclamation en reponse HTTP standard.
export class ProclamationPresenter {
  // Cette methode enveloppe la proclamation dans un objet simple.
  public static presenter(proclamation: ProclamationClasseOutput): { donnee: ProclamationClasseOutput } {
    return { donnee: proclamation };
  }
}
