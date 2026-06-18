import { CANAUX_REALTIME } from '../../domain';

export class RuntimeCanauxRealtime {
  public lister(): readonly string[] {
    return CANAUX_REALTIME;
  }
}
