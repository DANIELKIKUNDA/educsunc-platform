import { UseCase } from '../../../../../shared/application/UseCase';
import { ErreurAnneeScolaireInvalide } from '../../../domain/exceptions/ErreurAnneeScolaireInvalide';
import { ErreurTransitionStatutAnneeInterdite } from '../../../domain/exceptions/ErreurTransitionStatutAnneeInterdite';
import { PolicyAudit } from '../../../domain/policies/PolicyAudit';
import { DepotAnneeScolaire } from '../../../domain/repositories/DepotAnneeScolaire';
import { AnneeScolaireId } from '../../../domain/value-objects/AnneeScolaireId';
import { StatutAnneeScolaire } from '../../../domain/value-objects/StatutAnneeScolaire';
import { CloturerAnneeScolaireEntree } from '../../dto/input/CloturerAnneeScolaireEntree';
import { AnneeScolaireSortie } from '../../dto/output/AnneeScolaireSortie';
import { AnneeScolaireApplicationMapper } from '../../mappers/AnneeScolaireApplicationMapper';
import {
  ServiceJournalAuditReferentielAcademique,
  ServiceJournalAuditReferentielAcademiqueSansEffet,
} from '../../services/ServiceJournalAuditReferentielAcademique';

// Cette interface represente la sortie du cas d'usage CloturerAnneeScolaire.
export interface SortieCloturerAnneeScolaire {
  anneeScolaire: AnneeScolaireSortie;
}

// Ce cas d'usage orchestre la cloture d'une annee scolaire.
export class CloturerAnneeScolaire
  implements UseCase<CloturerAnneeScolaireEntree, SortieCloturerAnneeScolaire>
{
  private readonly depotAnneeScolaire: DepotAnneeScolaire;
  private readonly policyAudit: PolicyAudit;
  private readonly serviceJournalAudit: ServiceJournalAuditReferentielAcademique;

  // Ce constructeur injecte les dependances applicatives necessaires a la cloture d'une annee scolaire.
  constructor(
    depotAnneeScolaire: DepotAnneeScolaire,
    policyAudit: PolicyAudit = new PolicyAudit(),
    serviceJournalAudit: ServiceJournalAuditReferentielAcademique =
      new ServiceJournalAuditReferentielAcademiqueSansEffet(),
  ) {
    this.depotAnneeScolaire = depotAnneeScolaire;
    this.policyAudit = policyAudit;
    this.serviceJournalAudit = serviceJournalAudit;
  }

  // Cette methode cloture une annee scolaire active.
  public async executer(
    entree: CloturerAnneeScolaireEntree,
  ): Promise<SortieCloturerAnneeScolaire> {
    const entreeValidee = this.validerEntree(entree);
    const horodatageModification = new Date();

    this.policyAudit.verifierTracabiliteObligatoire(
      'CLOTURER_ANNEE_SCOLAIRE',
      entreeValidee.modifiePar,
      horodatageModification,
    );

    const anneeScolaire = await this.depotAnneeScolaire.trouverParId(
      new AnneeScolaireId(entreeValidee.idAnneeScolaire),
    );

    if (anneeScolaire === null) {
      throw new ErreurAnneeScolaireInvalide(
        "L'annee scolaire a cloturer est introuvable.",
      );
    }

    if (anneeScolaire.obtenirStatut() !== StatutAnneeScolaire.ACTIVE) {
      throw new ErreurTransitionStatutAnneeInterdite(
        'Seule une annee scolaire active peut etre cloturee.',
      );
    }

    anneeScolaire.cloturer(entreeValidee.modifiePar);
    await this.depotAnneeScolaire.sauvegarder(anneeScolaire);
    await this.serviceJournalAudit.journaliser({
      action: 'CLOTURER_ANNEE_SCOLAIRE',
      acteur: entreeValidee.modifiePar,
      typeRessource: 'AnneeScolaire',
      idRessource: anneeScolaire.obtenirId().obtenirValeur(),
      idEcole: anneeScolaire.obtenirEcoleId().obtenirValeur(),
      details: {
        code: anneeScolaire.obtenirCode(),
        statut: anneeScolaire.obtenirStatut(),
      },
      creeLe: horodatageModification,
    });

    return {
      anneeScolaire: AnneeScolaireApplicationMapper.versSortie(anneeScolaire),
    };
  }

  private validerEntree(
    entree: CloturerAnneeScolaireEntree,
  ): CloturerAnneeScolaireEntree {
    if (entree === null || entree === undefined) {
      throw new ErreurAnneeScolaireInvalide(
        "L'entree du cas d'usage CloturerAnneeScolaire est obligatoire.",
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
