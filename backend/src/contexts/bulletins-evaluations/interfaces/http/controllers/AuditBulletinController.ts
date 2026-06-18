import type { AuditEncodageQuery } from 'contexts/bulletins-evaluations/application/queries/AuditEncodageQuery';
import type { AuditConduiteQuery } from 'contexts/bulletins-evaluations/application/queries/AuditConduiteQuery';
import type { HistoriqueBulletinQuery } from 'contexts/bulletins-evaluations/application/queries/HistoriqueBulletinQuery';
import type { DepotClassementColonneClasse } from 'contexts/bulletins-evaluations/domain/repositories/DepotClassementColonneClasse';
import type { DepotFicheCotationEleveCours } from 'contexts/bulletins-evaluations/domain/repositories/DepotFicheCotationEleveCours';
import type { DepotResultatBulletinEleve } from 'contexts/bulletins-evaluations/domain/repositories/DepotResultatBulletinEleve';
import type { DepotBulletinEleve } from 'contexts/bulletins-evaluations/domain/repositories/DepotBulletinEleve';
import { QueryException } from 'contexts/bulletins-evaluations/application/exceptions/QueryException';
import type { AutorisationAuditPedagogiqueAdapter } from 'app/adapters/AutorisationAuditPedagogiqueAdapter';
import { ValidationHttpBulletinsEvaluations } from '../validators/ValidationHttpBulletinsEvaluations';
import { AuditPresenter } from '../presenters/AuditPresenter';

// Ce controleur expose les endpoints HTTP d'audit du BC.
export class AuditBulletinController {
  // Ce constructeur injecte la query de lecture des traces d'encodage.
  constructor(
    private readonly auditEncodageQuery: AuditEncodageQuery,
    private readonly auditConduiteQuery: AuditConduiteQuery,
    private readonly historiqueBulletinQuery: HistoriqueBulletinQuery,
    private readonly depotClassementColonneClasse: DepotClassementColonneClasse,
    private readonly depotFicheCotationEleveCours: DepotFicheCotationEleveCours,
    private readonly depotResultatBulletinEleve: DepotResultatBulletinEleve,
    private readonly depotBulletinEleve: DepotBulletinEleve,
    private readonly autorisationAuditPedagogiqueAdapter: AutorisationAuditPedagogiqueAdapter,
  ) {}

  // Cette methode lit l'audit des cotes pour une fiche.
  public async consulterAuditCotes(query: unknown, headers: unknown): Promise<{ donnee: unknown }> {
    const donnees = ValidationHttpBulletinsEvaluations.obtenirObjet(query, 'query');
    const idFicheCotationEleveCours = ValidationHttpBulletinsEvaluations.lireChaineRequise(
      donnees,
      'idFicheCotationEleveCours',
    );
    const ficheCotationEleveCours = await this.depotFicheCotationEleveCours.trouverParId(idFicheCotationEleveCours);

    if (ficheCotationEleveCours === null) {
      throw new QueryException('La fiche de cotation demandee est introuvable.');
    }

    await this.autoriserLectureAudit(
      {
        idEcole: ficheCotationEleveCours.obtenirIdEcole(),
        idClassePedagogique: ficheCotationEleveCours.obtenirIdClassePedagogique(),
        idAnneeScolaire: ficheCotationEleveCours.obtenirIdAnneeScolaire(),
      },
      headers,
      (entree) => this.autorisationAuditPedagogiqueAdapter.verifierLectureAuditCotes(entree),
    );

    const audits = await this.auditEncodageQuery.executer(idFicheCotationEleveCours);
    return AuditPresenter.presenter(audits);
  }

  // Cette methode lit l'audit de conduite pour un resultat consolide.
  public async consulterAuditConduite(query: unknown, headers: unknown): Promise<{ donnee: unknown }> {
    const donnees = ValidationHttpBulletinsEvaluations.obtenirObjet(query, 'query');
    const idResultatBulletinEleve = ValidationHttpBulletinsEvaluations.lireChaineRequise(
      donnees,
      'idResultatBulletinEleve',
    );
    const resultatBulletinEleve = await this.depotResultatBulletinEleve.trouverParId(idResultatBulletinEleve);

    if (resultatBulletinEleve === null) {
      throw new QueryException('Le resultat bulletin demande est introuvable.');
    }

    await this.autoriserLectureAudit(
      {
        idEcole: resultatBulletinEleve.obtenirIdEcole(),
        idClassePedagogique: resultatBulletinEleve.obtenirIdClassePedagogique(),
        idAnneeScolaire: resultatBulletinEleve.obtenirIdAnneeScolaire(),
      },
      headers,
      (entree) => this.autorisationAuditPedagogiqueAdapter.verifierLectureAuditConduite(entree),
    );

    const audits = await this.auditConduiteQuery.executer(idResultatBulletinEleve);
    return AuditPresenter.presenter(audits);
  }

  // Cette methode expose un historique d'audit bulletin quand il sera branche.
  public async consulterAuditBulletins(query: unknown, headers: unknown): Promise<{ donnee: unknown }> {
    const donnees = ValidationHttpBulletinsEvaluations.obtenirObjet(query, 'query');
    const idBulletinEleve = ValidationHttpBulletinsEvaluations.lireChaineRequise(donnees, 'idBulletinEleve');
    const bulletinEleve = await this.depotBulletinEleve.trouverParId(idBulletinEleve);

    if (bulletinEleve === null) {
      throw new QueryException('Le bulletin demande est introuvable.');
    }

    await this.autoriserLectureAudit(
      {
        idEcole: bulletinEleve.obtenirIdEcole(),
        idClassePedagogique: bulletinEleve.obtenirIdClassePedagogique(),
        idAnneeScolaire: bulletinEleve.obtenirIdAnneeScolaire(),
      },
      headers,
      (entree) => this.autorisationAuditPedagogiqueAdapter.verifierLectureAuditBulletins(entree),
    );
    const historiques = await this.historiqueBulletinQuery.executer(idBulletinEleve);

    return AuditPresenter.presenter(
      historiques.map((historique, index) => ({
        action: index === 0 ? 'GENERATION_BULLETIN' : 'REGENERATION_BULLETIN',
        dateAction: historique.dateGeneration,
        idUtilisateur: historique.generePar,
        commentaire: historique.motifGeneration
          ?? `Version bulletin ${historique.versionBulletin} - referentiel ${historique.versionReferentielProgramme}`,
      })),
    );
  }

  // Cette methode expose un historique d'audit classement quand il sera branche.
  public async consulterAuditClassements(query: unknown, headers: unknown): Promise<{ donnee: unknown }> {
    const donnees = ValidationHttpBulletinsEvaluations.obtenirObjet(query, 'query');
    const codeColonne = ValidationHttpBulletinsEvaluations.lireChaineOptionnelle(donnees, 'codeColonne');
    const idClassePedagogique = ValidationHttpBulletinsEvaluations.lireChaineRequise(donnees, 'idClassePedagogique');
    const idAnneeScolaire = ValidationHttpBulletinsEvaluations.lireChaineRequise(donnees, 'idAnneeScolaire');
    const idEcole = ValidationHttpBulletinsEvaluations.lireHeaderChaineRequise(headers, 'x-tenant-id');

    await this.autoriserLectureAudit(
      {
        idEcole,
        idClassePedagogique,
        idAnneeScolaire,
      },
      headers,
      (entree) => this.autorisationAuditPedagogiqueAdapter.verifierLectureAuditClassements(entree),
    );
    const classements = await this.depotClassementColonneClasse.listerParClasse(
      idClassePedagogique,
      idAnneeScolaire,
    );

    const lignes = classements
      .filter((classement) => codeColonne === undefined || classement.obtenirCodeColonne() === codeColonne)
      .sort((a, b) => b.obtenirDateCalcul().getTime() - a.obtenirDateCalcul().getTime())
      .map((classement) => ({
        action: 'RECALCUL_CLASSEMENT',
        dateAction: classement.obtenirDateCalcul(),
        commentaire: `Classement ${String(classement.obtenirCodeColonne())} version ${classement.obtenirVersion()}`,
      }));

    return AuditPresenter.presenter(lignes);
  }

  private async autoriserLectureAudit(
    contexte: {
      idEcole: string;
      idClassePedagogique: string;
      idAnneeScolaire: string;
    },
    headers: unknown,
    autoriser: (entree: {
      idUtilisateur: string;
      idOrganisation?: string;
      idEcole: string;
      idClassePedagogique: string;
      idAnneeScolaire: string;
    }) => Promise<void>,
  ): Promise<void> {
    await autoriser({
      idUtilisateur: ValidationHttpBulletinsEvaluations.lireHeaderChaineRequise(headers, 'x-user-id'),
      idOrganisation: ValidationHttpBulletinsEvaluations.lireHeaderChaine(headers, 'x-organisation-id'),
      ...contexte,
    });
  }
}
