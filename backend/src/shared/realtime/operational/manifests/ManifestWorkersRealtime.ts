export class ManifestWorkersRealtime {
  public lire() {
    return {
      workers: ['BROADCAST', 'DISPATCH', 'HEARTBEAT', 'OBSERVABILITY', 'DIAGNOSTICS'],
    };
  }
}
