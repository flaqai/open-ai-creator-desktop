import { NextResponse } from 'next/server';
import { PutObjectCommand, S3Client } from '@aws-sdk/client-s3';
import { getSignedUrl } from '@aws-sdk/s3-request-presigner';

function getR2Client() {
  const accountId = process.env.R2_ACCOUNT_ID;
  const accessKeyId = process.env.R2_ACCESS_KEY_ID;
  const secretAccessKey = process.env.R2_SECRET_ACCESS_KEY;

  if (!accountId || !accessKeyId || !secretAccessKey) return null;

  return new S3Client({
    region: 'auto',
    endpoint: `https://${accountId}.r2.cloudflarestorage.com`,
    credentials: { accessKeyId, secretAccessKey },
  });
}

export async function GET() {
  const bucketName = process.env.R2_BUCKET_NAME;
  const client = getR2Client();

  if (!client || !bucketName) {
    return NextResponse.json({ error: 'R2 storage is not configured.' }, { status: 503 });
  }

  try {
    const testKey = `.test-connection-${Date.now()}`;
    const command = new PutObjectCommand({
      Bucket: bucketName,
      Key: testKey,
      ContentType: 'text/plain',
    });
    const signedUrl = await getSignedUrl(client, command, { expiresIn: 60 });

    const putResponse = await fetch(signedUrl, {
      method: 'PUT',
      body: ' ',
      headers: { 'Content-Type': 'text/plain' },
    });

    if (!putResponse.ok) {
      return NextResponse.json(
        { error: `Upload test failed: ${putResponse.status} ${putResponse.statusText}` },
        { status: 502 },
      );
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
