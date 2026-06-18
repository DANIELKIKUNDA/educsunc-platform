import type { PolitiqueDiffusion } from '../../domain';

export class ProjectionPolitiqueRealtime {
  public projeter(politique: PolitiqueDiffusion) {
    return {
      prioriteParDefaut: politique.prioriteParDefaut,
      typeDiffusionParDefaut: politique.typeDiffusionParDefaut,
      offlineFirst: politique.offlineFirst,
      canauxAutorises: [...politique.canauxAutorises],
    };
  }
}
