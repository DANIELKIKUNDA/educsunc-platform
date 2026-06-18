import { FileAttenteRealtimeOffline } from '../../infrastructure';

export class RuntimeOfflineRealtime {
  constructor(private readonly file = new FileAttenteRealtimeOffline()) {}

  public drainer() {
    return this.file.drainer();
  }
}
