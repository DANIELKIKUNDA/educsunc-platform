import { UseCase } from '../../../../../shared/application/UseCase';
import { PolicyAudit } from '../../../domain/policies/PolicyAudit';
import { DepotMigrationReferentielProgramme } from '../../../domain/repositories/DepotMigrationReferentielProgramme';
import { DepotReferentielProgramme } from '../../../domain/repositories/DepotReferentielProgramme';
import { LigneReferentielProgrammeId } from '../../../domain/value-objects/LigneReferentielProgrammeId';
import { PonderationEvaluation, ProprietesPonderationEvaluation } from '../../../domain/value-objects/PonderationEvaluation';
import { ModifierLigneVersionReferentielProgrammeEntree } from '../../dto/input/ModifierLigneVersionReferentielProgrammeEntree';
import { VersionReferentielProgrammeSortie } from '../../dto/output/VersionReferentielProgrammeSortie';
import { VersionReferentielProgrammeApplicationMapper } from '../../mappers/VersionReferentielProgrammeApplicationMapper';
import {
  ServiceJournalAuditReferentielAcademique,
  ServiceJournalAuditReferentielAcademiqueSansEffet,
} from '../../services/ServiceJournalAuditReferentielAcademique';
import { SupportEditionVersionReferentiel } from './SupportEditionVersionReferentiel';

export interface SortieModifierLigneVersionReferentielProgramme {
  versionReferentielProgramme: VersionReferentielProgrammeSortie;
}

// Ce cas d'usage orchestre la modification d'une ligne existante sur une version de travail officielle.
export class ModifierLigneVersionReferentielProgramme
  implements
    UseCase<
      ModifierLigneVersionReferentielProgrammeEntree,
      SortieModifierLigneVersionReferentielProgramme
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
    entree: ModifierLigneVersionReferentielProgrammeEntree,
  ): Promise<SortieModifierLigneVersionReferentielProgramme> {
    const entreeValidee = this.validerEntree(entree);
    const horodatageModification = new Date();

    this.policyAudit.verifierTracabiliteObligatoire(
      'MODIFIER_LIGNE_VERSION_REFERENTIEL_PROGRAMME',
      entreeValidee.modifieePar,
      horodatageModification,
    );

    const contexte = await this.supportEdition.chargerVersionEditable(
      entreeValidee.idVersionReferentielProgramme,
    );

    try {
      contexte.versionReferentielProgramme.modifierLigne(
        new LigneReferentielProgrammeId(entreeValidee.idLigneReferentielProgramme),
        {
          ordreAffichage: entreeValidee.ordreAffichage,
          obligatoire: entreeValidee.obligatoire,
          aExamen: entreeValidee.aExamen,
          estCalculable: entreeValidee.estCalculable,
          ponderation: entreeValidee.ponderation === undefined
            ? undefined
            : new PonderationEvaluation(entreeValidee.ponderation),
          domaine: entreeValidee.domaine,
          sousDomaine: entreeValidee.sousDomaine,
        },
        contexte.referentielProgramme.obtenirTypeStructureEvaluation(),
      );
    } catch (erreur) {
      throw this.supportEdition.convertirErreurEdition(erreur);
    }

    await this.depotReferentielProgramme.sauvegarder(contexte.referentielProgramme);
    await this.serviceJournalAudit.journaliser({
      action: 'MODIFIER_LIGNE_VERSION_REFERENTIEL_PROGRAMME',
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
    entree: ModifierLigneVersionReferentielProgrammeEntree,
  ): ModifierLigneVersionReferentielProgrammeEntree {
    if (entree === null || entree === undefined) {
      throw this.supportEdition.convertirErreurEdition(
        new Error(
          "L'entree du cas d'usage ModifierLigneVersionReferentielProgramme est obligatoire.",
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
      ordreAffichage: this.validerEntierPositifOptionnel(entree.ordreAffichage, 'ordreAffichage'),
      obligatoire: this.validerBooleenOptionnel(entree.obligatoire, 'obligatoire'),
      aExamen: this.validerBooleenOptionnel(entree.aExamen, 'aExamen'),
      estCalculable: this.validerBooleenOptionnel(entree.estCalculable, 'estCalculable'),
      ponderation: this.validerPonderationOptionnelle(entree.ponderation),
      domaine: this.supportEdition.validerTexteOptionnel(entree.domaine),
      sousDomaine: this.supportEdition.validerTexteOptionnel(entree.sousDomaine),
      modifieePar: this.supportEdition.validerTexteObligatoire(entree.modifieePar, 'modifieePar'),
    };
  }

  private validerEntierPositifOptionnel(valeur: number | undefined, nomChamp: string): number | undefined {
    if (valeur === undefined) {
      return undefined;
    }

    if (!Number.isInteger(valeur) || valeur <= 0) {
      throw this.supportEdition.convertirErreurEdition(
        new Error(`Le champ "${nomChamp}" doit etre un entier strictement positif.`),
      );
    }

    return valeur;
  }

  private validerBooleenOptionnel(valeur: boolean | undefined, nomChamp: string): boolean | undefined {
    if (valeur === undefined) {
      return undefined;
    }

    if (typeof valeur !== 'boolean') {
      throw this.supportEdition.convertirErreurEdition(
        new Error(`Le champ "${nomChamp}" doit etre un booleen.`),
      );
    }

    return valeur;
  }

  private validerPonderationOptionnelle(
    valeur?: ProprietesPonderationEvaluation,
  ): ProprietesPonderationEvaluation | undefined {
    if (valeur === undefined) {
      return undefined;
    }

    if (typeof valeur !== 'object' || valeur === null) {
      throw this.supportEdition.convertirErreurEdition(
        new Error('La ponderation fournie est invalide.'),
      );
    }

    return valeur;
  }
}
