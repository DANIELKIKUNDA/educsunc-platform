import { Eleve } from '../../domain/aggregates/Eleve';
import { Famille } from '../../domain/aggregates/Famille';
import { InscriptionScolaire } from '../../domain/aggregates/InscriptionScolaire';
import { EleveListeReadModel } from '../read-models/EleveListeReadModel';
import { FamilleListeReadModel } from '../read-models/FamilleListeReadModel';
import { InscriptionListeReadModel } from '../read-models/InscriptionListeReadModel';

// Ce fichier contient le service applicatif qui prepare des read models simples.
/**
 * Ce service evite de propager les agregats complets dans les tableaux de lecture.
 */
export class ServiceApplicationReadModel {
  /** Prepare la lecture legere d'un eleve. */
  public creerEleveListe(eleve: Eleve): EleveListeReadModel {
    return {
      idEleve: eleve.obtenirId(),
      matricule: eleve.obtenirMatricule(),
      nomComplet: [eleve.obtenirNom(), eleve.obtenirPostNom(), eleve.obtenirPrenom()].filter(Boolean).join(' '),
      statutGlobal: eleve.obtenirStatutGlobal(),
    };
  }

  /** Prepare la lecture legere d'une famille. */
  public creerFamilleListe(famille: Famille, nombreElevesActifs: number): FamilleListeReadModel {
    return {
      idFamille: famille.obtenirId(),
      codeFamille: famille.obtenirCodeFamille(),
      nomFamille: famille.obtenirNomFamille(),
      telephonePrincipal: famille.obtenirTelephonePrincipal(),
      nombreElevesActifs,
    };
  }

  /** Prepare la lecture legere d'une inscription. */
  public creerInscriptionListe(inscription: InscriptionScolaire, nomCompletEleve: string): InscriptionListeReadModel {
    return {
      idInscriptionScolaire: inscription.obtenirId(),
      idEleve: inscription.obtenirIdEleve(),
      nomCompletEleve,
      idAnneeScolaire: inscription.obtenirIdAnneeScolaire(),
      statutInscription: inscription.obtenirStatutInscription(),
    };
  }
}
