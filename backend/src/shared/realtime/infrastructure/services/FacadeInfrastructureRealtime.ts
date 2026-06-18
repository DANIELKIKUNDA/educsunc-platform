import {
  ServiceApplicationAbonnementRealtime,
  ServiceApplicationConnexionRealtime,
  ServiceApplicationDiffusionRealtime,
  ServiceApplicationEtatRealtime,
} from '../../application';
import { RegistreInfrastructureRealtime } from './RegistreInfrastructureRealtime';

export class FacadeInfrastructureRealtime {
  public readonly registre = new RegistreInfrastructureRealtime();

  public readonly diffusion = new ServiceApplicationDiffusionRealtime(
    this.registre.evenements,
    this.registre.diffusion,
    this.registre.audience,
    this.registre.auth,
    this.registre.security,
    this.registre.observabilite,
  );

  public readonly connexions = new ServiceApplicationConnexionRealtime(this.registre.connexions);

  public readonly abonnements = new ServiceApplicationAbonnementRealtime(this.registre.abonnements);

  public readonly etat = new ServiceApplicationEtatRealtime(
    this.registre.connexions,
    this.registre.abonnements,
    this.registre.evenements,
  );
}
