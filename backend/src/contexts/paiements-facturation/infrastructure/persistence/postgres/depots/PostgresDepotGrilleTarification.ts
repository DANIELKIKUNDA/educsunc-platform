import { GrilleTarification } from '../../../../domain/aggregates/GrilleTarification';
import type { DepotGrilleTarification } from '../../../../domain/repositories/DepotGrilleTarification';
import { BaseDepotPostgresPaiementsFacturation } from './BaseDepotPostgresPaiementsFacturation';
import type { ClientPostgresPaiementsFacturation } from './ClientPostgresPaiementsFacturation';
import type { PostgresUnitOfWork } from '../transaction/PostgresUnitOfWork';
import type { PaiementTenantContext } from '../../../tenancy/PaiementTenantContext';
import { MappersPaiementsPostgres, type PersistanceGrilleTarificationPostgres } from '../mappers/MappersPaiementsPostgres';

// Ce depot persiste les grilles tarifaires locales des ecoles.
export class PostgresDepotGrilleTarification
  extends BaseDepotPostgresPaiementsFacturation
  implements DepotGrilleTarification
{
  constructor(
    clientLecture: ClientPostgresPaiementsFacturation,
    uniteDeTravail?: PostgresUnitOfWork<ClientPostgresPaiementsFacturation>,
    contexteTenant?: PaiementTenantContext,
  ) {
    super(clientLecture, uniteDeTravail, contexteTenant);
  }

  public async sauvegarder(grille: GrilleTarification): Promise<void> {
    this.verifierEcritureLocaleAutorisee(grille.obtenirIdEcole());
    const ligne = MappersPaiementsPostgres.versPersistanceGrille(grille);
    const colonnes = [
      'id',
      'id_organisation',
      'id_ecole',
      'id_annee_scolaire',
      'type_frais',
      'libelle',
      'montant',
      'devise',
      'section',
      'categorie_frais_etat',
      'categorie_technique',
      'est_classe_tenasosp',
      'est_classe_exetat',
      'est_classe_finaliste',
      'mois_scolaire',
      'tranche_frais_etat',
      'obligatoire',
      'actif',
      'date_debut_validite',
      'date_fin_validite',
      'cree_par',
      'cree_le',
      'modifie_par',
      'modifie_le',
      'version',
    ] as const;

    await this.sauvegarderAgregatVersionne(
      grille,
      'grilles_tarification',
      'id',
      grille.obtenirId(),
      colonnes,
      this.extraireValeursTypage(ligne, colonnes),
    );
  }

  public async trouverParId(idGrilleTarification: string): Promise<GrilleTarification | null> {
    const ligne = await this.executerRequeteUnique<PersistanceGrilleTarificationPostgres>(
      'SELECT * FROM "grilles_tarification" WHERE "id" = $1 LIMIT 1',
      [idGrilleTarification],
    );

    return ligne === null
      ? null
      : this.marquerAgregatCharge(MappersPaiementsPostgres.depuisPersistanceGrille(ligne));
  }

  public async trouverParIdEtEcole(
    idGrilleTarification: string,
    idEcole: string,
  ): Promise<GrilleTarification | null> {
    const ligne = await this.executerRequeteUnique<PersistanceGrilleTarificationPostgres>(
      'SELECT * FROM "grilles_tarification" WHERE "id" = $1 AND "id_ecole" = $2 LIMIT 1',
      [idGrilleTarification, idEcole],
    );

    return ligne === null
      ? null
      : this.marquerAgregatCharge(MappersPaiementsPostgres.depuisPersistanceGrille(ligne));
  }

  public async listerActivesParEcoleEtAnnee(
    idEcole: string,
    idAnneeScolaire: string,
  ): Promise<GrilleTarification[]> {
    return this.listerParEcoleEtAnnee(idEcole, idAnneeScolaire, true);
  }

  public async listerParEcoleEtAnnee(
    idEcole: string,
    idAnneeScolaire: string,
    actif?: boolean,
  ): Promise<GrilleTarification[]> {
    const clauses = [
      'SELECT * FROM "grilles_tarification"',
      'WHERE "id_ecole" = $1',
      'AND "id_annee_scolaire" = $2',
    ];
    const parametres: unknown[] = [idEcole, idAnneeScolaire];

    if (actif !== undefined) {
      clauses.push(`AND "actif" = $${parametres.length + 1}`);
      parametres.push(actif);
    }

    clauses.push('ORDER BY "type_frais" ASC, "libelle" ASC');

    const lignes = await this.executerRequete<PersistanceGrilleTarificationPostgres>(
      clauses.join(' '),
      parametres,
    );

    return lignes.map((ligne) =>
      this.marquerAgregatCharge(MappersPaiementsPostgres.depuisPersistanceGrille(ligne)));
  }

  private extraireValeursTypage<T extends object, K extends keyof T>(
    objet: T,
    cles: readonly K[],
  ): readonly unknown[] {
    return cles.map((cle) => objet[cle]);
  }
}
