import fs from 'fs';
import aws_S3 from '../configs/aws_s3.config.js';
import config from '../configs/common-config.js';
import Logging from '../library/Logging.js';

async function handleUpload(file, nhadat_id) {
  const key = `uploads/${nhadat_id}/${file.originalname}`;

  const buffer = fs.readFileSync(file.path);

  return await aws_S3
    .putObject({
      Bucket: config.aws.AWS_BUCKET,
      Key: key,
      Body: buffer,
      ACL: 'public-read',
      ContentType: 'image/jpeg',
    })
    // .promise()
    .then((res) => {
      Logging.success(`Upload Success file - ${res.ETag}`);
      return `https://${config.aws.AWS_BUCKET}.s3.${config.aws.AWS_REGION}.amazonaws.com/${key}`;
    })
    .catch((err) => Logging.error(err));
}

async function uploadToS3(files, nhadat_id) {
  let upload_promises = [];

  files.forEach((file) => upload_promises.push(handleUpload(file, nhadat_id)));

  const data = await Promise.all(upload_promises);

  return data;
}

async function deleteFolderCollections(id) {
  const key = `uploads/${id}`;

  await aws_S3
    .deleteObject({
      Bucket: config.aws.AWS_BUCKET,
      Key: key,
    })
    // .promise()
    .then(() => {
      Logging.success(`Delete Folder ${id} success`);
    })
    .catch((err) => {
      Logging.error(err);
    });
}

export { uploadToS3, deleteFolderCollections };
