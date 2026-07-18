# Maquette opérationnelle du Centre Sécurité Plateforme

## Structure commune

- En-tête : titre, description métier et action `Actualiser`.
- Bandeau de contexte : niveau Plateforme et acteur connecté.
- Onglets stables : Vue d’ensemble, Comptes, Administrateurs, Rôles, Affectations, Sessions, Tentatives, Historique.
- Zone centrale : filtres, contenu principal, chargement progressif sans pagination numérotée.
- États obligatoires : squelette de chargement, état vide, erreur humaine, accès refusé et action en cours.

## Comptes

Le tableau affiche le nom, l’adresse e-mail, les rôles et niveaux, l’état, le nombre de sessions et la dernière activité. Les actions visibles suivent les permissions : suspendre, réactiver, désactiver, déverrouiller et réinitialiser le mot de passe. Toute action sensible passe par une modale avec impact et motif.

## Administrateurs

Deux blocs distincts : administrateurs Organisation et administrateurs École. L’ajout Organisation est une opération normale. L’ajout École depuis la Plateforme est libellé comme intervention exceptionnelle et exige organisation, école, identité, motif et confirmation.

La fiche Organisation possède son propre onglet `Administration et accès`, parcours principal de création ou d’affectation du premier administrateur système Organisation.

## Rôles et permissions

La colonne de gauche présente l’annuaire recherchable des rôles avec niveau, statut et nombre d’affectations. La fiche de droite distingue autorisations et limitations. Un rôle officiel reste en lecture seule. Un rôle personnalisé peut recevoir ou perdre une autorisation ou une limitation après confirmation motivée.

## Affectations et périmètres

Le tableau distingue clairement la responsabilité et son lieu d’application. `Nouvelle affectation` ouvre un formulaire guidé : compte, rôle actif, niveau déduit du rôle, organisation puis école lorsque nécessaires, et motif. Une affectation active peut être retirée ; une affectation inactive peut être réactivée. Chaque décision affiche son impact avant confirmation et le serveur protège le dernier administrateur actif.

## Historique

L’historique durable propose une recherche métier, un filtre par résultat et un chargement progressif. Il affiche l’action, le motif, le résultat, le niveau et la date sans exposer les détails techniques ou sensibles.

## Responsive et accessibilité

Sur mobile, les tableaux deviennent des lectures empilées, les actions conservent une cible tactile suffisante et les modales occupent la largeur utile sans débordement. Les dialogues ont un titre associé, les boutons icônes ont un libellé accessible et le focus reste visible.

## Interdictions

- Aucun bouton critique sans appel réel.
- Aucun calcul d’autorisation fondé uniquement sur l’acteur affiché.
- Aucun formulaire de rôle système modifiable.
- Aucun secret réaffiché.
- Aucun contexte École injecté dans les routes Plateforme globales.
