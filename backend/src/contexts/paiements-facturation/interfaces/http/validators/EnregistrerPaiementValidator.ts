import type { EnregistrerPaiementInput } from '../../../application/dto/input/PaiementsEntreeDTO';
import { CiblePaiement } from '../../../domain/value-objects/CiblePaiement';
import { ModePaiement } from '../../../domain/value-objects/ModePaiement';
import { TypeFrais } from '../../../domain/value-objects/TypeFrais';
import { ParamValidator } from './ParamValidator';
import { ValidationHttpPaiementsFacturation } from './ValidationHttpPaiementsFacturation';

// Ce validator prepare l'entree applicative de creation d'un paiement sans porter de logique metier.
export class EnregistrerPaiementValidator {
  // Cette methode transforme le corps HTTP en DTO applicatif strict.
  public static valider(corps: unknown, headers: unknown): EnregistrerPaiementInput {
    const donnees = ValidationHttpPaiementsFacturation.obtenirObjet(corps, 'body');

    return {
      idOrganisation: ParamValidator.lireIdentifiantOrganisation(donnees, headers),
      idEleve: ValidationHttpPaiementsFacturation.lireChaineRequise(donnees, 'idEleve'),
      idEcole: ParamValidator.lireIdentifiantEcole(donnees, headers),
      typeFraisDeclare: ValidationHttpPaiementsFacturation.lireEnumRequis(
        donnees,
        'typeFraisDeclare',
        TypeFrais,
      ),
      montant: ValidationHttpPaiementsFacturation.lireMontantRequis(donnees, 'montant'),
      modePaiement: ValidationHttpPaiementsFacturation.lireEnumRequis(
        donnees,
        'modePaiement',
        ModePaiement,
      ),
      ciblePaiement:
        ValidationHttpPaiementsFacturation.lireChaineOptionnelle(donnees, 'ciblePaiement')
          === undefined
          ? undefined
          : ValidationHttpPaiementsFacturation.lireEnumRequis(
            donnees,
            'ciblePaiement',
            CiblePaiement,
          ),
      idempotencyKey:
        ValidationHttpPaiementsFacturation.lireChaineOptionnelle(
          donnees,
          'idempotencyKey',
        )
        ?? ValidationHttpPaiementsFacturation.lireHeaderChaine(
          headers,
          'idempotency-key',
        )
        ?? this.creerErreurCleIdempotente(),
      idCaissier: ParamValidator.lireIdentifiantUtilisateur(donnees, headers, 'idCaissier'),
    };
  }

  // Cette methode force la presence de la cle d'idempotence pour les ecritures critiques.
  private static creerErreurCleIdempotente(): never {
    throw new Error('La cle idempotente est obligatoire pour enregistrer un paiement.');
  }
}
