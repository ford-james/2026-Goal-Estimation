# Admin Guide - Match Result Management

## Updating Match Results

Since this is a small team application, match results can be updated manually using the API.

### Method 1: Using Browser Console (Easiest)

1. Open your browser's Developer Tools (F12)
2. Go to the Console tab
3. Run this command to update a match result:

```javascript
fetch('http://localhost:3000/api/matches/match_001/result', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ homeScore: 2, awayScore: 1 })
})
.then(r => r.json())
.then(data => console.log('Result updated:', data));
```

Replace:
- `match_001` with the actual match ID
- `homeScore: 2` with the home team's score
- `awayScore: 1` with the away team's score

### Method 2: Using PowerShell

```powershell
$body = @{
    homeScore = 2
    awayScore = 1
} | ConvertTo-Json

Invoke-RestMethod -Uri "http://localhost:3000/api/matches/match_001/result" `
    -Method POST `
    -Body $body `
    -ContentType "application/json"
```

### Method 3: Using curl (if installed)

```bash
curl -X POST http://localhost:3000/api/matches/match_001/result \
  -H "Content-Type: application/json" \
  -d '{"homeScore": 2, "awayScore": 1}'
```

## Finding Match IDs

### View all matches:

**Browser Console:**
```javascript
fetch('http://localhost:3000/api/matches')
  .then(r => r.json())
  .then(matches => console.table(matches));
```

**PowerShell:**
```powershell
Invoke-RestMethod -Uri "http://localhost:3000/api/matches" | Format-Table
```

## What Happens When You Update Results

1. Match status changes to "completed"
2. Home and away scores are recorded
3. Total goals for that day are calculated
4. All predictions for that day are scored automatically
5. Points are awarded based on accuracy
6. Leaderboard updates automatically

## Scoring Formula

```
Points = max(0, 100 - (|Predicted - Actual| × 10))
```

Examples:
- Exact prediction: 100 points
- Off by 1: 90 points
- Off by 2: 80 points
- Off by 5: 50 points
- Off by 10+: 0 points

## Checking Results

After updating match results, verify:

1. **Check the match was updated:**
```javascript
fetch('http://localhost:3000/api/matches/match_001')
  .then(r => r.json())
  .then(match => console.log(match));
```

2. **Check predictions were scored:**
```javascript
fetch('http://localhost:3000/api/predictions/2026-06-11')
  .then(r => r.json())
  .then(preds => console.table(preds));
```

3. **Check leaderboard:**
```javascript
fetch('http://localhost:3000/api/leaderboard')
  .then(r => r.json())
  .then(board => console.table(board));
```

## Common Match IDs

Based on the sample data:
- `match_001` - USA vs MEX (2026-06-11)
- `match_002` - CAN vs JAM (2026-06-11)
- `match_003` - BRA vs ARG (2026-06-11)
- `match_004` - ENG vs GER (2026-06-12)
- `match_005` - FRA vs ESP (2026-06-12)

## Example: Complete Day Update

Update all matches for June 11, 2026:

```javascript
// Match 1: USA 2-1 MEX
fetch('http://localhost:3000/api/matches/match_001/result', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ homeScore: 2, awayScore: 1 })
}).then(r => r.json()).then(console.log);

// Match 2: CAN 1-1 JAM
fetch('http://localhost:3000/api/matches/match_002/result', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ homeScore: 1, awayScore: 1 })
}).then(r => r.json()).then(console.log);

// Match 3: BRA 3-2 ARG
fetch('http://localhost:3000/api/matches/match_003/result', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ homeScore: 3, awayScore: 2 })
}).then(r => r.json()).then(console.log);

// Total goals for the day: 3 + 2 + 5 = 10 goals
```

## Troubleshooting

### "Match not found"
- Check the match ID is correct
- Use `GET /api/matches` to see all match IDs

### "Points not calculating"
- Make sure all matches for that day are marked as completed
- Check the backend console for errors
- Restart the backend server if needed

### "Leaderboard not updating"
- Refresh the frontend page
- Check browser console for errors
- Verify the API is returning updated data

## Adding More Matches

To add matches for future dates, you can:

1. Edit `backend/data/matches.json`
2. Add new match objects:
```json
{
  "id": "match_006",
  "match_date": "2026-06-13",
  "home_team": "ITA",
  "away_team": "POR"
}
```
3. Restart the backend server

Or use the database directly (requires SQLite tools):
```sql
INSERT INTO matches (id, match_date, home_team, away_team) 
VALUES ('match_006', '2026-06-13', 'ITA', 'POR');
```

## Quick Reference

**Update match result:**
```javascript
fetch('http://localhost:3000/api/matches/MATCH_ID/result', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({ homeScore: X, awayScore: Y })
}).then(r => r.json()).then(console.log);
```

**View all matches:**
```javascript
fetch('http://localhost:3000/api/matches')
  .then(r => r.json())
  .then(console.table);
```

**View leaderboard:**
```javascript
fetch('http://localhost:3000/api/leaderboard')
  .then(r => r.json())
  .then(console.table);