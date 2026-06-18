import { InitialiseurRuntimeRealtime } from 'shared/realtime';

export class RealtimeRuntimeFactory {
  public static creer() {
    return new InitialiseurRuntimeRealtime().initialiser();
  }
}
