import type { ConsulterParametresPaiementEcoleInput } from '../../dto/input/ParametresPaiementEntreeDTO';
import type { ParametresPaiementEcoleOutput } from '../../dto/output/ParametresPaiementSortieDTO';
import { versParametresPaiementOutput } from '../../mappers/ParametresPaiementApplicationMapper';
import type { DepotParametresPaiementEcole } from '../../../domain/repositories/DepotParametresPaiementEcole';
import { ErreurDroitsInsuffisants } from '../../exceptions/ErreurDroitsInsuffisants';

export class ConsulterParametresPaiementEcoleUseCase {
  constructor(private readonly depotParametresPaiementEcole: DepotParametresPaiementEcole) {}

  public async executer(
    input: ConsulterParametresPaiementEcoleInput,
  ): Promise<ParametresPaiementEcoleOutput | null> {
    this.verifierActeurAutorise(input.roleActif);

    const parametres = await this.depotParametresPaiementEcole.trouverActifParEcole(
      input.idEcole,
    );

    return parametres === null ? null : versParametresPaiementOutput(parametres);
  }

  private verifierActeurAutorise(roleActif?: string): void {
    if (roleActif === 'ADMIN_SYSTEME_ECOLE') {
      return;
    }

    throw new ErreurDroitsInsuffisants(
      "Seul l'admin systeme ecole peut consulter les parametres de paiement de l'ecole.",
    );
  }
}
