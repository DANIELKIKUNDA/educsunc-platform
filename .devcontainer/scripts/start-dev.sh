#!/usr/bin/env bash

set -Eeuo pipefail

cd /workspaces/EducSyn

secret_file="${HOME}/.config/educsyn/codespaces.env"
if [[ -f "${secret_file}" ]]; then
  # Le fichier est genere localement avec des droits 600 et n'est jamais versionne.
  source "${secret_file}"
fi

node .devcontainer/scripts/check-services.mjs

if [[ -n "${CODESPACE_NAME:-}" && -n "${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN:-}" ]]; then
  frontend_url="https://${CODESPACE_NAME}-4174.${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}"
  backend_url="https://${CODESPACE_NAME}-3000.${GITHUB_CODESPACES_PORT_FORWARDING_DOMAIN}"
else
  frontend_url="http://localhost:4174"
  backend_url="http://localhost:3000"
fi

export VITE_API_URL="${backend_url}"
export EDUCSYN_CORS_ADDITIONAL_ORIGINS="${frontend_url}"

backend_pid=""
frontend_pid=""

cleanup() {
  trap - EXIT INT TERM

  if [[ -n "${backend_pid}" ]]; then
    kill "${backend_pid}" 2>/dev/null || true
  fi

  if [[ -n "${frontend_pid}" ]]; then
    kill "${frontend_pid}" 2>/dev/null || true
  fi

  wait 2>/dev/null || true
}

trap cleanup EXIT INT TERM

echo "[codespaces] Backend : ${backend_url}"
echo "[codespaces] Frontend : ${frontend_url}"

npm --prefix backend run dev &
backend_pid=$!

npm --prefix frontend run dev:actors -- --host 0.0.0.0 --port 4174 &
frontend_pid=$!

wait -n "${backend_pid}" "${frontend_pid}"
exit_code=$?

echo "[codespaces] Un service EduSync s'est arrete (code ${exit_code})." >&2
exit "${exit_code}"
