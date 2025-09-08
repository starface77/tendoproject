module.exports = {
  apps: [
    {
      name: 'tendo-backend',
      script: './backend/app.js',
      cwd: '/var/www/tendo',
      instances: 1,
      exec_mode: 'fork',
      autorestart: true,
      watch: false,
      max_memory_restart: '1G',
      env: {
        NODE_ENV: 'production',
        PORT: 5000,
        MONGO_URI: 'mongodb://localhost:27017/tendomarketuz',
        JWT_SECRET: 'tendo_market_production_jwt_secret_key_2024_super_secure_change_this',
        CLIENT_URL: 'https://tendo.uz',
        ADMIN_FRONTEND_URL: 'https://admin.tendo.uz',
        HTTPS_ENABLED: 'true',
        SSL_CERT_PATH: '/etc/letsencrypt/live/tendo.uz/fullchain.pem',
        SSL_KEY_PATH: '/etc/letsencrypt/live/tendo.uz/privkey.pem'
      },
      error_file: '/var/log/pm2/tendo-backend.error.log',
      out_file: '/var/log/pm2/tendo-backend.out.log',
      log_file: '/var/log/pm2/tendo-backend.log',
      time: true,
      log_date_format: 'YYYY-MM-DD HH:mm:ss Z',
      merge_logs: true,
      kill_timeout: 5000,
      listen_timeout: 8000,
      restart_delay: 4000,
      max_restarts: 10,
      min_uptime: '10s'
    }
  ],
  
  deploy: {
    production: {
      user: 'root',
      host: ['YOUR_VPS_IP'],
      ref: 'origin/main',
      repo: 'https://github.com/starface77/tendo.git',
      path: '/var/www/tendo',
      'post-deploy': 'npm install --production && pm2 reload ecosystem.config.js --env production && pm2 save',
      'pre-setup': 'mkdir -p /var/www/tendo'
    }
  }
};


