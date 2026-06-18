# API HTTP du BC Scolarite Eleves

Les interfaces HTTP du BC `scolarite-eleves` exposent les use cases applicatifs via Fastify. Elles appliquent le contexte tenant, deleguent aux controleurs, puis normalisent les erreurs via `ErreurScolaritePresenter`.

## Contexte tenant

Entetes supportes :

- `x-tenant-id` : identifiant de l'ecole courante.
- `x-organisation-id` : identifiant d'organisation.
- `x-lecture-organisationnelle: true` : active explicitement une lecture multi-ecoles.

Le contexte tenant est applique par `ScolariteTenantContext`, puis reinitialise apres chaque requete.

Pour les commandes critiques, l'identite utilisateur effectivement consommee par le BC est celle du contexte authentifie. Le BC ne doit pas etre lu comme un espace qui fait confiance a un `x-user-id` arbitraire fourni par le client.

## Eleves

- `POST /api/eleves` : creer un eleve.
- `PATCH /api/eleves/:id` : modifier un eleve.
- `GET /api/eleves/recherche` : rechercher des eleves.
- `GET /api/eleves/:id` : consulter un eleve.
- `GET /api/eleves` : lister les eleves.
- `POST /api/eleves/:id/rattacher-famille` : rattacher l'eleve a une famille.
- `POST /api/eleves/:id/detacher-famille` : detacher l'eleve de sa famille.
- `POST /api/eleves/:id/deces` : marquer l'eleve comme decede.

Lecture officielle :

- le workflow eleve hors inscription est maintenant relu comme un sous-ensemble de gestion scolaire porte par le `CAISSIER`
- les mutations reappliquent `caisse.write` dans le perimetre `organisation + ecole`
- les lectures reappliquent `caisse.read` dans le perimetre `organisation + ecole`
- les routes eleves n'acceptent plus un utilisateur technique implicite pour ce workflow

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

Lecture officielle :

- le workflow familles est maintenant relu comme un sous-ensemble du flux reel d'inscription
- l'acteur local retenu est le `CAISSIER`
- les mutations reappliquent `caisse.write` dans le perimetre `organisation + ecole`
- les lectures reappliquent `caisse.read` dans le perimetre `organisation + ecole`
- le backend ne laisse plus les routes familles fonctionner avec un utilisateur technique implicite

## Inscriptions scolaires

- `POST /api/inscriptions-scolaires` : creer une inscription.
- `POST /api/inscriptions-scolaires/complete` : creer une inscription complete.
- `POST /api/inscriptions-scolaires/:id/valider` : valider une inscription.
- `POST /api/inscriptions-scolaires/:id/annuler` : annuler une inscription.
- `GET /api/inscriptions-scolaires/par-annee/:idAnnee` : lister les inscriptions par annee.
- `GET /api/inscriptions-scolaires/par-classe/:idClasse` : lister les inscriptions par classe.
- `GET /api/inscriptions-scolaires/:id` : consulter une inscription.

### Focus `POST /api/inscriptions-scolaires/complete`

Cette route est maintenant l'entree officielle du workflow compose d'inscription scolaire complete.

Elle attend :

- un header `idempotency-key`
- un contexte `organisation + ecole + utilisateur`
- un payload compose `eleve + inscription + affectation optionnelle`

Elle applique :

- une autorisation locale reservee au `CAISSIER`
- la permission `caisse.write`
- une transaction composee
- un rejeu idempotent si la meme cle et le meme payload sont reutilises

Quand une affectation est demandee, le flux reel devient :

1. creation eleve
2. creation inscription
3. validation inscription
4. affectation

## Affectations de classes

- `POST /api/affectations-classes` : affecter un eleve a une classe pedagogique.
- `POST /api/affectations-classes/:id/changer-classe` : changer la classe d'une affectation.
- `POST /api/affectations-classes/:id/desactiver` : desactiver une affectation.
- `GET /api/affectations-classes/active/:idInscription` : consulter l'affectation active d'une inscription.
- `GET /api/affectations-classes/:id` : consulter une affectation.
- `GET /api/classes-pedagogiques/:id/eleves` : lister les eleves d'une classe pedagogique.

Lecture officielle :

- les routes d'affectation relisent maintenant l'utilisateur authentifie depuis le contexte HTTP
- elles reappliquent une autorisation locale `permission + perimetre`
- `CAISSIER` reste autorise sur toute son ecole via `caisse.read` ou `caisse.write`
- les gestionnaires pedagogiques restent limites a leur section via `eleves.read` ou `eleves.write`
- `ADMINISTRATEUR_ECOLE`, `ENSEIGNANT` simple et `DIRECTEUR_DISCIPLINE` n'ouvrent pas implicitement ce workflow

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

Lecture officielle :

- ce bloc transverse est reserve au `PROMOTEUR_ORGANISATION`
- il reapplique `eleves.read` avec un perimetre `organisation`
- la route ne se contente plus d un simple `x-organisation-id` technique : elle relit l utilisateur authentifie avant toute lecture
- `synthese` n est plus un placeholder a zero : elle consolide les eleves, familles et inscriptions connues par les depots reels
- `alertes` n est plus une liste vide par defaut : elle remonte des constats factuels derives des memes depots

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

Pour `inscriptions.validator`, la validation de l'inscription complete n'est plus un simple cast technique : le payload compose est maintenant relu et structure explicitement avant d'entrer en application.
