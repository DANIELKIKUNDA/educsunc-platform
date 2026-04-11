import { UseCase } from '../../../../../shared/application/UseCase';
import { ReferentielProgramme } from '../../../domain/aggregates/ReferentielProgramme';
import { VersionReferentielProgramme } from '../../../domain/aggregates/VersionReferentielProgramme';
import { ErreurClasseAcademiqueInvalide } from '../../../domain/exceptions/ErreurClasseAcademiqueInvalide';
import { ErreurLigneProgrammeIncoherente } from '../../../domain/exceptions/ErreurLigneProgrammeIncoherente';
import { ErreurProgrammeInvalide } from '../../../domain/exceptions/ErreurProgrammeInvalide';
import { ErreurVersionProgrammeDupliquee } from '../../../domain/exceptions/ErreurVersionProgrammeDupliquee';
import { PolicyAudit } from '../../../domain/policies/PolicyAudit';
import { PolicyProgramme } from '../../../domain/policies/PolicyProgramme';
import { DepotClasseAcademique } from '../../../domain/repositories/DepotClasseAcademique';
import { DepotReferentielCours } from '../../../domain/repositories/DepotReferentielCours';
import { DepotReferentielProgramme } from '../../../domain/repositories/DepotReferentielProgramme';
import { MoteurProgrammeAcademique } from '../../../domain/services/MoteurProgrammeAcademique';
import { ClasseAcademiqueId } from '../../../domain/value-objects/ClasseAcademiqueId';
import { ReferentielCoursId } from '../../../domain/value-objects/ReferentielCoursId';
import { ReferentielProgrammeId } from '../../../domain/value-objects/ReferentielProgrammeId';
import { SourceReferentiel } from '../../../domain/value-objects/SourceReferentiel';
import { VersionReferentielProgrammeId } from '../../../domain/value-objects/VersionReferentielProgrammeId';
import {
  EnregistrementReferentielProgrammeJson,
  ImporterProgrammesAcademiquesDepuisJsonEntree,
} from '../../dto/input/ImporterProgrammesAcademiquesDepuisJsonEntree';
import { ReferentielProgrammeSortie } from '../../dto/output/ReferentielProgrammeSortie';
import { LigneReferentielProgrammeJsonMapper } from '../../mappers/LigneReferentielProgrammeJsonMapper';
import { ReferentielProgrammeApplicationMapper } from '../../mappers/ReferentielProgrammeApplicationMapper';

// Cette interface represente la sortie du cas d'usage ImporterProgrammesAcademiquesDepuisJson.
export interface SortieImporterProgrammesAcademiquesDepuisJson {
  referentielsProgrammes: ReferentielProgrammeSortie[];
  nombreImporte: number;
}

// Ce cas d'usage orchestre l'import des programmes academiques selon la sequence referentiel -> version -> lignes.
export class ImporterProgrammesAcademiquesDepuisJson
  implements UseCase<
    ImporterProgrammesAcademiquesDepuisJsonEntree,
    SortieImporterProgrammesAcademiquesDepuisJson
  >
{
  private readonly depotReferentielProgramme: DepotReferentielProgramme;
  private readonly depotClasseAcademique: DepotClasseAcademique;
  private readonly depotReferentielCours: DepotReferentielCours;
  private readonly moteurProgrammeAcademique: MoteurProgrammeAcademique;
  private readonly policyProgramme: PolicyProgramme;
  private readonly policyAudit: PolicyAudit;

  // Ce constructeur injecte les dependances applicatives necessaires a l'import des programmes officiels.
  constructor(
    depotReferentielProgramme: DepotReferentielProgramme,
    depotClasseAcademique: DepotClasseAcademique,
    depotReferentielCours: DepotReferentielCours,
    moteurProgrammeAcademique: MoteurProgrammeAcademique = new MoteurProgrammeAcademique(),
    policyProgramme: PolicyProgramme = new PolicyProgramme(),
    policyAudit: PolicyAudit = new PolicyAudit(),
  ) {
    this.depotReferentielProgramme = depotReferentielProgramme;
    this.depotClasseAcademique = depotClasseAcademique;
    this.depotReferentielCours = depotReferentielCours;
    this.moteurProgrammeAcademique = moteurProgrammeAcademique;
    this.policyProgramme = policyProgramme;
    this.policyAudit = policyAudit;
  }

  // Cette methode importe des programmes academiques complets a partir d'un contenu JSON deja parse.
  public async executer(
    entree: ImporterProgrammesAcademiquesDepuisJsonEntree,
  ): Promise<SortieImporterProgrammesAcademiquesDepuisJson> {
    const entreeValidee = this.validerEntree(entree);
    const horodatageImport = new Date();
    const referentielsProgrammes: ReferentielProgrammeSortie[] = [];
    let nombreImporte = 0;

    this.policyAudit.verifierTracabiliteObligatoire(
      'IMPORTER_PROGRAMMES_ACADEMIQUES_DEPUIS_JSON',
      entreeValidee.importePar,
      horodatageImport,
    );

    for (const enregistrement of entreeValidee.programmes) {
      const classeAcademique = await this.depotClasseAcademique.trouverParId(
        new ClasseAcademiqueId(enregistrement.idClasseAcademique),
      );

      if (classeAcademique === null) {
        throw new ErreurClasseAcademiqueInvalide(
          "La classe academique ciblee du programme officiel est introuvable.",
        );
      }

      const lignes = await this.construireLignes(enregistrement);
      const versionImportee = new VersionReferentielProgramme(
        new VersionReferentielProgrammeId(),
        enregistrement.versionReferentiel,
        enregistrement.datePublication.getUTCFullYear().toString(),
        enregistrement.datePublication,
        SourceReferentiel.JSON_OFFICIEL,
        undefined,
        false,
        horodatageImport,
        lignes,
      );

      versionImportee.publierVersion();
      this.moteurProgrammeAcademique.verifierLignesProgramme(
        versionImportee.obtenirLignes(),
        enregistrement.typeStructureEvaluation,
      );

      const referentielProgramme = await this.resoudreOuCreerReferentiel(
        classeAcademique.obtenirId(),
        enregistrement.typeStructureEvaluation,
      );
      const versionExistante = referentielProgramme.trouverVersionParCode(
        versionImportee.obtenirCodeVersion(),
      );

      if (versionExistante !== null) {
        this.verifierCoherenceVersionExistante(versionExistante, versionImportee);
        referentielsProgrammes.push(ReferentielProgrammeApplicationMapper.versSortie(referentielProgramme));
        continue;
      }

      referentielProgramme.ajouterVersion(versionImportee);
      this.policyProgramme.verifierVersionObligatoire(referentielProgramme);

      await this.depotReferentielProgramme.sauvegarder(referentielProgramme);
      referentielsProgrammes.push(ReferentielProgrammeApplicationMapper.versSortie(referentielProgramme));
      nombreImporte += 1;
    }

    return {
      referentielsProgrammes,
      nombreImporte,
    };
  }

  private async resoudreOuCreerReferentiel(
    idClasseAcademique: ClasseAcademiqueId,
    typeStructureEvaluation: EnregistrementReferentielProgrammeJson['typeStructureEvaluation'],
  ): Promise<ReferentielProgramme> {
    const referentielProgrammeExistant = await this.depotReferentielProgramme.trouverParClasseAcademique(
      idClasseAcademique,
    );

    if (referentielProgrammeExistant === null) {
      return new ReferentielProgramme(
        new ReferentielProgrammeId(),
        idClasseAcademique,
        typeStructureEvaluation,
      );
    }

    if (referentielProgrammeExistant.obtenirTypeStructureEvaluation() !== typeStructureEvaluation) {
      throw new ErreurProgrammeInvalide(
        "La structure d'evaluation du referentiel existant ne correspond pas au JSON importe.",
      );
    }

    return referentielProgrammeExistant;
  }

  private validerEntree(
    entree: ImporterProgrammesAcademiquesDepuisJsonEntree,
  ): ImporterProgrammesAcademiquesDepuisJsonEntree {
    if (entree === null || entree === undefined) {
      throw new ErreurProgrammeInvalide(
        "L'entree du cas d'usage ImporterProgrammesAcademiquesDepuisJson est obligatoire.",
      );
    }

    if (!Array.isArray(entree.programmes) || entree.programmes.length === 0) {
      throw new ErreurProgrammeInvalide(
        "L'import des programmes academiques exige au moins un programme.",
      );
    }

    return {
      programmes: entree.programmes.map((programme) => this.validerEnregistrement(programme)),
      importePar: this.validerTexteObligatoire(entree.importePar, 'importePar'),
    };
  }

  private validerEnregistrement(
    programme: EnregistrementReferentielProgrammeJson,
  ): EnregistrementReferentielProgrammeJson {
    if (programme === null || programme === undefined) {
      throw new ErreurProgrammeInvalide(
        'Chaque programme importe doit etre renseigne.',
      );
    }

    if (!Array.isArray(programme.lignes) || programme.lignes.length === 0) {
      throw new ErreurProgrammeInvalide(
        'Chaque programme importe doit contenir au moins une ligne.',
      );
    }

    return {
      idClasseAcademique: this.validerTexteObligatoire(programme.idClasseAcademique, 'idClasseAcademique'),
      typeStructureEvaluation: programme.typeStructureEvaluation,
      versionReferentiel: this.validerTexteObligatoire(programme.versionReferentiel, 'versionReferentiel'),
      datePublication: this.validerDate(programme.datePublication, 'datePublication'),
      lignes: programme.lignes,
    };
  }

  private async construireLignes(
    programme: EnregistrementReferentielProgrammeJson,
  ): Promise<ReturnType<typeof LigneReferentielProgrammeJsonMapper.versEntite>[]> {
    const lignes = [];

    for (const enregistrementLigne of programme.lignes) {
      const idReferentielCours = this.validerTexteObligatoire(
        enregistrementLigne.idReferentielCours,
        'idReferentielCours',
      );
      const referentielCours = await this.depotReferentielCours.trouverParId(
        new ReferentielCoursId(idReferentielCours),
      );

      if (referentielCours === null) {
        throw new ErreurLigneProgrammeIncoherente(
          `Le cours officiel "${idReferentielCours}" reference dans un programme est introuvable.`,
        );
      }

      lignes.push(LigneReferentielProgrammeJsonMapper.versEntite({
        ...enregistrementLigne,
        idReferentielCours,
      }));
    }

    return lignes;
  }

  private verifierCoherenceVersionExistante(
    versionExistante: VersionReferentielProgramme,
    versionEquivalente: VersionReferentielProgramme,
  ): void {
    const memeDatePublication = versionExistante
      .obtenirDatePublication()
      .toISOString() === versionEquivalente.obtenirDatePublication().toISOString();
    const memeSource = versionExistante.obtenirSourceImport() === versionEquivalente.obtenirSourceImport();
    const memesDifferences = versionExistante.produireUnDiff(versionEquivalente).length === 0
      && versionEquivalente.produireUnDiff(versionExistante).length === 0;

    if (!memeDatePublication || !memeSource || !memesDifferences) {
      throw new ErreurVersionProgrammeDupliquee(
        'Une version officielle avec cette classe et ce code existe deja avec une definition differente.',
      );
    }
  }

  private validerTexteObligatoire(valeur: string, nomChamp: string): string {
    if (typeof valeur !== 'string') {
      throw new ErreurProgrammeInvalide(
        `Le champ "${nomChamp}" doit etre une chaine de caracteres.`,
      );
    }

    const valeurNettoyee = valeur.trim();

    if (valeurNettoyee.length === 0) {
      throw new ErreurProgrammeInvalide(
        `Le champ "${nomChamp}" est obligatoire.`,
      );
    }

    return valeurNettoyee;
  }

  private validerDate(valeur: Date, nomChamp: string): Date {
    if (!(valeur instanceof Date) || Number.isNaN(valeur.getTime())) {
      throw new ErreurProgrammeInvalide(
        `Le champ "${nomChamp}" doit etre une date valide.`,
      );
    }

    return new Date(valeur.getTime());
  }
}
