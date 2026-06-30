import { QualificationFinanciereEleve } from '../../../../domain/aggregates/QualificationFinanciereEleve';
import type { DepotQualificationFinanciereEleve } from '../../../../domain/repositories/DepotQualificationFinanciereEleve';
import { CodeQualificationFinanciereEleve } from '../../../../domain/value-objects/CodeQualificationFinanciereEleve';
import { BaseDepotPostgresPaiementsFacturation } from './BaseDepotPostgresPaiementsFacturation';
import type { ClientPostgresPaiementsFacturation } from './ClientPostgresPaiementsFacturation';
import type { PostgresUnitOfWork } from '../transaction/PostgresUnitOfWork';
import type { PaiementTenantContext } from '../../../tenancy/PaiementTenantContext';
import {
  MappersPaiementsPostgres,
  type PersistanceQualificationFinanciereElevePostgres,
} from '../mappers/MappersPaiementsPostgres';

export class PostgresDepotQualificationFinanciereEleve
  extends BaseDepotPostgresPaiementsFacturation
  implements DepotQualificationFinanciereEleve
{
  constructor(
    clientLecture: ClientPostgresPaiementsFacturation,
    uniteDeTravail?: PostgresUnitOfWork<ClientPostgresPaiementsFacturation>,
    contexteTenant?: PaiementTenantContext,
  ) {
    super(clientLecture, uniteDeTravail, contexteTenant);
  }

  public async sauvegarder(qualification: QualificationFinanciereEleve): Promise<void> {
    this.verifierEcritureLocaleAutorisee(qualification.obtenirIdEcole());
    const ligne = MappersPaiementsPostgres.versPersistanceQualificationFinanciereEleve(qualification);

    await this.executerCommande(
      [
        'INSERT INTO "qualifications_financieres_eleves"',
        '("id", "id_organisation", "id_ecole", "id_eleve", "code_qualification", "actif", "date_debut_effet", "date_fin_effet", "details", "raison", "cree_par", "cree_le", "version")',
        'VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)',
        'ON CONFLICT ("id") DO UPDATE SET',
        '"id_organisation" = EXCLUDED."id_organisation",',
        '"id_ecole" = EXCLUDED."id_ecole",',
        '"id_eleve" = EXCLUDED."id_eleve",',
        '"code_qualification" = EXCLUDED."code_qualification",',
        '"actif" = EXCLUDED."actif",',
        '"date_debut_effet" = EXCLUDED."date_debut_effet",',
        '"date_fin_effet" = EXCLUDED."date_fin_effet",',
        '"details" = EXCLUDED."details",',
        '"raison" = EXCLUDED."raison",',
        '"cree_par" = EXCLUDED."cree_par",',
        '"cree_le" = EXCLUDED."cree_le",',
        '"version" = EXCLUDED."version"',
      ].join(' '),
      [
        ligne.id,
        ligne.id_organisation,
        ligne.id_ecole,
        ligne.id_eleve,
        ligne.code_qualification,
        ligne.actif,
        ligne.date_debut_effet,
        ligne.date_fin_effet,
        ligne.details,
        ligne.raison,
        ligne.cree_par,
        ligne.cree_le,
        ligne.version,
      ],
    );
  }

  public async trouverParId(idQualification: string): Promise<QualificationFinanciereEleve | null> {
    const ligne = await this.executerRequeteUnique<PersistanceQualificationFinanciereElevePostgres>(
      'SELECT * FROM "qualifications_financieres_eleves" WHERE "id" = $1 LIMIT 1',
      [idQualification],
    );

    return ligne === null
      ? null
      : MappersPaiementsPostgres.depuisPersistanceQualificationFinanciereEleve(ligne);
  }

  public async trouverActiveParEleveEtCode(params: {
    idEcole: string;
    idEleve: string;
    codeQualification: CodeQualificationFinanciereEleve;
  }): Promise<QualificationFinanciereEleve | null> {
    const ligne = await this.executerRequeteUnique<PersistanceQualificationFinanciereElevePostgres>(
      [
        'SELECT * FROM "qualifications_financieres_eleves"',
        'WHERE "id_ecole" = $1 AND "id_eleve" = $2 AND "code_qualification" = $3 AND "actif" = true',
        'LIMIT 1',
      ].join(' '),
      [params.idEcole, params.idEleve, params.codeQualification],
    );

    return ligne === null
      ? null
      : MappersPaiementsPostgres.depuisPersistanceQualificationFinanciereEleve(ligne);
  }

  public async listerParEleve(idEcole: string, idEleve: string): Promise<QualificationFinanciereEleve[]> {
    const lignes = await this.executerRequete<PersistanceQualificationFinanciereElevePostgres>(
      [
        'SELECT * FROM "qualifications_financieres_eleves"',
        'WHERE "id_ecole" = $1 AND "id_eleve" = $2',
        'ORDER BY "cree_le" DESC',
      ].join(' '),
      [idEcole, idEleve],
    );

    return lignes.map((ligne) =>
      MappersPaiementsPostgres.depuisPersistanceQualificationFinanciereEleve(ligne));
  }
}
