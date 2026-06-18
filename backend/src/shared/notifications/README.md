# Notifications

Module shared de Notifications pour EducSyn.

## Perimetre

Ce module couvre :
- creation et diffusion de notifications
- retry, replay, escalade et dead-letter
- chronology, forensic et monitoring
- runtime, workers et support operational local
- integrations avec les BC metier et les modules shared

## Structure

- `application` : cas d usage, orchestrateurs, ports, DTO, validateurs
- `domain` : aggregate, entites, value objects, policies, specifications
- `infrastructure` : persistence, queues, providers, cache, security, config
- `interfaces` : controllers, routes, validateurs HTTP, presenters, DTO exposés
- `integration` : ponts vers audit, monitoring, auth, security, configuration et BC metier
- `runtime` : bootstrap runtime, coordinators, throttling, recovery, monitoring
- `workers` : workers racine exposes par le module
- `operational` : healthchecks, scripts, manifests, runbooks
- `tests` : couverture transverse du module

## Etat actuel

Le module est structurellement ferme.

Points importants :
- les tests Notifications existent et compilent
- la migration BullMQ + Redis est integree cote code
- le socle Redis/BullMQ sait fonctionner en mode `simulation` ou `reel`
- sans serveur Redis local actif, le backend peut encore basculer en simulation selon `EDUCSYN_REDIS_MODE`

## Commandes utiles

Depuis `backend/` :

```bash
npm run typecheck:strict
npm run notifications:redis:ping
```

Pour executer les tests Notifications :

```bash
node node_modules/tsx/dist/cli.mjs --test src/shared/notifications/tests/**/*.spec.ts
```

## Redis local

Variables attendues :

- `EDUCSYN_REDIS_MODE`
- `EDUCSYN_REDIS_HOST`
- `EDUCSYN_REDIS_PORT`
- `EDUCSYN_REDIS_DB`
- `EDUCSYN_REDIS_PREFIX`

En local Windows, le chemin retenu pour l instant est Docker avec le compose du dossier [docker](C:/Users/MON%20PC/Documents/EducSyn/docker).

## Decision CTO

Le choix actuel est :
- `Redis` pour le cache et le backend technique
- `BullMQ` pour les queues du module Notifications

`RabbitMQ` n est pas retenu a ce stade.
