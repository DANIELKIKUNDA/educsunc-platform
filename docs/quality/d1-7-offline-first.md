# D1.7 - Socle frontend offline-first

## Decision

Dexie 4 est l'unique facade de stockage metier durable du frontend EduSync. Le projet ne maintient ni second moteur IndexedDB, ni stockage metier dans `localStorage`.

Le lot D1.7 ne pretend pas rendre tous les domaines utilisables hors ligne. Il industrialise le socle et branche uniquement les mutations dont le contrat backend idempotent est prouve. Au 5 aout 2026, cela couvre l'encodage et la modification d'une cote. Le vidage d'une cote et les autres domaines restent en ligne tant qu'un contrat de rejeu idempotent n'est pas prouve.

## Base locale et migrations

Base : `educsyn-local`.

Version 1 :

| Table | Role |
|---|---|
| `operations` | File chiffree des mutations en attente, en reprise, en conflit ou refusees. |
| `conflicts` | Decisions metier requises apres un conflit de version. |
| `encryptionKeys` | Cles AES-GCM non extractibles, separees par partition. |
| `metadata` | Metadonnees de maintenance ne portant aucun secret. |

Toute future evolution de schema doit ajouter une version Dexie et une migration explicite. Une modification silencieuse du schema version 1 est interdite apres publication.

## Isolation et confidentialite

Une partition est derivee par SHA-256 de :

`utilisateur + organisation + ecole + annee scolaire`.

Le payload est chiffre en AES-GCM 256 bits avec un vecteur aleatoire et la partition comme donnee authentifiee. La cle est non extractible. Les noms de champs correspondant a un mot de passe, un token, un cookie, une autorisation ou un secret sont refuses avant ecriture.

Les jetons d'acces, refresh tokens et informations de session ne sont jamais stockes dans Dexie. A la deconnexion ou au changement d'identite, les donnees locales et les cles sont purges. Un changement d'organisation, d'ecole ou d'annee selectionne une autre partition sans synchroniser silencieusement celle qui vient d'etre quittee.

Ce chiffrement protege le stockage au repos et l'inspection occasionnelle du profil navigateur. Il ne remplace pas la prevention XSS : un script malveillant execute dans la meme origine reste une menace et doit etre bloque par les protections applicatives.

## File et synchronisation

- 500 operations au maximum par profil navigateur.
- Une cle idempotente unique accompagne l'essai en ligne et son eventuel rejeu.
- Les operations sont rejouees dans l'ordre, par lots de 20 et uniquement pour la partition active.
- Une operation n'est supprimee qu'apres le succes HTTP reel de la route metier.
- Les pannes reseau, reponses 429 et erreurs serveur utilisent une reprise exponentielle sans abandon automatique; le delai entre essais reste plafonne a quinze minutes.
- Une erreur 401 attend la restauration de la session avant reprise. Une revocation reelle purge ensuite les donnees de l'identite concernee.
- Les erreurs metier 400, 403, 404 et 422 sont conservees comme refus a traiter.
- Une reponse 409 cree un conflit explicite sans perdre le payload chiffre.
- Une operation restee en cours plus de cinq minutes est replacee en reprise.
- Les refus de plus de trente jours peuvent etre purges; une operation active n'est jamais supprimee par anciennete.

Le frontend ne rejoue pas les mutations via `/api/sync/replay` : dans l'architecture actuelle, cette route journalise une operation generique mais ne prouve pas l'application de la mutation metier. Le rejeu D1.7 appelle donc les routes de cotation reelles avec la cle idempotente d'origine et `x-sync-origin: OFFLINE`.

## D1.7.1 - Robustesse pour les reseaux instables

EduSync ne deduit jamais une coupure du seul indicateur `navigator.onLine`. Un controle public leger verifie la sante reelle du service. La machine de connexion applique quatre etats :

| Etat | Comportement |
|---|---|
| En ligne | Requetes et synchronisation autorisees. |
| Connexion instable | Plusieurs controles sont effectues; aucun basculement brutal hors ligne. |
| Hors connexion | Les capacites locales prouvees restent utilisables et les operations sont chiffrees dans la file. |
| Reconnexion | Deux controles positifs consecutifs sont requis avant tout rejeu. |

Le passage hors connexion exige au minimum trois echecs et une fenetre de degradation de douze secondes. Une coupure breve, un changement d'antenne ou une latence ponctuelle ne ferme donc pas immediatement l'application.

### Session conservee sans secret

Apres une premiere connexion en ligne reussie, une projection locale minimale peut conserver l'identite, le contexte et les autorisations d'affichage deja resolues. Aucun jeton d'acces ni jeton de renouvellement n'est persiste dans cette projection.

Cette projection est non autoritative :

- elle maintient le Shell et les ecrans locaux disponibles;
- elle ne peut pas autoriser une requete serveur sans jeton valide;
- la session est restauree en ligne avant synchronisation;
- chaque mutation rejouee est recontrolee par le backend avec permission et perimetre;
- une revocation, une suspension ou une deconnexion prouvee purge la projection et la base locale.

Une ancienne installation qui ne possede pas encore cette projection doit effectuer une connexion en ligne reussie une fois avant de beneficier de la conservation de session hors ligne.

### Capacite locale et intervention humaine

Le navigateur est interroge avec l'API Storage pour estimer l'espace disponible et demander, lorsque possible, un stockage persistant. EduSync avertit avant la saturation et refuse proprement une nouvelle mise en file si la marge de securite n'est plus suffisante.

Le centre de connectivite du Shell affiche sur desktop et mobile : etat de connexion, session conservee, operations en attente, conflits, refus, derniere reprise et pression de stockage. Les conflits ne sont jamais supprimes silencieusement; l'abandon exige une confirmation explicite.

## Service worker

Le service worker n'est enregistre qu'en production. Il met en cache le shell et les actifs statiques de meme origine. Il ignore obligatoirement :

- toute methode autre que GET;
- toute URL `/api/**`;
- toute ressource d'une autre origine.

La navigation utilise le reseau en priorite et retombe sur le shell local. Les anciennes versions du cache EduSync sont supprimees a l'activation.

## Frontiere d'architecture

Les vues et ViewModels ne lisent jamais Dexie directement. La chaine reste :

`Vue -> ViewModel/store de domaine -> service metier -> file offline -> Dexie`.

Les anciens repositories locaux vides et les faux services de synchronisation bidirectionnelle ont ete supprimes. Une nouvelle capacite offline doit apporter ensemble : contrat backend idempotent, validation de payload, strategie de conflit et tests de rejeu.

## Validation

Commandes :

```text
npm run test:offline
npm run test:e2e:offline
npm run test
npm run build
```

La certification cible couvre schema, chiffrement, refus des secrets, isolation des partitions, deduplication, succes backend reel, conflits, exclusion des API du cache et rechargement du shell hors ligne dans Chromium.

## Resultats de fermeture

| Controle | Resultat |
|---|---|
| Typecheck frontend | OK |
| Build Vite de production | OK, 2 339 modules transformes |
| Tests formulaires | 39/39 |
| Tests acces, donnees et cycle de vie | 33/33 |
| Tests design system | 6/6 |
| Tests D1.7/D1.7.1 IndexedDB, reseau, session et synchronisation | 16/16 |
| Certification Chrome hors ligne | 2/2, dont conservation de session sans backend |
| Lint frontend | OK, aucun avertissement |
| Audit npm production | 0 vulnerabilite |

Le test navigateur utilise Chrome installe localement sous Windows et Chromium Playwright en CI. La pipeline installe le navigateur puis execute explicitement `test:e2e:offline`.

Verdict : **D1.7.1 - VALIDE** pour le socle, la resilience aux reseaux instables et les mutations de cotation idempotentes prouvees. Les autres domaines ne sont pas annonces comme hors ligne tant que leurs contrats backend ne sont pas industrialises.
