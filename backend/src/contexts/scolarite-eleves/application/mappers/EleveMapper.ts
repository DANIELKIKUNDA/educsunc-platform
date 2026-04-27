import { Eleve } from '../../domain/aggregates/Eleve';
import { EleveDetailSortieDTO } from '../dto/output/EleveDetailSortieDTO';
import { EleveSortieDTO } from '../dto/output/EleveSortieDTO';

// Ce fichier transforme l'agregat Eleve en DTO applicatifs.
/**
 * Ce mapper ne contient pas de logique metier, seulement de la projection.
 */
export class EleveMapper {
  /** Transforme un eleve en sortie synthetique. */
  public static versSortie(eleve: Eleve): EleveSortieDTO {
    const proprietes = eleve.versProprietes();
    const provenance = proprietes.ecoleProvenance;

    return {
      idEleve: proprietes.idEleve,
      idOrganisation: proprietes.idOrganisation,
      idEcole: proprietes.idEcole,
      matricule: proprietes.matricule,
      nom: proprietes.nom,
      postNom: proprietes.postNom,
      prenom: proprietes.prenom,
      sexe: proprietes.sexe,
      dateNaissance: proprietes.dateNaissance,
      statutGlobal: proprietes.statutGlobal,
      idFamille: proprietes.idFamille,
      typeProvenance: provenance.obtenirTypeProvenance(),
      nomEcoleProvenance: provenance.obtenirNomEcoleProvenance(),
      version: proprietes.version,
    };
  }

  /** Transforme un eleve en sortie detaillee. */
  public static versDetail(eleve: Eleve): EleveDetailSortieDTO {
    const proprietes = eleve.versProprietes();
    const sortie = EleveMapper.versSortie(eleve);

    return {
      ...sortie,
      lieuNaissance: proprietes.lieuNaissance,
      nationalite: proprietes.nationalite,
      idEcoleProvenance: proprietes.ecoleProvenance.obtenirIdEcoleProvenance(),
      creePar: proprietes.creePar,
      creeLe: proprietes.creeLe.toISOString(),
      modifiePar: proprietes.modifiePar,
      modifieLe: proprietes.modifieLe?.toISOString(),
      supprimeLogiquement: proprietes.supprimeLogiquement,
    };
  }
}
