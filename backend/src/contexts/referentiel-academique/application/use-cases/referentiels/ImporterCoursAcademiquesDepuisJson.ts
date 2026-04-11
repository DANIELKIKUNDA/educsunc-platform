import { UseCase } from '../../../../../shared/application/UseCase';
import { ReferentielCours } from '../../../domain/aggregates/ReferentielCours';
import { ErreurReferentielCoursDuplique } from '../../../domain/exceptions/ErreurReferentielCoursDuplique';
import { ErreurReferentielCoursInvalide } from '../../../domain/exceptions/ErreurReferentielCoursInvalide';
import { PolicyAudit } from '../../../domain/policies/PolicyAudit';
import { DepotReferentielCours } from '../../../domain/repositories/DepotReferentielCours';
import { ReferentielCoursId } from '../../../domain/value-objects/ReferentielCoursId';
import {
  EnregistrementReferentielCoursJson,
  ImporterCoursAcademiquesDepuisJsonEntree,
} from '../../dto/input/ImporterCoursAcademiquesDepuisJsonEntree';
import { ReferentielCoursSortie } from '../../dto/output/ReferentielCoursSortie';
import { ReferentielCoursApplicationMapper } from '../../mappers/ReferentielCoursApplicationMapper';

// Cette interface represente la sortie du cas d'usage ImporterCoursAcademiquesDepuisJson.
export interface SortieImporterCoursAcademiquesDepuisJson {
  referentielsCours: ReferentielCoursSortie[];
  nombreImporte: number;
}

// Ce cas d'usage orchestre l'import des cours academiques depuis une source JSON validee.
export class ImporterCoursAcademiquesDepuisJson
  implements UseCase<
    ImporterCoursAcademiquesDepuisJsonEntree,
    SortieImporterCoursAcademiquesDepuisJson
  >
{
  private readonly depotReferentielCours: DepotReferentielCours;
  private readonly policyAudit: PolicyAudit;

  // Ce constructeur injecte les dependances applicatives necessaires a l'import des cours officiels.
  constructor(
    depotReferentielCours: DepotReferentielCours,
    policyAudit: PolicyAudit = new PolicyAudit(),
  ) {
    this.depotReferentielCours = depotReferentielCours;
    this.policyAudit = policyAudit;
  }

  // Cette methode importe des cours officiels a partir d'un contenu JSON deja parse.
  public async executer(
    entree: ImporterCoursAcademiquesDepuisJsonEntree,
  ): Promise<SortieImporterCoursAcademiquesDepuisJson> {
    const entreeValidee = this.validerEntree(entree);
    const horodatageImport = new Date();
    const referentielsCours: ReferentielCoursSortie[] = [];
    let nombreImporte = 0;

    this.policyAudit.verifierTracabiliteObligatoire(
      'IMPORTER_COURS_ACADEMIQUES_DEPUIS_JSON',
      entreeValidee.importePar,
      horodatageImport,
    );

    for (const enregistrement of entreeValidee.cours) {
      const referentielCoursExistant = await this.depotReferentielCours.trouverParCode(
        enregistrement.code,
      );

      if (referentielCoursExistant !== null) {
        this.verifierCoherenceCoursExistant(referentielCoursExistant, enregistrement);
        referentielsCours.push(ReferentielCoursApplicationMapper.versSortie(referentielCoursExistant));
        continue;
      }

      const referentielCours = ReferentielCours.chargerDepuisReferentiel(
        new ReferentielCoursId(),
        enregistrement.code,
        enregistrement.libelle,
        enregistrement.abreviation,
        enregistrement.domaine,
        enregistrement.sousDomaine,
      );

      await this.depotReferentielCours.sauvegarder(referentielCours);
      referentielsCours.push(ReferentielCoursApplicationMapper.versSortie(referentielCours));
      nombreImporte += 1;
    }

    return {
      referentielsCours,
      nombreImporte,
    };
  }

  private validerEntree(
    entree: ImporterCoursAcademiquesDepuisJsonEntree,
  ): ImporterCoursAcademiquesDepuisJsonEntree {
    if (entree === null || entree === undefined) {
      throw new ErreurReferentielCoursInvalide(
        "L'entree du cas d'usage ImporterCoursAcademiquesDepuisJson est obligatoire.",
      );
    }

    if (!Array.isArray(entree.cours) || entree.cours.length === 0) {
      throw new ErreurReferentielCoursInvalide(
        "L'import des cours academiques exige au moins un cours.",
      );
    }

    return {
      cours: entree.cours.map((cours) => this.validerEnregistrement(cours)),
      importePar: this.validerTexteObligatoire(entree.importePar, 'importePar'),
    };
  }

  private validerEnregistrement(
    cours: EnregistrementReferentielCoursJson,
  ): EnregistrementReferentielCoursJson {
    if (cours === null || cours === undefined) {
      throw new ErreurReferentielCoursInvalide(
        'Chaque cours importe doit etre renseigne.',
      );
    }

    return {
      code: this.validerTexteObligatoire(cours.code, 'code'),
      libelle: this.validerTexteObligatoire(cours.libelle, 'libelle'),
      abreviation: this.validerTexteOptionnel(cours.abreviation),
      domaine: this.validerTexteOptionnel(cours.domaine),
      sousDomaine: this.validerTexteOptionnel(cours.sousDomaine),
    };
  }

  private verifierCoherenceCoursExistant(
    referentielCoursExistant: ReferentielCours,
    enregistrement: EnregistrementReferentielCoursJson,
  ): void {
    if (
      referentielCoursExistant.obtenirLibelle() !== enregistrement.libelle
      || referentielCoursExistant.obtenirAbreviation() !== enregistrement.abreviation
      || referentielCoursExistant.obtenirDomaine() !== enregistrement.domaine
      || referentielCoursExistant.obtenirSousDomaine() !== enregistrement.sousDomaine
    ) {
      throw new ErreurReferentielCoursDuplique(
        'Un cours officiel avec ce code existe deja avec une definition differente.',
      );
    }
  }

  private validerTexteObligatoire(valeur: string, nomChamp: string): string {
    if (typeof valeur !== 'string') {
      throw new ErreurReferentielCoursInvalide(
        `Le champ "${nomChamp}" doit etre une chaine de caracteres.`,
      );
    }

    const valeurNettoyee = valeur.trim();

    if (valeurNettoyee.length === 0) {
      throw new ErreurReferentielCoursInvalide(
        `Le champ "${nomChamp}" est obligatoire.`,
      );
    }

    return valeurNettoyee;
  }

  private validerTexteOptionnel(valeur?: string): string | undefined {
    if (valeur === undefined) {
      return undefined;
    }

    if (typeof valeur !== 'string') {
      throw new ErreurReferentielCoursInvalide(
        'Une valeur textuelle optionnelle fournie doit etre une chaine de caracteres.',
      );
    }

    const valeurNettoyee = valeur.trim();

    return valeurNettoyee.length > 0 ? valeurNettoyee : undefined;
  }
}
