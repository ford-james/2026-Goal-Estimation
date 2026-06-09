const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, 'data', 'worldcup.db');
const db = new sqlite3.Database(dbPath);

// Initialize database
db.serialize(() => {
  // Users table
  db.run(`CREATE TABLE IF NOT EXISTS users (
    id TEXT PRIMARY KEY,
    name TEXT NOT NULL,
    display_name TEXT NOT NULL,
    avatar_color TEXT NOT NULL
  )`);

  // Predictions table - NEW SCHEMA for per-match predictions
  db.run(`CREATE TABLE IF NOT EXISTS predictions (
    id TEXT PRIMARY KEY,
    user_id TEXT NOT NULL,
    match_id TEXT NOT NULL,
    predicted_goals INTEGER NOT NULL,
    actual_goals INTEGER,
    points INTEGER DEFAULT 0,
    submitted_at TEXT NOT NULL,
    locked INTEGER DEFAULT 0,
    UNIQUE(user_id, match_id)
  )`);

  // Matches table - with match_time for locking
  db.run(`CREATE TABLE IF NOT EXISTS matches (
    id TEXT PRIMARY KEY,
    match_date TEXT NOT NULL,
    match_time TEXT NOT NULL,
    home_team TEXT NOT NULL,
    away_team TEXT NOT NULL,
    home_score INTEGER,
    away_score INTEGER,
    status TEXT DEFAULT 'scheduled'
  )`);

  // Seed users - IBM Team
  const users = [
    ['user_001', 'Simon White', 'Simon W', '#0f62fe'],
    ['user_002', 'Paul Forshaw', 'Paul F', '#8a3ffc'],
    ['user_003', 'Neal Patel', 'Neal', '#33b1ff'],
    ['user_004', 'Martin Young', 'Martin', '#007d79'],
    ['user_005', 'Anton Opperman', 'Anton', '#ff7eb6'],
    ['user_006', 'Celine Carlier', 'Celine', '#fa4d56'],
    ['user_007', 'Charles Jewson', 'Charles', '#fff1f1'],
    ['user_008', 'Gary Johnston', 'Gary', '#6fdc8c'],
    ['user_009', 'James Ford', 'James', '#4589ff'],
    ['user_010', 'Paul Ford-Hutchinson', 'Paul FH', '#d12771'],
    ['user_011', 'Kenny Lee-Shim', 'Kenny', '#08bdba'],
    ['user_012', 'Simon Walker', 'Simon W', '#bae6ff'],
    ['user_013', 'Caroline Lundie', 'Caroline', '#d2a106'],
    ['user_014', 'Eric Vervoort', 'Eric', '#a56eff'],
    ['user_015', 'Safe Kaysir', 'Safe', '#009d9a'],
    ['user_016', 'Faith Ogundimu', 'Faith', '#ee5396']
  ];

  const userStmt = db.prepare('INSERT OR IGNORE INTO users VALUES (?, ?, ?, ?)');
  users.forEach(user => userStmt.run(user));
  userStmt.finalize();

  // Load matches from JSON
  const matches = require('./data/matches.json');
  const matchStmt = db.prepare('INSERT OR IGNORE INTO matches (id, match_date, match_time, home_team, away_team) VALUES (?, ?, ?, ?, ?)');
  matches.forEach(m => matchStmt.run(m.id, m.match_date, m.match_time, m.home_team, m.away_team));
  matchStmt.finalize();

  console.log('Database initialized successfully');
});

module.exports = db;

// Made with Bob
