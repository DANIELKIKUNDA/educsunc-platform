import { EvenementParcours } from '../../../../domain/entities/EvenementParcours';
import { ParcoursScolaireEleve } from '../../../../domain/aggregates/ParcoursScolaireEleve';
import { DepotParcoursScolaireEleve } from '../../../../domain/repositories/DepotParcoursScolaireEleve';
import { UUID } from '../../../../domain/value-objects/TypesPrimitifs';
import { ParcoursPersistenceMapper, ParcoursRow } from '../mappers/ParcoursPersistenceMapper';
import { BaseDepotPostgresScolariteEleves } from './BaseDepotPostgresScolariteEleves';

// Ce fichier implemente le depot PostgreSQL des parcours scolaires.
export class PostgresParcoursDepot extends BaseDepotPostgresScolariteEleves implements DepotParcoursScolaireEleve {
  /** Sauvegarde un parcours par upsert technique. */
  public async sauvegarder(parcours: ParcoursScolaireEleve): Promise<void> {
    const ligne = ParcoursPersistenceMapper.versLigne(parcours);
    this.verifierEcritureTenant(ligne.id_organisation, ligne.id_ecole);
    await this.executerCommande(
      `INSERT INTO parcours (id, id_organisation, id_ecole, id_eleve, historique, version)
       VALUES ($1,$2,$3,$4,$5::jsonb,$6)
       ON CONFLICT (id) DO UPDATE SET historique = EXCLUDED.historique, version = EXCLUDED.version`,
      [ligne.id, ligne.id_organisation, ligne.id_ecole, ligne.id_eleve, JSON.stringify(ligne.historique), ligne.version],
    );
  }

  /** Recherche le parcours d'un eleve. */
  public async trouverParEleve(idEleve: UUID): Promise<ParcoursScolaireEleve | null> {
    const ligne = await this.executerRequeteUnique<ParcoursRow>('SELECT * FROM parcours WHERE id_eleve = $1 LIMIT 1', [idEleve]);
    return ligne === null ? null : ParcoursPersistenceMapper.depuisLigne(ligne);
  }

  /** Liste les parcours d'un ensemble d'eleves. */
  public async listerParEleves(idsEleves: UUID[]): Promise<ParcoursScolaireEleve[]> {
    if (idsEleves.length === 0) {
      return [];
    }

    const lignes = await this.executerRequete<ParcoursRow>(
      'SELECT * FROM parcours WHERE id_eleve = ANY($1::text[])',
      [idsEleves],
    );
    return lignes.map(ParcoursPersistenceMapper.depuisLigne);
  }

  /** Liste les evenements d'un eleve. */
  public async listerEvenementsParEleve(idEleve: UUID): Promise<EvenementParcours[]> {
    return (await this.trouverParEleve(idEleve))?.listerHistorique() ?? [];
  }

  /** Liste les evenements d'une annee. */
  public async listerEvenementsParAnnee(idAnneeScolaire: UUID): Promise<EvenementParcours[]> {
    const lignes = await this.executerRequete<ParcoursRow>("SELECT * FROM parcours WHERE historique::text LIKE '%' || $1 || '%'", [idAnneeScolaire]);
    return lignes.flatMap((ligne) => ParcoursPersistenceMapper.depuisLigne(ligne).listerParAnnee(idAnneeScolaire));
  }

  /** Liste les evenements d'une ecole. */
  public async listerEvenementsParEcole(idEcole: UUID): Promise<EvenementParcours[]> {
    const lignes = await this.executerRequete<ParcoursRow>('SELECT * FROM parcours WHERE id_ecole = $1', [idEcole]);
    return lignes.flatMap((ligne) => ParcoursPersistenceMapper.depuisLigne(ligne).listerHistorique());
  }

  /** Liste les evenements d'une organisation. */
  public async listerEvenementsParOrganisation(idOrganisation: UUID): Promise<EvenementParcours[]> {
    const lignes = await this.executerRequete<ParcoursRow>('SELECT * FROM parcours WHERE id_organisation = $1', [idOrganisation]);
    return lignes.flatMap((ligne) => ParcoursPersistenceMapper.depuisLigne(ligne).listerHistorique());
  }
}
