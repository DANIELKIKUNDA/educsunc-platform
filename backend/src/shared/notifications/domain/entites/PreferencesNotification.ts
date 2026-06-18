import { Entite } from '../../../domain/Entity';
import { CanalNotification, NiveauPreferenceNotification } from '../enumerations';

/**
 * Cette entite represente les preferences de communication resolues pour un niveau donne.
 */
export class PreferencesNotification extends Entite<string> {
  public readonly niveau: NiveauPreferenceNotification;
  private readonly canauxAutorises: CanalNotification[];
  public readonly canalPrefere?: CanalNotification;
  public readonly mute: boolean;
  public readonly verrouille: boolean;

  /**
   * Ce constructeur hydrate les preferences consolidees d'une audience ou d'un destinataire.
   */
  constructor(
    identifiant: string,
    niveau: NiveauPreferenceNotification,
    canauxAutorises: CanalNotification[] = [],
    canalPrefere?: CanalNotification,
    mute = false,
    verrouille = false,
  ) {
    super(identifiant);
    this.niveau = niveau;
    this.canauxAutorises = [...canauxAutorises];
    this.canalPrefere = canalPrefere;
    this.mute = mute;
    this.verrouille = verrouille;
  }

  /** Cette methode expose les canaux encore autorises pour la diffusion. */
  public obtenirCanauxAutorises(): CanalNotification[] { return [...this.canauxAutorises]; }
}
