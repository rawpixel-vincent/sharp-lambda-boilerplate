// @ts-ignore
// eslint-disable-next-line
const AWS = require('aws-sdk');
const sharp = require('sharp');
const { convertWithSharp, getS3ObjectBuffer } = require('./utils');

/**
 * @param {AWS.S3} s3Client
 * @param {Object} options
 */
module.exports.sharpConverter = async (s3Client, { s3Key }) => {
  const fileBuffer = await getS3ObjectBuffer(s3Client, s3Key, process.env.SOURCE_BUCKET);

  const { buffer, info } = await convertWithSharp(sharp, fileBuffer);
};
