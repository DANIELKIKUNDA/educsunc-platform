import { UseCase } from '../../../../../shared/application/UseCase';
import { DepotAffectationClasse } from '../../../domain/repositories/DepotAffectationClasse';
import { ContexteCommandeScolariteDTO } from '../../dto/input/CommandesCommunesDTO';

// Ce fichier contient le cas d'usage de desactivation d'une affectation.
export interface DesactiverAffectationClasseEntree extends ContexteCommandeScolariteDTO { idInscriptionScolaire: string }

/** Ce cas d'usage desactive l'affectation active d'une inscription. */
export class DesactiverAffectationClasse implements UseCase<DesactiverAffectationClasseEntree, void> {
  constructor(private readonly depotAffectation: DepotAffectationClasse) {}
  /** Execute la desactivation. */
  public async executer(entree: DesactiverAffectationClasseEntree): Promise<void> {
    await this.depotAffectation.desactiverAffectationActiveParInscription(entree.idInscriptionScolaire, entree.idUtilisateur);
  }
}
