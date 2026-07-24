import fs from 'node:fs';
import path from 'node:path';
import { repositoryRoot } from './lib/runner.mjs';

const workflowRoot = path.join(repositoryRoot, '.github', 'workflows');
const shaReference = /^[a-f0-9]{40}$/u;
const findings = [];

for (const name of fs.readdirSync(workflowRoot)) {
  if (!name.endsWith('.yml') && !name.endsWith('.yaml')) continue;
  const file = path.join(workflowRoot, name);
  const lines = fs.readFileSync(file, 'utf8').split(/\r?\n/u);
  lines.forEach((line, index) => {
    const match = line.match(/^\s*uses:\s*([^@\s]+)@([^\s#]+)(?:\s+#\s*(.+))?$/u);
    if (!match || match[1].startsWith('./') || match[1].startsWith('docker://')) return;
    if (!shaReference.test(match[2])) {
      findings.push({
        file: path.relative(repositoryRoot, file),
        line: index + 1,
        action: match[1],
        reference: match[2],
      });
    }
  });
}

if (findings.length > 0) {
  process.stderr.write('Les actions GitHub suivantes ne sont pas épinglées par un SHA complet :\n');
  for (const finding of findings) {
    process.stderr.write(`- ${finding.file}:${finding.line} ${finding.action}@${finding.reference}\n`);
  }
  process.exitCode = 1;
} else {
  process.stdout.write('Toutes les actions GitHub externes sont épinglées par un SHA complet.\n');
}
