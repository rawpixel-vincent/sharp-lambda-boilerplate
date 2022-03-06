// eslint-disable-next-line
const AWS = require('aws-sdk');
const { sharpConverter } = require('./sharpConverter');

if (typeof process.env.ENVIRONMENT !== 'string' || !process.env.ENVIRONMENT.length) {
  throw new Error(`Invalid ENVIRONMENT ${process.env.ENVIRONMENT}`);
}
if (typeof process.env.REGION !== 'string' || !process.env.REGION.length) {
  throw new Error(`Invalid REGION ${process.env.REGION}`);
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

    let error;
    try {
      await sharpConverter(s3Client, payload);
    } catch (error) {
      console.log(error);
    }
    // sqsClient.sendMessage();
  }

  return {};
};
