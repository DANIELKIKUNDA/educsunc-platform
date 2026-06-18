import type { CoursProblematiqueQuery } from 'contexts/bulletins-evaluations/application/queries/CoursProblematiqueQuery';
import type { CoursProblematiqueReadModel } from 'contexts/bulletins-evaluations/application/read-models/CoursProblematiqueReadModel';
import type { CodeColonneBulletin } from 'contexts/bulletins-evaluations/domain/value-objects/CodeColonneBulletin';
import { PostgresDepotFicheCotationEleveCours } from '../depots/PostgresDepotFicheCotationEleveCours';

// Cette query relit les cours problematiques d'une classe depuis les fiches de cotation.
export class PostgresCoursProblematiqueQuery implements CoursProblematiqueQuery {
  constructor(private readonly depot = new PostgresDepotFicheCotationEleveCours()) {}

  public async executer(
    idClassePedagogique: string,
    idAnneeScolaire: string,
    codeColonne: CodeColonneBulletin,
    seuilEchec: number,
    seuilEchecProfond: number,
  ): Promise<CoursProblematiqueReadModel[]> {
    const fiches = await this.depot.listerParClasseEtColonne(idClassePedagogique, codeColonne, idAnneeScolaire);
    const groupes = new Map<string, {
      effectifEchecs: number;
      effectifEchecsProfonds: number;
      totalPourcentages: number;
      idsElevesConcernes: Set<string>;
    }>();

    for (const fiche of fiches) {
      const cote = fiche.obtenirCoteParColonne(codeColonne);
      if (cote === undefined || cote.obtenirCoteObtenue() === null) {
        continue;
      }

      const coteObtenue = cote.obtenirCoteObtenue();
      if (coteObtenue === null) {
        continue;
      }
      const pourcentage = cote.obtenirMaximumColonne() === 0
        ? 0
        : (coteObtenue / cote.obtenirMaximumColonne()) * 100;

      if (pourcentage >= seuilEchec) {
        continue;
      }

      const groupe = groupes.get(fiche.obtenirIdReferentielCours()) ?? {
        effectifEchecs: 0,
        effectifEchecsProfonds: 0,
        totalPourcentages: 0,
        idsElevesConcernes: new Set<string>(),
      };

      groupe.effectifEchecs += 1;
      if (pourcentage < seuilEchecProfond) {
        groupe.effectifEchecsProfonds += 1;
      }
      groupe.totalPourcentages += pourcentage;
      groupe.idsElevesConcernes.add(fiche.obtenirIdEleve());
      groupes.set(fiche.obtenirIdReferentielCours(), groupe);
    }

    return [...groupes.entries()]
      .map(([idReferentielCours, groupe]) => ({
        idReferentielCours,
        codeColonne,
        effectifEchecs: groupe.effectifEchecs,
        effectifEchecsProfonds: groupe.effectifEchecsProfonds,
        moyennePourcentage: Number((groupe.totalPourcentages / groupe.effectifEchecs).toFixed(2)),
        idsElevesConcernes: [...groupe.idsElevesConcernes],
      }))
      .sort((a, b) => (b.effectifEchecs - a.effectifEchecs) || (a.moyennePourcentage - b.moyennePourcentage));
  }
}
