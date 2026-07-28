# Suite E2E G1

Cette suite certifie la gouvernance frontend avec les vraies routes, les vraies
sessions développeur et les projections effectives du backend. Elle
n'intercepte aucune réponse métier et n'invente aucun tenant.

## Couverture

- `MANAGER_SYSTEME` : audit Plateforme sans organisation ni école injectée ;
- `SUPPORT_SYSTEME` : menus et actions de mutation absents, URL Organisation refusée ;
- `CAISSIER` : audit financier limité à son organisation et son école ;
- matrice des onze acteurs G1 avec acteur actif et niveau de gouvernance confirmés ;
- refus d'une URL Plateforme avec absence d'appel API et de flash interdit ;
- changement réel de contexte Plateforme vers Organisation puis retour Plateforme.
- déconnexion avec purge immédiate du shell.

## Prérequis réels

- PostgreSQL initialisé avec le premier Manager système ;
- Redis disponible si le démarrage backend courant l'exige ;
- environnement backend `development`, afin d'exposer la vraie session développeur ;
- une organisation réelle pour le scénario de changement de contexte ;
- les fixtures développeur `MANAGER_SYSTEME`, `SUPPORT_SYSTEME` et `CAISSIER`.

Le précontrôle échoue avec un code explicite si une fixture manque :

- `G1_BASE_NON_INITIALISEE` ;
- `G1_FIXTURE_MANAGER_PLATEFORME_INCOHERENTE` ;
- `G1_FIXTURE_CAISSIER_ECOLE_ABSENTE` ;
- `G1_FIXTURE_CAISSIER_AUDIT_FINANCE_ABSENTE` ;
- `G1_FIXTURE_ORGANISATION_ABSENTE`.

Ces erreurs sont des blocages de certification. La suite ne les remplace jamais
par un mock ou un identifiant de démonstration.

## Exécution

Depuis `frontend` :

```powershell
npx playwright install chromium
npx playwright test --config e2e/g1/playwright.g1.config.ts
```

La configuration réutilise les services déjà actifs. Sinon, elle démarre le
backend sur `3000` et Vite sur `4174`. Pour des ports différents :

```powershell
$env:EDUCSYN_BACKEND_URL='http://127.0.0.1:3000'
$env:EDUCSYN_FRONTEND_URL='http://127.0.0.1:4174'
npx playwright test --config e2e/g1/playwright.g1.config.ts
```

Pour vérifier la découverte des scénarios sans lancer les services :

```powershell
npx playwright test --config e2e/g1/playwright.g1.config.ts --list
```
