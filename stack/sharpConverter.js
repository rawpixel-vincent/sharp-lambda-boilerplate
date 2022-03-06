// @ts-check
const path = require('path');
const { Construct, Duration, Aws } = require('@aws-cdk/core');
const lambda = require('@aws-cdk/aws-lambda');
const iam = require('@aws-cdk/aws-iam');
const sqs = require('@aws-cdk/aws-sqs');
const { SqsEventSource } = require('@aws-cdk/aws-lambda-event-sources');
const { SubnetType } = require('@aws-cdk/aws-ec2');
const logs = require('@aws-cdk/aws-logs');

const { ENVIRONMENT } = process.env;

class SharpConverter extends Construct {
  constructor(scope, id, vpc, securityGroup, accessPoint, sourceBucket, destinationBucket) {
    super(scope, id);
    /** @typedef {import('@aws-cdk/aws-lambda').FunctionProps} */
    const lambdaBaseConfig = {
      memorySize: 2048,
      runtime: lambda.Runtime.NODEJS_14_X,
      handler: 'lambda.handler',
      architecture: lambda.Architecture.ARM_64,
      environment: {
        SOURCE_BUCKET: sourceBucket,
        DESTINATION_BUCKET: destinationBucket,
        REGION: Aws.REGION,
        ENVIRONMENT: ENVIRONMENT,
        AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
        VIPS_DISC_THRESHOLD: `2000m`,
        TMP: '/mnt/tmp',
      },
      timeout: Duration.minutes(5),
      filesystem: lambda.FileSystem.fromEfsAccessPoint(accessPoint, '/mnt/tmp'),
      code: lambda.AssetCode.fromAsset(path.join(__dirname, `../tasks/convert`), {
        bundling: {
          image: lambda.Runtime.NODEJS_14_X.bundlingImage,
          environment: {
            npm_config_cache: '/tmp/npm_cache',
            npm_config_update_notifier: 'false',
            TMP: '/tmp',
          },

          command: [
            'sh',
            '-c',
            [
              'npm install --arch=arm64 --platform=linux --production',
              'cp -r ./* /asset-output/',
            ].join(' && '),
          ],
        },
      }),
      vpc,
      vpcSubnets: { subnetType: SubnetType.PRIVATE_WITH_NAT },
      securityGroups: [securityGroup],
      logRetention: logs.RetentionDays.ONE_MONTH,
    };

    const handler = createLambdaFunction(
      this,
      'handler',
      { ...lambdaBaseConfig },
      destinationBucket,
      sourceBucket
    );

    const handlerFailed = createLambdaFunction(
      this,
      'handler-failed',
      {
        ...lambdaBaseConfig,
        memorySize: 4096,
        environment: {
          ...lambdaBaseConfig.environment,
          VIPS_DISC_THRESHOLD: `4000m`,
        },
      },
      destinationBucket,
      sourceBucket
    );

    const deadLetterQueue = new sqs.Queue(this, 'deadQueue', {
      queueName: `sharp-convert-${ENVIRONMENT}-dead`,
      retentionPeriod: Duration.days(7),
      visibilityTimeout: lambdaBaseConfig.timeout,
    });
    const FailedQueue = new sqs.Queue(this, 'failedQueue', {
      queueName: `sharp-convert-failed-${ENVIRONMENT}`,
      retentionPeriod: Duration.hours(12),
      visibilityTimeout: lambdaBaseConfig.timeout,
      deadLetterQueue: { queue: deadLetterQueue, maxReceiveCount: 3 },
    });
    const queue = new sqs.Queue(this, 'queue', {
      queueName: `sharp-convert-${ENVIRONMENT}`,
      retentionPeriod: Duration.hours(12),
      visibilityTimeout: lambdaBaseConfig.timeout,
      deadLetterQueue: { queue: FailedQueue, maxReceiveCount: 1 },
    });

    handler.addEventSource(
      new SqsEventSource(queue, {
        batchSize: 1,
      })
    );
    handlerFailed.addEventSource(
      new SqsEventSource(FailedQueue, {
        batchSize: 1,
      })
    );
  }
}

const createLambdaFunction = (scope, name, config, destinationBucket, sourceBucket) => {
  const buckets = [sourceBucket, destinationBucket];
  const handler = new lambda.Function(scope, name, config);
  handler.role.addToPrincipalPolicy(
    new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      resources: buckets.map((b) => `arn:aws:s3:::${b}`),
      actions: [
        's3:ListBucket',
        's3:ListAllMyBuckets',
        's3:GetBucketLocation',
        's3:ListBucketMultipartUploads',
      ],
    })
  );
  handler.role.addToPrincipalPolicy(
    new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      resources: buckets.map((b) => `arn:aws:s3:::${b}/*`),
      actions: ['s3:GetObject'],
    })
  );
  handler.role.addToPrincipalPolicy(
    new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      resources: [`arn:aws:s3:::${destinationBucket}/*`],
      actions: [
        's3:PutObject',
        's3:PutObjectAcl',
        's3:AbortMultipartUpload',
        's3:ListMultipartUploadParts',
      ],
    })
  );
  handler.role.addToPrincipalPolicy(
    new iam.PolicyStatement({
      effect: iam.Effect.ALLOW,
      resources: ['*'],
      actions: ['sqs:*'],
    })
  );

  return handler;
};

module.exports = SharpConverter;
