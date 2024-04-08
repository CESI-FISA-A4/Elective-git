require('dotenv').config(); // Load env variables

const { gitRoutes } = require('./src/routes/gitRoutes.js');
const { setupSwagger } = require('./src/utils/swagger');
const { subscribeToApiGateway } = require('./src/utils/registrySubscription');

const fastify = require('fastify')();

// Connect to DB
setupSwagger(fastify);
//subscribeToApiGateway();

/** -------------------------------------------Account------------------------------------------------- */
fastify.register(gitRoutes, { prefix: '/api/git' });

/**--------------------------------------------Start server--------------------------------------------- */
const PORT = process.env.PORT || 3000;
const HOST = process.env.HOST || "localhost";

fastify.listen({ port: PORT, host: HOST }, (err) => {
    if (err) {
        console.error(err);
        process.exit(1);
    }

    console.log(`Server started : ${PORT}`);
})