import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import { sql } from 'drizzle-orm';

const { Pool } = pg;
import * as schema from '@shared/schema';

// Create a PostgreSQL connection pool
const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: process.env.NODE_ENV === 'production'
    ? { rejectUnauthorized: false }
    : false,
  max: 10,
});

// Create a Drizzle instance with the schema
export const db = drizzle(pool, { schema });

// Function to initialize the database with tables
export async function initDb() {
  try {
    console.log('Initializing database...');

    // Test connection
    await pool.query('SELECT NOW()');
    console.log('Database connection successful');

    // Create tables if they don't exist
    await createTables();
    console.log('Database tables initialized');

    return true;
  } catch (error) {
    console.error('Failed to initialize database:', error);
    return false;
  }
}

// Function to create all tables defined in the schema
async function createTables() {
  // We'll use proper migrations via drizzle-kit instead of manually creating tables
  // This is just a placeholder for now to push the schema to the database
  try {
    // Create schema using SQL
    const result = await pool.query(`
      SELECT EXISTS (
        SELECT FROM pg_tables 
        WHERE schemaname = 'public' 
        AND tablename = 'users'
      );
    `);
    
    if (!result.rows[0].exists) {
      console.log('Creating database schema from scratch...');
      // Execute a command to push the schema to the database
      // In a real app, we would run 'npm run db:push' but we'll trigger it directly here
      await executeRawQuery(`
        CREATE TABLE IF NOT EXISTS "users" (
          "id" SERIAL PRIMARY KEY,
          "username" TEXT NOT NULL,
          "password" TEXT NOT NULL,
          "email" TEXT NOT NULL,
          "fullName" TEXT NOT NULL,
          "avatarUrl" TEXT,
          "preferences" JSONB,
          "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
        );
        
        CREATE TABLE IF NOT EXISTS "social_accounts" (
          "id" SERIAL PRIMARY KEY,
          "userId" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
          "platform" TEXT NOT NULL,
          "username" TEXT NOT NULL,
          "displayName" TEXT,
          "profileUrl" TEXT,
          "avatarUrl" TEXT,
          "bio" TEXT,
          "followerCount" INTEGER,
          "followingCount" INTEGER,
          "accessToken" TEXT,
          "refreshToken" TEXT,
          "tokenExpiry" TIMESTAMP WITH TIME ZONE,
          "isActive" BOOLEAN DEFAULT TRUE,
          "isPrimary" BOOLEAN DEFAULT FALSE,
          "lastSynced" TIMESTAMP WITH TIME ZONE,
          "accountCategory" TEXT,
          "verificationStatus" TEXT,
          "accountCreatedAt" TIMESTAMP WITH TIME ZONE,
          "accountHealth" FLOAT,
          "apiVersion" TEXT,
          "webhookUrl" TEXT,
          "scopes" TEXT[]
        );
        
        CREATE TABLE IF NOT EXISTS "posts" (
          "id" SERIAL PRIMARY KEY,
          "userId" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
          "platform" TEXT NOT NULL,
          "socialAccountId" INTEGER REFERENCES "social_accounts"("id") ON DELETE SET NULL,
          "status" TEXT NOT NULL,
          "content" TEXT NOT NULL,
          "mediaUrls" TEXT[],
          "scheduledAt" TIMESTAMP WITH TIME ZONE,
          "publishedAt" TIMESTAMP WITH TIME ZONE,
          "tags" TEXT[],
          "categories" TEXT[],
          "isMonetized" BOOLEAN DEFAULT FALSE,
          "monetizationDetails" JSONB,
          "engagementScore" FLOAT,
          "shadowbanRisk" FLOAT,
          "audienceMatch" FLOAT,
          "aiGenerated" BOOLEAN DEFAULT FALSE,
          "aiPrompt" TEXT,
          "postUrl" TEXT,
          "postAnalysis" JSONB,
          "visibility" TEXT DEFAULT 'public',
          "lastUpdated" TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
          "externalPostId" TEXT
        );
        
        CREATE TABLE IF NOT EXISTS "analytics_data" (
          "id" SERIAL PRIMARY KEY,
          "userId" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
          "date" TIMESTAMP WITH TIME ZONE NOT NULL,
          "platform" TEXT NOT NULL,
          "socialAccountId" INTEGER REFERENCES "social_accounts"("id") ON DELETE SET NULL,
          "postId" INTEGER REFERENCES "posts"("id") ON DELETE SET NULL,
          "likes" INTEGER,
          "comments" INTEGER,
          "shares" INTEGER,
          "saves" INTEGER,
          "clicks" INTEGER,
          "impressions" INTEGER,
          "reach" INTEGER,
          "engagement" INTEGER,
          "engagementRate" FLOAT,
          "followersGained" INTEGER,
          "followersLost" INTEGER,
          "totalFollowers" INTEGER,
          "viewDuration" INTEGER,
          "completionRate" FLOAT,
          "conversionRate" FLOAT, 
          "bouncerate" FLOAT,
          "demographics" JSONB,
          "geographics" JSONB,
          "referrers" JSONB,
          "deviceInfo" JSONB,
          "peakHours" INTEGER[],
          "bestPerforming" BOOLEAN,
          "comparisonToAvg" FLOAT
        );
        
        CREATE TABLE IF NOT EXISTS "engage_activities" (
          "id" SERIAL PRIMARY KEY,
          "userId" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
          "date" TIMESTAMP WITH TIME ZONE NOT NULL,
          "platform" TEXT NOT NULL,
          "type" TEXT NOT NULL,
          "status" TEXT NOT NULL,
          "targetId" TEXT,
          "targetType" TEXT,
          "targetContent" TEXT,
          "response" TEXT
        );
        
        CREATE TABLE IF NOT EXISTS "insights" (
          "id" SERIAL PRIMARY KEY,
          "userId" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
          "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
          "type" TEXT NOT NULL,
          "platform" TEXT,
          "title" TEXT NOT NULL,
          "description" TEXT NOT NULL,
          "priority" INTEGER NOT NULL,
          "isRead" BOOLEAN DEFAULT FALSE,
          "isApplied" BOOLEAN DEFAULT FALSE,
          "expiresAt" TIMESTAMP WITH TIME ZONE,
          "metadata" JSONB
        );
        
        CREATE TABLE IF NOT EXISTS "monetization_records" (
          "id" SERIAL PRIMARY KEY,
          "userId" INTEGER NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
          "date" TIMESTAMP WITH TIME ZONE NOT NULL,
          "platform" TEXT NOT NULL,
          "source" TEXT NOT NULL,
          "sourceType" TEXT,
          "status" TEXT,
          "amount" FLOAT NOT NULL,
          "currency" TEXT,
          "conversionRate" FLOAT,
          "payout" FLOAT,
          "payoutDate" TIMESTAMP WITH TIME ZONE,
          "transactionId" TEXT,
          "paymentMethod" TEXT,
          "taxWithheld" FLOAT,
          "netAmount" FLOAT,
          "postId" INTEGER REFERENCES "posts"("id") ON DELETE SET NULL,
          "campaignName" TEXT,
          "campaignId" TEXT,
          "partnerName" TEXT,
          "partnerId" TEXT,
          "commissionType" TEXT,
          "commissionRate" FLOAT,
          "productName" TEXT,
          "productId" TEXT,
          "productCategory" TEXT,
          "purchaseQuantity" INTEGER,
          "customerType" TEXT,
          "isRecurring" BOOLEAN,
          "isRenewal" BOOLEAN,
          "tags" TEXT[],
          "notes" TEXT,
          "metrics" JSONB
        );
      `);
      console.log('Database schema created successfully');
    } else {
      console.log('Database schema already exists');
    }
  } catch (error) {
    console.error('Error creating database schema:', error);
    throw error;
  }
}

// Function to run a health check
export async function healthCheck() {
  try {
    await pool.query('SELECT 1');
    return true;
  } catch (error) {
    console.error('Database health check failed:', error);
    return false;
  }
}

// Function to safely close the database connection
export async function closeDb() {
  try {
    await pool.end();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error closing database connection:', error);
  }
}

// Execute a raw SQL query
export async function executeRawQuery(query: string, params: any[] = []) {
  try {
    const result = await pool.query(query, params);
    return result.rows;
  } catch (error) {
    console.error('Error executing raw query:', error);
    throw error;
  }
}