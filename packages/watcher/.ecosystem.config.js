module.exports = {
  /**
   * Application configuration section
   * http://pm2.keymetrics.io/docs/usage/application-declaration/
   */
  apps: [
    // First application
    {
      name: 'cid-checker-watcher',
      script: 'build/index.js',
      log_date_format: 'YYYY-MM-DD HH:mm Z',
      env: {
        NODE_ENV: 'production',
      },
      env_dev: {
        NODE_ENV: 'dev',
      },
      env_production: {
        NODE_ENV: 'production',
      },
    },
  ],
}
