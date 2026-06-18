import { UseCase } from '../../../../../shared/application/UseCase';
import { DepotAffectationClasse } from '../../../domain/repositories/DepotAffectationClasse';
import { ContexteCommandeScolariteDTO } from '../../dto/input/CommandesCommunesDTO';
import type { AutorisationAffectationClassePort } from '../../ports';

// Ce fichier contient le cas d'usage de desactivation d'une affectation.
export interface DesactiverAffectationClasseEntree extends ContexteCommandeScolariteDTO { idInscriptionScolaire: string }

/** Ce cas d'usage desactive l'affectation active d'une inscription. */
export class DesactiverAffectationClasse implements UseCase<DesactiverAffectationClasseEntree, void> {
  constructor(
    private readonly depotAffectation: DepotAffectationClasse,
    private readonly autorisationAffectationClasse?: AutorisationAffectationClassePort,
  ) {}
  /** Execute la desactivation. */
  public async executer(entree: DesactiverAffectationClasseEntree): Promise<void> {
    await this.autorisationAffectationClasse?.verifierDesactivationAffectationClasse({
      idUtilisateur: entree.idUtilisateur,
      idOrganisation: entree.idOrganisation,
      idEcole: entree.idEcole,
      idInscriptionScolaire: entree.idInscriptionScolaire,
    });
    await this.depotAffectation.desactiverAffectationActiveParInscription(entree.idInscriptionScolaire, entree.idUtilisateur);
  }
}
