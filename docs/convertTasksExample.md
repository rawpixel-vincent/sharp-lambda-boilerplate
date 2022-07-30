# Convert task usage example

### Example 1

**Convert a tif to jpeg**

```javascript
const { SQS } = require('aws-sdk');
const sqsClient = new AWS.SQS({ region: region });

/**
 * @type {import("../tasks/convert/types").InputMessage}
 */
const inputMessageUsingDefault= {
  data: { id: 'bru' },
  s3InputKey: 'input/test.tif',
  s3OutputKey: 'output/test.jpg',
  preventOverride: true,
  outputSqsQueueUrl:
    `https://sqs.${region}.amazonaws.com/${account}/sharp-convert-${ENVIRONMENT}-result`,
  convertOptions: {},
};

await sqsClient
  .sendMessage({
    QueueUrl: `https://sqs.${region}.amazonaws.com/${account}/sharp-convert-${ENVIRONMENT}`,
    MessageBody: JSON.stringify(inputMessageUsingDefault),
  })
  .promise();

```

### Example 2

**Convert and resize tif to a compressed jpeg including metadata**

```javascript
const { SQS } = require('aws-sdk');
const sqsClient = new AWS.SQS({ region: region });

/**
 * @type {import("../tasks/convert/types").InputMessage}
 */
const inputMessageFewOptions = {
  data: { id: 'bru' },
  s3InputKey: 'input/test.tif',
  s3OutputKey: 'output/test.jpg',
  s3OutputACL: 'private',
  preventOverride: true,
  outputSqsQueueUrl:
    `https://sqs.${region}.amazonaws.com/${account}/sharp-convert-${ENVIRONMENT}-result`,
  convertOptions: {
    outputFormat: require('sharp').format.jpeg,
    resizeOptions: { width: 1000, quality: 90 },
    withMetadata: true,
  },
};

await sqsClient
  .sendMessage({
    QueueUrl: `https://sqs.${region}.amazonaws.com/${account}/sharp-convert-${ENVIRONMENT}`,
    MessageBody: JSON.stringify(inputMessageUsingDefault),
  })
  .promise();
```

### Example 3

**Convert and resize tif to a png including metadata and fixing orientation from the exif data**


```javascript
const { SQS } = require('aws-sdk');
const sqsClient = new AWS.SQS({ region: region });

/**
 * @type {import("../tasks/convert/types").InputMessage}
 */
const inputMessageFullOptions = {
  data: { id: 'bru' },
  s3InputKey: 'input/test.tif',
  s3OutputKey: 'output/test.jpg',
  s3OutputACL: 'private',
  preventOverride: true,
  outputSqsQueueUrl:
    `https://sqs.${region}.amazonaws.com/${account}/sharp-convert-${ENVIRONMENT}-result`,
  convertOptions: {
    outputFormat: require('sharp').format.png,
    resizeOptions: { width: 1000 },
    withMetadata: true,
    rotateFromExifOrientation: true,
    outputOptions: {
      quality: 100,
    },
  },
};

await sqsClient
  .sendMessage({
    QueueUrl: `https://sqs.${region}.amazonaws.com/${account}/sharp-convert-${ENVIRONMENT}`,
    MessageBody: JSON.stringify(inputMessageUsingDefault),
  })
  .promise();
```
