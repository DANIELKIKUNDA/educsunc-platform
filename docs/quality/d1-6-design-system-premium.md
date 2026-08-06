# D1.6 - Design system premium EduSync

## Statut

`D1.6 - VALIDE`

Ce lot consolide la presentation et les interactions transversales. Il ne modifie aucun workflow, aucune permission, aucune route et aucune regle metier.

## Decisions officielles

| Capacite | Decision | Justification |
|---|---|---|
| Composants complexes | Conserver les composants Vue EduSync | Les centres utilisent deja des composants adaptes au metier et accessibles. PrimeVue imposerait une seconde architecture et une migration visuelle sans gain immediat prouve. |
| Styles | Conserver le CSS existant avec des jetons semantiques | Le theme clair/sombre, le responsive et les centres premium existent deja. Tailwind dupliquerait la grammaire actuelle. |
| Icones | Lucide Vue | Une seule bibliotheque, imports explicites, tree-shaking et style coherent. |
| Notifications | `notificationsService` et `ToastStack` | Abstraction commune, messages metier, niveaux accessibles, actions facultatives et limite de notifications visibles. Sonner n'est pas necessaire. |
| Dialogues | `ModalShell` et composants metier specialises | Focus contraint, fermeture clavier, restauration du focus, verrouillage partage du scroll et compatibilite mobile. |
| Confirmations | Composant metier base sur `ModalShell` | La consequence et le perimetre restent propres a chaque workflow. Les dialogues natifs du navigateur sont interdits. |

PrimeVue, Tailwind, Sonner et SweetAlert2 ne doivent pas etre ajoutes sans nouvelle decision d'architecture fondee sur un besoin que le socle EduSync ne sait pas couvrir.

## Fondation visuelle

Les jetons officiels sont definis dans `frontend/src/styles/variables.css` :

- couleurs et contrastes semantiques ;
- surfaces et bordures ;
- succes, attention, danger et information ;
- rayons ;
- hauteurs de controles ;
- ombres ;
- durees de transition ;
- niveaux d'empilement des modales et notifications.

Les primitives opt-in sont dans `frontend/src/styles/design-system.css` :

- `ui-surface` ;
- `ui-button` et ses variantes ;
- `ui-badge` et ses variantes ;
- `ui-field-control` ;
- `ui-table-shell`.

Elles servent aux composants futurs et aux migrations progressives. Aucun ecran existant ne doit etre reecrit uniquement pour changer un nom de classe.

## Conventions UX obligatoires

1. Une action principale par zone de decision.
2. Les actions impossibles sont desactivees et leur cause reste comprehensible.
3. Une mutation n'affiche un succes qu'apres confirmation du backend.
4. Une action critique passe par une confirmation metier, jamais par `window.confirm`.
5. Une notification temporaire passe par `notificationsService`.
6. Une interaction complexe passe par `ModalShell` ou un composant specialise qui offre les memes garanties.
7. Les icones decoratives sont masquees des technologies d'assistance ; les boutons icone seuls ont un nom accessible.
8. Les controles tactiles gardent une hauteur confortable sur mobile.
9. Le focus clavier reste visible.
10. La preference de reduction des animations est respectee globalement.

## Regles pour les composants futurs

Tout nouveau composant doit :

- reutiliser les jetons `--ui-*` au lieu de recopier des couleurs ou des ombres ;
- rester compatible avec les themes clair et sombre ;
- avoir un etat clavier, mobile, desactive, chargement, vide et erreur lorsque pertinent ;
- utiliser Lucide pour les icones ;
- utiliser les abstractions communes de notification et de dialogue ;
- ne pas exposer de vocabulaire technique ;
- ne pas ajouter une nouvelle bibliotheque UI sans decision documentee ;
- passer `npm run test:design-system`.

## Certification automatique

`frontend/scripts/run-design-system-tests.cjs` controle :

- la pile UI unique ;
- la presence des jetons essentiels ;
- les protections d'accessibilite et de reduction des animations ;
- le comportement structurel des modales ;
- l'accessibilite des notifications ;
- l'absence de dialogues natifs ;
- la documentation des conventions futures.

La CI execute cette certification via la commande `npm test` du frontend.
