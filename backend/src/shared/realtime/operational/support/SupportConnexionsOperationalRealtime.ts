import { ManifestConnexionsRealtime } from '../manifests/ManifestConnexionsRealtime';

export class SupportConnexionsOperationalRealtime {
  public decrire() {
    return new ManifestConnexionsRealtime().lire();
  }
}
