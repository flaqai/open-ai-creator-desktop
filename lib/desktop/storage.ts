export const R2_PUBLIC_DOMAIN_STORAGE_KEY = 'FLAQ-SAAS-TEMPLATE-r2-public-domain';
export const R2_ACCOUNT_ID_STORAGE_KEY = 'FLAQ-CREATOR-DESKTOP-r2-account-id';
export const R2_ACCESS_KEY_ID_STORAGE_KEY = 'FLAQ-CREATOR-DESKTOP-r2-access-key-id';
export const R2_SECRET_ACCESS_KEY_STORAGE_KEY = 'FLAQ-CREATOR-DESKTOP-r2-secret-access-key';
export const R2_BUCKET_NAME_STORAGE_KEY = 'FLAQ-CREATOR-DESKTOP-r2-bucket-name';
export const CUSTOM_R2_PUBLIC_DOMAIN_STORAGE_KEY = 'FLAQ-CREATOR-DESKTOP-custom-r2-public-domain';
export const CUSTOM_R2_ACCOUNT_ID_STORAGE_KEY = 'FLAQ-CREATOR-DESKTOP-custom-r2-account-id';
export const CUSTOM_R2_ACCESS_KEY_ID_STORAGE_KEY = 'FLAQ-CREATOR-DESKTOP-custom-r2-access-key-id';
export const CUSTOM_R2_SECRET_ACCESS_KEY_STORAGE_KEY = 'FLAQ-CREATOR-DESKTOP-custom-r2-secret-access-key';
export const CUSTOM_R2_BUCKET_NAME_STORAGE_KEY = 'FLAQ-CREATOR-DESKTOP-custom-r2-bucket-name';
export const UPLOAD_PROVIDER_STORAGE_KEY = 'FLAQ-CREATOR-DESKTOP-upload-provider-v1';

export type UploadProvider = 'builtin' | 'custom-r2';

export function getUploadProvider(): UploadProvider {
  if (typeof window === 'undefined') return 'builtin';
  return localStorage.getItem(UPLOAD_PROVIDER_STORAGE_KEY) === 'custom-r2' ? 'custom-r2' : 'builtin';
}

export function setUploadProvider(provider: UploadProvider): void {
  localStorage.setItem(UPLOAD_PROVIDER_STORAGE_KEY, provider);
}

export const DESKTOP_R2_STORAGE_KEYS = [
  R2_ACCOUNT_ID_STORAGE_KEY,
  R2_ACCESS_KEY_ID_STORAGE_KEY,
  R2_SECRET_ACCESS_KEY_STORAGE_KEY,
  R2_BUCKET_NAME_STORAGE_KEY,
  R2_PUBLIC_DOMAIN_STORAGE_KEY,
];

export const DESKTOP_CUSTOM_R2_STORAGE_KEYS = [
  CUSTOM_R2_ACCOUNT_ID_STORAGE_KEY,
  CUSTOM_R2_ACCESS_KEY_ID_STORAGE_KEY,
  CUSTOM_R2_SECRET_ACCESS_KEY_STORAGE_KEY,
  CUSTOM_R2_BUCKET_NAME_STORAGE_KEY,
  CUSTOM_R2_PUBLIC_DOMAIN_STORAGE_KEY,
];
