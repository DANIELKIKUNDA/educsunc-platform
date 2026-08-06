import { spawn } from 'node:child_process';
import fs from 'node:fs';
import path from 'node:path';

export const repositoryRoot = path.resolve(import.meta.dirname, '..', '..', '..');
export const qualityArtifacts = path.join(repositoryRoot, 'artifacts', 'quality');

export function npmInvocation(args) {
  if (process.platform !== 'win32') return { command: 'npm', args };
  return {
    command: process.env.ComSpec ?? 'C:\\Windows\\System32\\cmd.exe',
    args: ['/d', '/s', '/c', 'npm', ...args],
  };
}

export function ensureDirectory(directory) {
  fs.mkdirSync(directory, { recursive: true });
}

export function formatDuration(durationMs) {
  if (durationMs < 1000) return `${durationMs} ms`;
  return `${(durationMs / 1000).toFixed(1)} s`;
}

export function runCommand({
  id,
  command,
  args = [],
  cwd = repositoryRoot,
  env = {},
  outputFile,
  allowFailure = false,
  quiet = false,
}) {
  const startedAt = new Date();
  const chunks = [];
  if (!quiet) process.stdout.write(`\n[${id}] ${command} ${args.join(' ')}\n`);

  return new Promise((resolve, reject) => {
    let settled = false;
    const child = spawn(command, args, {
      cwd,
      env: { ...process.env, ...env },
      windowsHide: true,
      shell: false,
      stdio: ['ignore', 'pipe', 'pipe'],
    });

    const capture = (stream, target) => stream.on('data', (chunk) => {
      const value = chunk.toString();
      chunks.push(value);
      if (!quiet) target.write(value);
    });

    capture(child.stdout, process.stdout);
    capture(child.stderr, process.stderr);

    child.once('error', (error) => {
      if (settled) return;
      settled = true;
      const finishedAt = new Date();
      const result = {
        id,
        command,
        args,
        cwd,
        status: 'failed',
        exitCode: null,
        startedAt: startedAt.toISOString(),
        finishedAt: finishedAt.toISOString(),
        durationMs: finishedAt.getTime() - startedAt.getTime(),
        error: error.message,
      };
      writeOutput(outputFile, chunks.join(''));
      if (allowFailure) resolve(result);
      else reject(Object.assign(error, { verificationResult: result }));
    });

    child.once('exit', (code, signal) => {
      if (settled) return;
      settled = true;
      const finishedAt = new Date();
      const result = {
        id,
        command,
        args,
        cwd,
        status: code === 0 ? 'passed' : 'failed',
        exitCode: code,
        signal,
        startedAt: startedAt.toISOString(),
        finishedAt: finishedAt.toISOString(),
        durationMs: finishedAt.getTime() - startedAt.getTime(),
      };
      writeOutput(outputFile, chunks.join(''));
      if (code === 0 || allowFailure) {
        if (!quiet) process.stdout.write(`[${id}] ${result.status.toUpperCase()} en ${formatDuration(result.durationMs)}\n`);
        resolve(result);
      } else {
        const error = new Error(`${id} a échoué avec le code ${code}${signal ? ` (${signal})` : ''}.`);
        error.verificationResult = result;
        reject(error);
      }
    });
  });
}

export function runNode(id, script, args = [], options = {}) {
  return runCommand({
    id,
    command: process.execPath,
    args: [script, ...args],
    ...options,
  });
}

export function runNpm(id, prefix, script, options = {}) {
  const invocation = npmInvocation([
    '--prefix',
    prefix,
    'run',
    script,
    ...(options.scriptArgs ? ['--', ...options.scriptArgs] : []),
  ]);
  return runCommand({
    id,
    command: invocation.command,
    args: invocation.args,
    ...options,
  });
}

export function runRootNpm(id, script, options = {}) {
  const invocation = npmInvocation([
    'run',
    script,
    ...(options.scriptArgs ? ['--', ...options.scriptArgs] : []),
  ]);
  return runCommand({
    id,
    command: invocation.command,
    args: invocation.args,
    ...options,
  });
}

export function runNpmCli(id, args, options = {}) {
  const invocation = npmInvocation(args);
  return runCommand({
    id,
    command: invocation.command,
    args: invocation.args,
    ...options,
  });
}

export async function runParallel(label, tasks) {
  process.stdout.write(`\n=== ${label} (${tasks.length} contrôles parallèles) ===\n`);
  const settled = await Promise.allSettled(tasks.map((task) => task()));
  const results = [];
  const failures = [];
  for (const entry of settled) {
    if (entry.status === 'fulfilled') results.push(entry.value);
    else {
      failures.push(entry.reason);
      if (entry.reason?.verificationResult) results.push(entry.reason.verificationResult);
    }
  }
  if (failures.length > 0) {
    const error = new Error(`${failures.length} contrôle(s) ont échoué dans ${label}.`);
    error.causes = failures;
    error.verificationResults = results;
    throw error;
  }
  return results;
}

export function writeJson(file, value) {
  ensureDirectory(path.dirname(file));
  fs.writeFileSync(file, `${JSON.stringify(value, null, 2)}\n`, 'utf8');
}

function writeOutput(file, value) {
  if (!file) return;
  ensureDirectory(path.dirname(file));
  fs.writeFileSync(file, value, 'utf8');
}
