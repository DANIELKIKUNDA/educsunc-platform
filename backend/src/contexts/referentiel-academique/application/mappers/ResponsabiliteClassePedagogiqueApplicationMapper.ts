import { ResponsabiliteClassePedagogique } from '../../domain/aggregates/ResponsabiliteClassePedagogique';
import { ResponsabiliteClassePedagogiqueSortie } from '../dto/output/ResponsabiliteClassePedagogiqueSortie';

// Ce mapper transforme la responsabilite de classe pedagogique en contrat de sortie stable.
export class ResponsabiliteClassePedagogiqueApplicationMapper {
  public static versSortie(params: {
    responsabiliteClassePedagogique: ResponsabiliteClassePedagogique;
    sectionCode: string;
    sectionLibelle: string;
  }): ResponsabiliteClassePedagogiqueSortie {
    const { responsabiliteClassePedagogique, sectionCode, sectionLibelle } = params;

    return {
      id: responsabiliteClassePedagogique.obtenirId().obtenirValeur(),
      idOrganisation: responsabiliteClassePedagogique.obtenirIdOrganisation().obtenirValeur(),
      idEcole: responsabiliteClassePedagogique.obtenirIdEcole().obtenirValeur(),
      idClassePedagogique: responsabiliteClassePedagogique.obtenirIdClassePedagogique().obtenirValeur(),
      idClasseAcademique: responsabiliteClassePedagogique.obtenirIdClasseAcademique().obtenirValeur(),
      idSectionScolaire: responsabiliteClassePedagogique.obtenirIdSectionScolaire().obtenirValeur(),
      sectionCode,
      sectionLibelle,
      idAnneeScolaire: responsabiliteClassePedagogique.obtenirIdAnneeScolaire().obtenirValeur(),
      idUtilisateurEnseignant: responsabiliteClassePedagogique.obtenirIdUtilisateurEnseignant(),
      active: responsabiliteClassePedagogique.estActive(),
      dateDebut: responsabiliteClassePedagogique.obtenirDateDebut().toISOString(),
      dateFin: responsabiliteClassePedagogique.obtenirDateFin()?.toISOString(),
      creeLe: responsabiliteClassePedagogique.obtenirCreeLe().toISOString(),
      creePar: responsabiliteClassePedagogique.obtenirCreePar(),
      version: responsabiliteClassePedagogique.obtenirVersion(),
    };
  }
}
