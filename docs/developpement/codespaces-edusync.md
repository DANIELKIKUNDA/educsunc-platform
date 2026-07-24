# EduSync dans GitHub Codespaces

## Objectif

Cet environnement deplace les compilations et les services de developpement vers
une machine Linux GitHub Codespaces. Le poste Windows sert uniquement a VS Code
et au navigateur.

Le socle est conforme aux preuves du depot :

- Node.js 24 ;
- backend Fastify sur le port `3000` ;
- frontend Vue/Vite sur le port `4174` ;
- PostgreSQL 16 ;
- Redis 7.4 ;
- migration officielle `db:migrate:referentiel`.

## Creation

1. Commiter et pousser la branche qui contient `.devcontainer`.
2. Dans GitHub, ouvrir `Code`, puis `Codespaces`, puis `Create codespace`.
3. Choisir la branche souhaitee.
4. Conserver la machine recommandee de 4 coeurs et 16 Go.
5. Attendre la fin de `postCreateCommand`.

Le premier demarrage installe les dependances racine, backend et frontend. Il
attend PostgreSQL et Redis, genere un secret JWT de developpement hors du depot,
puis applique la migration idempotente du referentiel.

Aucun seed metier n'est lance automatiquement.

## Demarrage quotidien

Dans le terminal du Codespace :

```bash
bash .devcontainer/scripts/start-dev.sh
```

Le script :

- verifie PostgreSQL et Redis ;
- calcule les URL privees du Codespace ;
- configure le lien frontend/backend ;
- autorise uniquement l'origine frontend du Codespace ;
- lance le backend et le frontend ;
- arrete les deux processus si l'un des deux echoue.

Les ports `3000` et `4174` sont transferes en mode prive. PostgreSQL et Redis ne
sont pas publies.

## Commandes utiles

Validation rapide :

```bash
npm run verify:fast
```

Verification backend :

```bash
npm --prefix backend run typecheck:strict
npm --prefix backend run test:global
```

Verification frontend :

```bash
npm --prefix frontend run build
npm --prefix frontend test
```

Migration explicite du referentiel :

```bash
npm --prefix backend run db:migrate:referentiel
```

Seeds officiels, uniquement sur decision explicite :

```bash
npm --prefix backend run seed:referentiel-academique
```

## Donnees et secrets

Les volumes Docker `postgres-data` et `redis-data` conservent les donnees lors
d'un simple redemarrage du conteneur.

Le secret JWT de developpement est genere dans :

```text
~/.config/educsyn/codespaces.env
```

Il n'est ni place dans le depot, ni affiche dans les journaux. PostgreSQL utilise
une authentification de confiance strictement reservee au reseau Docker interne
du Codespace. Cette configuration ne doit jamais etre reutilisee en production.

Pour une valeur de production ou un service externe, utiliser un secret
Codespaces configure dans GitHub. Ne jamais ajouter de secret dans
`devcontainer.json`, le fichier Compose ou un fichier `.env` versionne.

## Cout et arret

La configuration demande au minimum 4 coeurs, 16 Go de memoire et 32 Go de
stockage. Le tarif public indique pour une machine 4 coeurs est actuellement de
`0,36 USD` par heure active. Le stockage persiste tant que le Codespace existe.

Regles de maitrise du budget :

- definir un budget GitHub de 10 USD, avec alertes ;
- regler le delai d'inactivite sur 15 minutes ;
- arreter explicitement le Codespace apres chaque session ;
- ne pas creer de prebuild pendant la phase initiale ;
- conserver un seul Codespace principal ;
- supprimer les Codespaces devenus inutiles.

Fermer l'onglet du navigateur n'arrete pas immediatement la machine. Pour
l'arreter, utiliser la palette `Codespaces: Stop Current Codespace`, la page
`github.com/codespaces`, ou :

```bash
gh codespace stop
```

La facturation du calcul s'arrete lorsque le Codespace est stoppe. Le stockage
continue jusqu'a sa suppression.

References officielles :

- https://docs.github.com/en/codespaces/setting-up-your-project-for-codespaces/configuring-dev-containers/setting-a-minimum-specification-for-codespace-machines
- https://docs.github.com/en/billing/concepts/product-billing/github-codespaces
- https://docs.github.com/en/codespaces/troubleshooting/troubleshooting-included-usage

## Reconstruction et incident

Si les dependances ou la configuration du conteneur changent, executer
`Codespaces: Rebuild Container`. Les volumes PostgreSQL et Redis restent
persistants tant qu'ils ne sont pas explicitement supprimes.

En cas d'echec de preparation :

```bash
node .devcontainer/scripts/check-services.mjs
npm ci
npm --prefix backend ci
npm --prefix frontend ci
npm --prefix backend run db:migrate:referentiel
```

Ne jamais copier `node_modules` depuis Windows ou WSL dans le Codespace.
