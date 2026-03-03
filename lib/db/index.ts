import Database from 'better-sqlite3';
import path from 'path';
import fs from 'fs';
import { initSchema } from './schema';
import { seedData } from './seed';

// In production (Vercel), use /tmp for writable filesystem; locally use ./data
const DB_PATH = process.env.NODE_ENV === 'production'
  ? path.join('/tmp', 'f1predictor.db')
  : path.join(process.cwd(), 'data', 'f1predictor.db');

let db: Database.Database | null = null;

export function getDb(): Database.Database {
  if (db) return db;

  // Ensure data directory exists
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  db = new Database(DB_PATH);
  db.pragma('journal_mode = WAL');
  db.pragma('foreign_keys = ON');

  // Initialize schema and seed data
  initSchema(db);
  seedData(db);

  return db;
}

export default getDb;
