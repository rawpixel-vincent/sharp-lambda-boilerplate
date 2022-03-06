/**
 * @param {import('sharp')} sharp
 * @param {Buffer} buffer
 * @param {import('./types').ConvertTaskOptions} convertOptions
 */
module.exports.convertWithSharp = (sharp, buffer, convertOptions) =>
  new Promise((resolve, reject) => {
    const {
      sharpOptions = null,
      resizeOptions = null,
      withMetadata = false,
      rotateFromExifOrientation = true,
      outputFormat = sharp.format.jpeg,
      outputOptions = null,
    } = convertOptions;

    const image = sharp(buffer, {
      limitInputPixels: 2147483648, // 2048mb
      failOnError: false,
      ...sharpOptions,
    });

    if (withMetadata) {
      image.withMetadata();
    }

    if (resizeOptions) {
      image.resize(resizeOptions);
    }

    if (rotateFromExifOrientation) {
      image.rotate();
    }

    image.toFormat(outputFormat, outputOptions);

    image.toBuffer((err, buffer, info) => {
      if (err) {
        reject(err);
      } else {
        resolve({ buffer, info });
      }
    });
  });

/**
 * @param {AWS.S3} s3Client
 * @param {string} s3Key
 * @param {string} bucket
 * @returns {Promise<Buffer>}
 */
module.exports.getS3ObjectBuffer = async (s3Client, s3Key, bucket) => {
  const { Body } = await s3Client.getObject({ Key: s3Key, Bucket: bucket }).promise();
  // @ts-ignore
  return Body;
};
