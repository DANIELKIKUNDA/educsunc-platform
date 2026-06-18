import { RecuPaiement } from '../../../../domain/aggregates/RecuPaiement';
import type { DepotRecuPaiement } from '../../../../domain/repositories/DepotRecuPaiement';
import { BaseDepotPostgresPaiementsFacturation } from './BaseDepotPostgresPaiementsFacturation';
import type { ClientPostgresPaiementsFacturation } from './ClientPostgresPaiementsFacturation';
import type { PostgresUnitOfWork } from '../transaction/PostgresUnitOfWork';
import type { PaiementTenantContext } from '../../../tenancy/PaiementTenantContext';
import { MappersPaiementsPostgres, type PersistanceRecuPaiementPostgres } from '../mappers/MappersPaiementsPostgres';

// Ce depot persiste les recus de paiement generes.
export class PostgresDepotRecuPaiement
  extends BaseDepotPostgresPaiementsFacturation
  implements DepotRecuPaiement
{
  constructor(
    clientLecture: ClientPostgresPaiementsFacturation,
    uniteDeTravail?: PostgresUnitOfWork<ClientPostgresPaiementsFacturation>,
    contexteTenant?: PaiementTenantContext,
  ) {
    super(clientLecture, uniteDeTravail, contexteTenant);
  }

  public async sauvegarder(recu: RecuPaiement): Promise<void> {
    this.verifierEcritureLocaleAutorisee(recu.obtenirIdEcole());
    const ligne = MappersPaiementsPostgres.versPersistanceRecu(recu);

    await this.executerCommande(
      [
        'INSERT INTO "recus_paiement"',
        '("id", "numero_recu", "id_paiement", "id_obligation", "id_eleve", "id_ecole", "type_frais", "reference_frais", "libelle", "montant", "devise", "montant_lettres", "mode_paiement", "id_caissier", "date_emission", "statut_recu")',
        'VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16)',
        'ON CONFLICT ("id") DO UPDATE SET',
        '"numero_recu" = EXCLUDED."numero_recu",',
        '"id_paiement" = EXCLUDED."id_paiement",',
        '"id_obligation" = EXCLUDED."id_obligation",',
        '"id_eleve" = EXCLUDED."id_eleve",',
        '"id_ecole" = EXCLUDED."id_ecole",',
        '"type_frais" = EXCLUDED."type_frais",',
        '"reference_frais" = EXCLUDED."reference_frais",',
        '"libelle" = EXCLUDED."libelle",',
        '"montant" = EXCLUDED."montant",',
        '"devise" = EXCLUDED."devise",',
        '"montant_lettres" = EXCLUDED."montant_lettres",',
        '"mode_paiement" = EXCLUDED."mode_paiement",',
        '"id_caissier" = EXCLUDED."id_caissier",',
        '"date_emission" = EXCLUDED."date_emission",',
        '"statut_recu" = EXCLUDED."statut_recu"',
      ].join(' '),
      [
        ligne.id,
        ligne.numero_recu,
        ligne.id_paiement,
        ligne.id_obligation,
        ligne.id_eleve,
        ligne.id_ecole,
        ligne.type_frais,
        ligne.reference_frais,
        ligne.libelle,
        ligne.montant,
        ligne.devise,
        ligne.montant_lettres,
        ligne.mode_paiement,
        ligne.id_caissier,
        ligne.date_emission,
        ligne.statut_recu,
      ],
    );
  }

  public async listerParPaiement(idPaiement: string): Promise<RecuPaiement[]> {
    const lignes = await this.executerRequete<PersistanceRecuPaiementPostgres>(
      [
        'SELECT * FROM "recus_paiement"',
        'WHERE "id_paiement" = $1',
        'ORDER BY "date_emission" ASC, "numero_recu" ASC',
      ].join(' '),
      [idPaiement],
    );

    return lignes.map((ligne) =>
      MappersPaiementsPostgres.depuisPersistanceRecu(ligne));
  }

  public async trouverParId(idRecu: string): Promise<RecuPaiement | null> {
    const ligne = await this.executerRequeteUnique<PersistanceRecuPaiementPostgres>(
      'SELECT * FROM "recus_paiement" WHERE "id" = $1 LIMIT 1',
      [idRecu],
    );

    return ligne === null ? null : MappersPaiementsPostgres.depuisPersistanceRecu(ligne);
  }
}
