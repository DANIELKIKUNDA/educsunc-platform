import type {
  BulletinDocumentIdentiteEleveReadModel,
  BulletinDocumentIdentiteInstitutionnelleReadModel,
  BulletinDocumentMetaReadModel,
} from 'contexts/bulletins-evaluations/application/read-models/BulletinDocumentDataReadModel';
import type { ReferentielAcademiquePort } from 'contexts/bulletins-evaluations/application/ports/out/ReferentielAcademiquePort';
import type { ScolariteElevesPort } from 'contexts/bulletins-evaluations/application/ports/out/ScolariteElevesPort';
import type { BulletinEleveReadModel } from 'contexts/bulletins-evaluations/application/read-models/BulletinEleveReadModel';

export interface BulletinDocumentContextReadModel {
  meta?: Partial<BulletinDocumentMetaReadModel>;
  identiteInstitutionnelle?: Partial<BulletinDocumentIdentiteInstitutionnelleReadModel>;
  identiteEleve?: Partial<BulletinDocumentIdentiteEleveReadModel>;
  programmeDocumentaire?: {
    coursProgramme: Array<{
      idReferentielCours: string;
      ordreAffichage: number;
      domaine?: string;
      sousDomaine?: string;
    }>;
  };
}

function formaterDateDocumentaire(date: Date): string {
  const jour = String(date.getDate()).padStart(2, '0');
  const mois = String(date.getMonth() + 1).padStart(2, '0');
  const annee = date.getFullYear();

  return `${jour}/${mois}/${annee}`;
}

function formaterDateValeur(dateSource?: string): string | undefined {
  if (!dateSource) {
    return undefined;
  }

  const date = new Date(dateSource);
  if (Number.isNaN(date.getTime())) {
    return dateSource;
  }

  return formaterDateDocumentaire(date);
}

// Ce service relit les donnees documentaires humaines sans alourdir le read model metier principal.
export class BulletinDocumentContextLoaderService {
  constructor(
    private readonly scolariteElevesPort?: ScolariteElevesPort,
    private readonly referentielAcademiquePort?: ReferentielAcademiquePort,
  ) {}

  public async charger(bulletin: BulletinEleveReadModel): Promise<BulletinDocumentContextReadModel> {
    const [
      eleve,
      classePedagogique,
      ecole,
      anneeScolaire,
      programmeNiveau,
      coursProgramme,
    ] = await Promise.all([
      this.scolariteElevesPort?.consulterEleve(bulletin.idEleve) ?? Promise.resolve(null),
      this.scolariteElevesPort?.consulterClassePedagogique(bulletin.idClassePedagogique) ?? Promise.resolve(null),
      this.referentielAcademiquePort?.consulterEcole?.(bulletin.idEcole) ?? Promise.resolve(null),
      this.referentielAcademiquePort?.consulterAnneeScolaire?.(bulletin.idAnneeScolaire) ?? Promise.resolve(null),
      this.referentielAcademiquePort?.consulterProgrammeNiveau?.({
        idProgrammeNiveau: bulletin.idProgrammeNiveau,
        idEcole: bulletin.idEcole,
      }) ?? Promise.resolve(null),
      this.referentielAcademiquePort?.listerCoursProgramme({
        idProgrammeNiveau: bulletin.idProgrammeNiveau,
        idEcole: bulletin.idEcole,
      }) ?? Promise.resolve([]),
    ]);

    return {
      meta: {
        idClasseAcademique: programmeNiveau?.idClasseAcademique,
        estClasseEXETAT: programmeNiveau?.estClasseEXETAT,
        estClasseFinaliste: programmeNiveau?.estClasseFinaliste,
        libelleAnneeScolaire: anneeScolaire?.libelle,
        dateEditionDocument: formaterDateDocumentaire(new Date()),
      },
      identiteInstitutionnelle: {
        nomEcole: ecole?.nom,
        codeEcole: ecole?.code,
        sigleEcole: ecole?.sigle,
        adresseEcole: ecole?.adresse,
        telephoneEcole: ecole?.telephone,
        emailEcole: ecole?.email,
        provinceEducationnelle: ecole?.provinceEducationnelle,
        ville: ecole?.ville,
        communeOuTerritoire: ecole?.communeOuTerritoire,
        villeSignature: ecole?.ville,
      },
      identiteEleve: {
        matricule: eleve?.matricule,
        nom: eleve?.nom,
        postNom: eleve?.postNom,
        prenom: eleve?.prenom,
        nomComplet: eleve?.nomComplet,
        sexe: eleve?.sexe,
        dateNaissance: formaterDateValeur(eleve?.dateNaissance),
        lieuNaissance: eleve?.lieuNaissance,
        libelleClasse: classePedagogique?.libelleClasse,
        numeroPermanent: eleve?.matricule,
      },
      programmeDocumentaire: {
        coursProgramme: coursProgramme.map((cours) => ({
          idReferentielCours: cours.idReferentielCours,
          ordreAffichage: cours.ordreAffichage,
          domaine: cours.domaine,
          sousDomaine: cours.sousDomaine,
        })),
      },
    };
  }
}
