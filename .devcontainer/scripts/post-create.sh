#!/usr/bin/env bash

set -Eeuo pipefail

cd /workspaces/EducSyn

if [[ "$(node --version)" != v24.* ]]; then
  echo "[codespaces] Node.js 24 est requis." >&2
  exit 1
fi

echo "[codespaces] Verification de PostgreSQL et Redis..."
node .devcontainer/scripts/check-services.mjs

echo "[codespaces] Installation des dependances racine..."
npm ci

echo "[codespaces] Installation des dependances backend..."
npm --prefix backend ci

echo "[codespaces] Installation des dependances frontend..."
npm --prefix frontend ci

secret_directory="${HOME}/.config/educsyn"
secret_file="${secret_directory}/codespaces.env"
mkdir -p "${secret_directory}"
chmod 700 "${secret_directory}"

if [[ ! -s "${secret_file}" ]]; then
  umask 077
  jwt_secret="$(node -e "process.stdout.write(require('node:crypto').randomBytes(48).toString('base64url'))")"
  printf 'export EDUCSYN_DEVELOPMENT_JWT_SECRET=%q\n' "${jwt_secret}" > "${secret_file}"
  chmod 600 "${secret_file}"
fi

echo "[codespaces] Application des migrations idempotentes du referentiel..."
npm --prefix backend run db:migrate:referentiel

echo
echo "[codespaces] Environnement EduSync pret."
echo "[codespaces] Demarrage : bash .devcontainer/scripts/start-dev.sh"
