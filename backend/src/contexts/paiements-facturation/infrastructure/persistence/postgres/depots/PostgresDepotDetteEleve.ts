// Ce fichier contient le depot PostgreSQL de la dette consolidee par eleve.

import { DetteEleve } from '../../../../domain/aggregates/DetteEleve';
import type { DepotDetteEleve } from '../../../../domain/repositories/DepotDetteEleve';
import { BaseDepotPostgresPaiementsFacturation } from './BaseDepotPostgresPaiementsFacturation';
import type { ClientPostgresPaiementsFacturation } from './ClientPostgresPaiementsFacturation';
import type { PostgresUnitOfWork } from '../transaction/PostgresUnitOfWork';
import type { PaiementTenantContext } from '../../../tenancy/PaiementTenantContext';
import {
  MappersPaiementsPostgres,
  type PersistanceDetteElevePostgres,
} from '../mappers/MappersPaiementsPostgres';

// Ce depot persiste la vue consolidee des dettes par eleve.
export class PostgresDepotDetteEleve
  extends BaseDepotPostgresPaiementsFacturation
  implements DepotDetteEleve
{
  // Ce constructeur injecte le client de lecture, l'unite de travail et le contexte tenant.
  constructor(
    clientLecture: ClientPostgresPaiementsFacturation,
    uniteDeTravail?: PostgresUnitOfWork<ClientPostgresPaiementsFacturation>,
    contexteTenant?: PaiementTenantContext,
  ) {
    super(clientLecture, uniteDeTravail, contexteTenant);
  }

  // Cette methode sauvegarde la dette consolidee d'un eleve.
  public async sauvegarder(dette: DetteEleve): Promise<void> {
    this.verifierEcritureLocaleAutorisee(dette.obtenirIdEcole());
    const ligne = MappersPaiementsPostgres.versPersistanceDette(dette);

    await this.executerCommande(
      [
        'INSERT INTO "dettes_eleves"',
        '("id", "id_eleve", "id_ecole", "dettes_par_annee", "total_arrieres", "total_annee_active", "total_global")',
        'VALUES ($1, $2, $3, $4::jsonb, $5::jsonb, $6::jsonb, $7::jsonb)',
        'ON CONFLICT ("id") DO UPDATE SET',
        '"id_eleve" = EXCLUDED."id_eleve",',
        '"id_ecole" = EXCLUDED."id_ecole",',
        '"dettes_par_annee" = EXCLUDED."dettes_par_annee",',
        '"total_arrieres" = EXCLUDED."total_arrieres",',
        '"total_annee_active" = EXCLUDED."total_annee_active",',
        '"total_global" = EXCLUDED."total_global"',
      ].join(' '),
      [
        ligne.id,
        ligne.id_eleve,
        ligne.id_ecole,
        JSON.stringify(ligne.dettes_par_annee),
        JSON.stringify(ligne.total_arrieres),
        JSON.stringify(ligne.total_annee_active),
        JSON.stringify(ligne.total_global),
      ],
    );
  }

  // Cette methode recharge la dette d'un eleve pour une ecole donnee.
  public async trouverParEleve(
    idEcole: string,
    idEleve: string,
  ): Promise<DetteEleve | null> {
    const ligne = await this.executerRequeteUnique<PersistanceDetteElevePostgres>(
      [
        'SELECT * FROM "dettes_eleves"',
        'WHERE "id_ecole" = $1 AND "id_eleve" = $2',
        'LIMIT 1',
      ].join(' '),
      [idEcole, idEleve],
    );

    return ligne === null
      ? null
      : MappersPaiementsPostgres.depuisPersistanceDette(ligne);
  }
}
