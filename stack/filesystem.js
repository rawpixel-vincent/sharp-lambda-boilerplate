// @ts-check
const { Construct, RemovalPolicy } = require('@aws-cdk/core');
const efs = require('@aws-cdk/aws-efs');

class FileSystem extends Construct {
  constructor(scope, id, vpc) {
    super(scope, id);

    this.filesystem = new efs.FileSystem(this, 'FileSystem', {
      vpc,
      removalPolicy: RemovalPolicy.DESTROY,
      lifecyclePolicy: efs.LifecyclePolicy.AFTER_7_DAYS,
      performanceMode: efs.PerformanceMode.MAX_IO,
    });

    this.accessPoint = this.filesystem.addAccessPoint('AccessPoint', {
      createAcl: {
        ownerGid: '1001',
        ownerUid: '1001',
        permissions: '755',
      },
      path: '/export/lambda',
      posixUser: {
        gid: '1001',
        uid: '1001',
      },
    });
  }
}

module.exports = FileSystem;
