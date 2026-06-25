import type { ProclamationClasseReadModel } from 'contexts/bulletins-evaluations/application/read-models/ProclamationClasseReadModel';
import type { ProclamationTemplateDocumentaire } from 'contexts/bulletins-evaluations/application/read-models/ProclamationDocumentDataReadModel';

// Ce service resout la famille documentaire officielle de proclamation.
export class ProclamationTemplateResolverService {
  public resoudre(_proclamation: ProclamationClasseReadModel): ProclamationTemplateDocumentaire {
    return 'PROCL-TPL-01';
  }
}
