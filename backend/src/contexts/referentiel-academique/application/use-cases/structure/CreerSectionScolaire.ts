import { UseCase } from '../../../../../shared/application/UseCase';
import { SectionScolaire } from '../../../domain/aggregates/SectionScolaire';
import { ErreurSectionScolaireDupliquee } from '../../../domain/exceptions/ErreurSectionScolaireDupliquee';
import { ErreurSectionScolaireInvalide } from '../../../domain/exceptions/ErreurSectionScolaireInvalide';
import { PolicyAudit } from '../../../domain/policies/PolicyAudit';
import { DepotSectionScolaire } from '../../../domain/repositories/DepotSectionScolaire';
import { SectionScolaireId } from '../../../domain/value-objects/SectionScolaireId';
import { CreerSectionScolaireEntree } from '../../dto/input/CreerSectionScolaireEntree';
import { SectionScolaireSortie } from '../../dto/output/SectionScolaireSortie';
import { SectionScolaireApplicationMapper } from '../../mappers/SectionScolaireApplicationMapper';

// Cette interface represente la sortie du cas d'usage CreerSectionScolaire.
export interface SortieCreerSectionScolaire {
  sectionScolaire: SectionScolaireSortie;
}

// Ce cas d'usage orchestre la creation d'une section scolaire.
export class CreerSectionScolaire
  implements UseCase<CreerSectionScolaireEntree, SortieCreerSectionScolaire>
{
  private readonly depotSectionScolaire: DepotSectionScolaire;
  private readonly policyAudit: PolicyAudit;

  // Ce constructeur injecte les dependances applicatives necessaires a la creation d'une section scolaire.
  constructor(
    depotSectionScolaire: DepotSectionScolaire,
    policyAudit: PolicyAudit = new PolicyAudit(),
  ) {
    this.depotSectionScolaire = depotSectionScolaire;
    this.policyAudit = policyAudit;
  }

  // Cette methode cree une section scolaire globale du referentiel.
  public async executer(
    entree: CreerSectionScolaireEntree,
  ): Promise<SortieCreerSectionScolaire> {
    const entreeValidee = this.validerEntree(entree);
    const horodatageCreation = new Date();

    this.policyAudit.verifierTracabiliteObligatoire(
      'CREER_SECTION_SCOLAIRE',
      entreeValidee.creePar,
      horodatageCreation,
    );

    const sectionExistante = await this.depotSectionScolaire.trouverParCode(entreeValidee.code);

    if (sectionExistante !== null) {
      throw new ErreurSectionScolaireDupliquee(
        'Une section scolaire avec ce code existe deja.',
      );
    }

    const sectionScolaire = new SectionScolaire(
      new SectionScolaireId(),
      entreeValidee.code,
      entreeValidee.libelle,
      entreeValidee.ordreAffichage,
    );

    await this.depotSectionScolaire.sauvegarder(sectionScolaire);

    return {
      sectionScolaire: SectionScolaireApplicationMapper.versSortie(sectionScolaire),
    };
  }

  private validerEntree(entree: CreerSectionScolaireEntree): CreerSectionScolaireEntree {
    if (entree === null || entree === undefined) {
      throw new ErreurSectionScolaireInvalide(
        "L'entree du cas d'usage CreerSectionScolaire est obligatoire.",
      );
    }

    return {
      code: this.validerTexteObligatoire(entree.code, 'code'),
      libelle: this.validerTexteObligatoire(entree.libelle, 'libelle'),
      ordreAffichage: this.validerEntierPositif(entree.ordreAffichage, 'ordreAffichage'),
      creePar: this.validerTexteObligatoire(entree.creePar, 'creePar'),
    };
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
