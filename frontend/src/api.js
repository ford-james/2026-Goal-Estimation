const API = 'http://localhost:3000/api';

export const api = {
  getUsers: () => 
    fetch(`${API}/users`).then(r => r.json()),
  
  // Per-match prediction endpoints
  submitPrediction: (userId, matchId, goals) =>
    fetch(`${API}/predictions`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId, matchId, goals })
    }).then(r => r.json()),
  
  getPredictionsForMatch: (matchId) =>
    fetch(`${API}/predictions/match/${matchId}`).then(r => r.json()),
  
  getUserPredictions: (userId) =>
    fetch(`${API}/predictions/user/${userId}`).then(r => r.json()),
  
  getUserPredictionForMatch: (userId, matchId) =>
    fetch(`${API}/predictions/user/${userId}/match/${matchId}`).then(r => r.json()),
  
  getLeaderboard: () =>
    fetch(`${API}/leaderboard`).then(r => r.json()),
  
  getMatches: (date) =>
    fetch(`${API}/matches/${date}`).then(r => r.json()),
  
  getAllMatches: () =>
    fetch(`${API}/matches`).then(r => r.json()),
  
  getUpcomingMatches: () =>
    fetch(`${API}/matches/upcoming/all`).then(r => r.json()),
  
  updateMatchResult: (matchId, homeScore, awayScore) =>
    fetch(`${API}/matches/${matchId}/result`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ homeScore, awayScore })
    }).then(r => r.json()),
  
  getWatsonSuggestionForMatch: (matchId) =>
    fetch(`${API}/watson/match/${matchId}`).then(r => r.json()),
  
  lockPredictions: () =>
    fetch(`${API}/predictions/lock`, {
      method: 'POST'
    }).then(r => r.json()),
  
  createMatch: (matchDate, matchTime, homeTeam, awayTeam, group) =>
    fetch(`${API}/matches`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ matchDate, matchTime, homeTeam, awayTeam, group })
    }).then(r => r.json())
};

// Made with Bob
