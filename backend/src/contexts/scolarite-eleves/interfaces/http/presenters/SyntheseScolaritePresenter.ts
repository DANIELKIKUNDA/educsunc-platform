import { PresenterHttpScolarite } from './PresenterHttpScolarite';

// Ce fichier presente les syntheses et alertes de scolarite.
export class SyntheseScolaritePresenter {
  /** Presente une synthese organisationnelle ou ecole. */
  public static presenterSynthese<TSynthese>(synthese: TSynthese) { return PresenterHttpScolarite.detail(synthese); }
  /** Presente une liste d'alertes. */
  public static presenterAlertes<TAlerte>(alertes: TAlerte[]) { return PresenterHttpScolarite.liste(alertes); }
}
