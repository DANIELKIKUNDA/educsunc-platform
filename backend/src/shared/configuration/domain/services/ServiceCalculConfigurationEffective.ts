import { ConfigurationLock } from '../entities';
import { EffectiveConfiguration } from '../aggregates';
import { PolitiqueHeritageConfiguration, PolitiqueOverrideConfiguration } from '../policies';
import {
  ConfigurationKey,
  ConfigurationScope,
  ConfigurationValue,
  EffectiveValue,
} from '../value-objects';

// Ce fichier declare le service principal de calcul de configuration effective.

/** Cette interface represente une entree source candidate au calcul effectif. */
export interface EntreeCalculConfigurationEffective {
  readonly key: ConfigurationKey;
  readonly scope: ConfigurationScope;
  readonly value: ConfigurationValue;
  readonly verrouille: boolean;
  readonly sourceConfigurationId?: string;
  readonly sourceStatut?: string;
  readonly sourceTotalVersions?: number;
  readonly sourceCreeLe?: Date;
}

/** Cette classe centralise la resolution d une configuration effective a partir de plusieurs portees. */
export class ServiceCalculConfigurationEffective {
  constructor(
    private readonly politiqueOverride = new PolitiqueOverrideConfiguration(),
    private readonly politiqueHeritage = new PolitiqueHeritageConfiguration(),
  ) {}

  /** Cette methode calcule la configuration effective pour une portee cible. */
  public calculer(
    cible: ConfigurationScope,
    entrees: readonly EntreeCalculConfigurationEffective[],
    lock: ConfigurationLock | null = null,
  ): EffectiveConfiguration {
    const valeurs = new Map<string, EffectiveValue>();
    const entreesParCle = new Map<string, EntreeCalculConfigurationEffective[]>();

    for (const entree of entrees) {
      if (!this.scopeCompatibleAvecCible(entree.scope, cible)) {
        continue;
      }

      const cle = entree.key.valeur();
      const candidates = entreesParCle.get(cle) ?? [];
      candidates.push(entree);
      entreesParCle.set(cle, candidates);
    }

    for (const [cle, candidates] of entreesParCle.entries()) {
      const entreeRetenue = this.resoudreEntreePourCle(cible, candidates, lock);
      if (!entreeRetenue) {
        continue;
      }

      const effectif = new EffectiveValue({
        key: entreeRetenue.key,
        value: entreeRetenue.value,
        sourceNiveau: entreeRetenue.scope.niveau(),
        herite: entreeRetenue.scope.niveau() !== cible.niveau(),
        verrouille: lock !== null || entreeRetenue.verrouille,
        explanation: '',
        sourceConfigurationId: entreeRetenue.sourceConfigurationId,
        sourceStatut: entreeRetenue.sourceStatut,
        sourceTotalVersions: entreeRetenue.sourceTotalVersions,
        sourceCreeLe: entreeRetenue.sourceCreeLe,
      });

      valeurs.set(
        cle,
        new EffectiveValue({
          ...effectif.details(),
          explanation: this.politiqueHeritage.expliquer(effectif),
        }),
      );
    }

    return new EffectiveConfiguration(cible, [...valeurs.values()]);
  }

  /** Cette methode resout la meilleure entree pour une cle en respectant la hierarchie. */
  private resoudreEntreePourCle(
    cible: ConfigurationScope,
    candidates: readonly EntreeCalculConfigurationEffective[],
    lock: ConfigurationLock | null,
  ): EntreeCalculConfigurationEffective | null {
    const tries = [...candidates].sort((gauche, droite) => gauche.scope.priorite() - droite.scope.priorite());
    let retenue: EntreeCalculConfigurationEffective | null = null;

    for (const candidate of tries) {
      if (
        !this.politiqueOverride.autoriser(
          candidate.scope,
          cible,
          lock !== null || candidate.verrouille,
        )
      ) {
        continue;
      }

      if (!retenue || candidate.scope.priorite() >= retenue.scope.priorite()) {
        retenue = candidate;
      }
    }

    return retenue;
  }

  /** Cette methode verifie que la portee source appartient bien a la branche de la cible. */
  private scopeCompatibleAvecCible(source: ConfigurationScope, cible: ConfigurationScope): boolean {
    const valeurSource = source.valeur();
    const valeurCible = cible.valeur();

    if (valeurSource.organisationId && valeurSource.organisationId !== valeurCible.organisationId) {
      return false;
    }
    if (valeurSource.ecoleId && valeurSource.ecoleId !== valeurCible.ecoleId) {
      return false;
    }
    if (valeurSource.utilisateurId && valeurSource.utilisateurId !== valeurCible.utilisateurId) {
      return false;
    }

    return source.priorite() <= cible.priorite();
  }
}
