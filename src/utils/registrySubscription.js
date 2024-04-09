const axios = require("axios");

module.exports = {
    subscribeToApiGateway: async() => {
        try {
            const response = await axios({
                method: "POST",
                baseURL: `http://${process.env.GATEWAY_HOST}:${process.env.GATEWAY_PORT}`,
                url: `/registry/services`,
                headers: { 'Content-Type': 'application/json' },
                data: {
                    serviceIdentifier: "git-service",
                    serviceLabel: "Service Git",
                    host: process.env.HOST,
                    port: process.env.PORT,
                    entrypointUrl: "/api/git",
                    redirectUrl: "/api/git",
                    routeProtections: [
                        { methods: ["GET"], route: "/", roles: ["developer", "technician",  "admin"] },
                        { methods: ["GET"], route: "/:repo", roles: ["developer", "technician", "admin"] },
                        { methods: ["GET"], route: "/:repo/:branch", roles: ["developer", "technician", "admin"] },
                        { methods: ["GET", "PUT"], route: "/:repo/:branch/*", roles: ["developer", "technician", "admin"] },
                        { methods: ["GET"], route: "/download/:repo/:branch/*", roles: ["developer", "technician", "admin"] },
                    ]
                }
            });
        } catch (error) {
            console.log(error);
        }
    }
}