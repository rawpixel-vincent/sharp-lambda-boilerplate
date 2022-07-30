// eslint-disable-next-line
const AWS = require('aws-sdk');
const { sharpConverter } = require('./sharpConverter');

if (typeof process.env.ENVIRONMENT !== 'string' || !process.env.ENVIRONMENT.length) {
  throw new Error(`Invalid ENVIRONMENT ${process.env.ENVIRONMENT}`);
}
if (typeof process.env.REGION !== 'string' || !process.env.REGION.length) {
  throw new Error(`Invalid REGION ${process.env.REGION}`);
}
if (typeof process.env.SOURCE_BUCKET !== 'string' || !process.env.SOURCE_BUCKET.length) {
  throw new Error(`Invalid SOURCE_BUCKET ${process.env.SOURCE_BUCKET}`);
}
if (typeof process.env.DESTINATION_BUCKET !== 'string' || !process.env.DESTINATION_BUCKET.length) {
  throw new Error(`Invalid DESTINATION_BUCKET ${process.env.DESTINATION_BUCKET}`);
}

const sqsClient = new AWS.SQS({ region: process.env.REGION });
const s3Client = new AWS.S3({
  region: process.env.REGION,
  endpoint: `https://s3.${process.env.REGION}.amazonaws.com`,
  httpOptions: { timeout: 60 * 3 * 1000 },
  logger: console,
  maxRetries: 50,
});

module.exports.handler = async (event, context) => {
  const records = event.Records.map(({ body, ...message }) => ({
    ...message,
    ...JSON.parse(body),
  }));

  for (let i = 0; i < records.length; i += 1) {
    const payload = records[i];

    /** @type {import('./types').OutputMessage} */
    const message = { data: payload.data, success: null };
    try {
      const { info, s3DestinationKey } = await sharpConverter(s3Client, payload);
      message.s3OutputKey = s3DestinationKey;
      message.info = info;
      message.success = true;
    } catch (error) {
      console.error(error);
      message.success = false;
      message.error = error?.message || 'an unexpected error happened';
    }
    await sqsClient
      .sendMessage({
        QueueUrl: payload.outputSqsQueueUrl,
        MessageBody: JSON.stringify(message),
      })
      .promise();
  }

  return {};
};
