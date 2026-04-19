import { UseCase } from '../../../../../shared/application/UseCase';
import { ErreurAnneeScolaireInvalide } from '../../../domain/exceptions/ErreurAnneeScolaireInvalide';
import { PolicyAudit } from '../../../domain/policies/PolicyAudit';
import { DepotAnneeScolaire } from '../../../domain/repositories/DepotAnneeScolaire';
import { AnneeScolaireId } from '../../../domain/value-objects/AnneeScolaireId';
import { ModifierAnneeScolaireEntree } from '../../dto/input/ModifierAnneeScolaireEntree';
import { AnneeScolaireSortie } from '../../dto/output/AnneeScolaireSortie';
import { AnneeScolaireApplicationMapper } from '../../mappers/AnneeScolaireApplicationMapper';
import {
  ServiceJournalAuditReferentielAcademique,
  ServiceJournalAuditReferentielAcademiqueSansEffet,
} from '../../services/ServiceJournalAuditReferentielAcademique';
import {
  ServiceTransactionApplication,
  ServiceTransactionApplicationSansEffet,
} from '../../services/ServiceTransactionApplication';

// Cette interface represente la sortie du cas d'usage ModifierAnneeScolaire.
export interface SortieModifierAnneeScolaire {
  anneeScolaire: AnneeScolaireSortie;
}

// Ce cas d'usage orchestre la modification administrative d'une annee scolaire planifiee.
export class ModifierAnneeScolaire
  implements UseCase<ModifierAnneeScolaireEntree, SortieModifierAnneeScolaire>
{
  private readonly depotAnneeScolaire: DepotAnneeScolaire;
  private readonly policyAudit: PolicyAudit;
  private readonly serviceTransactionApplication: ServiceTransactionApplication;
  private readonly serviceJournalAudit: ServiceJournalAuditReferentielAcademique;

  // Ce constructeur injecte les dependances applicatives necessaires a la modification.
  constructor(
    depotAnneeScolaire: DepotAnneeScolaire,
    policyAudit: PolicyAudit = new PolicyAudit(),
    serviceTransactionApplication: ServiceTransactionApplication =
      new ServiceTransactionApplicationSansEffet(),
    serviceJournalAudit: ServiceJournalAuditReferentielAcademique =
      new ServiceJournalAuditReferentielAcademiqueSansEffet(),
  ) {
    this.depotAnneeScolaire = depotAnneeScolaire;
    this.policyAudit = policyAudit;
    this.serviceTransactionApplication = serviceTransactionApplication;
    this.serviceJournalAudit = serviceJournalAudit;
  }

  // Cette methode modifie les informations administratives d'une annee scolaire planifiee.
  public async executer(
    entree: ModifierAnneeScolaireEntree,
  ): Promise<SortieModifierAnneeScolaire> {
    const entreeValidee = this.validerEntree(entree);

    return this.serviceTransactionApplication.executerDansTransaction(async () => {
      const horodatageModification = new Date();

      this.policyAudit.verifierTracabiliteObligatoire(
        'MODIFIER_ANNEE_SCOLAIRE',
        entreeValidee.modifiePar,
        horodatageModification,
      );

      const anneeScolaire = await this.depotAnneeScolaire.trouverParId(
        new AnneeScolaireId(entreeValidee.idAnneeScolaire),
      );

      if (anneeScolaire === null) {
        throw new ErreurAnneeScolaireInvalide(
          "L'annee scolaire a modifier est introuvable.",
        );
      }

      const anneeMemeCode = await this.depotAnneeScolaire.trouverParCodeEtEcole(
        anneeScolaire.obtenirEcoleId(),
        entreeValidee.code,
      );

      if (
        anneeMemeCode !== null
        && anneeMemeCode.obtenirId().obtenirValeur()
          !== anneeScolaire.obtenirId().obtenirValeur()
      ) {
        throw new ErreurAnneeScolaireInvalide(
          "Une autre annee scolaire utilise deja ce code dans cette ecole.",
        );
      }

      anneeScolaire.modifierInformations(
        entreeValidee.code,
        entreeValidee.libelle,
        entreeValidee.dateDebut,
        entreeValidee.dateFin,
        entreeValidee.modifiePar,
      );

      await this.depotAnneeScolaire.sauvegarder(anneeScolaire);
      await this.serviceJournalAudit.journaliser({
        action: 'MODIFIER_ANNEE_SCOLAIRE',
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
    });
  }

  private validerEntree(entree: ModifierAnneeScolaireEntree): ModifierAnneeScolaireEntree {
    if (entree === null || entree === undefined) {
      throw new ErreurAnneeScolaireInvalide(
        "L'entree du cas d'usage ModifierAnneeScolaire est obligatoire.",
      );
    }

    return {
      idAnneeScolaire: this.validerTexteObligatoire(
        entree.idAnneeScolaire,
        'idAnneeScolaire',
      ),
      code: this.validerTexteObligatoire(entree.code, 'code'),
      libelle: this.validerTexteObligatoire(entree.libelle, 'libelle'),
      dateDebut: this.validerDate(entree.dateDebut, 'dateDebut'),
      dateFin: this.validerDate(entree.dateFin, 'dateFin'),
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

  private validerDate(valeur: Date, nomChamp: string): Date {
    if (!(valeur instanceof Date) || Number.isNaN(valeur.getTime())) {
      throw new ErreurAnneeScolaireInvalide(
        `Le champ "${nomChamp}" doit etre une date valide.`,
      );
    }

    return new Date(valeur.getTime());
  }
}
