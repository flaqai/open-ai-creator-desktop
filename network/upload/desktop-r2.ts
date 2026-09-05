import {
  R2_ACCESS_KEY_ID_STORAGE_KEY,
  R2_ACCOUNT_ID_STORAGE_KEY,
  R2_BUCKET_NAME_STORAGE_KEY,
  R2_PUBLIC_DOMAIN_STORAGE_KEY,
  R2_SECRET_ACCESS_KEY_STORAGE_KEY,
} from '@/lib/desktop/storage';
import { fetchWithTimeout } from '@/lib/platform/http';
import { getSecureItem } from '@/lib/utils/secureStorage';

import type { CreateSignedUrlResponse } from './client';

export type R2Config = {
  accountId: string;
  accessKeyId: string;
  secretAccessKey: string;
  bucketName: string;
  publicDomain: string;
};

function getFileExtension(mimeType: string) {
  const extensions: Record<string, string> = {
    'image/jpeg': 'jpg',
    'image/png': 'png',
    'image/webp': 'webp',
    'image/gif': 'gif',
    'image/avif': 'avif',
    'audio/mpeg': 'mp3',
    'audio/wav': 'wav',
    'audio/mp4': 'm4a',
    'video/mp4': 'mp4',
    'video/webm': 'webm',
    'video/quicktime': 'mov',
    'application/pdf': 'pdf',
    'application/json': 'json',
    'text/plain': 'txt',
  };
  return extensions[mimeType] || 'bin';
}

function createObjectPath(mimeType: string) {
  const now = new Date();
  const datePath = [
    now.getFullYear(),
    String(now.getMonth() + 1).padStart(2, '0'),
    String(now.getDate()).padStart(2, '0'),
  ].join('/');
  const id = crypto.randomUUID().replaceAll('-', '').slice(0, 20);
  return `${datePath}/${id}.${getFileExtension(mimeType)}`;
}

export async function getDesktopR2Config() {
  const [accountId, accessKeyId, secretAccessKey, bucketName, publicDomain] = await Promise.all([
    getSecureItem(R2_ACCOUNT_ID_STORAGE_KEY),
    getSecureItem(R2_ACCESS_KEY_ID_STORAGE_KEY),
    getSecureItem(R2_SECRET_ACCESS_KEY_STORAGE_KEY),
    getSecureItem(R2_BUCKET_NAME_STORAGE_KEY),
    getSecureItem(R2_PUBLIC_DOMAIN_STORAGE_KEY),
  ]);

  if (!accountId || !accessKeyId || !secretAccessKey || !bucketName || !publicDomain) {
    throw new Error('Cloudflare R2 is not fully configured. Open Settings → Image Hosting.');
  }

  return { accountId, accessKeyId, secretAccessKey, bucketName, publicDomain };
}

export async function createDesktopSignedUrls(mimeTypes: string[], input?: R2Config): Promise<CreateSignedUrlResponse> {
  const config = validateR2Config(input || (await getDesktopR2Config()));
  const [{ S3Client, PutObjectCommand }, { getSignedUrl }] = await Promise.all([
    import('@aws-sdk/client-s3'),
    import('@aws-sdk/s3-request-presigner'),
  ]);
  const client = new S3Client({
    region: 'auto',
    forcePathStyle: true,
    endpoint: `https://${config.accountId}.r2.cloudflarestorage.com`,
    credentials: {
      accessKeyId: config.accessKeyId,
      secretAccessKey: config.secretAccessKey,
    },
  });
  const domain = config.publicDomain.replace(/\/$/, '');
  const domainWithProtocol = domain.startsWith('http') ? domain : `https://${domain}`;

  const rows = await Promise.all(
    mimeTypes.map(async (mimeType) => {
      const objectPath = createObjectPath(mimeType);
      const command = new PutObjectCommand({
        Bucket: config.bucketName,
        Key: objectPath,
        ContentType: mimeType,
      });
      return {
        signedUrl: await getSignedUrl(client, command, { expiresIn: 3600 }),
        url: `${domainWithProtocol}/${objectPath}`,
        mimeType,
      };
    }),
  );

  return { rows };
}

export async function testDesktopR2Connection(config: R2Config) {
  const response = await createDesktopSignedUrls(['text/plain'], config);
  const signedUrl = response.rows[0]?.signedUrl;
  if (!signedUrl) throw new Error('Could not create a test upload URL.');

  const upload = await fetchWithTimeout(signedUrl, {
    method: 'PUT',
    body: 'Flaq Creator connection test',
    headers: { 'Content-Type': 'text/plain' },
  });
  if (!upload.ok) throw new Error(`${upload.status} ${upload.statusText}`);
}

export function validateR2Config(config: R2Config): R2Config {
  const cleaned = Object.fromEntries(Object.entries(config).map(([key, value]) => [key, value.trim()])) as R2Config;
  if (Object.values(cleaned).some((value) => !value))
    throw new Error('Complete all R2 fields before testing or saving.');
  if (!/^[a-zA-Z0-9-]+$/.test(cleaned.accountId)) throw new Error('Invalid R2 account ID.');
  const domain = new URL(
    /^https?:\/\//i.test(cleaned.publicDomain) ? cleaned.publicDomain : `https://${cleaned.publicDomain}`,
  );
  if (
    !['https:', 'http:'].includes(domain.protocol) ||
    domain.username ||
    domain.password ||
    domain.search ||
    domain.hash
  ) {
    throw new Error('Invalid R2 public asset URL.');
  }
  return { ...cleaned, publicDomain: domain.toString().replace(/\/+$/, '') };
}
