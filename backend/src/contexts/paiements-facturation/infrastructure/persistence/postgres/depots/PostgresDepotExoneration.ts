import { Exoneration } from '../../../../domain/aggregates/Exoneration';
import type { DepotExoneration } from '../../../../domain/repositories/DepotExoneration';
import { BaseDepotPostgresPaiementsFacturation } from './BaseDepotPostgresPaiementsFacturation';
import type { ClientPostgresPaiementsFacturation } from './ClientPostgresPaiementsFacturation';
import type { PostgresUnitOfWork } from '../transaction/PostgresUnitOfWork';
import type { PaiementTenantContext } from '../../../tenancy/PaiementTenantContext';
import { MappersPaiementsPostgres, type PersistanceExonerationPostgres } from '../mappers/MappersPaiementsPostgres';

// Ce depot persiste les exonerations accordees aux eleves.
export class PostgresDepotExoneration
  extends BaseDepotPostgresPaiementsFacturation
  implements DepotExoneration
{
  constructor(
    clientLecture: ClientPostgresPaiementsFacturation,
    uniteDeTravail?: PostgresUnitOfWork<ClientPostgresPaiementsFacturation>,
    contexteTenant?: PaiementTenantContext,
  ) {
    super(clientLecture, uniteDeTravail, contexteTenant);
  }

  public async sauvegarder(exoneration: Exoneration): Promise<void> {
    this.verifierEcritureLocaleAutorisee(exoneration.obtenirIdEcole());
    const ligne = MappersPaiementsPostgres.versPersistanceExoneration(exoneration);

    await this.executerCommande(
      [
        'INSERT INTO "exonerations"',
        '("id", "id_ecole", "id_eleve", "id_obligation", "type_exoneration", "montant_exonere", "devise", "pourcentage", "raison", "valide_par", "validee_le", "statut")',
        'VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12)',
        'ON CONFLICT ("id") DO UPDATE SET',
        '"id_ecole" = EXCLUDED."id_ecole",',
        '"id_eleve" = EXCLUDED."id_eleve",',
        '"id_obligation" = EXCLUDED."id_obligation",',
        '"type_exoneration" = EXCLUDED."type_exoneration",',
        '"montant_exonere" = EXCLUDED."montant_exonere",',
        '"devise" = EXCLUDED."devise",',
        '"pourcentage" = EXCLUDED."pourcentage",',
        '"raison" = EXCLUDED."raison",',
        '"valide_par" = EXCLUDED."valide_par",',
        '"validee_le" = EXCLUDED."validee_le",',
        '"statut" = EXCLUDED."statut"',
      ].join(' '),
      [
        ligne.id,
        ligne.id_ecole,
        ligne.id_eleve,
        ligne.id_obligation,
        ligne.type_exoneration,
        ligne.montant_exonere,
        ligne.devise,
        ligne.pourcentage,
        ligne.raison,
        ligne.valide_par,
        ligne.validee_le,
        ligne.statut,
      ],
    );
  }

  public async trouverParId(idExoneration: string): Promise<Exoneration | null> {
    const ligne = await this.executerRequeteUnique<PersistanceExonerationPostgres>(
      'SELECT * FROM "exonerations" WHERE "id" = $1 LIMIT 1',
      [idExoneration],
    );

    return ligne === null
      ? null
      : MappersPaiementsPostgres.depuisPersistanceExoneration(ligne);
  }

  public async listerParEleve(
    idEcole: string,
    idEleve: string,
  ): Promise<Exoneration[]> {
    const lignes = await this.executerRequete<PersistanceExonerationPostgres>(
      [
        'SELECT * FROM "exonerations"',
        'WHERE "id_ecole" = $1 AND "id_eleve" = $2',
        'ORDER BY "validee_le" DESC',
      ].join(' '),
      [idEcole, idEleve],
    );

    return lignes.map((ligne) =>
      MappersPaiementsPostgres.depuisPersistanceExoneration(ligne));
  }
}
