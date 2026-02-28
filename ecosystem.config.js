export default {
    apps: [
      {
        name: "quoationplatform",
        script: "./server.js",
        env: {
          NODE_ENV: "production",
          PORT: 3000
        }
      }
    ]
  }