import { UseCase } from '../../../../../shared/application/UseCase';
import { DepotAffectationClasse } from '../../../domain/repositories/DepotAffectationClasse';
import { AffectationClasseSortieDTO } from '../../dto/output/AffectationClasseSortieDTO';
import { ErreurRessourceIntrouvable } from '../../exceptions/ErreurRessourceIntrouvable';
import { AffectationClasseMapper } from '../../mappers/AffectationClasseMapper';
import type { AutorisationAffectationClassePort } from '../../ports';

// Ce fichier contient la consultation d'une affectation de classe par identifiant.
export interface ConsulterAffectationClasseEntree {
  idAffectationClasse: string;
  idOrganisation: string;
  idEcole: string;
  idUtilisateur: string;
}
export interface SortieConsulterAffectationClasse { affectation: AffectationClasseSortieDTO }

/** Ce cas d'usage retourne une affectation de classe ciblee, active ou non. */
export class ConsulterAffectationClasse implements UseCase<ConsulterAffectationClasseEntree, SortieConsulterAffectationClasse> {
  constructor(
    private readonly depotAffectation: DepotAffectationClasse,
    private readonly autorisationAffectationClasse?: AutorisationAffectationClassePort,
  ) {}

  public async executer(entree: ConsulterAffectationClasseEntree): Promise<SortieConsulterAffectationClasse> {
    const affectation = await this.depotAffectation.trouverParId(entree.idAffectationClasse);
    if (affectation === null) {
      throw new ErreurRessourceIntrouvable('Affectation introuvable.');
    }

    await this.autorisationAffectationClasse?.verifierConsultationAffectationClasse({
      idUtilisateur: entree.idUtilisateur,
      idOrganisation: entree.idOrganisation,
      idEcole: entree.idEcole,
      idInscriptionScolaire: affectation.obtenirIdInscriptionScolaire(),
    });

    return { affectation: AffectationClasseMapper.versSortie(affectation) };
  }
}
