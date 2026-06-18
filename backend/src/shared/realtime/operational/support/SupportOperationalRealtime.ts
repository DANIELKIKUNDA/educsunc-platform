import { ManifestRuntimeRealtime } from '../manifests/ManifestRuntimeRealtime';

export class SupportOperationalRealtime {
  public decrire() {
    return new ManifestRuntimeRealtime().lire();
  }
}
