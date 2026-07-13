# Configuration - Etape F - Finition UX et robustesse

## Perimetre

Cette etape finalise le Centre Configuration pour le deploiement initial mono-VPS.
Elle ne cree aucun nouveau reglage, workflow ou perimetre metier et n ouvre pas le multi-instance.

## Defauts constates

- Le frontend presentait encore des cles historiques absentes du catalogue officiel actuel.
- Des reglages officiels de notifications et de preferences utilisateur ne possedaient pas de formulaire adapte.
- Les stores absorbaient les erreurs, ce qui permettait d afficher un succes apres un echec serveur.
- Une lecture par identifiant pouvait injecter un contexte ecole dans une operation Plateforme.
- La lecture effective ne permettait pas de retrouver la fiche persistante qui avait produit la valeur.
- Une selection rapide pouvait conserver la fiche du reglage precedent.
- Les champs numeriques ne respectaient pas toutes les bornes officielles.
- Le bouton d enregistrement ne possedait pas une regle unique contre les doubles soumissions.
- Les modales ne garantissaient ni piege de focus, ni restauration du focus, ni blocage fiable du scroll.
- Des actions sans parcours utilisateur complet etaient encore visibles.
- La valeur enregistree et son application au fonctionnement courant etaient presentees de facon ambigue.
- Le tableau restait trop comprime sur telephone.

## Corrections realisees

### Source de verite

Le Centre expose exactement les vingt reglages du catalogue officiel :

- quatorze reglages Plateforme concernant le fonctionnement general et les notifications ;
- deux reglages de modules, exploites dans leurs parcours Organisation et Ecole existants ;
- quatre preferences utilisateur concernant le theme et les notifications.

Les anciennes cles de presentation non catalogues ne sont plus annoncees comme editables.
Le catalogue des modules affiche dans le Centre est charge depuis le serveur.

### Lecture et mutation

Chaque valeur effective transporte maintenant la reference, le statut, le nombre de versions et la date
d origine de sa configuration source. La selection d une ligne recharge sa fiche exacte et ignore toute
reponse tardive d une selection precedente.

Les appels par identifiant utilisent explicitement le niveau du reglage. Les operations SYSTEM et USER
n exigent plus un contexte ecole. Les erreurs sont propagees jusqu au ViewModel et aucun succes ne peut
etre affiche avant la confirmation du serveur.

### Formulaires

- booleens : choix Oui / Non ;
- domaines fermes : radio ou liste ;
- listes de canaux : cases a cocher ;
- entiers et durees : champ numerique avec minimum, maximum et pas ;
- modules : cartes issues du catalogue reel.

Le brouillon reste ouvert apres une erreur. Un conflit de version bloque la soumission et demande une
relecture. Une seule soumission peut etre executee a la fois.

### Valeur enregistree et application

Le Centre distingue desormais :

- la valeur enregistree et retenue par la configuration ;
- l application explicite au fonctionnement courant pour les reglages Plateforme.

L interface ne pretend jamais qu une valeur est appliquee sans retour positif de la commande de
rechargement existante.

### Modales et navigation

Les modales disposent d un en-tete et d un pied fixes, d un contenu defilant, d un focus initial, d un
piege de focus, d une fermeture Echap controlee, d une restauration du focus et d un verrou de scroll
compatible avec la confirmation imbriquee d abandon.

Une navigation ou un rafraichissement pendant une saisie non enregistree est protege. Une navigation
pendant une sauvegarde est bloquee.

### Responsive

Les cartes de familles suivent une structure commune avec icones. Sur mobile, le tableau devient une
suite de cartes lisibles avec Origine, Statut et Valeur. Aucun debordement horizontal n a ete detecte a
390 pixels.

## Actions volontairement non exposees

La comparaison de versions n est pas exposee car le serveur ne fournit pas de liste selectionnable des
versions enregistrees. La saisie manuelle d identifiants aurait expose un detail technique.

La propagation manuelle n est pas exposee dans le deploiement mono-VPS. La commande reelle
"Appliquer maintenant" reste disponible pour le runtime Plateforme.

## Validations

- Backend `npm run typecheck` : OK.
- Backend `npm run build` : OK.
- Tests Configuration backend : 77 reussis, 0 echec, 1 integration PostgreSQL conditionnelle ignoree.
- L integration PostgreSQL reelle avait deja ete validee a l etape E.
- Tests frontend Configuration et Administration Ecole : 16 sur 16 reussis.
- Frontend `vue-tsc --noEmit` : OK via `npm run build`.
- Frontend `npm run build` : OK, 2 277 modules transformes.
- Parcours Chrome automatise : OK.
- Verification desktop 1 440 x 1 000 : OK.
- Verification mobile 390 x 844 : OK.
- Erreurs console pendant le parcours final : aucune.

Les captures de verification sont conservees dans :

- `frontend/artifacts/configuration-step-f/desktop.png`
- `frontend/artifacts/configuration-step-f/mobile.png`

## Parcours navigateur verifies

1. Ouverture du Centre avec `MANAGER_SYSTEME` au niveau Plateforme.
2. Chargement des quatorze reglages SYSTEM sans refus errone.
3. Selection de "Tentatives de reprise" et relecture de sa fiche persistante.
4. Ouverture du formulaire numerique et activation du bouton avec un entier valide.
5. Annulation avec brouillon, confirmation d abandon, retour a l edition puis fermeture.
6. Rechargement en viewport mobile et controle du debordement horizontal.

## Dettes restantes

Aucune dette bloquante ou non bloquante propre au perimetre de l etape F n est conservee.
Les capacites non exposees ci-dessus sont des limites explicites des contrats actuels et non des
workflows partiellement implementes par cette etape.

## Verdict

**ETAPE F TERMINEE**

L etape G n est pas ouverte.
