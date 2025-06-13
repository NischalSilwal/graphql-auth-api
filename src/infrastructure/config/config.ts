import dotenv from 'dotenv';

dotenv.config();

// Validate required environment variables
const requiredEnvVars = [
  'SMTP_USER',
  'SMTP_PASS',
  'FROM_EMAIL',
  'JWT_ACCESS_SECRET',
  'JWT_REFRESH_SECRET',
];

requiredEnvVars.forEach((varName) => {
  if (!process.env[varName]) {
    throw new Error(`Missing required environment variable: ${varName}`);
  }
});

interface Config {
  port: number;
  nodeEnv: string;
  database: {
    host: string;
    port: number;
    name: string;
    user: string;
    password: string;
  };
  jwt: {
    accessSecret: string;
    refreshSecret: string;
    accessExpiry: string;
    refreshExpiry: string;
  };
  email: {
    host: string;
    port: number;
    user: string;
    password: string;
    from: string;
    fromName: string;
  };
  urls: {
    client: string;
    api: string;
  };
}

export const config: Config = {
  port: parseInt(process.env.PORT || '4000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  database: {
    host: process.env.DB_HOST || 'localhost',
    port: parseInt(process.env.DB_PORT || '3307', 10),
    name: process.env.DB_NAME || 'auth_db',
    user: process.env.DB_USER || 'auth_user',
    password: process.env.DB_PASSWORD || 'auth_password',
  },
  jwt: {
  accessSecret: process.env.JWT_ACCESS_SECRET!, // Non-null assertion if validated
  refreshSecret: process.env.JWT_REFRESH_SECRET!, // Non-null assertion if validated
  accessExpiry: process.env.JWT_ACCESS_EXPIRY || '15m',
  refreshExpiry: process.env.JWT_REFRESH_EXPIRY || '7d',
},
  email: {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    user: process.env.SMTP_USER as string,
    password: process.env.SMTP_PASS as string,
    from: process.env.FROM_EMAIL as string,
    fromName: process.env.FROM_NAME || 'Auth API',
  },
  urls: {
    client: process.env.CLIENT_URL || 'http://localhost:3000',
    api: process.env.API_URL || 'http://localhost:4000',
  },
};