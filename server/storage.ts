/**
 * Storage integration with DigitalOcean Spaces (S3-compatible).
 * Handles file uploads, downloads, and presigned URLs for direct client access.
 */

import { S3Client, PutObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import { getSignedUrl } from "@aws-sdk/s3-request-presigner";
import { randomUUID } from "node:crypto";
import { ENV } from "./_core/env";

// Initialize S3 client for DigitalOcean Spaces
const createS3Client = (): S3Client => {
  if (
    !ENV.doSpacesEndpoint ||
    !ENV.doSpacesRegion ||
    !ENV.doSpacesBucket ||
    !ENV.doSpacesAccessKey ||
    !ENV.doSpacesSecretKey
  ) {
    throw new Error(
      "DigitalOcean Spaces configuration incomplete. " +
      "Set DO_SPACES_ENDPOINT, DO_SPACES_REGION, DO_SPACES_BUCKET, DO_SPACES_ACCESS_KEY, DO_SPACES_SECRET_KEY"
    );
  }

  return new S3Client({
    region: ENV.doSpacesRegion,
    endpoint: ENV.doSpacesEndpoint,
    credentials: {
      accessKeyId: ENV.doSpacesAccessKey,
      secretAccessKey: ENV.doSpacesSecretKey,
    },
  });
};

let s3Client: S3Client | null = null;

function getS3Client(): S3Client {
  if (!s3Client) {
    s3Client = createS3Client();
  }
  return s3Client;
}

function normalizeKey(relKey: string): string {
  return relKey.replace(/^\/+/, "");
}

function appendHashSuffix(relKey: string): string {
  const hash = randomUUID().replace(/-/g, "").slice(0, 8);
  const lastDot = relKey.lastIndexOf(".");
  if (lastDot === -1) return `${relKey}_${hash}`;
  return `${relKey.slice(0, lastDot)}_${hash}${relKey.slice(lastDot)}`;
}

/**
 * Upload a file to DigitalOcean Spaces.
 * Returns the storage key and a publicly accessible URL.
 */
export async function storagePut(
  relKey: string,
  data: Buffer | Uint8Array | string,
  contentType = "application/octet-stream"
): Promise<{ key: string; url: string }> {
  const client = getS3Client();
  const key = appendHashSuffix(normalizeKey(relKey));

  try {
    const command = new PutObjectCommand({
      Bucket: ENV.doSpacesBucket,
      Key: key,
      Body: typeof data === "string" ? Buffer.from(data) : data,
      ContentType: contentType,
    });

    await client.send(command);

    // Construct public URL
    const baseUrl = ENV.doSpacesBaseUrl || `https://${ENV.doSpacesBucket}.${ENV.doSpacesRegion}.digitaloceanspaces.com`;
    const url = `${baseUrl.replace(/\/$/, "")}/${key}`;

    return { key, url };
  } catch (error) {
    throw new Error(
      `Failed to upload file to DigitalOcean Spaces: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

/**
 * Get the public URL for a stored file.
 * For DigitalOcean Spaces, files can be accessed directly via the public URL.
 */
export async function storageGet(relKey: string): Promise<{ key: string; url: string }> {
  const key = normalizeKey(relKey);
  if (!ENV.doSpacesBucket || !ENV.doSpacesRegion) {
    throw new Error("DigitalOcean Spaces is not configured. Set DO_SPACES_BUCKET and DO_SPACES_REGION.");
  }
  const baseUrl = ENV.doSpacesBaseUrl || `https://${ENV.doSpacesBucket}.${ENV.doSpacesRegion}.digitaloceanspaces.com`;
  const url = `${baseUrl.replace(/\/$/, "")}/${key}`;

  return { key, url };
}

/**
 * Generate a presigned URL for temporary direct access to a file.
 * Useful for private files that need temporary public access.
 * Defaults to 1 hour expiration.
 */
export async function storageGetSignedUrl(
  relKey: string,
  expirationSeconds = 3600
): Promise<string> {
  const client = getS3Client();
  const key = normalizeKey(relKey);

  try {
    const command = new GetObjectCommand({
      Bucket: ENV.doSpacesBucket,
      Key: key,
    });

    const url = await getSignedUrl(client, command, {
      expiresIn: expirationSeconds,
    });

    return url;
  } catch (error) {
    throw new Error(
      `Failed to generate presigned URL: ${error instanceof Error ? error.message : String(error)}`
    );
  }
}

