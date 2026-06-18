import { ParametresPaiementEcole } from '../../../../domain/aggregates/ParametresPaiementEcole';
import type { DepotParametresPaiementEcole } from '../../../../domain/repositories/DepotParametresPaiementEcole';
import { MappersPaiementsPostgres, type PersistanceParametresPaiementEcolePostgres } from '../mappers/MappersPaiementsPostgres';
import { BaseDepotPostgresPaiementsFacturation } from './BaseDepotPostgresPaiementsFacturation';
import type { ClientPostgresPaiementsFacturation } from './ClientPostgresPaiementsFacturation';
import type { PostgresUnitOfWork } from '../transaction/PostgresUnitOfWork';
import type { PaiementTenantContext } from '../../../tenancy/PaiementTenantContext';

// Ce depot persiste les parametres de paiement propres a chaque ecole.
export class PostgresDepotParametresPaiementEcole
  extends BaseDepotPostgresPaiementsFacturation
  implements DepotParametresPaiementEcole
{
  constructor(
    clientLecture: ClientPostgresPaiementsFacturation,
    uniteDeTravail?: PostgresUnitOfWork<ClientPostgresPaiementsFacturation>,
    contexteTenant?: PaiementTenantContext,
  ) {
    super(clientLecture, uniteDeTravail, contexteTenant);
  }

  public async sauvegarder(parametres: ParametresPaiementEcole): Promise<void> {
    this.verifierEcritureLocaleAutorisee(parametres.obtenirIdEcole());
    const ligne = MappersPaiementsPostgres.versPersistanceParametres(parametres);
    const colonnes = [
      'id',
      'id_ecole',
      'paiement_partiel_autorise',
      'paiement_partiel_par_type_frais',
      'perception_deleguee_par_type_frais',
      'consultation_historique_paiements_deleguee',
      'exoneration_deleguee',
      'politique_arrieres',
      'autoriser_inscription_avec_dette',
      'bloquer_retrait_documents_si_dette',
      'appliquer_famille_nombreuse',
      'nombre_enfants_seuil_famille_nombreuse',
      'modes_paiement_autorises',
      'mois_obligatoire_inscription',
      'exiger_frais_inscription',
      'actif',
      'version',
    ] as const;

    await this.sauvegarderAgregatVersionne(
      parametres,
      'parametres_paiement_ecole',
      'id',
      parametres.obtenirId(),
      colonnes,
      this.extraireValeursTypage(ligne, colonnes),
    );
  }

  public async trouverParId(
    idParametresPaiementEcole: string,
  ): Promise<ParametresPaiementEcole | null> {
    const ligne =
      await this.executerRequeteUnique<PersistanceParametresPaiementEcolePostgres>(
        'SELECT * FROM "parametres_paiement_ecole" WHERE "id" = $1 LIMIT 1',
        [idParametresPaiementEcole],
      );

    return ligne === null
      ? null
      : this.marquerAgregatCharge(
        MappersPaiementsPostgres.depuisPersistanceParametres(ligne),
      );
  }

  public async trouverActifParEcole(
    idEcole: string,
  ): Promise<ParametresPaiementEcole | null> {
    const ligne =
      await this.executerRequeteUnique<PersistanceParametresPaiementEcolePostgres>(
        [
          'SELECT * FROM "parametres_paiement_ecole"',
          'WHERE "id_ecole" = $1 AND "actif" = true',
          'LIMIT 1',
        ].join(' '),
        [idEcole],
      );

    return ligne === null
      ? null
      : this.marquerAgregatCharge(
        MappersPaiementsPostgres.depuisPersistanceParametres(ligne),
      );
  }

  private extraireValeursTypage<T extends object, K extends keyof T>(
    objet: T,
    cles: readonly K[],
  ): readonly unknown[] {
    return cles.map((cle) => objet[cle]);
  }
}
