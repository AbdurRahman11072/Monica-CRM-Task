import { Client } from 'pg';
import dotenv from 'dotenv';

dotenv.config();

const connectionString = process.env.DATABASE_URL || `postgresql://${process.env.DB_USER}:${process.env.DB_PASSWORD}@${process.env.DB_HOST}:${process.env.DB_PORT}/${process.env.DB_NAME}`;

async function migrate() {
  console.log('Starting PostgreSQL migrations...');

  const isNeon = connectionString.includes('neon.tech');

  // If it's a local database, we make sure it exists. If it's Neon/Cloud DB, we skip database creation.
  if (!isNeon) {
    const systemClient = new Client({
      host: process.env.DB_HOST || '127.0.0.1',
      port: parseInt(process.env.DB_PORT || '5432'),
      user: process.env.DB_USER || 'postgres',
      password: process.env.DB_PASSWORD || '',
      database: 'postgres',
    });

    await systemClient.connect();

    const dbName = process.env.DB_NAME || 'monica_express';
    console.log(`Checking if database "${dbName}" exists...`);
    const checkDbRes = await systemClient.query(
      'SELECT 1 FROM pg_database WHERE datname = $1',
      [dbName]
    );

    if (checkDbRes.rowCount === 0) {
      console.log(`Database "${dbName}" does not exist. Creating it...`);
      await systemClient.query(`CREATE DATABASE "${dbName}"`);
    } else {
      console.log(`Database "${dbName}" already exists.`);
    }
    
    await systemClient.end();
  }

  // Connection to the specific target database
  const dbClient = new Client({
    connectionString,
    ssl: connectionString.includes('sslmode=require') || isNeon 
      ? { rejectUnauthorized: false } 
      : undefined,
  });

  await dbClient.connect();

  console.log('Creating "accounts" table...');
  await dbClient.query(`
    CREATE TABLE IF NOT EXISTS accounts (
      id VARCHAR(36) PRIMARY KEY,
      name VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  console.log('Creating "users" table...');
  await dbClient.query(`
    CREATE TABLE IF NOT EXISTS users (
      id VARCHAR(36) PRIMARY KEY,
      account_id VARCHAR(36) NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
      first_name VARCHAR(255) NOT NULL,
      last_name VARCHAR(255) NOT NULL,
      email VARCHAR(255) UNIQUE NOT NULL,
      password VARCHAR(255) NOT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  console.log('Creating "contacts" table...');
  await dbClient.query(`
    CREATE TABLE IF NOT EXISTS contacts (
      id VARCHAR(36) PRIMARY KEY,
      account_id VARCHAR(36) NOT NULL REFERENCES accounts(id) ON DELETE CASCADE,
      first_name VARCHAR(255) NOT NULL,
      middle_name VARCHAR(255) NULL,
      last_name VARCHAR(255) NULL,
      nickname VARCHAR(255) NULL,
      is_favorite BOOLEAN DEFAULT FALSE,
      personal_note TEXT NULL,
      created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
      updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    );
  `);

  console.log('Migrations completed successfully!');
  await dbClient.end();
}

migrate().catch((error) => {
  console.error('Migration failed:', error);
  process.exit(1);
});
