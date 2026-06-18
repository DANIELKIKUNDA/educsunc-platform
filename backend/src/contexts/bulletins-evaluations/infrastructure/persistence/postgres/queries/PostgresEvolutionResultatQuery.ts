import type { EvolutionResultatQuery } from 'contexts/bulletins-evaluations/application/queries/EvolutionResultatQuery';
import type { EvolutionResultatReadModel } from 'contexts/bulletins-evaluations/application/read-models/EvolutionResultatReadModel';
import type { CodeColonneBulletin } from 'contexts/bulletins-evaluations/domain/value-objects/CodeColonneBulletin';
import { PostgresDepotResultatBulletinEleve } from '../depots/PostgresDepotResultatBulletinEleve';

// Cette query relit l'evolution historisee d'un resultat consolide.
export class PostgresEvolutionResultatQuery implements EvolutionResultatQuery {
  constructor(private readonly depot = new PostgresDepotResultatBulletinEleve()) {}

  public async executer(
    idEleve: string,
    idAnneeScolaire: string,
    codeColonne?: CodeColonneBulletin,
  ): Promise<EvolutionResultatReadModel[]> {
    const resultat = await this.depot.trouverParEleveEtAnnee(idEleve, idAnneeScolaire);
    if (resultat === null) {
      return [];
    }

    const snapshots = await this.depot.listerSnapshotsResultats(resultat.obtenirId());
    const snapshotsFiltres = snapshots.filter((snapshot) => codeColonne === undefined || snapshot.obtenirCodeColonne() === codeColonne);
    const historiques = snapshotsFiltres.map((snapshot) => ({
      codeColonne: snapshot.obtenirCodeColonne() as CodeColonneBulletin,
      totalObtenu: snapshot.obtenirTotalObtenu(),
      maximumGeneral: snapshot.obtenirMaximumGeneral(),
      pourcentage: snapshot.obtenirPourcentage(),
      rang: snapshot.obtenirRang(),
      estNonClasse: snapshot.obtenirEstNonClasse(),
      dateObservation: snapshot.obtenirDateSnapshot(),
      motifObservation: snapshot.obtenirMotifSnapshot(),
      estEtatCourant: false,
    }));

    const etatCourant = resultat.obtenirResultatsColonnes()
      .filter((colonne) => codeColonne === undefined || colonne.obtenirCodeColonne() === codeColonne)
      .map((colonne) => ({
        codeColonne: colonne.obtenirCodeColonne(),
        totalObtenu: colonne.obtenirTotalObtenu(),
        maximumGeneral: colonne.obtenirMaximumGeneral(),
        pourcentage: colonne.obtenirPourcentage(),
        rang: colonne.obtenirRang(),
        estNonClasse: colonne.obtenirEstNonClasse(),
        dateObservation: resultat.obtenirDernierRecalculLe() ?? new Date(0),
        motifObservation: 'ETAT_COURANT',
        estEtatCourant: true,
      }));

    return [...historiques, ...etatCourant]
      .sort((a, b) => a.dateObservation.getTime() - b.dateObservation.getTime());
  }
}
