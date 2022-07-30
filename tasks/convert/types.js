/**
 * @typedef {import('sharp').OutputOptions | import('sharp').JpegOptions | import('sharp').PngOptions | import('sharp').WebpOptions | import('sharp').AvifOptions | import('sharp').HeifOptions | import('sharp').GifOptions | import('sharp').TiffOptions} SharpOutputOptions
 */

/**
 * @typedef {Object} ConvertTaskOptions
 * @property {import('sharp').SharpOptions} [sharpOptions]
 * @property {import('sharp').ResizeOptions} [resizeOptions=null]
 * @property {boolean} [withMetadata=false]
 * @property {boolean} [rotateFromExifOrientation=false]
 * @property {import('sharp').AvailableFormatInfo} [outputFormat="jpeg"]
 * @property {SharpOutputOptions} [outputOptions]
 */

/**
 * @typedef {Object} InputMessage
 * @property {string} s3InputKey
 * @property {string} s3OutputKey
 * @property {string} [s3OutputACL="private"]
 * @property {boolean} [preventOverride=true]
 * @property {string} outputSqsQueueUrl
 * @property {Object} data - an object passed as is to the outputMessage, useful to trace the origin of the operation
 * @property {ConvertTaskOptions} convertOptions
 */

/**
 * @typedef {Object} OutputMessage
 * @property {string} [s3OutputKey]
 * @property {import('sharp').OutputInfo} [info]
 * @property {Object} data - Passed from inputMessage as is.
 * @property {boolean} success
 * @property {string} [error]
 */

module.exports = {};
