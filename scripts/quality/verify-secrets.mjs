import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';
import { repositoryRoot } from './lib/runner.mjs';

const mode = process.argv[2] ?? 'staged';
const supportedModes = new Set(['staged', 'tracked']);
if (!supportedModes.has(mode)) {
  throw new Error(`Mode de contrôle des secrets inconnu : ${mode}.`);
}

const files = listFiles(mode);
const highConfidencePatterns = [
  { name: 'Clé privée', pattern: /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/u },
  { name: 'Jeton GitHub', pattern: /\b(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9]{30,}\b/u },
  { name: 'Clé AWS', pattern: /\bAKIA[0-9A-Z]{16}\b/u },
  { name: 'Secret Stripe', pattern: /\bsk_(?:live|test)_[A-Za-z0-9]{16,}\b/u },
  { name: 'Jeton Slack', pattern: /\bxox[baprs]-[A-Za-z0-9-]{10,}\b/u },
];
const ignoredExtensions = new Set(['.png', '.jpg', '.jpeg', '.gif', '.webp', '.pdf', '.zip', '.woff', '.woff2', '.ttf']);
const findings = [];

for (const relativeFile of files) {
  const file = path.join(repositoryRoot, relativeFile);
  if (!fs.existsSync(file) || !fs.statSync(file).isFile()) continue;
  if (ignoredExtensions.has(path.extname(file).toLowerCase())) continue;
  const content = fs.readFileSync(file, 'utf8');
  for (const detector of highConfidencePatterns) {
    const match = detector.pattern.exec(content);
    if (!match) continue;
    const line = content.slice(0, match.index).split(/\r?\n/u).length;
    findings.push({ file: relativeFile, line, detector: detector.name });
  }
}

if (findings.length > 0) {
  process.stderr.write('Secrets potentiels détectés. Les valeurs sont volontairement masquées :\n');
  for (const finding of findings) {
    process.stderr.write(`- ${finding.file}:${finding.line} (${finding.detector})\n`);
  }
  process.exitCode = 1;
} else {
  process.stdout.write(`Contrôle rapide des secrets : ${files.length} fichier(s), aucun secret à haute confiance détecté.\n`);
}

function listFiles(selectedMode) {
  const args = selectedMode === 'staged'
    ? ['diff', '--cached', '--name-only', '--diff-filter=ACMR']
    : ['ls-files'];
  const output = execFileSync('git', args, { cwd: repositoryRoot, encoding: 'utf8' });
  return output.split(/\r?\n/u).map((entry) => entry.trim()).filter(Boolean);
}
