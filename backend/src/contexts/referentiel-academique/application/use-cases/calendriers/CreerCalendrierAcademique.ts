import { UseCase } from '../../../../../shared/application/UseCase';
import { CalendrierAcademique } from '../../../domain/aggregates/CalendrierAcademique';
import { AnneeScolaire } from '../../../domain/aggregates/AnneeScolaire';
import { Ecole } from '../../../domain/aggregates/Ecole';
import { PeriodeCalendrier } from '../../../domain/entities/PeriodeCalendrier';
import { ErreurAnneeScolaireInvalide } from '../../../domain/exceptions/ErreurAnneeScolaireInvalide';
import { ErreurCalendrierInvalide } from '../../../domain/exceptions/ErreurCalendrierInvalide';
import { ErreurEcoleInvalide } from '../../../domain/exceptions/ErreurEcoleInvalide';
import { PolicyAudit } from '../../../domain/policies/PolicyAudit';
import { PolicyCalendrier } from '../../../domain/policies/PolicyCalendrier';
import { DepotAnneeScolaire } from '../../../domain/repositories/DepotAnneeScolaire';
import { DepotCalendrierAcademique } from '../../../domain/repositories/DepotCalendrierAcademique';
import { DepotEcole } from '../../../domain/repositories/DepotEcole';
import { MoteurCalendrierAcademique } from '../../../domain/services/MoteurCalendrierAcademique';
import { AnneeScolaireId } from '../../../domain/value-objects/AnneeScolaireId';
import { CalendrierAcademiqueId } from '../../../domain/value-objects/CalendrierAcademiqueId';
import { EcoleId } from '../../../domain/value-objects/EcoleId';
import { PeriodeCalendrierId } from '../../../domain/value-objects/PeriodeCalendrierId';
import { TypePeriodeCalendrier } from '../../../domain/value-objects/TypePeriodeCalendrier';
import { TypeStructureEvaluation } from '../../../domain/value-objects/TypeStructureEvaluation';
import { CreerCalendrierAcademiqueEntree } from '../../dto/input/CreerCalendrierAcademiqueEntree';
import { PeriodeCalendrierEntree } from '../../dto/input/PeriodeCalendrierEntree';
import { CalendrierAcademiqueSortie } from '../../dto/output/CalendrierAcademiqueSortie';
import { CalendrierAcademiqueApplicationMapper } from '../../mappers/CalendrierAcademiqueApplicationMapper';
import {
  ServiceJournalAuditReferentielAcademique,
  ServiceJournalAuditReferentielAcademiqueSansEffet,
} from '../../services/ServiceJournalAuditReferentielAcademique';
import {
  ServiceTransactionApplication,
  ServiceTransactionApplicationSansEffet,
} from '../../services/ServiceTransactionApplication';

// Cette interface represente la sortie du cas d'usage CreerCalendrierAcademique.
export interface SortieCreerCalendrierAcademique {
  calendrierAcademique: CalendrierAcademiqueSortie;
}

// Ce cas d'usage orchestre la creation d'un calendrier academique.
export class CreerCalendrierAcademique
  implements UseCase<CreerCalendrierAcademiqueEntree, SortieCreerCalendrierAcademique>
{
  private readonly depotCalendrierAcademique: DepotCalendrierAcademique;
  private readonly depotEcole: DepotEcole;
  private readonly depotAnneeScolaire: DepotAnneeScolaire;
  private readonly policyCalendrier: PolicyCalendrier;
  private readonly moteurCalendrierAcademique: MoteurCalendrierAcademique;
  private readonly policyAudit: PolicyAudit;
  private readonly serviceTransactionApplication: ServiceTransactionApplication;
  private readonly serviceJournalAudit: ServiceJournalAuditReferentielAcademique;

  // Ce constructeur injecte les dependances applicatives necessaires a la creation d'un calendrier academique.
  constructor(
    depotCalendrierAcademique: DepotCalendrierAcademique,
    depotEcole: DepotEcole,
    depotAnneeScolaire: DepotAnneeScolaire,
    policyCalendrier: PolicyCalendrier = new PolicyCalendrier(),
    moteurCalendrierAcademique: MoteurCalendrierAcademique = new MoteurCalendrierAcademique(),
    policyAudit: PolicyAudit = new PolicyAudit(),
    serviceTransactionApplication: ServiceTransactionApplication = new ServiceTransactionApplicationSansEffet(),
    serviceJournalAudit: ServiceJournalAuditReferentielAcademique =
      new ServiceJournalAuditReferentielAcademiqueSansEffet(),
  ) {
    this.depotCalendrierAcademique = depotCalendrierAcademique;
    this.depotEcole = depotEcole;
    this.depotAnneeScolaire = depotAnneeScolaire;
    this.policyCalendrier = policyCalendrier;
    this.moteurCalendrierAcademique = moteurCalendrierAcademique;
    this.policyAudit = policyAudit;
    this.serviceTransactionApplication = serviceTransactionApplication;
    this.serviceJournalAudit = serviceJournalAudit;
  }

  // Cette methode cree un calendrier academique unique pour une ecole et une annee scolaire donnees.
  public async executer(
    entree: CreerCalendrierAcademiqueEntree,
  ): Promise<SortieCreerCalendrierAcademique> {
    const entreeValidee = this.validerEntree(entree);
    return this.serviceTransactionApplication.executerDansTransaction(async () => {
      const horodatageCreation = new Date();

      this.policyAudit.verifierTracabiliteObligatoire(
        'CREER_CALENDRIER_ACADEMIQUE',
        entreeValidee.creePar,
        horodatageCreation,
      );

      const ecole = await this.obtenirEcole(entreeValidee.idEcole);
      const anneeScolaire = await this.obtenirAnneeScolaire(entreeValidee.idAnneeScolaire);

      this.verifierRattachementAnneeAEcole(anneeScolaire, ecole);

      const calendrierAcademique = new CalendrierAcademique(
        new CalendrierAcademiqueId(),
        ecole.obtenirId(),
        anneeScolaire.obtenirId(),
        entreeValidee.typeStructureEvaluation,
        entreeValidee.dateDebutAnnee,
        entreeValidee.dateFinAnnee,
        entreeValidee.periodes.map((periode) => this.creerPeriode(periode)),
        entreeValidee.creePar,
      );

      const calendrierExistant = await this.depotCalendrierAcademique.trouverParEcoleEtAnnee(
        ecole.obtenirId(),
        anneeScolaire.obtenirId(),
      );

      this.policyCalendrier.verifierCalendrierUnique(
        calendrierExistant === null
          ? [calendrierAcademique]
          : [calendrierExistant, calendrierAcademique],
        ecole.obtenirId(),
        anneeScolaire.obtenirId(),
      );
      this.policyCalendrier.verifierCoherenceTemporelleObligatoire(calendrierAcademique);
      this.moteurCalendrierAcademique.validerCalendrier(calendrierAcademique);

      await this.depotCalendrierAcademique.sauvegarder(calendrierAcademique);
      await this.serviceJournalAudit.journaliser({
        action: 'CREER_CALENDRIER_ACADEMIQUE',
        acteur: entreeValidee.creePar,
        typeRessource: 'CalendrierAcademique',
        idRessource: calendrierAcademique.obtenirId().obtenirValeur(),
        idEcole: ecole.obtenirId().obtenirValeur(),
        details: {
          idAnneeScolaire: anneeScolaire.obtenirId().obtenirValeur(),
          typeStructureEvaluation: calendrierAcademique.obtenirTypeStructureEvaluation(),
          nombrePeriodes: calendrierAcademique.obtenirPeriodes().length,
        },
        creeLe: horodatageCreation,
      });

      return {
        calendrierAcademique: CalendrierAcademiqueApplicationMapper.versSortie(calendrierAcademique),
      };
    });
  }

  private async obtenirEcole(idEcole: string): Promise<Ecole> {
    const ecole = await this.depotEcole.trouverParId(new EcoleId(idEcole));

    if (ecole === null) {
      throw new ErreurEcoleInvalide(
        "L'ecole cible du calendrier academique est introuvable.",
      );
    }

    return ecole;
  }

  private async obtenirAnneeScolaire(idAnneeScolaire: string): Promise<AnneeScolaire> {
    const anneeScolaire = await this.depotAnneeScolaire.trouverParId(
      new AnneeScolaireId(idAnneeScolaire),
    );

    if (anneeScolaire === null) {
      throw new ErreurAnneeScolaireInvalide(
        "L'annee scolaire cible du calendrier academique est introuvable.",
      );
    }

    return anneeScolaire;
  }

  private verifierRattachementAnneeAEcole(anneeScolaire: AnneeScolaire, ecole: Ecole): void {
    if (!anneeScolaire.obtenirEcoleId().estEgal(ecole.obtenirId())) {
      throw new ErreurAnneeScolaireInvalide(
        "L'annee scolaire fournie n'appartient pas a l'ecole cible.",
      );
    }
  }

  private creerPeriode(periode: PeriodeCalendrierEntree): PeriodeCalendrier {
    return new PeriodeCalendrier(
      new PeriodeCalendrierId(),
      periode.code,
      periode.libelle,
      periode.ordre,
      periode.typePeriode,
      periode.dateDebut,
      periode.dateFin,
    );
  }

  private validerEntree(
    entree: CreerCalendrierAcademiqueEntree,
  ): CreerCalendrierAcademiqueEntree {
    if (entree === null || entree === undefined) {
      throw new ErreurCalendrierInvalide(
        "L'entree du cas d'usage CreerCalendrierAcademique est obligatoire.",
      );
    }

    return {
      idEcole: this.validerTexteObligatoire(entree.idEcole, 'idEcole'),
      idAnneeScolaire: this.validerTexteObligatoire(entree.idAnneeScolaire, 'idAnneeScolaire'),
      typeStructureEvaluation: this.validerTypeStructureEvaluation(entree.typeStructureEvaluation),
      dateDebutAnnee: this.validerDate(entree.dateDebutAnnee, 'dateDebutAnnee'),
      dateFinAnnee: this.validerDate(entree.dateFinAnnee, 'dateFinAnnee'),
      periodes: this.validerPeriodes(entree.periodes),
      creePar: this.validerTexteObligatoire(entree.creePar, 'creePar'),
    };
  }

  private validerPeriodes(periodes: PeriodeCalendrierEntree[]): PeriodeCalendrierEntree[] {
    if (!Array.isArray(periodes)) {
      throw new ErreurCalendrierInvalide(
        'Les periodes du calendrier doivent etre fournies sous forme de tableau.',
      );
    }

    return periodes.map((periode) => this.validerPeriode(periode));
  }

  private validerPeriode(periode: PeriodeCalendrierEntree): PeriodeCalendrierEntree {
    if (periode === null || periode === undefined) {
      throw new ErreurCalendrierInvalide(
        'Chaque periode du calendrier doit etre definie.',
      );
    }

    return {
      code: this.validerTexteObligatoire(periode.code, 'periode.code'),
      libelle: this.validerTexteObligatoire(periode.libelle, 'periode.libelle'),
      ordre: this.validerEntierPositif(periode.ordre, 'periode.ordre'),
      typePeriode: this.validerTypePeriode(periode.typePeriode),
      dateDebut: this.validerDate(periode.dateDebut, 'periode.dateDebut'),
      dateFin: this.validerDate(periode.dateFin, 'periode.dateFin'),
    };
  }

  private validerTexteObligatoire(valeur: string, nomChamp: string): string {
    if (typeof valeur !== 'string') {
      throw new ErreurCalendrierInvalide(
        `Le champ "${nomChamp}" doit etre une chaine de caracteres.`,
      );
    }

    const valeurNettoyee = valeur.trim();

    if (valeurNettoyee.length === 0) {
      throw new ErreurCalendrierInvalide(
        `Le champ "${nomChamp}" est obligatoire.`,
      );
    }

    return valeurNettoyee;
  }

  private validerEntierPositif(valeur: number, nomChamp: string): number {
    if (!Number.isInteger(valeur) || valeur <= 0) {
      throw new ErreurCalendrierInvalide(
        `Le champ "${nomChamp}" doit etre un entier strictement positif.`,
      );
    }

    return valeur;
  }

  private validerDate(valeur: Date, nomChamp: string): Date {
    if (!(valeur instanceof Date) || Number.isNaN(valeur.getTime())) {
      throw new ErreurCalendrierInvalide(
        `Le champ "${nomChamp}" doit etre une date valide.`,
      );
    }

    return new Date(valeur.getTime());
  }

  private validerTypePeriode(valeur: TypePeriodeCalendrier): TypePeriodeCalendrier {
    if (!Object.values(TypePeriodeCalendrier).includes(valeur)) {
      throw new ErreurCalendrierInvalide(
        'Le type de periode du calendrier est invalide.',
      );
    }

    return valeur;
  }

  private validerTypeStructureEvaluation(
    valeur: TypeStructureEvaluation,
  ): TypeStructureEvaluation {
    if (!Object.values(TypeStructureEvaluation).includes(valeur)) {
      throw new ErreurCalendrierInvalide(
        "Le type de structure d'evaluation du calendrier est invalide.",
      );
    }

    return valeur;
  }
}
