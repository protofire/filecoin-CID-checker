module.exports = {
  /**
   * Application configuration section
   * http://pm2.keymetrics.io/docs/usage/application-declaration/
   */
  apps: [
    // First application
    {
      name: 'cid-checker-backend',
      script: 'index.js',
      instances: 'max',
      exec_mode: 'cluster',
      log_date_format: 'YYYY-MM-DD HH:mm Z',
      env: {
        NODE_ENV: 'production',
        PORT: 4444,
      },
      env_dev: {
        NODE_ENV: 'dev',
        PORT: 4444,
      },
      env_production: {
        NODE_ENV: 'production',
        PORT: 4444,
      },
    },
  ],
}
