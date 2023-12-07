/*
    - Upload Avatar
    - Delete Avatar
*/

import fs from 'fs';
import aws_S3 from '../configs/aws_s3.config.js';
import config from '../configs/common-config.js';
import Logging from '../library/Logging.js';

// upload Avatar user
async function uploadAvatarToS3(file, key_file) {
  const file_buffer = fs.readFileSync(file.path);

  await aws_S3
    .putObject({
      Bucket: config.aws.AWS_BUCKET,
      Key: key_file,
      Body: file_buffer,
      ACL: 'public-read',
      ContentType: 'image/jpeg',
    })
    .then(() => Logging.success('Upload avatar success!'))
    .catch((err) => Logging.error('Upload avatar fail', err));
}

// delete obj
function deleteAvatar(key_old_avt) {
  aws_S3.deleteObject(
    {
      Bucket: config.aws.AWS_BUCKET,
      Key: `avatars${key_old_avt}`,
    },
    (err, data) => {
      if (err) {
        Logging.error('Fail Delete Obj - ' + err);
      }

      Logging.success('Delete Obj success!');
    }
  );
}

export { uploadAvatarToS3, deleteAvatar };
