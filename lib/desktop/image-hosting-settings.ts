import type { R2Config } from '@/network/upload/types';

import { getSecureItem, setSecureItem } from '../utils/secureStorage';
import {
  CUSTOM_R2_ACCESS_KEY_ID_STORAGE_KEY,
  CUSTOM_R2_ACCOUNT_ID_STORAGE_KEY,
  CUSTOM_R2_BUCKET_NAME_STORAGE_KEY,
  CUSTOM_R2_PUBLIC_DOMAIN_STORAGE_KEY,
  CUSTOM_R2_SECRET_ACCESS_KEY_STORAGE_KEY,
  getUploadProvider,
  R2_ACCESS_KEY_ID_STORAGE_KEY,
  R2_ACCOUNT_ID_STORAGE_KEY,
  R2_BUCKET_NAME_STORAGE_KEY,
  R2_PUBLIC_DOMAIN_STORAGE_KEY,
  R2_SECRET_ACCESS_KEY_STORAGE_KEY,
  setUploadProvider,
  type UploadProvider,
} from './storage';

const CUSTOM_KEYS = [
  CUSTOM_R2_ACCOUNT_ID_STORAGE_KEY,
  CUSTOM_R2_ACCESS_KEY_ID_STORAGE_KEY,
  CUSTOM_R2_SECRET_ACCESS_KEY_STORAGE_KEY,
  CUSTOM_R2_BUCKET_NAME_STORAGE_KEY,
  CUSTOM_R2_PUBLIC_DOMAIN_STORAGE_KEY,
] as const;

const LEGACY_KEYS = [
  R2_ACCOUNT_ID_STORAGE_KEY,
  R2_ACCESS_KEY_ID_STORAGE_KEY,
  R2_SECRET_ACCESS_KEY_STORAGE_KEY,
  R2_BUCKET_NAME_STORAGE_KEY,
  R2_PUBLIC_DOMAIN_STORAGE_KEY,
] as const;

function toConfig(values: Array<string | null>): R2Config {
  return {
    accountId: values[0] || '',
    accessKeyId: values[1] || '',
    secretAccessKey: values[2] || '',
    bucketName: values[3] || '',
    publicDomain: values[4] || '',
  };
}

function isComplete(config: R2Config) {
  return Object.values(config).every(Boolean);
}

function configValues(config: R2Config) {
  return [config.accountId, config.accessKeyId, config.secretAccessKey, config.bucketName, config.publicDomain];
}

async function readConfig(keys: readonly string[]) {
  return toConfig(await Promise.all(keys.map((key) => getSecureItem(key))));
}

export async function loadImageHostingSettings() {
  const custom = await readConfig(CUSTOM_KEYS);
  return {
    provider: getUploadProvider(),
    customR2: isComplete(custom) ? custom : await readConfig(LEGACY_KEYS),
  };
}

export async function saveImageHostingSettings(
  provider: UploadProvider,
  customR2: R2Config | undefined,
  remember: boolean,
) {
  if (provider === 'custom-r2' && !customR2) throw new Error('Custom R2 configuration is required.');
  if (customR2) {
    const values = configValues(customR2);
    await Promise.all(CUSTOM_KEYS.map((key, index) => setSecureItem(key, values[index], remember)));
  }
  setUploadProvider(provider);
}

export async function getConfiguredCustomR2() {
  const { customR2 } = await loadImageHostingSettings();
  if (!isComplete(customR2)) throw new Error('Custom R2 is not configured. Open Settings → Image Hosting.');
  return customR2;
}

export type { UploadProvider };
