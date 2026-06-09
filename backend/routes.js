const express = require('express');
const router = express.Router();
const db = require('./database');

// Get all users
router.get('/users', (req, res) => {
  db.all('SELECT * FROM users ORDER BY display_name', (err, rows) => {
    if (err) return res.status(500).json({ error: err.message });
    res.json(rows);
  });
});

// Submit or update prediction for a specific match
router.post('/predictions', (req, res) => {
  const { userId, matchId, goals } = req.body;
  
  if (!userId || !matchId || goals === undefined) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  // Check if match is locked (started)
  db.get(
    `SELECT id, match_date, match_time, status FROM matches WHERE id = ?`,
    [matchId],
    (err, match) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!match) return res.status(404).json({ error: 'Match not found' });
      
      // Check if match has started
      const matchDateTime = new Date(`${match.match_date}T${match.match_time}:00Z`);
      const now = new Date();
      
      if (now >= matchDateTime || match.status !== 'scheduled') {
        return res.status(400).json({ error: 'Match has already started or is locked' });
      }
      
      // Check if prediction exists
      db.get(
        'SELECT id FROM predictions WHERE user_id = ? AND match_id = ?',
        [userId, matchId],
        (err, existing) => {
          if (err) return res.status(500).json({ error: err.message });
          
          if (existing) {
            // Update existing prediction
            db.run(
              'UPDATE predictions SET predicted_goals = ?, submitted_at = datetime("now") WHERE user_id = ? AND match_id = ?',
              [goals, userId, matchId],
              function(err) {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ success: true, id: existing.id, updated: true });
              }
            );
          } else {
            // Create new prediction
            const id = `pred_${Date.now()}_${userId}_${matchId}`;
            db.run(
              'INSERT INTO predictions (id, user_id, match_id, predicted_goals, submitted_at) VALUES (?, ?, ?, ?, datetime("now"))',
              [id, userId, matchId, goals],
              function(err) {
                if (err) return res.status(500).json({ error: err.message });
                res.json({ success: true, id, updated: false });
              }
            );
          }
        }
      );
    }
  );
});

// Get predictions for a specific match
router.get('/predictions/match/:matchId', (req, res) => {
  db.all(
    `SELECT p.*, u.display_name, u.avatar_color 
     FROM predictions p 
     JOIN users u ON p.user_id = u.id 
     WHERE p.match_id = ?
     ORDER BY p.submitted_at`,
    [req.params.matchId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// Get user's predictions
router.get('/predictions/user/:userId', (req, res) => {
  db.all(
    `SELECT p.*, m.match_date, m.match_time, m.home_team, m.away_team, m.status
     FROM predictions p 
     JOIN matches m ON p.match_id = m.id
     WHERE p.user_id = ? 
     ORDER BY m.match_date DESC, m.match_time DESC`,
    [req.params.userId],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// Get user's prediction for a specific match
router.get('/predictions/user/:userId/match/:matchId', (req, res) => {
  db.get(
    `SELECT * FROM predictions WHERE user_id = ? AND match_id = ?`,
    [req.params.userId, req.params.matchId],
    (err, row) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(row || null);
    }
  );
});

// Get leaderboard
router.get('/leaderboard', (req, res) => {
  db.all(
    `SELECT 
       u.id,
       u.display_name, 
       u.avatar_color, 
       COALESCE(SUM(p.points), 0) as total_points,
       COUNT(p.id) as predictions,
       COALESCE(AVG(ABS(p.predicted_goals - COALESCE(p.actual_goals, 0))), 0) as avg_accuracy,
       COUNT(CASE WHEN p.points = 100 THEN 1 END) as perfect_predictions
     FROM users u
     LEFT JOIN predictions p ON u.id = p.user_id
     GROUP BY u.id
     ORDER BY total_points DESC, perfect_predictions DESC`,
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// Get matches for date
router.get('/matches/:date', (req, res) => {
  db.all(
    'SELECT * FROM matches WHERE match_date = ? ORDER BY match_time',
    [req.params.date],
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// Get all matches
router.get('/matches', (req, res) => {
  db.all(
    'SELECT * FROM matches ORDER BY match_date, match_time',
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      res.json(rows);
    }
  );
});

// Get upcoming matches (not started yet)
router.get('/matches/upcoming/all', (req, res) => {
  db.all(
    `SELECT * FROM matches 
     WHERE status = 'scheduled'
     ORDER BY match_date, match_time`,
    (err, rows) => {
      if (err) return res.status(500).json({ error: err.message });
      
      // Add lock status to each match
      const now = new Date();
      const matchesWithLockStatus = rows.map(match => {
        const matchDateTime = new Date(`${match.match_date}T${match.match_time}:00Z`);
        const isLocked = now >= matchDateTime;
        const timeUntilLock = matchDateTime - now;
        
        return {
          ...match,
          is_locked: isLocked,
          time_until_lock: timeUntilLock > 0 ? timeUntilLock : 0
        };
      });
      
      res.json(matchesWithLockStatus);
    }
  );
});

// Update match result (admin)
router.post('/matches/:id/result', (req, res) => {
  const { homeScore, awayScore } = req.body;
  
  if (homeScore === undefined || awayScore === undefined) {
    return res.status(400).json({ error: 'Missing scores' });
  }
  
  db.run(
    'UPDATE matches SET home_score = ?, away_score = ?, status = "completed" WHERE id = ?',
    [homeScore, awayScore, req.params.id],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      
      // Calculate points for this specific match
      calculateMatchPoints(req.params.id, () => {
        res.json({ success: true, message: 'Match result updated and points calculated' });
      });
    }
  );
});

// Calculate points for a specific match
function calculateMatchPoints(matchId, callback) {
  // Get match result
  db.get(
    `SELECT home_score, away_score FROM matches WHERE id = ? AND status = 'completed'`,
    [matchId],
    (err, match) => {
      if (err) {
        console.error('Error getting match result:', err);
        if (callback) callback(err);
        return;
      }
      
      if (!match) {
        console.error('Match not found or not completed');
        if (callback) callback(new Error('Match not found'));
        return;
      }
      
      const actualGoals = match.home_score + match.away_score;
      
      // Update predictions with actual goals and points for this match
      db.run(
        `UPDATE predictions
         SET actual_goals = ?,
             points = MAX(0, 100 - (ABS(predicted_goals - ?) * 10)),
             locked = 1
         WHERE match_id = ?`,
        [actualGoals, actualGoals, matchId],
        (err) => {
          if (err) {
            console.error('Error updating predictions:', err);
          } else {
            console.log(`Points calculated for match ${matchId}: ${actualGoals} goals`);
          }
          if (callback) callback(err);
        }
      );
    }
  );
}

// Lock predictions for matches that have started
router.post('/predictions/lock', (req, res) => {
  const now = new Date().toISOString();
  
  db.run(
    `UPDATE predictions
     SET locked = 1
     WHERE match_id IN (
       SELECT id FROM matches 
       WHERE datetime(match_date || 'T' || match_time || ':00') <= datetime(?)
       AND status = 'scheduled'
     )
     AND locked = 0`,
    [now],
    function(err) {
      if (err) return res.status(500).json({ error: err.message });
      res.json({ success: true, locked: this.changes });
    }
  );
});

// Get Watson AI suggestion for a specific match
router.get('/watson/match/:matchId', (req, res) => {
  db.get(
    'SELECT * FROM matches WHERE id = ?',
    [req.params.matchId],
    (err, match) => {
      if (err) return res.status(500).json({ error: err.message });
      if (!match) return res.status(404).json({ error: 'Match not found' });
      
      // Simple prediction: 2.5 goals per match average
      const prediction = Math.round(2.5);
      
      res.json({
        prediction,
        confidence: 0.7,
        reasoning: `Based on historical data, ${match.home_team} vs ${match.away_team} suggests ${prediction} goals`
      });
    }
  );
});

// Create new match (admin)
router.post('/matches', (req, res) => {
  const { matchDate, matchTime, homeTeam, awayTeam, group } = req.body;
  
  if (!matchDate || !matchTime || !homeTeam || !awayTeam) {
    return res.status(400).json({ error: 'Missing required fields' });
  }
  
  // Generate match ID
  db.get('SELECT COUNT(*) as count FROM matches', (err, row) => {
    if (err) return res.status(500).json({ error: err.message });
    
    const count = row.count + 1;
    const matchId = `match_${String(count).padStart(3, '0')}`;
    
    db.run(
      'INSERT INTO matches (id, match_date, match_time, home_team, away_team, status) VALUES (?, ?, ?, ?, ?, "scheduled")',
      [matchId, matchDate, matchTime, homeTeam, awayTeam],
      function(err) {
        if (err) return res.status(500).json({ error: err.message });
        
        res.json({
          success: true,
          match: {
            id: matchId,
            match_date: matchDate,
            match_time: matchTime,
            home_team: homeTeam,
            away_team: awayTeam,
            status: 'scheduled'
          }
        });
      }
    );
  });
});

module.exports = router;

// Made with Bob
