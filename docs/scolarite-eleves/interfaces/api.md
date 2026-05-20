# API HTTP du BC Scolarite Eleves

Les interfaces HTTP du BC `scolarite-eleves` exposent les use cases applicatifs via Fastify. Elles appliquent le contexte tenant, deleguent aux controleurs, puis normalisent les erreurs via `ErreurScolaritePresenter`.

## Contexte tenant

Entetes supportes :

- `x-tenant-id` : identifiant de l'ecole courante.
- `x-organisation-id` : identifiant d'organisation.
- `x-lecture-organisationnelle: true` : active explicitement une lecture multi-ecoles.

Le contexte tenant est applique par `ScolariteTenantContext`, puis reinitialise apres chaque requete.

## Eleves

- `POST /api/eleves` : creer un eleve.
- `PATCH /api/eleves/:id` : modifier un eleve.
- `GET /api/eleves/recherche` : rechercher des eleves.
- `GET /api/eleves/:id` : consulter un eleve.
- `GET /api/eleves` : lister les eleves.
- `POST /api/eleves/:id/rattacher-famille` : rattacher l'eleve a une famille.
- `POST /api/eleves/:id/detacher-famille` : detacher l'eleve de sa famille.
- `POST /api/eleves/:id/deces` : marquer l'eleve comme decede.

## Familles

- `POST /api/familles` : creer une famille.
- `PATCH /api/familles/:id` : modifier une famille.
- `GET /api/familles/:id` : consulter une famille.
- `GET /api/familles` : lister les familles.
- `POST /api/familles/:id/responsables` : ajouter un responsable.
- `PATCH /api/familles/:id/responsables/:idResponsable` : modifier un responsable.
- `DELETE /api/familles/:id/responsables/:idResponsable` : retirer un responsable.
- `POST /api/familles/:id/responsable-principal` : definir le responsable principal.
- `GET /api/familles/:id/famille-nombreuse` : evaluer une famille nombreuse.

## Inscriptions scolaires

- `POST /api/inscriptions-scolaires` : creer une inscription.
- `POST /api/inscriptions-scolaires/complete` : creer une inscription complete.
- `POST /api/inscriptions-scolaires/:id/valider` : valider une inscription.
- `POST /api/inscriptions-scolaires/:id/annuler` : annuler une inscription.
- `GET /api/inscriptions-scolaires/par-annee/:idAnnee` : lister les inscriptions par annee.
- `GET /api/inscriptions-scolaires/par-classe/:idClasse` : lister les inscriptions par classe.
- `GET /api/inscriptions-scolaires/:id` : consulter une inscription.

## Affectations de classes

- `POST /api/affectations-classes` : affecter un eleve a une classe pedagogique.
- `POST /api/affectations-classes/:id/changer-classe` : changer la classe d'une affectation.
- `POST /api/affectations-classes/:id/desactiver` : desactiver une affectation.
- `GET /api/affectations-classes/active/:idInscription` : consulter l'affectation active d'une inscription.
- `GET /api/affectations-classes/:id` : consulter une affectation.
- `GET /api/classes-pedagogiques/:id/eleves` : lister les eleves d'une classe pedagogique.

## Cycle de vie de l'eleve

- `POST /api/eleves/:id/abandon` : declarer un abandon.
- `POST /api/eleves/:id/transfert` : transferer un eleve.
- `POST /api/eleves/:id/reintegration` : reintegrer un eleve.
- `POST /api/eleves/:id/suspension` : suspendre un eleve.
- `POST /api/eleves/:id/reactivation` : reactiver un eleve.

## Parcours scolaire

- `GET /api/eleves/:id/parcours` : consulter le parcours d'un eleve.
- `GET /api/eleves/:id/evenements` : lister les evenements de parcours d'un eleve.
- `GET /api/parcours/evenements/par-annee/:idAnnee` : lister les evenements de parcours d'une annee.
- `POST /api/eleves/:id/parcours/reconstruire` : reconstruire le parcours de l'eleve.

## Lecture organisationnelle

- `GET /api/organisations/:idOrganisation/scolarite/eleves` : lister les eleves d'une organisation.
- `GET /api/organisations/:idOrganisation/scolarite/inscriptions` : lister les inscriptions d'une organisation.
- `GET /api/organisations/:idOrganisation/scolarite/synthese` : consulter la synthese de scolarite d'une organisation.
- `GET /api/organisations/:idOrganisation/scolarite/alertes` : lister les alertes de scolarite d'une organisation.

## Validation HTTP

Les validateurs sont regroupes dans `interfaces/http/validators` :

- `eleves.validator`
- `familles.validator`
- `inscriptions.validator`
- `affectations.validator`
- `cycle-vie.validator`
- `parcours.validator`
- `organisation-scolarite.validator`

Ils traduisent les entrees HTTP en donnees applicatives mais ne remplacent jamais les validations du domaine.
