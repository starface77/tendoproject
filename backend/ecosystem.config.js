module.exports = {
  apps: [{
    name: 'tendo-backend',
    script: 'app.js',
    cwd: '/var/www/tendo/backend',
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '1G',
    env: {
      NODE_ENV: 'production',
      PORT: 5000,
      MONGO_URI: 'mongodb://localhost:27017/tendomarketuz',
      JWT_SECRET: 'tendo_market_jwt_secret_2024'
    }
  }]
};
