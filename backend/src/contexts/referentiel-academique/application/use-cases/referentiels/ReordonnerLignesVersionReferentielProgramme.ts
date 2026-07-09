import { UseCase } from '../../../../../shared/application/UseCase';
import { PolicyAudit } from '../../../domain/policies/PolicyAudit';
import { DepotMigrationReferentielProgramme } from '../../../domain/repositories/DepotMigrationReferentielProgramme';
import { DepotReferentielProgramme } from '../../../domain/repositories/DepotReferentielProgramme';
import { LigneReferentielProgrammeId } from '../../../domain/value-objects/LigneReferentielProgrammeId';
import { ReordonnerLignesVersionReferentielProgrammeEntree } from '../../dto/input/ReordonnerLignesVersionReferentielProgrammeEntree';
import { VersionReferentielProgrammeSortie } from '../../dto/output/VersionReferentielProgrammeSortie';
import { VersionReferentielProgrammeApplicationMapper } from '../../mappers/VersionReferentielProgrammeApplicationMapper';
import {
  ServiceJournalAuditReferentielAcademique,
  ServiceJournalAuditReferentielAcademiqueSansEffet,
} from '../../services/ServiceJournalAuditReferentielAcademique';
import { SupportEditionVersionReferentiel } from './SupportEditionVersionReferentiel';

export interface SortieReordonnerLignesVersionReferentielProgramme {
  versionReferentielProgramme: VersionReferentielProgrammeSortie;
}

// Ce cas d'usage orchestre le reordonnancement des lignes d'une version de travail officielle.
export class ReordonnerLignesVersionReferentielProgramme
  implements
    UseCase<
      ReordonnerLignesVersionReferentielProgrammeEntree,
      SortieReordonnerLignesVersionReferentielProgramme
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
    entree: ReordonnerLignesVersionReferentielProgrammeEntree,
  ): Promise<SortieReordonnerLignesVersionReferentielProgramme> {
    const entreeValidee = this.validerEntree(entree);
    const horodatageReordonnancement = new Date();

    this.policyAudit.verifierTracabiliteObligatoire(
      'REORDONNER_LIGNES_VERSION_REFERENTIEL_PROGRAMME',
      entreeValidee.reordonneePar,
      horodatageReordonnancement,
    );

    const contexte = await this.supportEdition.chargerVersionEditable(
      entreeValidee.idVersionReferentielProgramme,
    );

    try {
      contexte.versionReferentielProgramme.reordonnerLignes(
        entreeValidee.lignes.map((ligne) => ({
          idLigne: new LigneReferentielProgrammeId(ligne.idLigneReferentielProgramme),
          ordreAffichage: ligne.ordreAffichage,
        })),
        contexte.referentielProgramme.obtenirTypeStructureEvaluation(),
      );
    } catch (erreur) {
      throw this.supportEdition.convertirErreurEdition(erreur);
    }

    await this.depotReferentielProgramme.sauvegarder(contexte.referentielProgramme);
    await this.serviceJournalAudit.journaliser({
      action: 'REORDONNER_LIGNES_VERSION_REFERENTIEL_PROGRAMME',
      acteur: entreeValidee.reordonneePar,
      typeRessource: 'VersionReferentielProgramme',
      idRessource: contexte.idVersionReferentielProgramme.obtenirValeur(),
      details: {
        idReferentielProgramme: contexte.referentielProgramme.obtenirId().obtenirValeur(),
        nombreLignes: entreeValidee.lignes.length,
      },
      creeLe: horodatageReordonnancement,
    });

    return {
      versionReferentielProgramme: VersionReferentielProgrammeApplicationMapper.versSortie(
        contexte.versionReferentielProgramme,
      ),
    };
  }

  private validerEntree(
    entree: ReordonnerLignesVersionReferentielProgrammeEntree,
  ): ReordonnerLignesVersionReferentielProgrammeEntree {
    if (entree === null || entree === undefined) {
      throw this.supportEdition.convertirErreurEdition(
        new Error(
          "L'entree du cas d'usage ReordonnerLignesVersionReferentielProgramme est obligatoire.",
        ),
      );
    }

    if (!Array.isArray(entree.lignes) || entree.lignes.length === 0) {
      throw this.supportEdition.convertirErreurEdition(
        new Error('Le reordonnancement doit contenir au moins une ligne cible.'),
      );
    }

    return {
      idVersionReferentielProgramme: this.supportEdition.validerTexteObligatoire(
        entree.idVersionReferentielProgramme,
        'idVersionReferentielProgramme',
      ),
      lignes: entree.lignes.map((ligne) => ({
        idLigneReferentielProgramme: this.supportEdition.validerTexteObligatoire(
          ligne.idLigneReferentielProgramme,
          'idLigneReferentielProgramme',
        ),
        ordreAffichage: this.validerEntierPositif(ligne.ordreAffichage, 'ordreAffichage'),
      })),
      reordonneePar: this.supportEdition.validerTexteObligatoire(
        entree.reordonneePar,
        'reordonneePar',
      ),
    };
  }

  private validerEntierPositif(valeur: number, nomChamp: string): number {
    if (!Number.isInteger(valeur) || valeur <= 0) {
      throw this.supportEdition.convertirErreurEdition(
        new Error(`Le champ "${nomChamp}" doit etre un entier strictement positif.`),
      );
    }

    return valeur;
  }
}
