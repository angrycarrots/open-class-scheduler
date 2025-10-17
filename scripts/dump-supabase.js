#!/usr/bin/env node
import { spawn } from 'node:child_process';
import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '..');
const backupsDir = path.join(rootDir, 'supabase', 'backups');

const pad = (value) => String(value).padStart(2, '0');
const now = new Date();
const dateStamp = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}_${pad(now.getHours())}-${pad(now.getMinutes())}-${pad(now.getSeconds())}`;
const dumpFileName = `supabase-dump-${dateStamp}.sql`;
const dumpFilePath = path.join(backupsDir, dumpFileName);

await mkdir(backupsDir, { recursive: true });

const rawArgs = process.argv.slice(2);
if (rawArgs.includes('--file') || rawArgs.includes('-f')) {
  console.error('Please omit the --file/-f option. The output file path is managed automatically.');
  process.exit(1);
}

let skipDefaultSchemas = false;
const passthroughArgs = [];

for (const arg of rawArgs) {
  if (arg === '--no-default-schemas') {
    skipDefaultSchemas = true;
    continue;
  }
  passthroughArgs.push(arg);
}

let hasDbNameArg = false;
for (const arg of passthroughArgs) {
  if (arg === '--dbname' || arg === '-d' || arg.startsWith('--dbname=')) {
    hasDbNameArg = true;
    break;
  }
}

let hasSchemaArg = false;
for (let index = 0; index < passthroughArgs.length; index += 1) {
  const arg = passthroughArgs[index];
  if (arg === '--schema' || arg === '-n') {
    const value = passthroughArgs[index + 1];
    if (!value || value.startsWith('-')) {
      console.error('The pg_dump option `--schema` (`-n`) must be followed by a schema name. To suppress default schemas without providing a value, use the `--no-default-schemas` flag.');
      process.exit(1);
    }
    hasSchemaArg = true;
    continue;
  }
  if (arg.startsWith('--schema=')) {
    hasSchemaArg = true;
    continue;
  }
  if (arg.startsWith('-n') && arg.length > 2) {
    hasSchemaArg = true;
  }
}

const defaultDbUrl = 'postgresql://postgres:postgres@127.0.0.1:54322/postgres';
const dbUrl = process.env.SUPABASE_DB_URL ?? defaultDbUrl;

const safeDbDescriptor = (() => {
  try {
    const parsed = new URL(dbUrl);
    const host = parsed.hostname ?? '';
    const port = parsed.port ? `:${parsed.port}` : '';
    const database = parsed.pathname ? parsed.pathname.replace(/^\//, '') : '';
    const user = parsed.username ? `${parsed.username}@` : '';
    return `${user}${host}${port}/${database}`;
  } catch (error) {
    return 'configured connection';
  }
})();

const pgDumpArgs = [];

if (!hasDbNameArg) {
  pgDumpArgs.push('--dbname', dbUrl);
}

pgDumpArgs.push('--file', dumpFilePath);
if (!skipDefaultSchemas && !hasSchemaArg) {
  pgDumpArgs.push('--schema=public', '--schema=auth');
}
pgDumpArgs.push(...passthroughArgs);

console.log(`Creating Postgres dump (${safeDbDescriptor}) at ${dumpFilePath}`);

try {
  await new Promise((resolve, reject) => {
    const child = spawn('pg_dump', pgDumpArgs, { stdio: 'inherit' });
    child.on('error', (error) => {
      if (error.code === 'ENOENT') {
        reject(new Error('`pg_dump` command not found. Please install PostgreSQL client tools and ensure `pg_dump` is available in your PATH.'));
        return;
      }
      reject(error);
    });
    child.on('close', (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`pg_dump exited with code ${code}`));
      }
    });
  });

  console.log('Postgres dump completed successfully.');
  console.log(`Dump saved to ${dumpFilePath}`);
} catch (error) {
  console.error('Failed to dump Postgres database.');
  console.error(error.message);
  process.exit(1);
}
