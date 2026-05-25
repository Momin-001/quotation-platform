module.exports = {
    apps: [
        {
            name: "quotation-next",
            script: "node_modules/next/dist/bin/next",
            args: "start",
            env: {
                NODE_ENV: "production",
                PORT: 3000,
            },
        },
        {
            name: "quotation-socket",
            script: "./socket-server/index.js",
            env: {
                NODE_ENV: "production",
                SOCKET_PORT: 3001,
            },
        },
    ],
};
