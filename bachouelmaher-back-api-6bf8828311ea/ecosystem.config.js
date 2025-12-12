module.exports = {
  apps: [{
    name: "node-api",
    script: "npm",
    args: "start",
    autorestart: true,
    watch: false,
    max_memory_restart: "1G",
    env: {
      NODE_ENV: "production"
    }
  }]
};