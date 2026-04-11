import { ImporterClassesAcademiquesDepuisJsonEntree } from '../dto/input/ImporterClassesAcademiquesDepuisJsonEntree';
import { ImporterCoursAcademiquesDepuisJsonEntree } from '../dto/input/ImporterCoursAcademiquesDepuisJsonEntree';
import { ImporterLignesProgrammeDepuisJsonEntree } from '../dto/input/ImporterLignesProgrammeDepuisJsonEntree';
import { ImporterOptionsDepuisJsonEntree } from '../dto/input/ImporterOptionsDepuisJsonEntree';
import { ImporterProgrammesAcademiquesDepuisJsonEntree } from '../dto/input/ImporterProgrammesAcademiquesDepuisJsonEntree';
import { ImporterSectionsDepuisJsonEntree } from '../dto/input/ImporterSectionsDepuisJsonEntree';
import {
  ImporterClassesAcademiquesDepuisJson,
  SortieImporterClassesAcademiquesDepuisJson,
} from '../use-cases/referentiels/ImporterClassesAcademiquesDepuisJson';
import {
  ImporterCoursAcademiquesDepuisJson,
  SortieImporterCoursAcademiquesDepuisJson,
} from '../use-cases/referentiels/ImporterCoursAcademiquesDepuisJson';
import {
  ImporterLignesProgrammeDepuisJson,
  SortieImporterLignesProgrammeDepuisJson,
} from '../use-cases/referentiels/ImporterLignesProgrammeDepuisJson';
import {
  ImporterOptionsDepuisJson,
  SortieImporterOptionsDepuisJson,
} from '../use-cases/referentiels/ImporterOptionsDepuisJson';
import {
  ImporterProgrammesAcademiquesDepuisJson,
  SortieImporterProgrammesAcademiquesDepuisJson,
} from '../use-cases/referentiels/ImporterProgrammesAcademiquesDepuisJson';
import {
  ImporterSectionsDepuisJson,
  SortieImporterSectionsDepuisJson,
} from '../use-cases/referentiels/ImporterSectionsDepuisJson';
import {
  ServiceTransactionApplication,
  ServiceTransactionApplicationSansEffet,
} from './ServiceTransactionApplication';

// Ce service applicatif regroupe les operations d'import du referentiel academique.
export class OrchestrateurImportReferentiel {
  private readonly casUsageImporterSectionsDepuisJson: ImporterSectionsDepuisJson;
  private readonly casUsageImporterOptionsDepuisJson: ImporterOptionsDepuisJson;
  private readonly casUsageImporterClassesAcademiquesDepuisJson: ImporterClassesAcademiquesDepuisJson;
  private readonly casUsageImporterCoursAcademiquesDepuisJson: ImporterCoursAcademiquesDepuisJson;
  private readonly casUsageImporterProgrammesAcademiquesDepuisJson: ImporterProgrammesAcademiquesDepuisJson;
  private readonly casUsageImporterLignesProgrammeDepuisJson: ImporterLignesProgrammeDepuisJson;
  private readonly serviceTransactionApplication: ServiceTransactionApplication;

  // Ce constructeur injecte les cas d'usage reutilises pendant les imports de referentiel.
  constructor(
    casUsageImporterSectionsDepuisJson: ImporterSectionsDepuisJson,
    casUsageImporterOptionsDepuisJson: ImporterOptionsDepuisJson,
    casUsageImporterClassesAcademiquesDepuisJson: ImporterClassesAcademiquesDepuisJson,
    casUsageImporterCoursAcademiquesDepuisJson: ImporterCoursAcademiquesDepuisJson,
    casUsageImporterProgrammesAcademiquesDepuisJson: ImporterProgrammesAcademiquesDepuisJson,
    casUsageImporterLignesProgrammeDepuisJson: ImporterLignesProgrammeDepuisJson,
    serviceTransactionApplication: ServiceTransactionApplication = new ServiceTransactionApplicationSansEffet(),
  ) {
    this.casUsageImporterSectionsDepuisJson = casUsageImporterSectionsDepuisJson;
    this.casUsageImporterOptionsDepuisJson = casUsageImporterOptionsDepuisJson;
    this.casUsageImporterClassesAcademiquesDepuisJson = casUsageImporterClassesAcademiquesDepuisJson;
    this.casUsageImporterCoursAcademiquesDepuisJson = casUsageImporterCoursAcademiquesDepuisJson;
    this.casUsageImporterProgrammesAcademiquesDepuisJson = casUsageImporterProgrammesAcademiquesDepuisJson;
    this.casUsageImporterLignesProgrammeDepuisJson = casUsageImporterLignesProgrammeDepuisJson;
    this.serviceTransactionApplication = serviceTransactionApplication;
  }

  // Cette methode orchestre l'import des sections scolaires.
  public importerSectionsDepuisJson(
    entree: ImporterSectionsDepuisJsonEntree,
  ): Promise<SortieImporterSectionsDepuisJson> {
    return this.casUsageImporterSectionsDepuisJson.executer(entree);
  }

  // Cette methode orchestre l'import des options d'etude.
  public importerOptionsDepuisJson(
    entree: ImporterOptionsDepuisJsonEntree,
  ): Promise<SortieImporterOptionsDepuisJson> {
    return this.casUsageImporterOptionsDepuisJson.executer(entree);
  }

  // Cette methode orchestre l'import des classes academiques.
  public importerClassesAcademiquesDepuisJson(
    entree: ImporterClassesAcademiquesDepuisJsonEntree,
  ): Promise<SortieImporterClassesAcademiquesDepuisJson> {
    return this.casUsageImporterClassesAcademiquesDepuisJson.executer(entree);
  }

  // Cette methode orchestre l'import des cours academiques.
  public importerCoursAcademiquesDepuisJson(
    entree: ImporterCoursAcademiquesDepuisJsonEntree,
  ): Promise<SortieImporterCoursAcademiquesDepuisJson> {
    return this.casUsageImporterCoursAcademiquesDepuisJson.executer(entree);
  }

  // Cette methode orchestre l'import des programmes academiques.
  public importerProgrammesAcademiquesDepuisJson(
    entree: ImporterProgrammesAcademiquesDepuisJsonEntree,
  ): Promise<SortieImporterProgrammesAcademiquesDepuisJson> {
    return this.serviceTransactionApplication.executerDansTransaction(() =>
      this.casUsageImporterProgrammesAcademiquesDepuisJson.executer(entree),
    );
  }

  // Cette methode orchestre l'import des lignes de programme.
  public importerLignesProgrammeDepuisJson(
    entree: ImporterLignesProgrammeDepuisJsonEntree,
  ): Promise<SortieImporterLignesProgrammeDepuisJson> {
    return this.casUsageImporterLignesProgrammeDepuisJson.executer(entree);
  }
}
