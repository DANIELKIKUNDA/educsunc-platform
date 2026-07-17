# Lanceur local EduSync sous Windows

## Utilisation quotidienne

Double-cliquez sur le raccourci **EduSync** du Bureau. Le lanceur vérifie et démarre dans l'ordre :

1. Redis dans Ubuntu 22.04 / WSL 2 ;
2. PostgreSQL natif Windows ;
3. le backend sur `http://localhost:3000` ;
4. le frontend sur `http://localhost:4174` ;
5. le navigateur, uniquement lorsque les deux applications répondent.

Un second double-clic réutilise les services actifs et ne crée pas de doublon.

## Commandes manuelles

Depuis PowerShell à la racine du projet :

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\windows\start-edusync.ps1
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\windows\status-edusync.ps1
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\windows\stop-edusync.ps1
```

L'arrêt concerne uniquement les processus backend et frontend créés par le lanceur. PostgreSQL et Redis restent actifs. Pour arrêter aussi le Redis dédié :

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\windows\stop-edusync.ps1 -StopRedis
```

## Raccourci du Bureau

Pour recréer le raccourci et son icône :

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\windows\create-edusync-shortcut.ps1
```

Le contournement `ExecutionPolicy Bypass` s'applique uniquement à ce lancement. Il ne modifie aucune stratégie PowerShell du système.

## Journaux

Les journaux sont conservés dans `.runtime/logs/` :

- `launcher.log` ;
- `backend.stdout.log` et `backend.stderr.log` ;
- `frontend.stdout.log` et `frontend.stderr.log`.

Une seule génération précédente est conservée pour chaque sortie Node. Aucun mot de passe, jeton ou URL PostgreSQL complète n'est journalisé.

Le journal Redis reste dans Ubuntu : `/var/log/redis/edusync-redis.log`.

## Dépannage

- **Redis indisponible** : lancez `wsl --list --verbose` et vérifiez qu'`Ubuntu-22.04` existe, puis `wsl -d Ubuntu-22.04 -u root -- redis-cli ping`.
- **PostgreSQL indisponible** : vérifiez le service `postgresql-x64-16`. Si Windows refuse son démarrage, lancez une fois le raccourci en tant qu'administrateur.
- **Port occupé** : exécutez `status-edusync.ps1`. Le lanceur refuse de tuer un processus inconnu.
- **Backend ou frontend en erreur** : consultez le fichier `.stderr.log` correspondant.
- **Chemin avec espace** : tous les scripts et le raccourci utilisent des chemins cités ; aucune adaptation n'est nécessaire pour `MON PC`.

Docker Desktop et Docker Compose ne sont jamais utilisés par ce lanceur.

## Certification

Pour exécuter les contrôles statiques et les scénarios de panne non destructifs :

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\windows\tests\test-edusync-launcher.ps1
```

Le rapport de certification complet se trouve dans `docs/architecture/lanceur-local-windows.md`.
