import { UseCase } from '../../../../../shared/application/UseCase';
import { PolicyAudit } from '../../../domain/policies/PolicyAudit';
import { DepotMigrationReferentielProgramme } from '../../../domain/repositories/DepotMigrationReferentielProgramme';
import { DepotReferentielProgramme } from '../../../domain/repositories/DepotReferentielProgramme';
import { VerifierCoherenceVersionReferentielAvantPublicationEntree } from '../../dto/input/VerifierCoherenceVersionReferentielAvantPublicationEntree';
import { VerificationCoherenceVersionReferentielSortie } from '../../dto/output/VerificationCoherenceVersionReferentielSortie';
import { VersionReferentielProgrammeApplicationMapper } from '../../mappers/VersionReferentielProgrammeApplicationMapper';
import {
  ServiceJournalAuditReferentielAcademique,
  ServiceJournalAuditReferentielAcademiqueSansEffet,
} from '../../services/ServiceJournalAuditReferentielAcademique';
import { SupportEditionVersionReferentiel } from './SupportEditionVersionReferentiel';

// Ce cas d'usage orchestre la verification explicite de coherence avant publication.
export class VerifierCoherenceVersionReferentielAvantPublication
  implements
    UseCase<
      VerifierCoherenceVersionReferentielAvantPublicationEntree,
      VerificationCoherenceVersionReferentielSortie
    >
{
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
    this.supportEdition = new SupportEditionVersionReferentiel(
      depotReferentielProgramme,
      depotMigrationReferentielProgramme,
    );
    this.policyAudit = policyAudit;
    this.serviceJournalAudit = serviceJournalAudit;
  }

  public async executer(
    entree: VerifierCoherenceVersionReferentielAvantPublicationEntree,
  ): Promise<VerificationCoherenceVersionReferentielSortie> {
    const entreeValidee = this.validerEntree(entree);
    const horodatageVerification = new Date();

    this.policyAudit.verifierTracabiliteObligatoire(
      'VERIFIER_COHERENCE_VERSION_REFERENTIEL',
      entreeValidee.verifieePar,
      horodatageVerification,
    );

    const contexte = await this.supportEdition.chargerVersionEditable(
      entreeValidee.idVersionReferentielProgramme,
    );

    try {
      contexte.versionReferentielProgramme.verifierCoherenceDesLignes(
        contexte.referentielProgramme.obtenirTypeStructureEvaluation(),
      );
    } catch (erreur) {
      throw this.supportEdition.convertirErreurEdition(erreur);
    }

    await this.serviceJournalAudit.journaliser({
      action: 'VERIFIER_COHERENCE_VERSION_REFERENTIEL',
      acteur: entreeValidee.verifieePar,
      typeRessource: 'VersionReferentielProgramme',
      idRessource: contexte.idVersionReferentielProgramme.obtenirValeur(),
      details: {
        idReferentielProgramme: contexte.referentielProgramme.obtenirId().obtenirValeur(),
        estCoherente: true,
      },
      creeLe: horodatageVerification,
    });

    return {
      estCoherente: true,
      erreurs: [],
      avertissements: [],
      versionReferentielProgramme: VersionReferentielProgrammeApplicationMapper.versSortie(
        contexte.versionReferentielProgramme,
      ),
    };
  }

  private validerEntree(
    entree: VerifierCoherenceVersionReferentielAvantPublicationEntree,
  ): VerifierCoherenceVersionReferentielAvantPublicationEntree {
    if (entree === null || entree === undefined) {
      throw this.supportEdition.convertirErreurEdition(
        new Error(
          "L'entree du cas d'usage VerifierCoherenceVersionReferentielAvantPublication est obligatoire.",
        ),
      );
    }

    return {
      idVersionReferentielProgramme: this.supportEdition.validerTexteObligatoire(
        entree.idVersionReferentielProgramme,
        'idVersionReferentielProgramme',
      ),
      verifieePar: this.supportEdition.validerTexteObligatoire(entree.verifieePar, 'verifieePar'),
    };
  }
}
