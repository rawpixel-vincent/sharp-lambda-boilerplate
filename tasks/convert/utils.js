/**
 * @param {import('sharp')} sharp
 * @param {Buffer} buffer
 * @param {import('sharp').SharpOptions} [sharpOptions=null]
 * @param {import("sharp").ResizeOptions} [resizeOptions=null]
 * @param {boolean} [withMetadata=false]
 * @param {boolean} [rotateFromExifOrientation=true]
 * @param {import('sharp').AvailableFormatInfo} format
 * @param {import('sharp').OutputOptions | import('sharp').JpegOptions | import('sharp').PngOptions | import('sharp').WebpOptions | import('sharp').AvifOptions | import('sharp').HeifOptions | import('sharp').GifOptions | import('sharp').TiffOptions} [outputOptions=null]
 * @returns {Promise<{buffer:Buffer, info:import('sharp').OutputInfo}>}
 */
module.exports.convertWithSharp = (
  sharp,
  buffer,
  sharpOptions = null,
  resizeOptions = null,
  withMetadata = false,
  rotateFromExifOrientation = true,
  format = sharp.format.jpeg,
  outputOptions = null
) =>
  new Promise((resolve, reject) => {
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

    image.toFormat(format, outputOptions);

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
