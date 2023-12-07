import fs from 'fs';
import aws_S3 from '../configs/aws_s3.config.js';
import config from '../configs/common-config.js';
import Logging from '../library/Logging.js';

// upload Avatar user
async function uploadContract(file, key_file) {
  const file_buffer = fs.readFileSync(file.path);

  await aws_S3
    .putObject({
      Bucket: config.aws.AWS_BUCKET,
      Key: key_file,
      Body: file_buffer,
      ACL: 'public-read',
      ContentType: 'application/pdf',
    })
    .then(() => Logging.success('Upload file pdf success!'))
    .catch((err) => Logging.error('Upload file pdf fail', err));
}

export { uploadContract };
