#!/usr/bin/env node

const { Aws } = require('@aws-cdk/core');
const cdk = require('@aws-cdk/core');
const Stack = require('../stack/stack');
const sharpConfig = require('../sharp.json');

const { ENVIRONMENT, CDK_DEFAULT_ACCOUNT } = process.env;

if (typeof ENVIRONMENT !== 'string' || !ENVIRONMENT.length) {
  throw new Error('Missing ENVIRONMENT environment variable');
}

if (!sharpConfig[ENVIRONMENT]) {
  throw new Error(`Missing config key for environment ${ENVIRONMENT} in sharp.json`);
}

const app = new cdk.App();
cdk.Tags.of(app).add('environment', ENVIRONMENT);
new Stack(app, `sharp-${ENVIRONMENT}`, {
  env: { account: CDK_DEFAULT_ACCOUNT, region: Aws.REGION },
});
