import type {
  AbandonEleveDTO,
  ClassePedagogiqueBulletinDTO,
  EleveBulletinDTO,
  InscriptionBulletinDTO,
  ScolariteElevesPort,
} from 'contexts/bulletins-evaluations/application/ports/out/ScolariteElevesPort';
import { SexeEleve } from 'contexts/bulletins-evaluations/domain/value-objects/SexeEleve';

// Ce fichier isole l'acces futur au BC Scolarite & Eleves depuis le BC bulletins.
export class ScolariteElevesAdapter implements ScolariteElevesPort {
  // Cette methode retrouvera plus tard la fiche eleve source.
  public async consulterEleve(idEleve: string): Promise<EleveBulletinDTO | null> {
    return {
      idEleve,
      nomComplet: 'Eleve a synchroniser',
      sexe: SexeEleve.M,
      idEcole: 'ECOLE_NON_CHARGEE',
    };
  }

  // Cette methode retrouvera plus tard l'inscription scolaire d'un eleve.
  public async consulterInscription(idInscriptionScolaire: string): Promise<InscriptionBulletinDTO | null> {
    return {
      idInscriptionScolaire,
      idEleve: 'ELEVE_NON_CHARGE',
      idClassePedagogique: 'CLASSE_NON_CHARGEE',
      idAnneeScolaire: 'ANNEE_NON_CHARGEE',
    };
  }

  // Cette methode retrouvera plus tard la classe pedagogique support.
  public async consulterClassePedagogique(idClassePedagogique: string): Promise<ClassePedagogiqueBulletinDTO | null> {
    return {
      idClassePedagogique,
      libelleClasse: 'Classe non synchronisee',
      idEcole: 'ECOLE_NON_CHARGEE',
    };
  }

  // Cette methode verifiera plus tard si l'eleve est sorti ou abandon.
  public async verifierAbandon(): Promise<AbandonEleveDTO | null> {
    return null;
  }
}
