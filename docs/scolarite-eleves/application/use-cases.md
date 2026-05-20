# Use cases du BC Scolarite Eleves

Les use cases du BC `scolarite-eleves` orchestrent les agregats, depots, mappers, policies, services applicatifs et adaptateurs inter-BC. Ils ne contiennent ni logique HTTP ni logique SQL.

## Eleves

- `CreerEleve` : cree un eleve avec son identite permanente.
- `ModifierEleve` : modifie l'identite ou certaines informations administratives de l'eleve.
- `ConsulterEleve` : charge un eleve par identifiant.
- `ListerEleves` : liste les eleves avec pagination et filtrage.
- `RechercherEleves` : recherche des eleves selon des criteres applicatifs.
- `RattacherEleveAFamille` : rattache un eleve a une famille.
- `DetacherEleveDeFamille` : retire le rattachement famille.
- `MarquerEleveDecede` : marque un eleve comme decede.
- `ChangerStatutEleve` : pilote certains changements de statut globaux selon les regles applicatives exposees.

## Familles

- `CreerFamille` : cree une famille administrative.
- `ModifierFamille` : modifie les informations de la famille.
- `ConsulterFamille` : charge une famille par identifiant.
- `ListerFamilles` : liste les familles d'une ecole.
- `AjouterResponsableFamille` : ajoute un responsable familial.
- `ModifierResponsableFamille` : modifie un responsable existant.
- `RetirerResponsableFamille` : retire un responsable.
- `DefinirResponsablePrincipal` : positionne le responsable principal.
- `EvaluerFamilleNombreuse` : produit une evaluation metier de famille nombreuse.

## Inscriptions scolaires

- `CreerInscriptionScolaire` : cree une inscription annuelle simple.
- `CreerInscriptionComplete` : orchestre une creation composee incluant les etapes necessaires a une inscription complete.
- `ConsulterInscriptionScolaire` : charge une inscription par identifiant.
- `ValiderInscriptionScolaire` : valide une inscription en attente.
- `AnnulerInscriptionScolaire` : annule une inscription.
- `ListerInscriptionsActives` : liste les inscriptions actives.
- `ListerInscriptionsParAnnee` : liste les inscriptions d'une annee scolaire.
- `ListerInscriptionsParClasse` : liste les inscriptions par classe pedagogique.

## Affectations de classes

- `AffecterEleveAClasse` : affecte un eleve inscrit a une classe pedagogique.
- `ChangerEleveDeClasse` : change la classe active d'un eleve.
- `DesactiverAffectationClasse` : desactive l'affectation active.
- `ConsulterAffectationActive` : charge l'affectation active d'une inscription.
- `ListerAffectationsParAnnee` : liste les affectations par annee.
- `ListerElevesParClasse` : retourne les eleves d'une classe pedagogique.

## Cycle de vie de l'eleve

- `DeclarerAbandonEleve` : marque un eleve comme abandonne.
- `TransfererEleve` : marque un eleve comme transfere.
- `ReintegrerEleve` : reintegre un eleve selon les regles de parcours.
- `SuspendreEleve` : suspend l'eleve.
- `ReactiverEleve` : reactive un eleve precedemment inactif ou suspendu.
- `DeclarerDecesEleve` : marque le deces de l'eleve dans le cycle de vie.

## Parcours scolaire

- `ConsulterParcoursEleve` : retourne le parcours reconstruit d'un eleve.
- `ListerEvenementsParEleve` : liste les evenements de parcours d'un eleve.
- `ListerEvenementsParAnnee` : liste les evenements d'une annee.
- `ReconstruireParcoursEleve` : reconstruit explicitement le parcours a partir des evenements et sources disponibles.

## Lecture organisationnelle

- `ListerElevesParOrganisation` : liste les eleves d'une organisation en lecture multi-ecoles.
- `ListerInscriptionsParOrganisation` : liste les inscriptions d'une organisation.
- `ConsulterSyntheseScolariteOrganisation` : produit une synthese organisationnelle.
- `ListerAlertesScolariteOrganisation` : retourne les alertes scolaires organisationnelles.

## Queries et read models

Le BC expose aussi des queries et read models dedies :

- `ListerElevesQuery`
- `RechercherElevesQuery`
- `ListerFamillesQuery`
- `ListerInscriptionsQuery`
- `ListerElevesParClasseQuery`
- `GetStatistiquesScolariteQuery`
- `ConsulterTableauBordScolariteEcoleQuery`
- `ConsulterTableauBordScolariteOrganisationQuery`

Ils alimentent notamment :

- `EleveListeReadModel`
- `EleveDetailReadModel`
- `FamilleListeReadModel`
- `InscriptionListeReadModel`
- `ClasseElevesReadModel`
- `StatistiquesScolariteReadModel`
- `SyntheseScolariteEcoleReadModel`
- `SyntheseScolariteOrganisationReadModel`
