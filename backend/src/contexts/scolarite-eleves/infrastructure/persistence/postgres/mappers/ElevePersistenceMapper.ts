import { Eleve, ProprietesEleve } from '../../../../domain/aggregates/Eleve';
import { EcoleProvenance, ProprietesEcoleProvenance } from '../../../../domain/value-objects/EcoleProvenance';
import { SexeEleve } from '../../../../domain/value-objects/SexeEleve';
import { StatutEleve } from '../../../../domain/value-objects/StatutEleve';

// Ce fichier transforme les lignes SQL eleves en agregat Eleve et inversement.
export interface EleveRow {
  id: string;
  id_organisation: string;
  id_ecole: string;
  matricule: string;
  nom: string;
  post_nom: string;
  prenom: string | null;
  sexe: SexeEleve;
  date_naissance: string;
  lieu_naissance: string | null;
  nationalite: string | null;
  ecole_provenance: ProprietesEcoleProvenance | string;
  id_famille: string | null;
  statut_global: StatutEleve;
  cree_par: string;
  cree_le: Date | string;
  modifie_par: string | null;
  modifie_le: Date | string | null;
  version: number;
  supprime_logiquement: boolean;
}

/**
 * Ce mapper ne contient aucune regle metier, uniquement des conversions de structure.
 */
export class ElevePersistenceMapper {
  /** Transforme une ligne SQL en agregat Eleve. */
  public static depuisLigne(ligne: EleveRow): Eleve {
    const ecoleProvenance = typeof ligne.ecole_provenance === 'string'
      ? JSON.parse(ligne.ecole_provenance) as ProprietesEcoleProvenance
      : ligne.ecole_provenance;

    return new Eleve({
      idEleve: ligne.id,
      idOrganisation: ligne.id_organisation,
      idEcole: ligne.id_ecole,
      matricule: ligne.matricule,
      nom: ligne.nom,
      postNom: ligne.post_nom,
      prenom: ligne.prenom ?? undefined,
      sexe: ligne.sexe,
      dateNaissance: ligne.date_naissance,
      lieuNaissance: ligne.lieu_naissance ?? undefined,
      nationalite: ligne.nationalite ?? undefined,
      ecoleProvenance: EcoleProvenance.depuisProprietes(ecoleProvenance),
      idFamille: ligne.id_famille ?? undefined,
      statutGlobal: ligne.statut_global,
      creePar: ligne.cree_par,
      creeLe: new Date(ligne.cree_le),
      modifiePar: ligne.modifie_par ?? undefined,
      modifieLe: ligne.modifie_le === null ? undefined : new Date(ligne.modifie_le),
      version: ligne.version,
      supprimeLogiquement: ligne.supprime_logiquement,
    });
  }

  /** Transforme un agregat Eleve en ligne SQL. */
  public static versLigne(eleve: Eleve): EleveRow {
    const proprietes: ProprietesEleve = eleve.versProprietes();

    return {
      id: proprietes.idEleve,
      id_organisation: proprietes.idOrganisation,
      id_ecole: proprietes.idEcole,
      matricule: proprietes.matricule,
      nom: proprietes.nom,
      post_nom: proprietes.postNom,
      prenom: proprietes.prenom ?? null,
      sexe: proprietes.sexe,
      date_naissance: proprietes.dateNaissance,
      lieu_naissance: proprietes.lieuNaissance ?? null,
      nationalite: proprietes.nationalite ?? null,
      ecole_provenance: proprietes.ecoleProvenance.versProprietes(),
      id_famille: proprietes.idFamille ?? null,
      statut_global: proprietes.statutGlobal,
      cree_par: proprietes.creePar,
      cree_le: proprietes.creeLe,
      modifie_par: proprietes.modifiePar ?? null,
      modifie_le: proprietes.modifieLe ?? null,
      version: proprietes.version,
      supprime_logiquement: proprietes.supprimeLogiquement,
    };
  }
}
