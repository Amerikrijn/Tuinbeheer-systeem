#!/usr/bin/env node
'use strict';

const fs = require('fs');
const path = require('path');
require('dotenv').config();
const { Client } = require('pg');

async function main() {
  const sqlFilePathArg = process.argv[2];
  if (!sqlFilePathArg) {
    console.error('Usage: node scripts/run-sql-file.js <path-to-sql-file>');
    process.exit(1);
  }

  const sqlFilePath = path.resolve(sqlFilePathArg);
  if (!fs.existsSync(sqlFilePath)) {
    console.error(`SQL file not found: ${sqlFilePath}`);
    process.exit(1);
  }

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) {
    console.error('DATABASE_URL is not set. Please export it or add it to a .env file.');
    process.exit(1);
  }

  const sql = fs.readFileSync(sqlFilePath, 'utf8');

  const client = new Client({
    connectionString: databaseUrl,
    ssl: { rejectUnauthorized: false },
  });

  try {
    await client.connect();
    await client.query('BEGIN');
    await client.query(sql);
    await client.query('COMMIT');
    console.log(`Executed SQL from: ${sqlFilePath}`);
  } catch (error) {
    await client.query('ROLLBACK').catch(() => {});
    console.error('Failed to execute SQL:', error.message);
    process.exitCode = 1;
  } finally {
    await client.end().catch(() => {});
  }
}

main();