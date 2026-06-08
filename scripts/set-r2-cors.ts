import { S3Client, PutBucketCorsCommand } from '@aws-sdk/client-s3';
import * as dotenv from 'dotenv';
import { resolve } from 'path';

// Load .env variables
dotenv.config({ path: resolve(process.cwd(), '.env') });

async function setCors() {
    const endpoint = process.env.R2_ENDPOINT;
    const accessKey = process.env.R2_ACCESS_KEY;
    const secretKey = process.env.R2_SECRET_KEY;
    const bucket = process.env.R2_BUCKET;

    if (!endpoint || !accessKey || !secretKey || !bucket) {
        console.error("Missing R2 credentials in .env file.");
        process.exit(1);
    }

    const client = new S3Client({
        region: 'auto',
        endpoint,
        credentials: {
            accessKeyId: accessKey,
            secretAccessKey: secretKey,
        },
    });

    const command = new PutBucketCorsCommand({
        Bucket: bucket,
        CORSConfiguration: {
            CORSRules: [
                {
                    AllowedOrigins: [
                        "http://localhost:3000",
                        "https://emotionview.vercel.app"
                    ],
                    AllowedMethods: [
                        "GET",
                        "PUT",
                        "POST",
                        "DELETE",
                        "HEAD"
                    ],
                    AllowedHeaders: ["*"],
                    ExposeHeaders: ["ETag"],
                    MaxAgeSeconds: 3600
                }
            ]
        }
    });

    try {
        await client.send(command);
        console.log("Successfully updated CORS policy for R2 bucket!");
    } catch (error) {
        console.error("Error setting CORS policy:", error);
    }
}

setCors();
