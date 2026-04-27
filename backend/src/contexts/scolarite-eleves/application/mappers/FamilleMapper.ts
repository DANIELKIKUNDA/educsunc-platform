import { Famille } from '../../domain/aggregates/Famille';
import { FamilleSortieDTO } from '../dto/output/FamilleSortieDTO';
import { ResponsableFamilleMapper } from './ResponsableFamilleMapper';

// Ce fichier transforme l'agregat Famille en DTO applicatif.
/**
 * Ce mapper expose une famille et ses responsables sous forme de sortie application.
 */
export class FamilleMapper {
  /** Transforme une famille en DTO. */
  public static versSortie(famille: Famille): FamilleSortieDTO {
    const proprietes = famille.versProprietes();

    return {
      idFamille: proprietes.idFamille,
      idOrganisation: proprietes.idOrganisation,
      idEcole: proprietes.idEcole,
      codeFamille: proprietes.codeFamille,
      nomFamille: proprietes.nomFamille,
      adresse: proprietes.adresse,
      telephonePrincipal: proprietes.telephonePrincipal,
      email: proprietes.email,
      responsables: proprietes.responsables.map(ResponsableFamilleMapper.versSortie),
      version: proprietes.version,
    };
  }
}
