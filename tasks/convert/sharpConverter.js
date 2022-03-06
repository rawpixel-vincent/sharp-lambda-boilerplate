// @ts-ignore
// eslint-disable-next-line
const AWS = require('aws-sdk');
const sharp = require('sharp');
const { convertWithSharp, getS3ObjectBuffer, findNonExistentKey } = require('./utils');

/**
 * @param {AWS.S3} s3Client
 * @param {import('./types').InputMessage} options
 */
module.exports.sharpConverter = async (
  s3Client,
  { s3InputKey, s3OutputKey, preventOverride = false, convertOptions }
) => {
  const { DESTINATION_BUCKET, SOURCE_BUCKET } = process.env;
  const inputBuffer = await getS3ObjectBuffer(s3Client, s3InputKey, SOURCE_BUCKET);

  const { buffer, info } = await convertWithSharp(sharp, inputBuffer, convertOptions);

  const s3DestinationKey = preventOverride
    ? await findNonExistentKey(s3Client, s3OutputKey, DESTINATION_BUCKET)
    : s3OutputKey;

  await s3Client
    .upload({ Body: buffer, Key: s3DestinationKey, Bucket: DESTINATION_BUCKET })
    .promise();

  return { s3DestinationKey, info };
};
