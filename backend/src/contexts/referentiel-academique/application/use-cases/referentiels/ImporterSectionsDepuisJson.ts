import { UseCase } from '../../../../../shared/application/UseCase';
import { SectionScolaire } from '../../../domain/aggregates/SectionScolaire';
import { ErreurSectionScolaireDupliquee } from '../../../domain/exceptions/ErreurSectionScolaireDupliquee';
import { ErreurSectionScolaireInvalide } from '../../../domain/exceptions/ErreurSectionScolaireInvalide';
import { PolicyAudit } from '../../../domain/policies/PolicyAudit';
import { DepotSectionScolaire } from '../../../domain/repositories/DepotSectionScolaire';
import { SectionScolaireId } from '../../../domain/value-objects/SectionScolaireId';
import {
  EnregistrementSectionScolaireJson,
  ImporterSectionsDepuisJsonEntree,
} from '../../dto/input/ImporterSectionsDepuisJsonEntree';
import { SectionScolaireSortie } from '../../dto/output/SectionScolaireSortie';
import { SectionScolaireApplicationMapper } from '../../mappers/SectionScolaireApplicationMapper';

// Cette interface represente la sortie du cas d'usage ImporterSectionsDepuisJson.
export interface SortieImporterSectionsDepuisJson {
  sectionsScolaires: SectionScolaireSortie[];
  nombreImporte: number;
}

// Ce cas d'usage orchestre l'import des sections depuis une source JSON validee.
export class ImporterSectionsDepuisJson
  implements UseCase<ImporterSectionsDepuisJsonEntree, SortieImporterSectionsDepuisJson>
{
  private readonly depotSectionScolaire: DepotSectionScolaire;
  private readonly policyAudit: PolicyAudit;

  // Ce constructeur injecte les dependances applicatives necessaires a l'import des sections scolaires.
  constructor(
    depotSectionScolaire: DepotSectionScolaire,
    policyAudit: PolicyAudit = new PolicyAudit(),
  ) {
    this.depotSectionScolaire = depotSectionScolaire;
    this.policyAudit = policyAudit;
  }

  // Cette methode importe des sections scolaires a partir d'un contenu JSON deja parse.
  public async executer(
    entree: ImporterSectionsDepuisJsonEntree,
  ): Promise<SortieImporterSectionsDepuisJson> {
    const entreeValidee = this.validerEntree(entree);
    const horodatageImport = new Date();
    const sectionsScolaires: SectionScolaireSortie[] = [];
    let nombreImporte = 0;

    this.policyAudit.verifierTracabiliteObligatoire(
      'IMPORTER_SECTIONS_DEPUIS_JSON',
      entreeValidee.importePar,
      horodatageImport,
    );

    for (const enregistrement of entreeValidee.sections) {
      const sectionExistante = await this.depotSectionScolaire.trouverParCode(enregistrement.code);

      if (sectionExistante !== null) {
        this.verifierCoherenceSectionExistante(sectionExistante, enregistrement);
        sectionsScolaires.push(SectionScolaireApplicationMapper.versSortie(sectionExistante));
        continue;
      }

      const sectionScolaire = new SectionScolaire(
        new SectionScolaireId(),
        enregistrement.code,
        enregistrement.libelle,
        enregistrement.ordreAffichage,
      );

      await this.depotSectionScolaire.sauvegarder(sectionScolaire);
      sectionsScolaires.push(SectionScolaireApplicationMapper.versSortie(sectionScolaire));
      nombreImporte += 1;
    }

    return {
      sectionsScolaires,
      nombreImporte,
    };
  }

  private validerEntree(
    entree: ImporterSectionsDepuisJsonEntree,
  ): ImporterSectionsDepuisJsonEntree {
    if (entree === null || entree === undefined) {
      throw new ErreurSectionScolaireInvalide(
        "L'entree du cas d'usage ImporterSectionsDepuisJson est obligatoire.",
      );
    }

    if (!Array.isArray(entree.sections) || entree.sections.length === 0) {
      throw new ErreurSectionScolaireInvalide(
        "L'import des sections scolaires exige au moins une section.",
      );
    }

    return {
      sections: entree.sections.map((section) => this.validerEnregistrement(section)),
      importePar: this.validerTexteObligatoire(entree.importePar, 'importePar'),
    };
  }

  private validerEnregistrement(
    section: EnregistrementSectionScolaireJson,
  ): EnregistrementSectionScolaireJson {
    if (section === null || section === undefined) {
      throw new ErreurSectionScolaireInvalide(
        'Chaque section importee doit etre renseignee.',
      );
    }

    return {
      code: this.validerTexteObligatoire(section.code, 'code'),
      libelle: this.validerTexteObligatoire(section.libelle, 'libelle'),
      ordreAffichage: this.validerEntierPositif(section.ordreAffichage, 'ordreAffichage'),
    };
  }

  private verifierCoherenceSectionExistante(
    sectionExistante: SectionScolaire,
    enregistrement: EnregistrementSectionScolaireJson,
  ): void {
    if (
      sectionExistante.obtenirLibelle() !== enregistrement.libelle
      || sectionExistante.obtenirOrdreAffichage() !== enregistrement.ordreAffichage
    ) {
      throw new ErreurSectionScolaireDupliquee(
        'Une section scolaire avec ce code existe deja avec une definition differente.',
      );
    }
  }

  private validerTexteObligatoire(valeur: string, nomChamp: string): string {
    if (typeof valeur !== 'string') {
      throw new ErreurSectionScolaireInvalide(
        `Le champ "${nomChamp}" doit etre une chaine de caracteres.`,
      );
    }

    const valeurNettoyee = valeur.trim();

    if (valeurNettoyee.length === 0) {
      throw new ErreurSectionScolaireInvalide(
        `Le champ "${nomChamp}" est obligatoire.`,
      );
    }

    return valeurNettoyee;
  }

  private validerEntierPositif(valeur: number, nomChamp: string): number {
    if (!Number.isInteger(valeur) || valeur <= 0) {
      throw new ErreurSectionScolaireInvalide(
        `Le champ "${nomChamp}" doit etre un entier strictement positif.`,
      );
    }

    return valeur;
  }
}
