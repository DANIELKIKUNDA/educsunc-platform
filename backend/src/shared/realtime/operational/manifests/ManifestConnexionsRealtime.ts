export class ManifestConnexionsRealtime {
  public lire() {
    return {
      flux: ['open', 'close', 'reconnect', 'cleanup'],
    };
  }
}
