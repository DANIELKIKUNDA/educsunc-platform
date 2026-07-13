# Configuration - Etape D

## Portee

Cette etape ferme la consommation directe de la preference d affichage utilisateur.

Elle couvre :

- une portee `USER` valable pour tout compte authentifie, y compris un acteur Plateforme
- l amorcage idempotent des preferences personnelles au premier usage
- la lecture et la mise a jour du theme par le proprietaire du compte
- l application du theme avant le montage de l interface
- un cache local uniquement destine a eviter un clignotement visuel au demarrage
- le retour automatique au choix precedent si l enregistrement est refuse
- le branchement du ThemeToggle dans le Shell reel d EduSync
- l alignement du formulaire `preferences.theme` du Centre Configuration

## Regle de portee

Une preference personnelle appartient d abord a un utilisateur.

Par consequent :

- `utilisateurId` est obligatoire
- `organisationId` et `ecoleId` restent facultatifs
- un `MANAGER_SYSTEME` ne recoit pas artificiellement une ecole pour enregistrer son theme
- la lecture et la mutation ciblent toujours l utilisateur authentifie

## Source de verite

Le backend Configuration reste la source durable de la preference.

Le navigateur conserve une copie locale par utilisateur uniquement pour appliquer rapidement le
theme pendant le demarrage. Apres ouverture de session, la valeur backend est relue et remplace le
cache si necessaire.

## Valeurs admises

- `light` : apparence claire
- `dark` : apparence sombre
- `system` : apparence adaptee a l appareil

Toute autre valeur est refusee par le backend.

## Robustesse UX

- aucun succes n est suppose avant la reponse backend
- une erreur restaure le choix precedent
- le bouton est desactive pendant la synchronisation
- le changement suit les preferences systeme lorsque `system` est choisi
- le cache est isole par utilisateur

## Preuves principales

- `backend/src/app/services/ConfigurationPreferencesUtilisateurService.ts`
- `backend/src/app/routes/configuration.routes.ts`
- `frontend/src/composables/useTheme.ts`
- `frontend/src/shared/ui/ThemeToggle.vue`
- `frontend/src/shell/components/UserMenu.vue`

## Verdict etape D

La preference de theme n est plus une valeur simplement stockee dans Configuration ni un etat
isole dans le navigateur. Elle est maintenant consommee de bout en bout par le produit.
