module.exports = {
  apps: [
    {
      name: 'angular-ssr',
      script: 'dist/ssr/server/server.mjs', // Path to the server bundle
      exec_mode: 'cluster', // Enable clustering
      env: {
        NODE_ENV: 'production',
        PORT: 4000, // Port for the Angular SSR app
      },
    },
  ],
};
