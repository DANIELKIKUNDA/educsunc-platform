import { ParcoursScolaireEleve, ProprietesParcoursScolaireEleve } from '../../../../domain/aggregates/ParcoursScolaireEleve';
import { EvenementParcours, ProprietesEvenementParcours } from '../../../../domain/entities/EvenementParcours';

// Ce fichier transforme les lignes SQL parcours en agregat ParcoursScolaireEleve et inversement.
export interface ParcoursRow {
  id: string;
  id_organisation: string;
  id_ecole: string;
  id_eleve: string;
  historique: ProprietesEvenementParcours[] | string;
  version: number;
}

/** Ce mapper effectue uniquement les conversions SQL/domaine de ParcoursScolaireEleve. */
export class ParcoursPersistenceMapper {
  /** Transforme une ligne SQL en agregat ParcoursScolaireEleve. */
  public static depuisLigne(ligne: ParcoursRow): ParcoursScolaireEleve {
    const historique = typeof ligne.historique === 'string'
      ? JSON.parse(ligne.historique) as ProprietesEvenementParcours[]
      : ligne.historique;

    return new ParcoursScolaireEleve({
      idParcoursScolaireEleve: ligne.id,
      idOrganisation: ligne.id_organisation,
      idEcole: ligne.id_ecole,
      idEleve: ligne.id_eleve,
      historique: historique.map((evenement) => EvenementParcours.creer({ ...evenement, dateEvenement: new Date(evenement.dateEvenement) })),
      version: ligne.version,
    });
  }

  /** Transforme un agregat ParcoursScolaireEleve en ligne SQL. */
  public static versLigne(parcours: ParcoursScolaireEleve): ParcoursRow {
    const proprietes: ProprietesParcoursScolaireEleve = parcours.versProprietes();

    return {
      id: proprietes.idParcoursScolaireEleve,
      id_organisation: proprietes.idOrganisation,
      id_ecole: proprietes.idEcole,
      id_eleve: proprietes.idEleve,
      historique: proprietes.historique.map((evenement) => evenement.versProprietes()),
      version: proprietes.version,
    };
  }
}
