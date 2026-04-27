import { ReferentielAcademiquePort } from '../ports/ReferentielAcademiquePort';
import { ErreurTenantApplication } from '../exceptions/ErreurTenantApplication';

// Ce fichier contient le service applicatif de validation tenant organisation/ecole.
/**
 * Ce service verifie le contexte tenant via le port Referentiel Academique quand il est disponible.
 */
export class ServiceApplicationTenant {
  constructor(private readonly referentielAcademiquePort?: ReferentielAcademiquePort) {}

  /** Verifie la presence et la coherence organisation/ecole. */
  public async verifierTenant(idOrganisation: string, idEcole: string): Promise<void> {
    if (idOrganisation.trim().length === 0 || idEcole.trim().length === 0) {
      throw new ErreurTenantApplication('L organisation et l ecole sont obligatoires.');
    }

    if (this.referentielAcademiquePort === undefined) {
      return;
    }

    const ecoleValide = await this.referentielAcademiquePort.verifierEcoleAppartientOrganisation(idOrganisation, idEcole);

    if (!ecoleValide) {
      throw new ErreurTenantApplication('L ecole ne correspond pas a l organisation fournie.');
    }
  }
}
