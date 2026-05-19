import {
  S3Client,
  PutObjectCommand
} from '@aws-sdk/client-s3';

import {
  getSignedUrl
} from '@aws-sdk/s3-request-presigner';

const s3 =
  new S3Client({

    region:
      process.env.AWS_REGION
  });

export async function
generateUploadUrl({

  fileName,

  fileType
}) {

  const key =
    `uploads/${Date.now()}-${fileName}`;

  const command =
    new PutObjectCommand({

      Bucket:
        process.env.S3_BUCKET,

      Key: key,

      ContentType:
        fileType,
    });

  const uploadUrl =
    await getSignedUrl(

      s3,

      command,

      {
        expiresIn: 300
      }
    );

  return {

    uploadUrl,

    fileUrl:

      `https://${process.env.S3_BUCKET}.s3.amazonaws.com/${key}`,
  };
}