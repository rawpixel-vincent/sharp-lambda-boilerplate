const cdk = require('@aws-cdk/core');
const lambda = require('@aws-cdk/aws-lambda');
const { Duration, Aws } = require('@aws-cdk/core');
const Network = require('./network');
const FileSystem = require('./filesystem');
const Cleaner = require('./cleaner');
const SharpConverter = require('./sharpConverter');
const sharpConfig = require('../sharp.json');

const { ENVIRONMENT } = process.env;

class Stack extends cdk.Stack {
  /**
   *
   * @param {cdk.Construct} scope
   * @param {string} id
   * @param {cdk.StackProps=} props
   */
  constructor(scope, id, props) {
    super(scope, id, props);
    const config = {
      ...sharpConfig.global,
      ...(sharpConfig[ENVIRONMENT] ? sharpConfig[ENVIRONMENT] : {}),
    };

    const { vpc, securityGroup } = new Network(this, 'network', config.cidr);
    const { accessPoint } = new FileSystem(this, 'fs1a', vpc);

    // Sharp Converter
    new SharpConverter(
      this,
      `sharp-converter`,
      vpc,
      securityGroup,
      accessPoint,
      config.sourceBucket,
      config.destinationBucket
    );

    new Cleaner(this, `cleaner`, vpc, securityGroup, {
      memorySize: 512,
      architecture: lambda.Architecture.ARM_64,
      environment: {
        REGION: 'ap-southeast-1',
        ENVIRONMENT: ENVIRONMENT,
        AWS_NODEJS_CONNECTION_REUSE_ENABLED: '1',
      },
      timeout: Duration.minutes(15),
      filesystem: lambda.FileSystem.fromEfsAccessPoint(accessPoint, '/mnt/tmp'),
    });
  }
}

module.exports = Stack;
