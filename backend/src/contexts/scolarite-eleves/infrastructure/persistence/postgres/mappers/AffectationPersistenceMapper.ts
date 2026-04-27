import { AffectationClasse, ProprietesAffectationClasse } from '../../../../domain/aggregates/AffectationClasse';

// Ce fichier transforme les lignes SQL affectations en agregat AffectationClasse et inversement.
export interface AffectationRow {
  id: string;
  id_organisation: string;
  id_ecole: string;
  id_inscription_scolaire: string;
  id_classe_pedagogique: string;
  date_affectation: string;
  motif_affectation: string | null;
  active: boolean;
  cree_par: string;
  cree_le: Date | string;
  modifie_par: string | null;
  modifie_le: Date | string | null;
  version: number;
  supprime_logiquement: boolean;
}

/** Ce mapper effectue uniquement les conversions SQL/domaine d'AffectationClasse. */
export class AffectationPersistenceMapper {
  /** Transforme une ligne SQL en agregat AffectationClasse. */
  public static depuisLigne(ligne: AffectationRow): AffectationClasse {
    return new AffectationClasse({
      idAffectationClasse: ligne.id,
      idOrganisation: ligne.id_organisation,
      idEcole: ligne.id_ecole,
      idInscriptionScolaire: ligne.id_inscription_scolaire,
      idClassePedagogique: ligne.id_classe_pedagogique,
      dateAffectation: ligne.date_affectation,
      motifAffectation: ligne.motif_affectation ?? undefined,
      active: ligne.active,
      creePar: ligne.cree_par,
      creeLe: new Date(ligne.cree_le),
      modifiePar: ligne.modifie_par ?? undefined,
      modifieLe: ligne.modifie_le === null ? undefined : new Date(ligne.modifie_le),
      version: ligne.version,
      supprimeLogiquement: ligne.supprime_logiquement,
    });
  }

  /** Transforme un agregat AffectationClasse en ligne SQL. */
  public static versLigne(affectation: AffectationClasse): AffectationRow {
    const proprietes: ProprietesAffectationClasse = affectation.versProprietes();

    return {
      id: proprietes.idAffectationClasse,
      id_organisation: proprietes.idOrganisation,
      id_ecole: proprietes.idEcole,
      id_inscription_scolaire: proprietes.idInscriptionScolaire,
      id_classe_pedagogique: proprietes.idClassePedagogique,
      date_affectation: proprietes.dateAffectation,
      motif_affectation: proprietes.motifAffectation ?? null,
      active: proprietes.active,
      cree_par: proprietes.creePar,
      cree_le: proprietes.creeLe,
      modifie_par: proprietes.modifiePar ?? null,
      modifie_le: proprietes.modifieLe ?? null,
      version: proprietes.version,
      supprime_logiquement: proprietes.supprimeLogiquement,
    };
  }
}
