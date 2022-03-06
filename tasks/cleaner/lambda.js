const { exec } = require('promisify-child-process');

module.exports.handler = async () => {
  try {
    const cleanupResult = await exec(
      `find /mnt/tmp -type f -not -path ".nfs*" -not -name ".nfs*" -cmin +30 -delete`,
      {
        // @ts-ignore
        encoding: 'utf8',
      }
    );
    console.log(cleanupResult);
  } catch (error) {
    console.log(error);
  }
  return {};
};
