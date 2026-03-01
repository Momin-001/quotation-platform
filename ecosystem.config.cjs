module.exports = {
    apps: [
      {
        name: "quotationplatform",
        script: "./server.js",
        env: {
          NODE_ENV: "production",
          PORT: 3000
        }
      }
    ]
  }