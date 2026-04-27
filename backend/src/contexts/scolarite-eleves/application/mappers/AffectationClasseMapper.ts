import { AffectationClasse } from '../../domain/aggregates/AffectationClasse';
import { AffectationClasseSortieDTO } from '../dto/output/AffectationClasseSortieDTO';

// Ce fichier transforme l'agregat AffectationClasse en DTO applicatif.
/**
 * Ce mapper projette l'affectation active ou historique.
 */
export class AffectationClasseMapper {
  /** Transforme une affectation de classe en DTO. */
  public static versSortie(affectation: AffectationClasse): AffectationClasseSortieDTO {
    const proprietes = affectation.versProprietes();

    return {
      idAffectationClasse: proprietes.idAffectationClasse,
      idOrganisation: proprietes.idOrganisation,
      idEcole: proprietes.idEcole,
      idInscriptionScolaire: proprietes.idInscriptionScolaire,
      idClassePedagogique: proprietes.idClassePedagogique,
      dateAffectation: proprietes.dateAffectation,
      motifAffectation: proprietes.motifAffectation,
      active: proprietes.active,
      version: proprietes.version,
    };
  }
}
