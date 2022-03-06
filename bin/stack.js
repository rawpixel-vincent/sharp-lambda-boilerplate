#!/usr/bin/env node

const { Aws } = require('@aws-cdk/core');
const cdk = require('@aws-cdk/core');
const Stack = require('../stack/stack');

const { ENVIRONMENT, CDK_DEFAULT_ACCOUNT } = process.env;

const app = new cdk.App();
cdk.Tags.of(app).add('environment', ENVIRONMENT);
new Stack(app, `sharp-${ENVIRONMENT}`, {
  env: { account: CDK_DEFAULT_ACCOUNT, region: Aws.REGION },
});
