import { PolitiqueArrieres } from '../value-objects/PolitiqueArrieres';

// Cette policy encode la priorisation metier des arrieres.
export class PolicyGestionArrieres {
  public prioriserArrieres(politique: PolitiqueArrieres): boolean {
    return politique === PolitiqueArrieres.ARRIERE_D_ABORD
      || politique === PolitiqueArrieres.BLOQUER_REINSCRIPTION;
  }
}
