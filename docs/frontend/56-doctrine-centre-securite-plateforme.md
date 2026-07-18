# Doctrine du Centre Sécurité Plateforme

## Statut

Doctrine figée pour le périmètre Plateforme. PostgreSQL et les contrôles HTTP sont l’unique source de vérité. Le frontend matérialise les décisions du serveur sans reconstruire une autorisation localement.

## Gouvernance officielle

- La Plateforme gouverne les comptes Plateforme et crée ou affecte le premier `ADMIN_SYSTEME_ORGANISATION`.
- Le parcours principal du premier administrateur est `Organisation > Fiche > Administration et accès`.
- L’Organisation gouverne ses écoles et crée ou affecte les `ADMIN_SYSTEME_ECOLE` de son périmètre.
- La Plateforme intervient sur une école uniquement en récupération exceptionnelle, avec motif, confirmation et audit.
- L’École gouverne ensuite ses acteurs locaux sans pouvoir élargir son périmètre.
- Promoteur principal et administrateur système Organisation restent deux responsabilités distinctes.
- Une même identité peut cumuler plusieurs responsabilités au moyen d’affectations explicites distinctes.

## Autorisation effective

Une autorisation exige simultanément : utilisateur authentifié, compte actif, session PostgreSQL active, version de jeton valide, affectation active, rôle actif, permission réelle et périmètre compatible. Une route Plateforme globale n’exige ni organisation ni école active.

## Invariants critiques

- Un périmètre actif conserve au moins un administrateur système actif.
- Le contrôle du dernier administrateur utilise un verrou transactionnel PostgreSQL.
- Un remplacement crée ou affecte le successeur avant de fermer l’ancienne affectation dans la même transaction.
- Les rôles système ne sont ni renommables, ni supprimables, ni désactivables par les workflows ordinaires.
- Une permission seule ne donne jamais un accès hors périmètre.
- La suspension et la désactivation incrémentent `tokenVersion`, révoquent les sessions et invalident les refresh tokens.
- La réactivation ne restaure aucune session et exige une nouvelle connexion.
- La réinitialisation administrative du mot de passe applique la politique existante, invalide tous les accès et ne révèle jamais le secret.
- Toute mutation critique exige un motif et produit un audit durable.
- Aucun mot de passe, hash, jeton, cookie ou secret n’est conservé dans l’audit.

## Persistance et audit

Les rôles, permissions, restrictions, affectations, scopes, titulariats, comptes, sessions, tentatives et événements de sécurité sont persistés dans PostgreSQL. Les événements du Centre Sécurité et du Centre Audit partagent `audit_entries`, protégée en append-only. Les archives, projections, exports, conflits et états techniques durables utilisent `audit_runtime_documents`.

Les anciens magasins mémoire sont interdits au runtime. Les doubles mémoire ne sont autorisés que sous les dossiers de tests et doivent être nommés comme tels.

## Centre unique

Le Centre Sécurité Plateforme comprend :

1. Vue d’ensemble : comptes actifs, sessions, verrouillages et périmètres sans administrateur.
2. Comptes : recherche, filtres, création Plateforme, cycle de vie, déverrouillage et réinitialisation du mot de passe.
3. Administrateurs : gouvernance transversale Organisation et intervention École exceptionnelle.
4. Rôles : annuaire, fiche détaillée, catalogue d’autorisations, limitations, rôles système protégés et cycle de vie des rôles personnalisés.
5. Affectations : lecture explicite rôle + niveau + périmètre, création guidée, retrait et réactivation audités.
6. Sessions : appareil, activité et révocation locale ou globale.
7. Tentatives : connexions récentes et verrouillages, sans détail exploitable.
8. Historique : décisions de sécurité issues de la source Audit durable.

## Langage et expérience

L’interface n’affiche ni JSON brut, ni identifiant technique comme information principale, ni nom de table, route HTTP, payload ou stack trace. Les confirmations expliquent l’impact avant mutation. Les erreurs restent humaines et les succès ne sont affichés qu’après confirmation du serveur.

## Certification

La création d’une affectation utilise exclusivement des sélecteurs de compte, rôle, organisation et école. Le serveur vérifie l’existence des ressources, la compatibilité du rôle avec le niveau et l’appartenance de l’école à l’organisation. Le retrait du dernier rôle administratif d’un périmètre est refusé sous verrou transactionnel.

La certification exige au minimum : migrations idempotentes, persistance après nouvelle instance de dépôt, rollback, audit append-only, masquage des secrets, protection du dernier administrateur, cycle complet des affectations, isolation multi-tenant, révocation des sessions après suspension ou changement de mot de passe, build frontend et typecheck backend.
