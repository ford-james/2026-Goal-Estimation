# Match Schedule Management Guide

## 📅 How Match Scheduling Works

### Current System

The application determines which matches are scheduled for each day based on the `match_date` field in the database.

## 🗄️ Where Matches Are Stored

### 1. Initial Data File
**Location:** `backend/data/matches.json`

This file contains the initial match schedule that gets loaded into the database when the backend starts.

**Current Sample Data:**
```json
[
  {
    "id": "match_001",
    "match_date": "2026-06-11",
    "home_team": "USA",
    "away_team": "MEX"
  },
  {
    "id": "match_002",
    "match_date": "2026-06-11",
    "home_team": "CAN",
    "away_team": "JAM"
  }
]
```

### 2. Database
**Location:** `backend/data/worldcup.db`

Once the backend starts, matches are stored in the SQLite database in the `matches` table.

## 🔍 How the Dashboard Finds Today's Matches

### Frontend (Dashboard.jsx)
```javascript
const today = new Date().toISOString().split('T')[0];  // Gets "2026-06-11"
const matches = await api.getMatches(today);           // Fetches matches for today
```

### Backend API (routes.js)
```javascript
router.get('/matches/:date', (req, res) => {
  db.all(
    'SELECT * FROM matches WHERE match_date = ? ORDER BY id',
    [req.params.date],  // e.g., "2026-06-11"
    (err, rows) => {
      res.json(rows);
    }
  );
});
```

### Database Query
```sql
SELECT * FROM matches 
WHERE match_date = '2026-06-11' 
ORDER BY id
```

## 📝 How to Add the Full World Cup Schedule

### Option 1: Update matches.json (Recommended)

**1. Edit the file:** `backend/data/matches.json`

**2. Add all World Cup matches:**
```json
[
  {
    "id": "match_001",
    "match_date": "2026-06-11",
    "home_team": "USA",
    "away_team": "MEX"
  },
  {
    "id": "match_002",
    "match_date": "2026-06-11",
    "home_team": "CAN",
    "away_team": "JAM"
  },
  {
    "id": "match_003",
    "match_date": "2026-06-12",
    "home_team": "ENG",
    "away_team": "GER"
  }
  // ... add all 104 World Cup matches
]
```

**3. Reset the database:**
```powershell
Remove-Item backend/data/worldcup.db
cd backend
npm start
```

The new schedule will be loaded automatically!

### Option 2: Add Matches via API

You can add matches programmatically using the database directly:

```javascript
// In backend, add a new route or run this in database.js
db.run(
  'INSERT INTO matches (id, match_date, home_team, away_team) VALUES (?, ?, ?, ?)',
  ['match_100', '2026-06-15', 'BRA', 'ARG']
);
```

### Option 3: Import from CSV/Excel

Create a script to import matches from a spreadsheet:

```javascript
// backend/scripts/import-matches.js
const fs = require('fs');
const csv = require('csv-parser');
const db = require('../database');

fs.createReadStream('world-cup-schedule.csv')
  .pipe(csv())
  .on('data', (row) => {
    db.run(
      'INSERT INTO matches (id, match_date, home_team, away_team, venue) VALUES (?, ?, ?, ?, ?)',
      [row.id, row.date, row.home, row.away, row.venue]
    );
  });
```

## 🌍 Getting the Official World Cup Schedule

### Where to Find It

1. **FIFA Official Website**
   - https://www.fifa.com/fifaplus/en/tournaments/mens/worldcup/canadamexicousa2026

2. **Sports APIs**
   - API-Football (RapidAPI)
   - The Sports DB
   - SportRadar

3. **Manual Entry**
   - Create a spreadsheet with all matches
   - Convert to JSON format
   - Import into the application

## 📋 Match Data Format

### Required Fields
```json
{
  "id": "match_XXX",           // Unique identifier
  "match_date": "2026-06-11",  // YYYY-MM-DD format
  "home_team": "USA",          // Home team code
  "away_team": "MEX"           // Away team code
}
```

### Optional Fields
```json
{
  "match_time": "12:00:00",    // Match time
  "venue": "MetLife Stadium",  // Stadium name
  "city": "New York",          // City
  "stage": "group",            // Tournament stage
  "group_name": "Group A"      // Group identifier
}
```

## 🔄 How Predictions Work with Dates

### Daily Prediction Flow

1. **User opens dashboard** → Gets today's date (e.g., "2026-06-11")
2. **Frontend requests matches** → `GET /api/matches/2026-06-11`
3. **Backend queries database** → `WHERE match_date = '2026-06-11'`
4. **Returns matches** → All matches scheduled for that day
5. **User makes prediction** → Predicts total goals for ALL matches that day
6. **Prediction is locked** → When first match of the day starts

### Example Timeline

**June 11, 2026:**
- Match 1: USA vs MEX at 12:00 PM
- Match 2: CAN vs JAM at 3:00 PM
- Match 3: BRA vs ARG at 6:00 PM

**User Experience:**
- Opens app at 10:00 AM → Sees all 3 matches
- Makes prediction: "8 goals total"
- Prediction locks at 12:00 PM (first match starts)
- After 6:00 PM (last match ends) → Points are calculated

## 🎯 Quick Setup for Testing

### Add Sample Matches for Multiple Days

Edit `backend/data/matches.json`:

```json
[
  {
    "id": "match_001",
    "match_date": "2026-06-11",
    "home_team": "USA",
    "away_team": "MEX"
  },
  {
    "id": "match_002",
    "match_date": "2026-06-11",
    "home_team": "CAN",
    "away_team": "JAM"
  },
  {
    "id": "match_003",
    "match_date": "2026-06-12",
    "home_team": "ENG",
    "away_team": "GER"
  },
  {
    "id": "match_004",
    "match_date": "2026-06-12",
    "home_team": "FRA",
    "away_team": "ESP"
  },
  {
    "id": "match_005",
    "match_date": "2026-06-13",
    "home_team": "BRA",
    "away_team": "ARG"
  }
]
```

Then reset database:
```powershell
Remove-Item backend/data/worldcup.db
cd backend
npm start
```

## 🔍 Checking What Matches Are Loaded

### Via Browser Console

```javascript
// Get all matches
fetch('http://localhost:3000/api/matches')
  .then(r => r.json())
  .then(console.table);

// Get matches for specific date
fetch('http://localhost:3000/api/matches/2026-06-11')
  .then(r => r.json())
  .then(console.table);
```

### Via PowerShell

```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/matches" | Format-Table
```

## 📊 Match Schedule Template

Here's a template for the full World Cup schedule:

```json
[
  {
    "id": "match_001",
    "match_date": "2026-06-11",
    "match_time": "12:00:00",
    "home_team": "USA",
    "away_team": "MEX",
    "venue": "MetLife Stadium",
    "city": "New York",
    "stage": "group",
    "group_name": "Group A"
  },
  // ... repeat for all 104 matches
]
```

## 🎯 Summary

**How it works:**
1. Matches are stored in `backend/data/matches.json`
2. Loaded into SQLite database on startup
3. Dashboard queries by date: `WHERE match_date = today`
4. Only matches for that specific date are shown
5. Users predict total goals for that day's matches

**To add more matches:**
1. Edit `backend/data/matches.json`
2. Delete `backend/data/worldcup.db`
3. Restart backend
4. New schedule is loaded!

**Current sample data:**
- June 11: 3 matches (USA-MEX, CAN-JAM, BRA-ARG)
- June 12: 2 matches (ENG-GER, FRA-ESP)

You can add the full 104-match World Cup schedule by updating the JSON file!