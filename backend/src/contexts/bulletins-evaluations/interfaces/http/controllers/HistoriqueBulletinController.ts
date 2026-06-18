import type { ConsulterHistoriqueBulletinUseCase } from 'contexts/bulletins-evaluations/application/use-cases/ConsulterHistoriqueBulletin/ConsulterHistoriqueBulletinUseCase';
import type { DepotProclamationClasse } from 'contexts/bulletins-evaluations/domain/repositories/DepotProclamationClasse';
import type { DepotResultatBulletinEleve } from 'contexts/bulletins-evaluations/domain/repositories/DepotResultatBulletinEleve';
import { ProclamationPostgresMapper } from 'contexts/bulletins-evaluations/infrastructure/persistence/postgres/mappers';
import { ConsulterHistoriqueBulletinValidator } from '../validators/ConsulterHistoriqueBulletinValidator';
import { ValidationHttpBulletinsEvaluations } from '../validators/ValidationHttpBulletinsEvaluations';

// Ce controleur expose les endpoints HTTP d'historique et d'archives du BC.
export class HistoriqueBulletinController {
  // Ce constructeur injecte le cas d'usage de consultation d'historique deja disponible.
  constructor(
    private readonly consulterHistoriqueBulletinUseCase: ConsulterHistoriqueBulletinUseCase,
    private readonly depotProclamationClasse: DepotProclamationClasse,
    private readonly depotResultatBulletinEleve: DepotResultatBulletinEleve,
  ) {}

  // Cette methode consulte l'historique d'un bulletin.
  public async consulterHistoriqueBulletins(params: unknown, headers: unknown): Promise<{ donnee: unknown }> {
    const entree = ConsulterHistoriqueBulletinValidator.valider(params, headers);
    const sortie = await this.consulterHistoriqueBulletinUseCase.executer(entree);
    return { donnee: sortie };
  }

  // Cette methode expose l'historique des proclamations quand il sera branche.
  public async consulterHistoriqueProclamations(query: unknown): Promise<{ donnee: unknown[] }> {
    const donnees = ValidationHttpBulletinsEvaluations.obtenirObjet(query, 'query');
    const historique = await this.depotProclamationClasse.listerHistoriqueProclamations(
      ValidationHttpBulletinsEvaluations.lireChaineRequise(donnees, 'idClassePedagogique'),
      ValidationHttpBulletinsEvaluations.lireChaineRequise(donnees, 'idAnneeScolaire'),
    );

    return {
      donnee: historique
        .sort((a, b) => b.obtenirDateGeneration().getTime() - a.obtenirDateGeneration().getTime())
        .map((proclamation) => ProclamationPostgresMapper.versReadModel(proclamation)),
    };
  }

  // Cette methode expose les snapshots disponibles quand ils seront branches.
  public async consulterSnapshots(query: unknown): Promise<{ donnee: unknown[] }> {
    const donnees = ValidationHttpBulletinsEvaluations.obtenirObjet(query, 'query');
    const snapshots = await this.depotResultatBulletinEleve.listerSnapshotsResultats(
      ValidationHttpBulletinsEvaluations.lireChaineRequise(donnees, 'idResultatBulletinEleve'),
    );

    return {
      donnee: snapshots
        .sort((a, b) => b.obtenirDateSnapshot().getTime() - a.obtenirDateSnapshot().getTime())
        .map((snapshot) => ({
          idEleve: snapshot.obtenirIdEleve(),
          idInscriptionScolaire: snapshot.obtenirIdInscriptionScolaire(),
          idClassePedagogique: snapshot.obtenirIdClassePedagogique(),
          idAnneeScolaire: snapshot.obtenirIdAnneeScolaire(),
          codeColonne: snapshot.obtenirCodeColonne(),
          totalObtenu: snapshot.obtenirTotalObtenu(),
          maximumGeneral: snapshot.obtenirMaximumGeneral(),
          pourcentage: snapshot.obtenirPourcentage(),
          rang: snapshot.obtenirRang(),
          estNonClasse: snapshot.obtenirEstNonClasse(),
          versionReferentielProgramme: snapshot.obtenirVersionReferentielProgramme(),
          dateSnapshot: snapshot.obtenirDateSnapshot(),
          motifSnapshot: snapshot.obtenirMotifSnapshot(),
          creePar: snapshot.obtenirCreePar(),
        })),
    };
  }
}
