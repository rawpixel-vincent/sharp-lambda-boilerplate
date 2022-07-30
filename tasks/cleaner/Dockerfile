FROM --platform=linux/arm64 public.ecr.aws/lambda/nodejs:14

ENV TMPDIR=/mnt/tmp

# Copy function code
COPY package.json ${LAMBDA_TASK_ROOT}
RUN cd ${LAMBDA_TASK_ROOT} && npm install && cd -
COPY lambda.js ${LAMBDA_TASK_ROOT}


CMD ["lambda.handler"]