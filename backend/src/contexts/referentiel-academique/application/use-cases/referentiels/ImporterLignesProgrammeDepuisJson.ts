import { UseCase } from '../../../../../shared/application/UseCase';
import { ErreurLigneProgrammeIncoherente } from '../../../domain/exceptions/ErreurLigneProgrammeIncoherente';
import { PolicyAudit } from '../../../domain/policies/PolicyAudit';
import { DepotReferentielCours } from '../../../domain/repositories/DepotReferentielCours';
import { MoteurProgrammeAcademique } from '../../../domain/services/MoteurProgrammeAcademique';
import { ReferentielCoursId } from '../../../domain/value-objects/ReferentielCoursId';
import { TypeStructureEvaluation } from '../../../domain/value-objects/TypeStructureEvaluation';
import { EnregistrementLigneReferentielProgrammeJson } from '../../dto/input/EnregistrementLigneReferentielProgrammeJson';
import { ImporterLignesProgrammeDepuisJsonEntree } from '../../dto/input/ImporterLignesProgrammeDepuisJsonEntree';
import { LigneReferentielProgrammeSortie } from '../../dto/output/LigneReferentielProgrammeSortie';
import { LigneReferentielProgrammeApplicationMapper } from '../../mappers/LigneReferentielProgrammeApplicationMapper';
import { LigneReferentielProgrammeJsonMapper } from '../../mappers/LigneReferentielProgrammeJsonMapper';

// Cette interface represente la sortie du cas d'usage ImporterLignesProgrammeDepuisJson.
export interface SortieImporterLignesProgrammeDepuisJson {
  lignesProgramme: LigneReferentielProgrammeSortie[];
  nombreImporte: number;
  ordreMaximum: number;
}

// Ce cas d'usage orchestre l'import des lignes de programme depuis une source JSON validee.
export class ImporterLignesProgrammeDepuisJson
  implements UseCase<ImporterLignesProgrammeDepuisJsonEntree, SortieImporterLignesProgrammeDepuisJson>
{
  private readonly depotReferentielCours: DepotReferentielCours;
  private readonly moteurProgrammeAcademique: MoteurProgrammeAcademique;
  private readonly policyAudit: PolicyAudit;

  // Ce constructeur injecte les dependances applicatives necessaires a l'import des lignes de programme.
  constructor(
    depotReferentielCours: DepotReferentielCours,
    moteurProgrammeAcademique: MoteurProgrammeAcademique = new MoteurProgrammeAcademique(),
    policyAudit: PolicyAudit = new PolicyAudit(),
  ) {
    this.depotReferentielCours = depotReferentielCours;
    this.moteurProgrammeAcademique = moteurProgrammeAcademique;
    this.policyAudit = policyAudit;
  }

  // Cette methode importe et valide des lignes de programme a partir d'un contenu JSON deja parse.
  public async executer(
    entree: ImporterLignesProgrammeDepuisJsonEntree,
  ): Promise<SortieImporterLignesProgrammeDepuisJson> {
    const entreeValidee = this.validerEntree(entree);
    const horodatageImport = new Date();
    const lignesProgramme = [];

    this.policyAudit.verifierTracabiliteObligatoire(
      'IMPORTER_LIGNES_PROGRAMME_DEPUIS_JSON',
      entreeValidee.importePar,
      horodatageImport,
    );

    for (const enregistrement of entreeValidee.lignes) {
      await this.verifierExistenceCours(enregistrement.idReferentielCours);
      lignesProgramme.push(LigneReferentielProgrammeJsonMapper.versEntite(enregistrement));
    }

    this.moteurProgrammeAcademique.verifierLignesProgramme(
      lignesProgramme,
      entreeValidee.typeStructureEvaluation,
    );

    return {
      lignesProgramme: lignesProgramme.map((ligneProgramme) => (
        LigneReferentielProgrammeApplicationMapper.versSortie(ligneProgramme)
      )),
      nombreImporte: lignesProgramme.length,
      ordreMaximum: this.moteurProgrammeAcademique.calculerOrdreMaximum(lignesProgramme),
    };
  }

  private validerEntree(
    entree: ImporterLignesProgrammeDepuisJsonEntree,
  ): ImporterLignesProgrammeDepuisJsonEntree {
    if (entree === null || entree === undefined) {
      throw new ErreurLigneProgrammeIncoherente(
        "L'entree du cas d'usage ImporterLignesProgrammeDepuisJson est obligatoire.",
      );
    }

    if (!Array.isArray(entree.lignes) || entree.lignes.length === 0) {
      throw new ErreurLigneProgrammeIncoherente(
        "L'import des lignes de programme exige au moins une ligne.",
      );
    }

    return {
      lignes: entree.lignes.map((ligne) => this.validerEnregistrement(ligne)),
      typeStructureEvaluation: this.validerTypeStructureEvaluation(entree.typeStructureEvaluation),
      importePar: this.validerTexteObligatoire(entree.importePar, 'importePar'),
    };
  }

  private validerEnregistrement(
    ligne: EnregistrementLigneReferentielProgrammeJson,
  ): EnregistrementLigneReferentielProgrammeJson {
    if (ligne === null || ligne === undefined) {
      throw new ErreurLigneProgrammeIncoherente(
        'Chaque ligne de programme importee doit etre renseignee.',
      );
    }

    return {
      idReferentielCours: this.validerTexteObligatoire(ligne.idReferentielCours, 'idReferentielCours'),
      ordreAffichage: this.validerEntierPositif(ligne.ordreAffichage, 'ordreAffichage'),
      obligatoire: this.validerBooleen(ligne.obligatoire, 'obligatoire'),
      aExamen: this.validerBooleen(ligne.aExamen, 'aExamen'),
      estCalculable: this.validerBooleen(ligne.estCalculable, 'estCalculable'),
      sourceLigne: ligne.sourceLigne,
      ponderation: ligne.ponderation,
    };
  }

  private async verifierExistenceCours(idReferentielCours: string): Promise<void> {
    const referentielCours = await this.depotReferentielCours.trouverParId(
      new ReferentielCoursId(idReferentielCours),
    );

    if (referentielCours === null) {
      throw new ErreurLigneProgrammeIncoherente(
        `Le cours officiel "${idReferentielCours}" reference dans une ligne est introuvable.`,
      );
    }
  }

  private validerTexteObligatoire(valeur: string, nomChamp: string): string {
    if (typeof valeur !== 'string') {
      throw new ErreurLigneProgrammeIncoherente(
        `Le champ "${nomChamp}" doit etre une chaine de caracteres.`,
      );
    }

    const valeurNettoyee = valeur.trim();

    if (valeurNettoyee.length === 0) {
      throw new ErreurLigneProgrammeIncoherente(
        `Le champ "${nomChamp}" est obligatoire.`,
      );
    }

    return valeurNettoyee;
  }

  private validerEntierPositif(valeur: number, nomChamp: string): number {
    if (!Number.isInteger(valeur) || valeur <= 0) {
      throw new ErreurLigneProgrammeIncoherente(
        `Le champ "${nomChamp}" doit etre un entier strictement positif.`,
      );
    }

    return valeur;
  }

  private validerBooleen(valeur: boolean, nomChamp: string): boolean {
    if (typeof valeur !== 'boolean') {
      throw new ErreurLigneProgrammeIncoherente(
        `Le champ "${nomChamp}" doit etre un booleen.`,
      );
    }

    return valeur;
  }

  private validerTypeStructureEvaluation(
    valeur: TypeStructureEvaluation,
  ): TypeStructureEvaluation {
    if (!Object.values(TypeStructureEvaluation).includes(valeur)) {
      throw new ErreurLigneProgrammeIncoherente(
        "Le type de structure d'evaluation est invalide.",
      );
    }

    return valeur;
  }
}
