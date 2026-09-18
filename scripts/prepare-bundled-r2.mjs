import { createCipheriv, randomBytes } from 'node:crypto';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { pathToFileURL } from 'node:url';

const REQUIRED_FIELDS = ['accountId', 'accessKeyId', 'secretAccessKey', 'bucketName', 'publicDomain'];
const ENVIRONMENT_FIELDS = {
  accountId: ['FLAQ_BUNDLED_R2_ACCOUNT_ID', 'R2_ACCOUNT_ID'],
  accessKeyId: ['FLAQ_BUNDLED_R2_ACCESS_KEY_ID', 'R2_ACCESS_KEY_ID'],
  secretAccessKey: ['FLAQ_BUNDLED_R2_SECRET_ACCESS_KEY', 'R2_SECRET_ACCESS_KEY'],
  bucketName: ['FLAQ_BUNDLED_R2_BUCKET_NAME', 'R2_BUCKET_NAME'],
  publicDomain: ['FLAQ_BUNDLED_R2_PUBLIC_DOMAIN', 'R2_PUBLIC_DOMAIN'],
};

function parseEnv(source) {
  return Object.fromEntries(
    source
      .split(/\r?\n/)
      .map((line) => line.trim())
      .filter((line) => line && !line.startsWith('#') && line.includes('='))
      .map((line) => {
        const separator = line.indexOf('=');
        const key = line.slice(0, separator).trim();
        let value = line.slice(separator + 1).trim();
        if (
          value.length >= 2 &&
          ((value.startsWith('"') && value.endsWith('"')) || (value.startsWith("'") && value.endsWith("'")))
        ) {
          value = value.slice(1, -1);
        }
        return [key, value];
      }),
  );
}

async function loadLocalEnvironment(projectRoot) {
  try {
    return parseEnv(await readFile(path.join(projectRoot, '.local/r2.env'), 'utf8'));
  } catch (error) {
    if (error?.code === 'ENOENT') return {};
    throw error;
  }
}

function resolveConfig(environment) {
  return Object.fromEntries(
    Object.entries(ENVIRONMENT_FIELDS).map(([field, keys]) => [
      field,
      keys.map((key) => environment[key]?.trim()).find(Boolean) || '',
    ]),
  );
}

function rustBytes(value) {
  return `&[${[...value].join(', ')}]`;
}

function unavailableSource() {
  return `// Generated during desktop packaging. Do not edit.\n\
pub const BUNDLED_R2_AVAILABLE: bool = false;\n\
pub const BUNDLED_R2_KEY: &[u8] = &[];\n\
pub const BUNDLED_R2_NONCE: &[u8] = &[];\n\
pub const BUNDLED_R2_CIPHERTEXT: &[u8] = &[];\n`;
}

export async function prepareBundledR2(projectRoot, options = {}) {
  const output = options.output || path.join(projectRoot, 'src-tauri/.generated/bundled_r2.rs');
  const environment = { ...(await loadLocalEnvironment(projectRoot)), ...(options.environment || process.env) };
  const config = options.config || resolveConfig(environment);
  const populated = REQUIRED_FIELDS.filter((field) => Boolean(config[field]?.trim()));

  await mkdir(path.dirname(output), { recursive: true });
  if (populated.length === 0) {
    if (environment.FLAQ_REQUIRE_BUNDLED_R2 === 'true') {
      throw new Error('The bundled R2 configuration is required for this build but was not provided.');
    }
    await writeFile(output, unavailableSource(), { mode: 0o600 });
    return { available: false, output };
  }
  if (populated.length !== REQUIRED_FIELDS.length) {
    const missing = REQUIRED_FIELDS.filter((field) => !config[field]?.trim());
    throw new Error(`Bundled R2 configuration is incomplete. Missing: ${missing.join(', ')}`);
  }

  const key = options.encryptionKey || randomBytes(32);
  const nonce = options.nonce || randomBytes(12);
  if (key.length !== 32) throw new Error('Bundled R2 encryption key must be 32 bytes.');
  if (nonce.length !== 12) throw new Error('Bundled R2 nonce must be 12 bytes.');

  const plaintext = Buffer.from(JSON.stringify(config), 'utf8');
  const cipher = createCipheriv('aes-256-gcm', key, nonce);
  const encrypted = Buffer.concat([cipher.update(plaintext), cipher.final(), cipher.getAuthTag()]);
  plaintext.fill(0);

  const source = `// Generated during desktop packaging. Do not edit.\n\
pub const BUNDLED_R2_AVAILABLE: bool = true;\n\
pub const BUNDLED_R2_KEY: &[u8] = ${rustBytes(key)};\n\
pub const BUNDLED_R2_NONCE: &[u8] = ${rustBytes(nonce)};\n\
pub const BUNDLED_R2_CIPHERTEXT: &[u8] = ${rustBytes(encrypted)};\n`;
  await writeFile(output, source, { mode: 0o600 });
  return { available: true, output };
}

if (process.argv[1] && import.meta.url === pathToFileURL(path.resolve(process.argv[1])).href) {
  const result = await prepareBundledR2(process.cwd());
  console.log(
    result.available ? 'Bundled R2 preset encrypted for desktop packaging.' : 'No bundled R2 preset configured.',
  );
}
