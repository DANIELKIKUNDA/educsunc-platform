# Politique officielle de qualite EduSync

## Commandes

### `npm run verify:fast`

A utiliser pendant le developpement. La commande execute le lint, les deux
typechecks et la detection rapide de secrets sur l index Git. Elle ne lance ni
E2E, ni Semgrep complet, ni Trivy, ni k6.

### `npm run verify:code`

A utiliser avant un commit important. Elle execute les controles statiques,
les tests backend et frontend, les builds et les certifications PostgreSQL dans
un schema isole.

### `npm run verify:security`

A utiliser avant une fusion sensible ou une release. Elle execute les audits npm,
Semgrep, Gitleaks historique, Trivy filesystem/configuration, le controle des
actions GitHub et la detection de secrets.

Les sous-commandes suivantes permettent une execution CI parallele :

- `verify:security:dependencies`
- `verify:security:semgrep`
- `verify:security:gitleaks`
- `verify:security:trivy`

### `npm run verify:e2e`

Cette commande reutilise le harnais certifie du Centre Securite. Elle demarre une
base logique, un backend et un frontend isoles, execute les parcours navigateur,
redemarre le backend, verifie la persistance et nettoie les ressources.

### `npm run verify:performance`

Cette commande demarre un backend sur le port `3108` et un schema PostgreSQL
temporaire. k6 mesure authentification, lectures, ecriture restauree, p50, p95,
p99, debit et erreurs. La base normale n est jamais utilisee.

### `npm run verify:all`

Commande de certification : code, securite, E2E puis performance. Elle est
reservee aux releases et ne doit pas etre lancee apres une simple retouche UI.

## Politique de blocage

- TypeScript, ESLint, builds, tests, PostgreSQL et E2E sont bloquants.
- npm audit est bloquant a partir du niveau eleve.
- Semgrep est bloquant pour les regles versionnees `ERROR` et doit etre trie pour
  chaque alerte.
- Gitleaks est toujours bloquant. Une valeur detectee n est jamais affichee dans
  les logs.
- Trivy filesystem/configuration est bloquant sur `HIGH` et `CRITICAL`.
- Les seuils k6 initiaux sont prudents : moins de 1 % d erreurs, aucune reponse
  500, p95 sous 1 500 ms et p99 sous 3 000 ms.

## Triage d une alerte

1. Conserver le rapport JSON ou SARIF.
2. Identifier la source controlee, le chemin de donnees et l exposition.
3. Classer : exploitable, durcissement, contextuelle, faux positif prouve ou non
   determine.
4. Corriger la cause reelle et ajouter un test lorsque pertinent.
5. Relancer le fichier, puis le lot, puis la commande de niveau superieur.
6. Documenter toute exception minimale.

`nosemgrep`, `skip`, `fixme`, l affaiblissement d assertion et
`npm audit fix --force` sont interdits comme moyens d obtenir du vert.

## Choix ESLint documente

La regle `require-atomic-updates` reste active pour le backend et les scripts.
Elle est desactivee uniquement pour les sources Vue : les affectations d etat
reactif apres un appel asynchrone sont intentionnelles et la regle ne sait pas
modeliser cette reactivite. TypeScript, les tests des stores et les E2E restent
les protections adaptees.

## CI

La CI separe les jobs backend, frontend, PostgreSQL, dependances, Semgrep,
Gitleaks, Trivy et E2E. La performance legere est planifiee chaque nuit et
declenchable manuellement.

Les actions GitHub sont epinglees par SHA complet. Les binaires Gitleaks, Trivy
et k6 sont epingles par version et verifies par SHA-256 avant execution.
L analyse d image reste non applicable tant qu aucune image de production
EduSync n existe.

## Rapports

Tous les orchestrateurs ecrivent sous `artifacts/quality`. Les jobs CI conservent
les rapports utiles meme en cas d echec. Un rapport doit etre lu avant toute
correction ; son seul code de sortie ne suffit pas a decider.

## Frequence

- Modification courante : `verify:fast`.
- Commit important : `verify:code`.
- Push sensible : le lot `verify:security` concerne.
- Release : `verify:all`.
- Nuit : scans complets, E2E et performance legere.

## Dependances connues

L audit a ferme toutes les vulnerabilites elevees et critiques via des mises a
jour compatibles. Une alerte basse `esbuild` reste transitive via `tsx`, limitee
au serveur de developpement Windows ; elle est informative et surveillee jusqu a
la publication d une version compatible du parent.
