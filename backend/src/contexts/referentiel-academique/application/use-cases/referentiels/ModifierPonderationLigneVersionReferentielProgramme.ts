import { UseCase } from '../../../../../shared/application/UseCase';
import { PolicyAudit } from '../../../domain/policies/PolicyAudit';
import { DepotMigrationReferentielProgramme } from '../../../domain/repositories/DepotMigrationReferentielProgramme';
import { DepotReferentielProgramme } from '../../../domain/repositories/DepotReferentielProgramme';
import { LigneReferentielProgrammeId } from '../../../domain/value-objects/LigneReferentielProgrammeId';
import { PonderationEvaluation } from '../../../domain/value-objects/PonderationEvaluation';
import { ModifierPonderationLigneVersionReferentielProgrammeEntree } from '../../dto/input/ModifierPonderationLigneVersionReferentielProgrammeEntree';
import { VersionReferentielProgrammeSortie } from '../../dto/output/VersionReferentielProgrammeSortie';
import { VersionReferentielProgrammeApplicationMapper } from '../../mappers/VersionReferentielProgrammeApplicationMapper';
import {
  ServiceJournalAuditReferentielAcademique,
  ServiceJournalAuditReferentielAcademiqueSansEffet,
} from '../../services/ServiceJournalAuditReferentielAcademique';
import { SupportEditionVersionReferentiel } from './SupportEditionVersionReferentiel';

export interface SortieModifierPonderationLigneVersionReferentielProgramme {
  versionReferentielProgramme: VersionReferentielProgrammeSortie;
}

// Ce cas d'usage orchestre la modification de ponderation d'une ligne sur une version de travail officielle.
export class ModifierPonderationLigneVersionReferentielProgramme
  implements
    UseCase<
      ModifierPonderationLigneVersionReferentielProgrammeEntree,
      SortieModifierPonderationLigneVersionReferentielProgramme
    >
{
  private readonly depotReferentielProgramme: DepotReferentielProgramme;
  private readonly supportEdition: SupportEditionVersionReferentiel;
  private readonly policyAudit: PolicyAudit;
  private readonly serviceJournalAudit: ServiceJournalAuditReferentielAcademique;

  constructor(
    depotReferentielProgramme: DepotReferentielProgramme,
    depotMigrationReferentielProgramme?: DepotMigrationReferentielProgramme,
    policyAudit: PolicyAudit = new PolicyAudit(),
    serviceJournalAudit: ServiceJournalAuditReferentielAcademique =
      new ServiceJournalAuditReferentielAcademiqueSansEffet(),
  ) {
    this.depotReferentielProgramme = depotReferentielProgramme;
    this.supportEdition = new SupportEditionVersionReferentiel(
      depotReferentielProgramme,
      depotMigrationReferentielProgramme,
    );
    this.policyAudit = policyAudit;
    this.serviceJournalAudit = serviceJournalAudit;
  }

  public async executer(
    entree: ModifierPonderationLigneVersionReferentielProgrammeEntree,
  ): Promise<SortieModifierPonderationLigneVersionReferentielProgramme> {
    const entreeValidee = this.validerEntree(entree);
    const horodatageModification = new Date();

    this.policyAudit.verifierTracabiliteObligatoire(
      'MODIFIER_PONDERATION_LIGNE_VERSION_REFERENTIEL_PROGRAMME',
      entreeValidee.modifieePar,
      horodatageModification,
    );

    const contexte = await this.supportEdition.chargerVersionEditable(
      entreeValidee.idVersionReferentielProgramme,
    );

    try {
      contexte.versionReferentielProgramme.modifierPonderationLigne(
        new LigneReferentielProgrammeId(entreeValidee.idLigneReferentielProgramme),
        new PonderationEvaluation(entreeValidee.ponderation),
        contexte.referentielProgramme.obtenirTypeStructureEvaluation(),
      );
    } catch (erreur) {
      throw this.supportEdition.convertirErreurEdition(erreur);
    }

    await this.depotReferentielProgramme.sauvegarder(contexte.referentielProgramme);
    await this.serviceJournalAudit.journaliser({
      action: 'MODIFIER_PONDERATION_LIGNE_VERSION_REFERENTIEL_PROGRAMME',
      acteur: entreeValidee.modifieePar,
      typeRessource: 'VersionReferentielProgramme',
      idRessource: contexte.idVersionReferentielProgramme.obtenirValeur(),
      details: {
        idReferentielProgramme: contexte.referentielProgramme.obtenirId().obtenirValeur(),
        idLigneReferentielProgramme: entreeValidee.idLigneReferentielProgramme,
      },
      creeLe: horodatageModification,
    });

    return {
      versionReferentielProgramme: VersionReferentielProgrammeApplicationMapper.versSortie(
        contexte.versionReferentielProgramme,
      ),
    };
  }

  private validerEntree(
    entree: ModifierPonderationLigneVersionReferentielProgrammeEntree,
  ): ModifierPonderationLigneVersionReferentielProgrammeEntree {
    if (entree === null || entree === undefined) {
      throw this.supportEdition.convertirErreurEdition(
        new Error(
          "L'entree du cas d'usage ModifierPonderationLigneVersionReferentielProgramme est obligatoire.",
        ),
      );
    }

    if (typeof entree.ponderation !== 'object' || entree.ponderation === null) {
      throw this.supportEdition.convertirErreurEdition(
        new Error('La ponderation de ligne est obligatoire.'),
      );
    }

    return {
      idVersionReferentielProgramme: this.supportEdition.validerTexteObligatoire(
        entree.idVersionReferentielProgramme,
        'idVersionReferentielProgramme',
      ),
      idLigneReferentielProgramme: this.supportEdition.validerTexteObligatoire(
        entree.idLigneReferentielProgramme,
        'idLigneReferentielProgramme',
      ),
      ponderation: entree.ponderation,
      modifieePar: this.supportEdition.validerTexteObligatoire(entree.modifieePar, 'modifieePar'),
    };
  }
}
