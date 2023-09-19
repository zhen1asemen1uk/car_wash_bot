module.exports = {
  apps: [
    {
      name: 'Telegram Bot (gCarWash)',
      script: './dist/index.js',
      watch: false,
      instances: 'max',
      exec_mode: 'cluster',
      env: {
        NODE_ENV: '../development',
      },
      env_production: {
        NODE_ENV: '../production',
      },
      env_development: {
        NODE_ENV: '../development',
      },
    },
  ],
};
