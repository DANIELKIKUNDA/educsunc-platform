import { Restitution } from '../../../../domain/aggregates/Restitution';
import type { DepotRestitution } from '../../../../domain/repositories/DepotRestitution';
import { BaseDepotPostgresPaiementsFacturation } from './BaseDepotPostgresPaiementsFacturation';
import type { ClientPostgresPaiementsFacturation } from './ClientPostgresPaiementsFacturation';
import type { PostgresUnitOfWork } from '../transaction/PostgresUnitOfWork';
import type { PaiementTenantContext } from '../../../tenancy/PaiementTenantContext';
import { MappersPaiementsPostgres, type PersistanceRestitutionPostgres } from '../mappers/MappersPaiementsPostgres';

// Ce depot persiste les restitutions dexcedents financiers.
export class PostgresDepotRestitution
  extends BaseDepotPostgresPaiementsFacturation
  implements DepotRestitution
{
  constructor(
    clientLecture: ClientPostgresPaiementsFacturation,
    uniteDeTravail?: PostgresUnitOfWork<ClientPostgresPaiementsFacturation>,
    contexteTenant?: PaiementTenantContext,
  ) {
    super(clientLecture, uniteDeTravail, contexteTenant);
  }

  public async sauvegarder(restitution: Restitution): Promise<void> {
    this.verifierEcritureLocaleAutorisee(restitution.obtenirIdEcole());
    const ligne = MappersPaiementsPostgres.versPersistanceRestitution(restitution);

    await this.executerCommande(
      [
        'INSERT INTO "restitutions"',
        '("id", "id_paiement", "id_ecole", "id_eleve", "montant", "devise", "raison", "effectue_par", "effectue_le")',
        'VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9)',
        'ON CONFLICT ("id") DO UPDATE SET',
        '"id_paiement" = EXCLUDED."id_paiement",',
        '"id_ecole" = EXCLUDED."id_ecole",',
        '"id_eleve" = EXCLUDED."id_eleve",',
        '"montant" = EXCLUDED."montant",',
        '"devise" = EXCLUDED."devise",',
        '"raison" = EXCLUDED."raison",',
        '"effectue_par" = EXCLUDED."effectue_par",',
        '"effectue_le" = EXCLUDED."effectue_le"',
      ].join(' '),
      [
        ligne.id,
        ligne.id_paiement,
        ligne.id_ecole,
        ligne.id_eleve,
        ligne.montant,
        ligne.devise,
        ligne.raison,
        ligne.effectue_par,
        ligne.effectue_le,
      ],
    );
  }

  public async trouverParId(idRestitution: string): Promise<Restitution | null> {
    const ligne = await this.executerRequeteUnique<PersistanceRestitutionPostgres>(
      'SELECT * FROM "restitutions" WHERE "id" = $1 LIMIT 1',
      [idRestitution],
    );

    return ligne === null
      ? null
      : MappersPaiementsPostgres.depuisPersistanceRestitution(ligne);
  }
}
