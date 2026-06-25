import type { BulletinTemplateBackgroundReadModel } from 'contexts/bulletins-evaluations/application/read-models/BulletinTemplateLayoutReadModel';
import type { BulletinTemplateLayoutReadModel } from 'contexts/bulletins-evaluations/application/read-models/BulletinTemplateLayoutReadModel';

// Ce service isole la resolution du fond maitre actif d'un template documentaire.
export class BulletinMasterBackgroundResolverService {
  public resoudre(layout: BulletinTemplateLayoutReadModel): BulletinTemplateBackgroundReadModel {
    return layout.pages[0].background;
  }
}
