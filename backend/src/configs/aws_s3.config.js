import aws from 'aws-sdk';
import { S3 } from "@aws-sdk/client-s3";
import config from './common-config.js';

aws.config.update({
  accessKeyId: config.aws.AWS_ACCESS_KEY_ID,
  secretAccessKey: config.aws.AWS_SECRET_ACCESS_KEY,
  region: config.aws.AWS_REGION,
});

const aws_S3 = new S3();

export default aws_S3;
