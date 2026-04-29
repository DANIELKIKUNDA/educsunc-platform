import { Paiement } from '../../domain/aggregates/Paiement';
import { PaiementEnregistreOutput, PaiementHistoriqueOutput, RecuPaiementOutput, RestitutionOutput } from '../dto/output/PaiementsSortieDTO';
import { RecuPaiement } from '../../domain/aggregates/RecuPaiement';
import { Restitution } from '../../domain/aggregates/Restitution';

export const versPaiementHistoriqueOutput = (paiement: Paiement): PaiementHistoriqueOutput => ({
  idPaiement: paiement.obtenirId(),
  montantTotal: paiement.obtenirMontantTotal(),
  modePaiement: paiement.obtenirModePaiement(),
  typeFraisDeclare: paiement.obtenirTypeFraisDeclare(),
  statutPaiement: paiement.obtenirStatutPaiement(),
  creeLe: paiement.obtenirCreeLe(),
});

export const versRecuPaiementOutput = (recu: RecuPaiement): RecuPaiementOutput => ({
  idRecu: recu.obtenirId(),
  numeroRecu: recu.obtenirNumeroRecu(),
  idPaiement: recu.obtenirIdPaiement(),
  idObligation: recu.obtenirIdObligation(),
  libelle: recu.obtenirLibelle(),
  montant: recu.obtenirMontant(),
  montantEnLettres: recu.obtenirMontantEnLettres(),
  dateEmission: recu.obtenirDateEmission(),
  statutRecu: recu.obtenirStatutRecu(),
});

export const versRestitutionOutput = (restitution: Restitution): RestitutionOutput => ({
  idRestitution: restitution.obtenirId(),
  montant: restitution.obtenirMontant(),
  raison: restitution.obtenirRaison(),
});

export const versPaiementEnregistreOutput = (
  paiement: Paiement,
  recus: RecuPaiement[],
  restitution?: Restitution,
): PaiementEnregistreOutput => ({
  idPaiement: paiement.obtenirId(),
  montantTotal: paiement.obtenirMontantTotal(),
  modePaiement: paiement.obtenirModePaiement(),
  typeFraisDeclare: paiement.obtenirTypeFraisDeclare(),
  statutPaiement: paiement.obtenirStatutPaiement(),
  repartitions: paiement.obtenirRepartitions().map((repartition) => ({
    idRepartition: repartition.obtenirIdRepartition(),
    idObligation: repartition.obtenirIdObligation(),
    montantAffecte: repartition.obtenirMontantAffecte(),
    ordreAffectation: repartition.obtenirOrdreAffectation(),
    origineAffectation: repartition.obtenirOrigineAffectation(),
  })),
  recus: recus.map(versRecuPaiementOutput),
  restitution: restitution === undefined ? undefined : versRestitutionOutput(restitution),
});
