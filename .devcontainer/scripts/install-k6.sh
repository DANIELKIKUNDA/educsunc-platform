#!/usr/bin/env bash

set -Eeuo pipefail

readonly K6_VERSION="2.0.0"
readonly K6_ARCHIVE_SHA256="2ae87d976f6cdba17185bdd980d8819a3a98e9092c6f0638cd58272ecefc8b90"

if command -v k6 >/dev/null 2>&1 && k6 version | grep -q "v${K6_VERSION}"; then
  echo "[codespaces] k6 ${K6_VERSION} est deja disponible."
  exit 0
fi

temporary_directory="$(mktemp -d)"
trap 'rm -rf "${temporary_directory}"' EXIT

archive_path="${temporary_directory}/k6.tar.gz"
extraction_path="${temporary_directory}/k6"
mkdir -p "${extraction_path}"

echo "[codespaces] Installation verifiee de k6 ${K6_VERSION}..."
curl -fsSLo "${archive_path}" \
  "https://github.com/grafana/k6/releases/download/v${K6_VERSION}/k6-v${K6_VERSION}-linux-amd64.tar.gz"
printf '%s  %s\n' "${K6_ARCHIVE_SHA256}" "${archive_path}" | sha256sum -c -
tar -xzf "${archive_path}" -C "${extraction_path}" --strip-components=1
sudo install -m 0755 "${extraction_path}/k6" /usr/local/bin/k6

k6 version
