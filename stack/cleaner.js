// @ts-check
const path = require('path');
const { Construct } = require('@aws-cdk/core');
const lambda = require('@aws-cdk/aws-lambda');
const { LambdaFunction } = require('@aws-cdk/aws-events-targets');
const { Rule, Schedule } = require('@aws-cdk/aws-events');
const { SubnetType } = require('@aws-cdk/aws-ec2');
const logs = require('@aws-cdk/aws-logs');

class Cleaner extends Construct {
  constructor(scope, id, vpc, securityGroup, lambdaSettings) {
    super(scope, id);

    const handler = new lambda.DockerImageFunction(this, 'handler', {
      ...lambdaSettings,
      code: lambda.DockerImageCode.fromImageAsset(path.join(__dirname, `../cleaner`)),
      vpc,
      vpcSubnets: { subnetType: SubnetType.PRIVATE_WITH_NAT },
      securityGroups: [securityGroup],
      logRetention: logs.RetentionDays.ONE_MONTH,
    });

    const eventRule = new Rule(this, 'scheduleRule', {
      schedule: Schedule.cron({ minute: '1', hour: '19' }),
    });
    // @ts-ignore
    eventRule.addTarget(new LambdaFunction(handler));
  }
}

module.exports = Cleaner;
