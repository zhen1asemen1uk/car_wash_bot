module.exports = {
  apps: [
    {
      name: 'Telegram Bot (gCarWash)',
      script: './dist/index.js',
      instances: 'max',
      exec_mode: 'cluster',
      env_production: {
        NODE_ENV: './config/.env.production',
      },
      env_development: {
        NODE_ENV: './config/.env.development',
      },
    },
  ],
};
