import express, { Application } from 'express';
import { ApolloServer } from 'apollo-server-express';
import cors from 'cors';
import helmet from 'helmet';
import rateLimit from 'express-rate-limit';
import Database from './config/database';
import { config } from './config/config';
import { typeDefs } from './schema/typeDefs';
import { resolvers } from './schema/resolvers';
import { getContext } from './middleware/auth';
import verificationRoutes from './routes/verification';
import dotenv from 'dotenv';

async function startServer(): Promise<void> {
  try {
    // Connect to database
    const db = Database.getInstance();
    await db.connect();

    // Create Express app
    const app: Application = express();

    // Security middleware (consolidated)
    app.use(helmet({
      contentSecurityPolicy: config.nodeEnv === 'production' ? undefined : false,
      crossOriginEmbedderPolicy: config.nodeEnv === 'production' ? undefined : false, // Disable COEP in development
    }));
    dotenv.config();

    // CORS
    app.use(cors({
      origin: config.urls.client,
      credentials: true,
    }));

    // Rate limiting
    const limiter = rateLimit({
      windowMs: 15 * 60 * 1000, // 15 minutes
      max: 100, // limit each IP to 100 requests per windowMs
      message: 'Too many requests from this IP, please try again later.',
    });
    app.use(limiter);

    // Body parser
    app.use(express.json({ limit: '10mb' }));
    app.use(express.urlencoded({ extended: true }));

    // Routes
    app.use('/', verificationRoutes);

    // Health check
    app.get('/health', (req, res) => {
      res.json({ status: 'OK', timestamp: new Date().toISOString() });
    });

    // Create Apollo Server
    const server = new ApolloServer({
      typeDefs,
      resolvers,
      context: getContext,
      introspection: config.nodeEnv !== 'production',
      debug: config.nodeEnv !== 'production',
      formatError: (error) => {
        console.error('GraphQL Error:', error);
        return {
          message: error.message,
          code: error.extensions?.code,
          path: error.path,
        };
      },
    });

    // Start the server
    await server.start();
    server.applyMiddleware({ app: app as import('apollo-server-express').ExpressContext['req']['app'], path: '/graphql' });

    // Start listening
    app.listen(config.port, () => {
      console.log(`🚀 Server running at http://localhost:${config.port}`);
      console.log(`📊 GraphQL endpoint: http://localhost:${config.port}${server.graphqlPath}`);
      console.log(`🏥 Health check: http://localhost:${config.port}/health`);
      console.log(`📧 Verification endpoint: http://localhost:${config.port}/verify-email`);
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      console.log('\n🛑 Shutting down gracefully...');
      await db.disconnect();
      process.exit(0);
    });

    process.on('SIGTERM', async () => {
      console.log('\n🛑 Shutting down gracefully...');
      await db.disconnect();
      process.exit(0);
    });

  } catch (error) {
    console.error('❌ Failed to start server:', error);
    process.exit(1);
  }
}

// Start the application
startServer().catch((error) => {
  console.error('❌ Unhandled error during startup:', error);
  process.exit(1);
});