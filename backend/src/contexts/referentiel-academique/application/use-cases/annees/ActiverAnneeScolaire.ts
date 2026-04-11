import { UseCase } from '../../../../../shared/application/UseCase';
import { ErreurAnneeScolaireDejaActive } from '../../../domain/exceptions/ErreurAnneeScolaireDejaActive';
import { ErreurAnneeScolaireInvalide } from '../../../domain/exceptions/ErreurAnneeScolaireInvalide';
import { ErreurTransitionStatutAnneeInterdite } from '../../../domain/exceptions/ErreurTransitionStatutAnneeInterdite';
import { PolicyAudit } from '../../../domain/policies/PolicyAudit';
import { DepotAnneeScolaire } from '../../../domain/repositories/DepotAnneeScolaire';
import { AnneeScolaireId } from '../../../domain/value-objects/AnneeScolaireId';
import { StatutAnneeScolaire } from '../../../domain/value-objects/StatutAnneeScolaire';
import { ActiverAnneeScolaireEntree } from '../../dto/input/ActiverAnneeScolaireEntree';
import { AnneeScolaireSortie } from '../../dto/output/AnneeScolaireSortie';
import { AnneeScolaireApplicationMapper } from '../../mappers/AnneeScolaireApplicationMapper';

// Cette interface represente la sortie du cas d'usage ActiverAnneeScolaire.
export interface SortieActiverAnneeScolaire {
  anneeScolaire: AnneeScolaireSortie;
}

// Ce cas d'usage orchestre l'activation d'une annee scolaire.
export class ActiverAnneeScolaire
  implements UseCase<ActiverAnneeScolaireEntree, SortieActiverAnneeScolaire>
{
  private readonly depotAnneeScolaire: DepotAnneeScolaire;
  private readonly policyAudit: PolicyAudit;

  // Ce constructeur injecte les dependances applicatives necessaires a l'activation d'une annee scolaire.
  constructor(
    depotAnneeScolaire: DepotAnneeScolaire,
    policyAudit: PolicyAudit = new PolicyAudit(),
  ) {
    this.depotAnneeScolaire = depotAnneeScolaire;
    this.policyAudit = policyAudit;
  }

  // Cette methode active une annee scolaire planifiee en garantissant l'unicite de l'annee active.
  public async executer(entree: ActiverAnneeScolaireEntree): Promise<SortieActiverAnneeScolaire> {
    const entreeValidee = this.validerEntree(entree);
    const horodatageModification = new Date();

    this.policyAudit.verifierTracabiliteObligatoire(
      'ACTIVER_ANNEE_SCOLAIRE',
      entreeValidee.modifiePar,
      horodatageModification,
    );

    const anneeScolaire = await this.depotAnneeScolaire.trouverParId(
      new AnneeScolaireId(entreeValidee.idAnneeScolaire),
    );

    if (anneeScolaire === null) {
      throw new ErreurAnneeScolaireInvalide(
        "L'annee scolaire a activer est introuvable.",
      );
    }

    if (anneeScolaire.obtenirStatut() === StatutAnneeScolaire.ACTIVE) {
      throw new ErreurAnneeScolaireDejaActive(
        'Cette annee scolaire est deja active.',
      );
    }

    if (anneeScolaire.obtenirStatut() !== StatutAnneeScolaire.PLANIFIEE) {
      throw new ErreurTransitionStatutAnneeInterdite(
        'Seule une annee scolaire planifiee peut etre activee.',
      );
    }

    const anneeActiveExistante = await this.depotAnneeScolaire.trouverActiveParEcole(
      anneeScolaire.obtenirEcoleId(),
    );

    if (
      anneeActiveExistante !== null
      && !anneeActiveExistante.obtenirId().estEgal(anneeScolaire.obtenirId())
    ) {
      throw new ErreurAnneeScolaireDejaActive(
        'Une autre annee scolaire est deja active pour cette ecole.',
      );
    }

    anneeScolaire.activer(entreeValidee.modifiePar);
    await this.depotAnneeScolaire.sauvegarder(anneeScolaire);

    return {
      anneeScolaire: AnneeScolaireApplicationMapper.versSortie(anneeScolaire),
    };
  }

  private validerEntree(entree: ActiverAnneeScolaireEntree): ActiverAnneeScolaireEntree {
    if (entree === null || entree === undefined) {
      throw new ErreurAnneeScolaireInvalide(
        "L'entree du cas d'usage ActiverAnneeScolaire est obligatoire.",
      );
    }

    return {
      idAnneeScolaire: this.validerTexteObligatoire(entree.idAnneeScolaire, 'idAnneeScolaire'),
      modifiePar: this.validerTexteObligatoire(entree.modifiePar, 'modifiePar'),
    };
  }

  private validerTexteObligatoire(valeur: string, nomChamp: string): string {
    if (typeof valeur !== 'string') {
      throw new ErreurAnneeScolaireInvalide(
        `Le champ "${nomChamp}" doit etre une chaine de caracteres.`,
      );
    }

    const valeurNettoyee = valeur.trim();

    if (valeurNettoyee.length === 0) {
      throw new ErreurAnneeScolaireInvalide(
        `Le champ "${nomChamp}" est obligatoire.`,
      );
    }

    return valeurNettoyee;
  }
}
