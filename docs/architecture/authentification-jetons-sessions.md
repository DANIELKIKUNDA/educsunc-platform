# Authentification - Jetons et sessions

La protection systematique des routes HTTP privees et l'allowlist publique officielle sont decrites dans [authentification-protection-http.md](./authentification-protection-http.md).

## Portee

Cette etape durcit le cycle backend de `shared/auth` sans reconstruire son domaine. Elle conserve
les agregats `UtilisateurAuth`, `SessionUtilisateur` et `RefreshToken`, les politiques de compte et
de session, les sagas de login/logout/refresh, `tokenVersion`, les evenements et les transactions
PostgreSQL certifies a l'etape A.

Elle ne couvre pas encore la page de connexion, Redis, le multi-instance ni le Centre Securite.
La protection globale de toutes les routes metier est fermee par l'etape C.

## Continuite du domaine

Le domaine portait deja les comptes actifs/suspendus/desactives, les sessions multiples, les
metadonnees d'appareil, la revocation, les refresh tokens hashes et rotatifs, le
logout courant, la revocation globale et `tokenVersion`. Les lacunes etaient principalement dans le
branchement technique : JWT non standard, secret duplique, claims incomplets, rotation non reliee a
la session et coherence bearer/session non imposee.

La doctrine conservee est celle d'une connexion durable : un access token court expire sans fermer
la session. Un refresh token rotatif permet de poursuivre la session tant qu'elle et le compte sont
actifs. Plusieurs appareils peuvent posseder des sessions distinctes.

## Configuration

Variables :

- `EDUCSYN_JWT_SECRET` : obligatoire en production, minimum 32 caracteres ;
- `EDUCSYN_DEVELOPMENT_JWT_SECRET` : secret explicitement reserve au developpement ;
- `EDUCSYN_JWT_ISSUER` : emetteur, `educsyn-api` par defaut ;
- `EDUCSYN_JWT_AUDIENCE` : audience, `educsyn-clients` par defaut ;
- `EDUCSYN_ACCESS_TOKEN_TTL_SECONDS` : 900 secondes par defaut ;

Les sessions persistantes et les refresh tokens n'ont pas d'echeance temporelle. Ils restent
valides jusqu'a leur rotation ou leur revocation par un evenement metier ou de securite.

Le demarrage en production echoue si le secret manque ou est trop court. Aucun secret de
production par defaut n'existe et aucun secret n'est journalise. Une rotation future du secret peut
etre introduite dans l'adaptateur central sans modifier le domaine.

## Access token

L'unique adaptateur JWT emet un JWT standard `HS256` a trois segments. Il impose et verifie :

- `sub` : utilisateur ;
- `sid` : session ;
- `iat` et `exp` : emission et expiration ;
- `iss` et `aud` : emetteur et audience ;
- `jti` : identifiant unique ;
- `tokenVersion` : version de securite du compte.

Un algorithme inattendu, une signature incorrecte, un claim obligatoire absent, une expiration, une
audience ou un emetteur incorrect sont refuses. Le plugin Auth confronte aussi `tokenVersion` a la
valeur PostgreSQL et impose la coherence entre `sub`, `sid`, `x-session-id` et le proprietaire de la
session.

## Refresh et rotation

Le refresh token brut possede 384 bits d'entropie. Il est remis au client, mais seule son empreinte
HMAC-SHA-256 est persistee. Un refresh actif doit etre associe a un utilisateur, a une session et a
la `tokenVersion` du compte au moment de son emission. Il ne possede aucune expiration temporelle.

La rotation est executee dans une transaction unique : lecture et validation du token, validation
de la session, creation du remplacement, marquage de l'ancien token, mise a jour de la session,
persistance et emission du nouvel access token. La concurrence optimiste garantit qu'un seul de
deux refresh simultanes peut etre valide.

La reutilisation d'un token deja remplace est tracee sans valeur brute. La session compromise et
son token courant sont revoques. Aucune notion parallele de famille de tokens n'a ete ajoutee.

Avant toute rotation, le backend relit le compte et refuse les comptes suspendus, desactives ou
verrouilles. Il compare aussi la version de securite emise avec la version actuelle du compte. Une
version obsolete, notamment apres changement de mot de passe, revoque la session concernee et ne
peut jamais recevoir automatiquement la nouvelle version.

## Connexion persistante

Une session n'est terminee que par un logout local ou global, une revocation administrative, un
etat de compte interdisant la connexion, un changement sensible, une compromission detectee ou la
suppression logique du compte. Le temps seul ne termine ni la session ni sa chaine de refresh.

Chaque appareil conserve une session distincte. Une revocation locale ou un rejeu compromet
uniquement cette session, tandis qu'un evenement global de securite invalide tous les appareils.

## Logout et revocation

Le logout courant est idempotent. Il revoque uniquement la session authentifiee et son refresh
token courant. Les autres appareils restent actifs.

La revocation globale ne prend jamais `x-user-id` comme preuve. Elle utilise `sub` d'un bearer
coherent, incremente `tokenVersion`, revoque toutes les sessions et tous les refresh tokens de
l'utilisateur dans une transaction. Les anciens access tokens sont alors refuses par comparaison de
version.

## Contrats prepares pour le frontend

- login : `accessToken`, `refreshToken`, `sessionId`, utilisateur et contexte actif ;
- refresh : `accessToken`, nouveau `refreshToken` et meme `sessionId` ;
- lecture/restauration : bearer et `x-session-id` coherents ;
- logout courant : bearer et `x-session-id`, puis suppression des cookies ;
- revocation globale : identite issue du bearer, jamais d'un identifiant utilisateur fourni seul.

Les routes actuelles peuvent transmettre les jetons par cookies `HttpOnly`, `SameSite=Strict` et
`Secure`, et le bearer reste accepte pour les clients API. L'etape frontend devra choisir un contrat
unique et documente ; aucune page de connexion ni stockage navigateur n'est implemente ici.

## Preuves reproductibles

```text
npm run typecheck
npm run test:auth:postgres
npm run auth:certify:postgres
npm run auth:certify:tokens
```

`auth:certify:tokens` enchaine cinq processus Node distincts. Il prouve deux sessions appareil,
rotation apres redemarrage, logout d'un seul appareil, survie de l'autre, nouveau redemarrage,
revocation globale et persistance finale des revocations.

`test:auth:postgres` prouve aussi une session et un refresh encore actifs apres 120 jours simules,
le renouvellement d'un access token expire, puis les refus et revocations apres suspension,
desactivation, verrouillage, changement de mot de passe ou `tokenVersion` obsolete.

## Limites assumees

Le renouvellement automatique cote client appartient a l'etape frontend. Le backend expose le
refresh token dans la reponse et accepte aussi un cookie `HttpOnly`; le choix de persistance sure
sur l'appareil sera certifie avec le client. Redis et la coordination
multi-instance restent explicitement hors de cette etape. L'authentification ne doit donc pas encore
etre declaree production-ready dans son ensemble avant les etapes HTTP et frontend suivantes.
