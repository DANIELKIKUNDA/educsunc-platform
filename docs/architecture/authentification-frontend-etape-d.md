# Authentification frontend - etape D

## Decision

EduSync utilise un seul domaine Auth reel pour les parcours de production et de developpement. Le frontend ne simule jamais une identite, une permission ou un contexte. Une session n'est consideree ouverte qu'apres validation par le backend et PostgreSQL.

Le parcours de production fournit la connexion, la premiere initialisation, la restauration automatique, la rotation des jetons et la deconnexion reelle. Le parcours developpeur conserve le pilotage rapide par acteur, mais ouvre lui aussi une vraie session backend et n'est jamais disponible en production.

## Modes d'entree

Le mode est resolu centralement par `auth-entry-mode.ts`.

| Environnement | Mode | Comportement |
|---|---|---|
| development | `developer` | Session developpeur reelle et selecteur d'acteurs |
| development | `login` | Parcours de connexion identique a la production |
| production | toute valeur | Connexion obligatoire, aucun outil developpeur |

Commandes officielles :

- `npm run dev:actors` : pilotage local rapide avec sessions reelles ;
- `npm run dev:login` : verification locale du parcours de connexion ;
- `npm run build` : compilation de production sans ouverture developpeur.

Une configuration inconnue en production provoque un refus sur, jamais une session automatique.

## Premiere initialisation

Le frontend interroge l'etat d'initialisation avant d'ouvrir l'application. Si aucun premier responsable Plateforme n'existe, il affiche le parcours d'initialisation. La decision reste exclusivement backend.

La creation du premier `MANAGER_SYSTEME` est protegee par une transaction PostgreSQL, un verrou de concurrence et une marque durable. Elle cree un seul compte, son affectation de role, son contexte Plateforme et sa premiere session. Une fois terminee, l'initialisation publique reste fermee apres actualisation et redemarrage.

Le mot de passe initial doit contenir au moins douze caracteres, une majuscule, une minuscule et un chiffre. Le backend applique cette politique ; le frontend guide l'utilisateur sans devenir la source de verite.

## Strategie des jetons

- le mot de passe n'est jamais persiste ;
- le refresh token est transporte uniquement par cookie `HttpOnly` ;
- l'access token est conserve en memoire et egalement transporte par cookie `HttpOnly` pour la restauration ;
- aucun jeton n'est ecrit dans `localStorage` ou `sessionStorage` ;
- les cookies utilisent `SameSite=Strict` et `Secure` en production ;
- les reponses JSON de login, refresh et initialisation n'exposent jamais le refresh token.

L'option « Se souvenir de moi » ne modifie pas la duree metier de la session. Elle rend seulement le cookie de restauration persistant apres fermeture du navigateur. Sans cette option, la session reste limitee au navigateur courant.

## Restauration et renouvellement

Au demarrage, `session.bootstrap.ts` determine le mode, verifie l'initialisation, tente une restauration par cookie, relit le profil, les roles, les permissions et le contexte, puis seulement ouvre la navigation autorisee. Un ecran de demarrage empeche tout flash de page privee ou de formulaire de connexion.

La relecture du profil produit une projection unique des capacites effectives pour la session courante. Elle contient l'acteur actif, les permissions, scopes, restrictions, niveaux de gouvernance, modules disponibles, contexte actif et capacites derivees utiles. Le frontend n'autorise aucune page a partir du role ou du contenu des jetons seuls.

Le client HTTP central :

1. envoie les credentials et l'access token memoire lorsqu'il existe ;
2. intercepte un `401` renouvelable ;
3. lance un unique refresh partage entre les requetes concurrentes ;
4. met a jour la session en memoire ;
5. rejoue la requete initiale une seule fois ;
6. ferme proprement la session si le refresh est refuse.

La rotation regenere un JWT portant le role et le contexte verifies de la session. Le role actif est persiste avec la session PostgreSQL : une rotation ne le recalcule pas depuis une autre affectation et un jeton portant un role different de celui de la session est refuse. Lorsqu'un compte possede plusieurs roles actifs, aucun cumul implicite de permissions n'est autorise ; le profil de travail doit rester explicite. Les acteurs Plateforme ne conservent jamais un ancien contexte Organisation ou Ecole apres connexion.

## Changement De Contexte Et Invalidation

Un changement d'acteur, d'organisation, d'ecole ou d'annee scolaire est confirme par le backend avant d'etre applique a l'interface.

Apres confirmation, le frontend :

1. relit la projection des capacites effectives
2. incremente la version locale de contexte
3. invalide les stores lies a l'ancien tenant
4. annule les requetes de l'ancien contexte
5. ignore leurs reponses tardives
6. recalcule menus, routes et actions
7. redirige si la page courante n'est plus autorisee

Une erreur pendant la transition conserve l'ancien contexte valide ; elle ne laisse jamais un etat hybride. Une expiration, une revocation ou une suspension invalide immediatement la projection et ferme les acces prives. Une mutation du Centre Securite invalide egalement la projection avant sa relecture et diffuse ce changement aux autres onglets, afin qu'une permission retiree ne reste pas affichee localement.

## Multi-onglets et deconnexion

Un canal navigateur diffuse uniquement les changements d'etat de session et de capacites, jamais les secrets. Un nouvel onglet restaure sa propre preuve backend. La deconnexion appelle le backend, revoque la session de l'appareil courant, efface cookies, contexte et caches locaux, puis redirige vers la connexion. Les autres appareils restent connectes tant qu'une revocation globale ou un evenement de securite ne les concerne pas.

## Interface et accessibilite

La page suit la reference officielle :

`frontend/docs/connexion/reference-page-connexion-edusync.png`

Elle reutilise l'identite visuelle PWA officielle, conserve les saisies utiles apres erreur, masque le lien de mot de passe oublie faute de workflow backend, prend en charge le clavier, les labels, le focus visible, `aria-live`, la reduction des animations et les ecrans de 360 a 1440 pixels.

Les erreurs sont traduites en messages utilisateur. Aucun JWT, identifiant technique, nom de table, trace ou detail d'existence d'un compte n'est affiche.

## Fichiers structurants

- `frontend/src/features/auth/views/LoginView.vue`
- `frontend/src/features/auth/views/InitializationView.vue`
- `frontend/src/features/auth/viewmodels/useLoginViewModel.ts`
- `frontend/src/features/auth/viewmodels/useInitializationViewModel.ts`
- `frontend/src/shared/auth/session.bootstrap.ts`
- `frontend/src/shared/http/api.client.ts`
- `backend/src/app/routes/auth.routes.ts`
- `backend/src/shared/auth/infrastructure/persistence/postgres/Migration_005_InitialisationPlateforme.ts`
- `backend/src/shared/auth/application/sagas/LoginSaga.ts`
- `backend/src/shared/auth/application/sagas/RefreshTokenSaga.ts`

## Preuves de certification

- `npm run typecheck` dans le backend : valide ;
- tests cibles Auth, politique HTTP et contexte : 11 sur 11 valides ;
- `npm run auth:certify:postgres` : persistance certifiee apres redemarrage ;
- `npm run auth:certify:tokens` : cycle JWT, sessions et refresh certifie sur plusieurs redemarrages ;
- `npm run build` dans le frontend : valide ;
- parcours Chrome reel : garde privee, erreur humaine, login reel, cookies HttpOnly, absence de secrets dans les stockages, restauration, multi-onglets et logout valides ;
- responsive Chrome reel : 1440, 1280, 1024, 768, 430 et 360 pixels.

Les captures et le rapport machine sont conserves dans :

`frontend/artifacts/authentication-step-d/`

## Regles de maintenance

- ne jamais remettre `isAuthenticated` a vrai par defaut ;
- ne jamais persister un jeton dans les stockages web ;
- ne jamais ajouter une route developpeur a la production ;
- ne jamais deduire une permission d'un simple role frontend ;
- ne jamais contourner la doctrine permission plus perimetre ;
- toute evolution du bootstrap ou de la rotation doit conserver les tests PostgreSQL, HTTP et navigateur.
