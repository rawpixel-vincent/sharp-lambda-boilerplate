/**
 * @typedef {import('sharp').OutputOptions | import('sharp').JpegOptions | import('sharp').PngOptions | import('sharp').WebpOptions | import('sharp').AvifOptions | import('sharp').HeifOptions | import('sharp').GifOptions | import('sharp').TiffOptions} SharpOutputOptions
 */

/**
 * @typedef {Object} ConvertTaskOptions
 * @property {import('sharp').SharpOptions} sharpOptions
 * @property {import('sharp').ResizeOptions} [resizeOptions=null]
 * @property {boolean} [withMetadata=false]
 * @property {boolean} [rotateFromExifOrientation=false]
 * @property {import('sharp').AvailableFormatInfo} [outputFormat="jpeg"]
 * @property {SharpOutputOptions} outputOptions
 */

/**
 * @typedef {Object} InputMessage
 * @property {string} s3InputKey
 * @property {string} s3OutputKey
 * @property {boolean} [preventOverride=true]
 * @property {string} outputSqsQueueUrl
 * @property {Object} data
 * @property {ConvertTaskOptions} convertOptions
 */

/**
 * @typedef {Object} OutputMessage
 * @property {string} [s3OutputKey]
 * @property {import('sharp').OutputInfo} [info]
 * @property {Object} data
 * @property {boolean} success
 * @property {string} [error]
 */

module.exports = {};
