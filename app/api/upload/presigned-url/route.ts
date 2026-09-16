import { NextRequest, NextResponse } from 'next/server';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

import { generateR2Path } from '@/lib/utils/r2PathUtils';

const ALLOWED_MIME_TYPES = new Set([
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/gif',
  'image/avif',
  'audio/mpeg',
  'audio/wav',
  'audio/mp4',
  'video/mp4',
  'video/webm',
  'video/quicktime',
]);

function getR2Client() {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

  if (!accountId || !accessKeyId || !secretAccessKey) {
    return null;
  }

  return new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });
}

export async function POST(req: NextRequest) {
  const bucketName = process.env.R2_BUCKET_NAME;
  const client = getR2Client();

  if (!client || !bucketName) {
    return NextResponse.json({ error: 'R2 storage is not configured.' }, { status: 503 });
  }

  const body = (await req.json()) as { mimeTypes?: string[]; publicDomain?: string };
  const { mimeTypes, publicDomain } = body;

  if (!Array.isArray(mimeTypes) || mimeTypes.length === 0) {
    return NextResponse.json({ error: 'mimeTypes is required.' }, { status: 400 });
  }

  if (!publicDomain) {
    return NextResponse.json({ error: 'publicDomain is required.' }, { status: 400 });
  }

  for (const mimeType of mimeTypes) {
    if (!ALLOWED_MIME_TYPES.has(mimeType)) {
      return NextResponse.json({ error: `Unsupported file type: ${mimeType}` }, { status: 400 });
    }
  }

  const domain = publicDomain.replace(/\/$/, '');
  const domainWithProtocol = domain.startsWith('http') ? domain : `https://${domain}`;

  const rows = await Promise.all(
    mimeTypes.map(async (mimeType) => {
      const path = generateR2Path(mimeType);
      const command = new PutObjectCommand({
        Bucket: bucketName,
        Key: path,
        ContentType: mimeType,
      });
      const signedUrl = await getSignedUrl(client, command, { expiresIn: 3600 });
      const url = `${domainWithProtocol}/${path}`;
      return { signedUrl, url };
    }),
  );

  return NextResponse.json({ rows });
}
