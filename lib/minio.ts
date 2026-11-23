import { S3Client } from "@aws-sdk/client-s3";

const neonEndpoint = process.env.AWS_ENDPOINT_URL_S3;
const endpoint = neonEndpoint || process.env.MINIO_ENDPOINT;
const accessKeyId = neonEndpoint ? process.env.AWS_ACCESS_KEY_ID : process.env.MINIO_ACCESS_KEY;
const secretAccessKey = neonEndpoint ? process.env.AWS_SECRET_ACCESS_KEY : process.env.MINIO_SECRET_KEY;
const region = neonEndpoint ? process.env.AWS_REGION : "us-east-1";

export const MINIO_BUCKET = neonEndpoint ? "nextcrm-files" : process.env.MINIO_BUCKET;

if (!endpoint || !accessKeyId || !secretAccessKey || !region || !MINIO_BUCKET) {
  throw new Error(neonEndpoint ? "Neon Object Storage configuration is incomplete" : "MinIO configuration is incomplete");
}

export const minioClient = new S3Client({
  endpoint,
  region,
  credentials: { accessKeyId, secretAccessKey },
  forcePathStyle: true,
  requestChecksumCalculation: "WHEN_REQUIRED",
  responseChecksumValidation: "WHEN_REQUIRED",
});

export const MINIO_PUBLIC_URL = process.env.NEXT_PUBLIC_MINIO_ENDPOINT;
