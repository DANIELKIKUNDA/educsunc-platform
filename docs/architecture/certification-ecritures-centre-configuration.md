# Certification des écritures du Centre Configuration

Date de certification : 14 juillet 2026.

## Verdict

**CENTRE CONFIGURATION — ÉCRITURES CERTIFIÉES**

Les 18 réglages modifiables visibles pour le Manager système ont été modifiés depuis l'interface, relus après actualisation, relus après redémarrage du backend, puis restaurés à leur valeur initiale.

## Causes racines

1. Le serveur CORS autorisait `GET`, `POST`, `PATCH`, `DELETE` et `OPTIONS`, mais pas `PUT`. Toutes les écritures du Centre Configuration utilisant `PUT` étaient donc bloquées par le navigateur avant d'atteindre le contrôleur.
2. En développement, le compte `MANAGER_SYSTEME` était recréé avec un nouvel identifiant après chaque redémarrage, car le dépôt Auth actuel est en mémoire. Les préférences PostgreSQL étaient persistées correctement, mais devenaient invisibles à la nouvelle identité.
3. Les clés `notifications.templates.*` et `notifications.quotas.*` étaient classées trop tôt comme paramètres Plateforme, contrairement à leur périmètre École déjà documenté.

## Corrections

- Ajout de `PUT` aux méthodes CORS autorisées et centralisation de la configuration CORS testable.
- Stabilisation déterministe des identités de session développeur, sans modifier l'authentification de production.
- Alignement des modèles de notifications et quotas sur le périmètre École existant.
- Ajout d'un repère DOM neutre et de valeurs sémantiques aux cases à cocher pour rendre les contrôles navigateur fiables et accessibles.
- Ajout d'un scénario navigateur en deux phases : écriture/actualisation, redémarrage, vérification/restauration.

## Tableau exhaustif

| Famille | Libellé | Clé interne | Type | Initiale | Test | Après actualisation | Après redémarrage | Restaurée | Statut |
|---|---|---|---|---|---|---|---|---|---|
| Paramètres de la plateforme | Tentatives de reprise | `runtime.retry.maxAttempts` | Entier | 3 | 4 | 4 | 4 | 3 | Certifié |
| Paramètres de la plateforme | Relecture automatique | `runtime.replay.enabled` | Booléen | Oui | Non | Non | Non | Oui | Certifié |
| Paramètres de la plateforme | Durée de conservation temporaire | `runtime.cache.ttlSeconds` | Durée | 120 | 121 | 121 | 121 | 120 | Certifié |
| Diffusion des notifications | Notifications dans l'application | `notifications.providers.in_app.enabled` | Booléen | Oui | Non | Non | Non | Oui | Certifié |
| Diffusion des notifications | Notifications par SMS | `notifications.providers.sms.enabled` | Booléen | Oui | Non | Non | Non | Oui | Certifié |
| Diffusion des notifications | Notifications par e-mail | `notifications.providers.email.enabled` | Booléen | Oui | Non | Non | Non | Oui | Certifié |
| Diffusion des notifications | Notifications WhatsApp | `notifications.providers.whatsapp.enabled` | Booléen | Non | Oui | Oui | Oui | Non | Certifié |
| Diffusion des notifications | Notifications push | `notifications.providers.push.enabled` | Booléen | Non | Oui | Oui | Oui | Non | Certifié |
| Diffusion des notifications | Services connectés | `notifications.providers.webhook.enabled` | Booléen | Non | Oui | Oui | Oui | Non | Certifié |
| Diffusion des notifications | Reprise des notifications échouées | `notifications.retry.enabled` | Booléen | Oui | Non | Non | Non | Oui | Certifié |
| Diffusion des notifications | Tentatives de reprise des notifications | `notifications.retry.maxAttempts` | Entier | 5 | 6 | 6 | 6 | 5 | Certifié |
| Diffusion des notifications | Délai entre deux tentatives | `notifications.retry.defaultBackoffMs` | Durée | 60 000 | 61 000 | 61 000 | 61 000 | 60 000 | Certifié |
| Diffusion des notifications | Relecture des notifications | `notifications.replay.enabled` | Booléen | Oui | Non | Non | Non | Oui | Certifié |
| Diffusion des notifications | Notifications traitées par lot | `notifications.replay.batchSize` | Entier | 100 | 101 | 101 | 101 | 100 | Certifié |
| Préférences personnelles | Thème de l'espace personnel | `preferences.theme` | Choix unique | Système | Clair | Clair | Clair | Système | Certifié |
| Préférences personnelles | Suspendre les notifications | `notifications.preferences.muted` | Booléen | Non | Oui | Oui | Oui | Non | Certifié |
| Préférences personnelles | Canal préféré | `notifications.preferences.preferredChannel` | Choix unique | Dans l'application | SMS | SMS | SMS | Dans l'application | Certifié |
| Préférences personnelles | Canaux acceptés | `notifications.preferences.enabledChannels` | Choix multiple | Application + e-mail | E-mail | E-mail | E-mail | Application + e-mail | Certifié |

Toutes les écritures ont retourné HTTP `200`.

## Vérifications

- Préflight navigateur : `204`, méthode `PUT` annoncée.
- Certification navigateur : 18/18 réglages certifiés et restaurés.
- Tests backend ciblés : 8 réussis, 1 test PostgreSQL conditionnel ignoré par son propre garde d'environnement.
- Tests d'intégration des routes et périmètres Configuration : 9/9 réussis.
- Tests frontend : 16/16 réussis.
- Build backend : réussi.
- Build frontend : réussi, 2 276 modules transformés.
- Contrôle visuel desktop et mobile : réussi.
- `git diff --check` : réussi.

## Robustesse confirmée

- PostgreSQL conserve les valeurs après redémarrage.
- Chaque mutation ajoute une version et un événement d'audit.
- Le dépôt PostgreSQL utilise une révision atomique et refuse une sauvegarde concurrente obsolète.
- Les erreurs conservent le brouillon du formulaire.
- Les valeurs initiales ont toutes été restaurées après la certification.
- Redis et le backend ont été redémarrés pendant le scénario réel.

## Dettes restantes

Aucune dette bloquante ne subsiste dans la chaîne d'écriture du Centre Configuration.

Le dépôt Auth nommé PostgreSQL est encore implémenté en mémoire dans le socle transverse Auth. Son impact sur les préférences en développement est désormais neutralisé par une identité stable. Son remplacement futur par une persistance Auth complète reste un chantier transverse distinct et ne remet pas en cause les écritures Configuration certifiées.
