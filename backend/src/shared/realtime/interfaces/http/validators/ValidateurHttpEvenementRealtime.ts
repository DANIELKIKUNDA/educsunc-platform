import type { DtoHttpPublierEvenementRealtime } from '../dto/inputs';

export class ValidateurHttpEvenementRealtime {
  public valider(payload: DtoHttpPublierEvenementRealtime): DtoHttpPublierEvenementRealtime {
    return payload;
  }
}
