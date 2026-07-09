import { UseCase } from '../../../../../shared/application/UseCase';
import { PolicyAudit } from '../../../domain/policies/PolicyAudit';
import { DepotMigrationReferentielProgramme } from '../../../domain/repositories/DepotMigrationReferentielProgramme';
import { DepotReferentielProgramme } from '../../../domain/repositories/DepotReferentielProgramme';
import { LigneReferentielProgrammeId } from '../../../domain/value-objects/LigneReferentielProgrammeId';
import { RetirerLigneVersionReferentielProgrammeEntree } from '../../dto/input/RetirerLigneVersionReferentielProgrammeEntree';
import { VersionReferentielProgrammeSortie } from '../../dto/output/VersionReferentielProgrammeSortie';
import { VersionReferentielProgrammeApplicationMapper } from '../../mappers/VersionReferentielProgrammeApplicationMapper';
import {
  ServiceJournalAuditReferentielAcademique,
  ServiceJournalAuditReferentielAcademiqueSansEffet,
} from '../../services/ServiceJournalAuditReferentielAcademique';
import { SupportEditionVersionReferentiel } from './SupportEditionVersionReferentiel';

export interface SortieRetirerLigneVersionReferentielProgramme {
  versionReferentielProgramme: VersionReferentielProgrammeSortie;
}

// Ce cas d'usage orchestre le retrait d'une ligne sur une version de travail officielle.
export class RetirerLigneVersionReferentielProgramme
  implements
    UseCase<
      RetirerLigneVersionReferentielProgrammeEntree,
      SortieRetirerLigneVersionReferentielProgramme
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
    entree: RetirerLigneVersionReferentielProgrammeEntree,
  ): Promise<SortieRetirerLigneVersionReferentielProgramme> {
    const entreeValidee = this.validerEntree(entree);
    const horodatageRetrait = new Date();

    this.policyAudit.verifierTracabiliteObligatoire(
      'RETIRER_LIGNE_VERSION_REFERENTIEL_PROGRAMME',
      entreeValidee.retireePar,
      horodatageRetrait,
    );

    const contexte = await this.supportEdition.chargerVersionEditable(
      entreeValidee.idVersionReferentielProgramme,
    );

    try {
      contexte.versionReferentielProgramme.retirerLigne(
        new LigneReferentielProgrammeId(entreeValidee.idLigneReferentielProgramme),
        contexte.referentielProgramme.obtenirTypeStructureEvaluation(),
      );
    } catch (erreur) {
      throw this.supportEdition.convertirErreurEdition(erreur);
    }

    await this.depotReferentielProgramme.sauvegarder(contexte.referentielProgramme);
    await this.serviceJournalAudit.journaliser({
      action: 'RETIRER_LIGNE_VERSION_REFERENTIEL_PROGRAMME',
      acteur: entreeValidee.retireePar,
      typeRessource: 'VersionReferentielProgramme',
      idRessource: contexte.idVersionReferentielProgramme.obtenirValeur(),
      details: {
        idReferentielProgramme: contexte.referentielProgramme.obtenirId().obtenirValeur(),
        idLigneReferentielProgramme: entreeValidee.idLigneReferentielProgramme,
      },
      creeLe: horodatageRetrait,
    });

    return {
      versionReferentielProgramme: VersionReferentielProgrammeApplicationMapper.versSortie(
        contexte.versionReferentielProgramme,
      ),
    };
  }

  private validerEntree(
    entree: RetirerLigneVersionReferentielProgrammeEntree,
  ): RetirerLigneVersionReferentielProgrammeEntree {
    if (entree === null || entree === undefined) {
      throw this.supportEdition.convertirErreurEdition(
        new Error(
          "L'entree du cas d'usage RetirerLigneVersionReferentielProgramme est obligatoire.",
        ),
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
      retireePar: this.supportEdition.validerTexteObligatoire(entree.retireePar, 'retireePar'),
    };
  }
}
