module.exports = {
  setupSwagger: async (fastify) => {
    await fastify.register(require('@fastify/swagger'))

    await fastify.register(require('@fastify/swagger-ui'), {
      routePrefix: '/swagger/articles',
      uiConfig: {
        docExpansion: 'full',
        deepLinking: false
      },
      uiHooks: {
        onRequest: function (request, reply, next) { next() },
        preHandler: function (request, reply, next) { next() }
      },
      staticCSP: true,
      transformStaticCSP: (header) => header,
      transformSpecification: (swaggerObject, request, reply) => { return swaggerObject },
      transformSpecificationClone: true
    })

    await fastify.ready()
  }
}