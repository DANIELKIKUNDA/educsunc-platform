import type { DepotFicheCotationEleveCours } from 'contexts/bulletins-evaluations/domain/repositories/DepotFicheCotationEleveCours';
import { FicheCotationEleveCours } from 'contexts/bulletins-evaluations/domain/aggregates/FicheCotationEleveCours';
import { FicheCotationPostgresMapper } from '../mappers';
import { lireTexte, obtenirMemoireTechniqueBulletins } from './outilsDepotBulletin';

// Ce fichier fournit un depot PostgreSQL simplifie pour les fiches de cotation.
export class PostgresDepotFicheCotationEleveCours implements DepotFicheCotationEleveCours {
  private static readonly stockage = new Map<string, FicheCotationEleveCours>();

  public async sauvegarder(ficheCotationEleveCours: FicheCotationEleveCours): Promise<void> {
    PostgresDepotFicheCotationEleveCours.stockage.set(ficheCotationEleveCours.obtenirId(), ficheCotationEleveCours);
    obtenirMemoireTechniqueBulletins().auditsEncodage.set(
      ficheCotationEleveCours.obtenirId(),
      FicheCotationPostgresMapper.versAuditsEncodage(ficheCotationEleveCours),
    );
  }

  public async trouverParId(idFicheCotationEleveCours: string): Promise<FicheCotationEleveCours | null> {
    return PostgresDepotFicheCotationEleveCours.stockage.get(idFicheCotationEleveCours) ?? null;
  }

  public async trouverParEleveCoursEtAnnee(
    idEleve: string,
    idReferentielCours: string,
    idAnneeScolaire: string,
  ): Promise<FicheCotationEleveCours | null> {
    return [...PostgresDepotFicheCotationEleveCours.stockage.values()].find((fiche) =>
      fiche.obtenirIdEleve() === idEleve
      && fiche.obtenirIdReferentielCours() === idReferentielCours
      && fiche.obtenirIdAnneeScolaire() === idAnneeScolaire,
    ) ?? null;
  }

  public async listerParEleve(idEleve: string, idAnneeScolaire: string): Promise<FicheCotationEleveCours[]> {
    return [...PostgresDepotFicheCotationEleveCours.stockage.values()].filter((fiche) =>
      fiche.obtenirIdEleve() === idEleve && fiche.obtenirIdAnneeScolaire() === idAnneeScolaire,
    );
  }

  public async listerParClasseEtCours(
    idClassePedagogique: string,
    idReferentielCours: string,
    idAnneeScolaire: string,
  ): Promise<FicheCotationEleveCours[]> {
    return [...PostgresDepotFicheCotationEleveCours.stockage.values()].filter((fiche) =>
      fiche.obtenirIdClassePedagogique() === idClassePedagogique
      && fiche.obtenirIdReferentielCours() === idReferentielCours
      && fiche.obtenirIdAnneeScolaire() === idAnneeScolaire,
    );
  }

  public async listerParClasseEtColonne(
    idClassePedagogique: string,
    codeColonne: string,
    idAnneeScolaire: string,
  ): Promise<FicheCotationEleveCours[]> {
    return [...PostgresDepotFicheCotationEleveCours.stockage.values()].filter((fiche) =>
      fiche.obtenirIdClassePedagogique() === idClassePedagogique
      && fiche.obtenirIdAnneeScolaire() === idAnneeScolaire
      && fiche.obtenirCotesColonnes().some((cote) => lireTexte(cote, 'codeColonne') === codeColonne),
    );
  }

  public async existeFichePourEleveCoursAnnee(
    idEleve: string,
    idReferentielCours: string,
    idAnneeScolaire: string,
  ): Promise<boolean> {
    return (await this.trouverParEleveCoursEtAnnee(idEleve, idReferentielCours, idAnneeScolaire)) !== null;
  }
}
