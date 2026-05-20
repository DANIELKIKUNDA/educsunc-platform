# Policies du BC Scolarite Eleves

Le dossier `domain/policies` contient les regles metier transversales qui completent les agregats. Elles documentent les decisions qui doivent rester stables, explicites et testables.

## Identite, eleve et famille

- `PolicyEleveIdentitePermanente` : rappelle que l'identite de l'eleve est durable et distincte des inscriptions.
- `PolicyDetectionDoublonEleve` : encadre la detection de doublons eleves.
- `PolicyCoherenceFamilleEleve` : garantit la coherence entre eleve et famille.
- `PolicyUniciteMatriculeParEcole` : protege l'unicite du matricule dans une ecole.

## Inscriptions et affectations

- `PolicyInscriptionAnnuelle` et `PolicyUniciteInscriptionAnnuelle` : encadrent l'inscription annuelle unique d'un eleve.
- `PolicyCoherenceAnneeActive` : verifie l'usage d'une annee active.
- `PolicyCoherenceInscriptionClasse` : verifie la coherence entre inscription et classe cible.
- `PolicyAffectationAnnuelle` et `PolicyAffectationUnique` : prot egent l'affectation annuelle et l'unicite de l'affectation active.
- `PolicyChangementClasse` : encadre le changement de classe.
- `PolicyAnnulationInscription` : borne l'annulation d'une inscription.

## Cycle de vie de l'eleve

- `PolicyTransitionStatutEleve` : borne les transitions de statut global.
- `PolicySuspensionEleve` : encadre la suspension administrative.
- `PolicyTransfertEleve` : encadre le transfert.
- `PolicyDecesEleve` : encadre le marquage de deces.
- `PolicyAbandonPuisReintegration` : borne la reintegration apres abandon.

## Parcours et historique

- `PolicyCoherenceParcours` : verifie la coherence chronologique et semantique du parcours.
- `PolicyHistoriqueImmuable` : protege l'immuabilite metier de l'historique.

## Tenant, organisation et securite metier

- `PolicyIsolationEcole` : borne les operations a l'ecole courante.
- `PolicyIsolationOrganisation` : borne la lecture a l'organisation autorisee.
- `PolicyLectureOrganisationnelle` : explicite les conditions d'une lecture multi-ecoles.
- `PolicyOrganisationEcoleCoherente` : verifie la coherence organisation/ecole.
- `PolicyTenantContextObligatoire` : impose un contexte tenant valide.
- `PolicySuppressionPhysiqueInterdite` : interdit la suppression physique.

## Concurrence, synchronisation et idempotence

- `PolicyOptimisticConcurrency` : documente la concurrence optimiste basee sur la version d'agregat.
- `PolicyConflitModification` : borne les conflits de modification.
- `PolicyVersionAgregatObligatoire` : impose une version exploitable sur les agregats.
- `PolicyOperationSynchronisable` : borne les operations pouvant etre synchronisees.
- `PolicyResolutionConflitSync` : oriente la resolution de conflit de synchronisation.
- `PolicyIdempotenceSync` : encadre la relecture d'operations idempotentes.
- `PolicyEcoleProvenanceObligatoire` et `PolicyCoherenceEcoleProvenance` : completent les regles autour de la provenance scolaire.
