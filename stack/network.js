// @ts-check
const { Construct } = require('@aws-cdk/core');
const {
  Vpc,
  SubnetType,
  SecurityGroup,
  GatewayVpcEndpointAwsService,
} = require('@aws-cdk/aws-ec2');

const { ENVIRONMENT } = process.env;

class Network extends Construct {
  constructor(scope, id, cidr) {
    super(scope, id);
    this.vpc = new Vpc(this, 'vpc', {
      cidr,
      maxAzs: 1,
      subnetConfiguration: [
        {
          cidrMask: 28,
          name: 'privateSubnet',
          subnetType: SubnetType.PRIVATE_WITH_NAT,
        },
        {
          cidrMask: 28,
          name: 'publicSubnet',
          subnetType: SubnetType.PUBLIC,
        },
      ],
      natGateways: 1,
      gatewayEndpoints: {
        S3: {
          service: GatewayVpcEndpointAwsService.S3,
        },
      },
    });
    this.securityGroup = SecurityGroup.fromSecurityGroupId(
      this,
      'sg',
      this.vpc.vpcDefaultSecurityGroup
    );
  }
}

module.exports = Network;
