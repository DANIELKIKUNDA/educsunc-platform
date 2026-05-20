import type { TitulariatOutput } from 'shared/security/application';

// Ce presenter stabilise les sorties HTTP du titulariat.
export class TitulariatPresenter {
  public static presenter(sortie: TitulariatOutput): { donnee: { success: true; data: TitulariatOutput } } {
    return { donnee: { success: true, data: sortie } };
  }
}
