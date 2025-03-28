import { S3Client } from "@aws-sdk/client-s3"

if (!process.env.CLOUDFLARE_R2_ACCESS_KEY_ID) {
  throw new Error("CLOUDFLARE_R2_ACCESS_KEY_ID is not defined")
}

if (!process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY) {
  throw new Error("CLOUDFLARE_R2_SECRET_ACCESS_KEY is not defined")
}

if (!process.env.CLOUDFLARE_R2_ENDPOINT) {
  throw new Error("CLOUDFLARE_R2_ENDPOINT is not defined")
}

export const r2Client = new S3Client({
  region: "auto",
  endpoint: process.env.CLOUDFLARE_R2_ENDPOINT,
  credentials: {
    accessKeyId: process.env.CLOUDFLARE_R2_ACCESS_KEY_ID,
    secretAccessKey: process.env.CLOUDFLARE_R2_SECRET_ACCESS_KEY,
  },
})

export const R2_BUCKET_NAME = process.env.CLOUDFLARE_R2_BUCKET_NAME || "stratwealth"

