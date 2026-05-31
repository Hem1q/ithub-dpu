module.exports = {
  apps: [{
    name: 'ithub',
    script: 'dist/index.cjs',
    env: {
      NODE_ENV: 'production',
      PORT: 3000,
      DATABASE_URL: 'postgresql://pavlushenko@/ithub_db?host=/var/run/postgresql&port=5433',
      SESSION_SECRET: 'ithub_dpu_secret_2026'
    },
    instances: 1,
    autorestart: true,
    watch: false,
    max_memory_restart: '500M'
  }]
}
