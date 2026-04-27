import { ResponsableFamille } from '../../domain/entities/ResponsableFamille';
import { ResponsableFamilleSortieDTO } from '../dto/output/ResponsableFamilleSortieDTO';

// Ce fichier transforme l'entite ResponsableFamille en DTO applicatif.
/**
 * Ce mapper projette les responsables sans ajouter de regle metier.
 */
export class ResponsableFamilleMapper {
  /** Transforme un responsable familial en DTO. */
  public static versSortie(responsable: ResponsableFamille): ResponsableFamilleSortieDTO {
    const proprietes = responsable.versProprietes();

    return {
      idResponsableFamille: proprietes.idResponsableFamille,
      nomComplet: proprietes.nomComplet,
      telephone: proprietes.telephone,
      telephoneSecondaire: proprietes.telephoneSecondaire,
      profession: proprietes.profession,
      lienParente: proprietes.lienParente,
      adresse: proprietes.adresse,
      estPrincipal: proprietes.estPrincipal,
    };
  }
}
