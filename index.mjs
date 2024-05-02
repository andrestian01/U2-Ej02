import { makeExecutableSchema } from '@graphql-tools/schema';
import { ApolloServer } from 'apollo-server-express';
import express from 'express';
import { readFileSync } from 'fs';
import { execute, subscribe } from 'graphql';
import { PubSub } from 'graphql-subscriptions';
import { createServer } from 'http';
import { SubscriptionServer } from 'subscriptions-transport-ws';
import { resolvers } from './resolvers.mjs';

// Lee el esquema GraphQL
const typeDefs = readFileSync('./schema.graphql', 'utf8');

// Crea una instancia de PubSub
const pubsub = new PubSub();

// Crea el esquema ejecutable
const schema = makeExecutableSchema({
  typeDefs,
  resolvers,
});

// Configura el servidor Apollo GraphQL con Express
const app = express();
const apolloServer = new ApolloServer({
  schema,
  context: { pubsub },
});

// Inicia el servidor Apollo
async function startApolloServer() {
  await apolloServer.start();
  apolloServer.applyMiddleware({ app, path: '/graphql' });

  // Manejador de ruta para la página principal
  app.get('/', (req, res) => {
    res.send('Welcome to my GraphQL server. Access GraphQL Playground at /graphql');
  });

  // Inicia el servidor HTTP para Apollo GraphQL
  const httpServer = createServer(app);
  const PORT_APOLLO = process.env.PORT_APOLLO || 4000;
  httpServer.listen(PORT_APOLLO, () => {
    console.log(`Apollo Server ready at http://localhost:${PORT_APOLLO}/graphql`);
  });

  // Configura el servidor de suscripciones
  const subscriptionServer = SubscriptionServer.create(
    {
      schema,
      execute,
      subscribe,
    },
    {
      server: httpServer,
      path: '/graphql',
    }
  );

  console.log(`Subscription server ready at ws://localhost:${PORT_APOLLO}/graphql`);
}

startApolloServer();
