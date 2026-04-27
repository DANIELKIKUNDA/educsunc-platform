import { Famille, ProprietesFamille } from '../../../../domain/aggregates/Famille';
import { ProprietesResponsableFamille, ResponsableFamille } from '../../../../domain/entities/ResponsableFamille';

// Ce fichier transforme les lignes SQL familles en agregat Famille et inversement.
export interface FamilleRow {
  id: string;
  id_organisation: string;
  id_ecole: string;
  code_famille: string;
  nom_famille: string;
  adresse: string | null;
  telephone_principal: string;
  email: string | null;
  responsables: ProprietesResponsableFamille[] | string;
  cree_par: string;
  cree_le: Date | string;
  modifie_par: string | null;
  modifie_le: Date | string | null;
  version: number;
  supprime_logiquement: boolean;
}

/** Ce mapper effectue uniquement les conversions SQL/domaine de Famille. */
export class FamillePersistenceMapper {
  /** Transforme une ligne SQL en agregat Famille. */
  public static depuisLigne(ligne: FamilleRow): Famille {
    const responsables = typeof ligne.responsables === 'string'
      ? JSON.parse(ligne.responsables) as ProprietesResponsableFamille[]
      : ligne.responsables;

    return new Famille({
      idFamille: ligne.id,
      idOrganisation: ligne.id_organisation,
      idEcole: ligne.id_ecole,
      codeFamille: ligne.code_famille,
      nomFamille: ligne.nom_famille,
      adresse: ligne.adresse ?? undefined,
      telephonePrincipal: ligne.telephone_principal,
      email: ligne.email ?? undefined,
      responsables: responsables.map(ResponsableFamille.creer),
      creePar: ligne.cree_par,
      creeLe: new Date(ligne.cree_le),
      modifiePar: ligne.modifie_par ?? undefined,
      modifieLe: ligne.modifie_le === null ? undefined : new Date(ligne.modifie_le),
      version: ligne.version,
      supprimeLogiquement: ligne.supprime_logiquement,
    });
  }

  /** Transforme un agregat Famille en ligne SQL. */
  public static versLigne(famille: Famille): FamilleRow {
    const proprietes: ProprietesFamille = famille.versProprietes();

    return {
      id: proprietes.idFamille,
      id_organisation: proprietes.idOrganisation,
      id_ecole: proprietes.idEcole,
      code_famille: proprietes.codeFamille,
      nom_famille: proprietes.nomFamille,
      adresse: proprietes.adresse ?? null,
      telephone_principal: proprietes.telephonePrincipal,
      email: proprietes.email ?? null,
      responsables: proprietes.responsables.map((responsable) => responsable.versProprietes()),
      cree_par: proprietes.creePar,
      cree_le: proprietes.creeLe,
      modifie_par: proprietes.modifiePar ?? null,
      modifie_le: proprietes.modifieLe ?? null,
      version: proprietes.version,
      supprime_logiquement: proprietes.supprimeLogiquement,
    };
  }
}
