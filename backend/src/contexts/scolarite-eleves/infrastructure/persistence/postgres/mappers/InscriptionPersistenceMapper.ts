import { InscriptionScolaire, ProprietesInscriptionScolaire } from '../../../../domain/aggregates/InscriptionScolaire';
import { OrigineInscription } from '../../../../domain/value-objects/OrigineInscription';
import { StatutInscription } from '../../../../domain/value-objects/StatutInscription';

// Ce fichier transforme les lignes SQL inscriptions en agregat InscriptionScolaire et inversement.
export interface InscriptionRow {
  id: string;
  id_organisation: string;
  id_ecole: string;
  id_eleve: string;
  id_annee_scolaire: string;
  date_inscription: string;
  origine_inscription: OrigineInscription;
  statut_inscription: StatutInscription;
  numero_ordre: string | null;
  observation: string | null;
  cree_par: string;
  cree_le: Date | string;
  modifie_par: string | null;
  modifie_le: Date | string | null;
  version: number;
  supprime_logiquement: boolean;
}

/** Ce mapper effectue uniquement les conversions SQL/domaine d'InscriptionScolaire. */
export class InscriptionPersistenceMapper {
  /** Transforme une ligne SQL en agregat InscriptionScolaire. */
  public static depuisLigne(ligne: InscriptionRow): InscriptionScolaire {
    return new InscriptionScolaire({
      idInscriptionScolaire: ligne.id,
      idOrganisation: ligne.id_organisation,
      idEcole: ligne.id_ecole,
      idEleve: ligne.id_eleve,
      idAnneeScolaire: ligne.id_annee_scolaire,
      dateInscription: ligne.date_inscription,
      origineInscription: ligne.origine_inscription,
      statutInscription: ligne.statut_inscription,
      numeroOrdre: ligne.numero_ordre ?? undefined,
      observation: ligne.observation ?? undefined,
      creePar: ligne.cree_par,
      creeLe: new Date(ligne.cree_le),
      modifiePar: ligne.modifie_par ?? undefined,
      modifieLe: ligne.modifie_le === null ? undefined : new Date(ligne.modifie_le),
      version: ligne.version,
      supprimeLogiquement: ligne.supprime_logiquement,
    });
  }

  /** Transforme un agregat InscriptionScolaire en ligne SQL. */
  public static versLigne(inscription: InscriptionScolaire): InscriptionRow {
    const proprietes: ProprietesInscriptionScolaire = inscription.versProprietes();

    return {
      id: proprietes.idInscriptionScolaire,
      id_organisation: proprietes.idOrganisation,
      id_ecole: proprietes.idEcole,
      id_eleve: proprietes.idEleve,
      id_annee_scolaire: proprietes.idAnneeScolaire,
      date_inscription: proprietes.dateInscription,
      origine_inscription: proprietes.origineInscription,
      statut_inscription: proprietes.statutInscription,
      numero_ordre: proprietes.numeroOrdre ?? null,
      observation: proprietes.observation ?? null,
      cree_par: proprietes.creePar,
      cree_le: proprietes.creeLe,
      modifie_par: proprietes.modifiePar ?? null,
      modifie_le: proprietes.modifieLe ?? null,
      version: proprietes.version,
      supprime_logiquement: proprietes.supprimeLogiquement,
    };
  }
}
