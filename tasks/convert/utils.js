const { basename } = require('path');

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
/**
 * Take a destination and return a Key that doesn't exist on S3.
 * It can be the given destination or the destination with a number suffix (e.g. folder/filename_2.jpg).
 * @memberof S3Helpers
 *
 * @param {AWS.S3} S3Client
 * @param {string} destination
 * @param {string} bucket
 *
 * @returns {Promise<string>}
 */
module.exports.findNonExistentKey = async (S3Client, destination, bucket = '') => {
  const extension = this.getFileUrlExtension(destination);
  let filename = basename(destination);
  const filenameWithoutExtension = filename.substring(0, filename.length - extension.length - 1);
  const destinationPathWithoutFilename = destination.substring(
    0,
    destination.length - filename.length
  );
  let exists = true;
  let suffix = Date.now();

  while (exists) {
    const { error } = await this.headObject(
      S3Client,
      `${destinationPathWithoutFilename}${filename.toLowerCase()}`,
      bucket
    );
    if (error) {
      exists = false;
    } else {
      filename = `${filenameWithoutExtension}-${suffix.toString(36)}.${extension}`;
      suffix += 1;
    }
  }

  return `${destinationPathWithoutFilename}${filename.toLowerCase()}`;
};

/**
 * Get the object Head from S3.
 * @memberof S3Helpers
 *
 * @param {AWS.S3} S3Client
 * @param {string} key
 * @param {string} bucket
 *
 * @returns {Promise<Object>}
 */
module.exports.headObject = (S3Client, key, bucket = '') =>
  new Promise((resolve) => {
    const params = { Key: key, Bucket: null };
    if (bucket.length) {
      params.Bucket = bucket;
    }
    S3Client.headObject(params, (error, data) => {
      resolve({ data, error });
    });
  });

/**
 * Return a file url extension.
 * @param {string} url
 * @returns {string}
 */
module.exports.getFileUrlExtension = (url = '') => {
  const urlWithoutDomainAndQueryParameters = url.replace(/^.*\/\/[^\/]+/, '').split(/\#|\?/)[0];
  return urlWithoutDomainAndQueryParameters.includes('.')
    ? urlWithoutDomainAndQueryParameters.split('.').pop().toLowerCase()
    : '';
};
