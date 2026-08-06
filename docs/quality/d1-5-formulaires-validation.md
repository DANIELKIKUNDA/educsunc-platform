# D1.5 - Formulaires et validation

## Verdict

Le frontend conserve son architecture MVVM et adopte un noyau commun de validation de formulaire. VeeValidate et Zod ne sont pas installes dans ce lot : leur introduction imposerait une migration transversale sans supprimer une dette prouvee, tandis que les regles metier doivent rester dans le backend.

## Audit initial

Le frontend contient dix composants Vue portant un formulaire HTML ou une soumission de formulaire. Les parcours les plus sensibles sont :

| Parcours | Mecanisme initial | Decision D1.5 |
| --- | --- | --- |
| Connexion | Validation manuelle dans le ViewModel | Migrer vers le noyau commun et relier les erreurs aux champs |
| Initialisation plateforme | Validation manuelle et politique de mot de passe dupliquee dans le ViewModel | Migrer vers le noyau commun sans changer la politique existante |
| Creation organisation | Validation partagee entre vue et ViewModel | Centraliser dans un evaluateur de domaine |
| Modification organisation | Validation et comparaison JSON locales | Utiliser le noyau commun et les instantanes normalises |
| Creation ecole | Evaluateur de domaine existant | Conserver l'evaluateur et lui fournir les erreurs par champ |
| Actions ecole | Evaluateurs de domaine, modal avec protection des saisies | Conserver, deja conforme au modele MVVM |
| Configuration | Registre de champs et evaluateur dynamique testes | Conserver, car il gere les types dynamiques sans regle parallele |
| Referentiel officiel | Assistants et modales metier specialises | Conserver les validateurs specialises, non duplicables par un schema generique |
| Securite | Formulaire dynamique pilote par le ViewModel | Conserver le pilotage metier existant |
| Administration des acces organisation | Formulaire cible et store dedie | Conserver le flux existant |

Les problemes communs prouves etaient :

- validation de formats repetee ;
- erreurs parfois calculees dans les composants Vue ;
- absence frequente de liaison `aria-describedby` entre un champ et son erreur ;
- comparaison d'etat sale par serialisation locale ;
- chargeurs TypeScript de tests dupliques.

## Architecture retenue

### Noyau commun

`frontend/src/shared/forms/form-validation.ts` fournit :

- evaluation deterministe d'un formulaire ;
- erreurs par champ ;
- premiere erreur exploitable ;
- validateurs de presence, e-mail, longueur, format et correspondance ;
- attributs d'accessibilite coherents.

`frontend/src/shared/forms/form-snapshot.ts` fournit :

- instantane normalise ;
- detection fiable des modifications ;
- comparaison independante des espaces inutiles et de l'ordre des proprietes.

Le noyau ne contient aucune permission, aucun invariant metier et aucun appel reseau.

### Responsabilites

- la vue affiche les champs et les erreurs accessibles ;
- le ViewModel orchestre l'etat, la soumission et la conservation de la saisie ;
- l'evaluateur de domaine couvre seulement la coherence immediate du formulaire ;
- le backend reste l'unique autorite pour les invariants metier, les permissions et la persistance.

## Decisions sur les dependances

| Outil | Decision | Justification |
| --- | --- | --- |
| Mecanisme MVVM existant | CONSERVER ET STANDARDISER | Il est deja coherent avec les stores et les modales EduSync |
| VeeValidate | REPORTER | Dix formulaires HTML, dont plusieurs assistants dynamiques, ne justifient pas une migration globale immediate |
| Zod | REPORTER | Sans generation de contrats, il dupliquerait les DTO et une partie des regles du backend |
| Validateurs de domaine specialises | CONSERVER | Configuration, Referentiel et Securite portent des structures dynamiques reelles |

Cette decision n'interdit pas une adoption future. VeeValidate devient pertinent si le nombre de formulaires simples augmente fortement. Zod devient pertinent si des schemas de transport sont generes depuis une source contractuelle et non recopies manuellement.

## Accessibilite et experience utilisateur

Les formulaires critiques utilisent maintenant :

- des identifiants de champs stables ;
- `aria-invalid` ;
- `aria-describedby` ;
- des messages d'erreur avec `role="alert"` ;
- `autocomplete` sur les donnees d'authentification ;
- une soumission bloquee pendant le traitement ;
- la conservation de la saisie lorsque le backend refuse l'action ;
- une confirmation avant abandon des formulaires metier deja proteges.

## Tests

Le chargeur `frontend/scripts/load-typescript-module.cjs` execute les modules TypeScript et leurs imports locaux dans les tests Node. La commande officielle est :

```text
npm run test:forms
```

Elle couvre le noyau commun, les formats, les instantanes, la creation d'organisation, la creation d'ecole, les formulaires Configuration existants et les protections Administration Ecole.

## Frontiere du lot

D1.5 ne modifie ni les routes, ni les payloads, ni les permissions, ni les regles metier. Les assistants dynamiques deja industrialises ne sont pas reecrits uniquement pour adopter une bibliotheque. Cette conservation explicite est une decision d'architecture, pas une dette cachee.
