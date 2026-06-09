import { useState, useEffect } from 'react';
import { api } from '../api';

export function Admin() {
  const [formData, setFormData] = useState({
    matchDate: '',
    matchTime: '20:00',
    homeTeam: '',
    awayTeam: '',
    group: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState(null);
  const [error, setError] = useState(null);
  const [matches, setMatches] = useState([]);
  const [loadingMatches, setLoadingMatches] = useState(true);
  const [scores, setScores] = useState({});
  const [updatingScore, setUpdatingScore] = useState({});

  useEffect(() => {
    loadMatches();
  }, []);

  const loadMatches = async () => {
    try {
      setLoadingMatches(true);
      const allMatches = await api.getAllMatches();
      setMatches(allMatches);
    } catch (err) {
      console.error('Error loading matches:', err);
    } finally {
      setLoadingMatches(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage(null);
    setError(null);

    try {
      const result = await api.createMatch(
        formData.matchDate,
        formData.matchTime,
        formData.homeTeam,
        formData.awayTeam,
        formData.group
      );

      if (result.success) {
        setMessage(`Match created successfully! ID: ${result.match.id}`);
        // Reset form
        setFormData({
          matchDate: '',
          matchTime: '20:00',
          homeTeam: '',
          awayTeam: '',
          group: ''
        });
      } else {
        setError(result.error || 'Failed to create match');
      }
    } catch (err) {
      setError('Failed to create match: ' + err.message);
      console.error('Error creating match:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleScoreChange = (matchId, team, value) => {
    setScores(prev => ({
      ...prev,
      [matchId]: {
        ...prev[matchId],
        [team]: value
      }
    }));
  };

  const handleScoreSubmit = async (matchId, e) => {
    e.preventDefault();
    const matchScores = scores[matchId];
    
    if (!matchScores || matchScores.home === undefined || matchScores.away === undefined) {
      setError('Please enter both scores');
      return;
    }

    setUpdatingScore(prev => ({ ...prev, [matchId]: true }));
    
    try {
      await api.updateMatchResult(matchId, parseInt(matchScores.home), parseInt(matchScores.away));
      setMessage(`Match result updated successfully! Points calculated for all predictions.`);
      setError(null);
      // Reload matches to show updated status
      await loadMatches();
      // Clear scores for this match
      setScores(prev => {
        const newScores = { ...prev };
        delete newScores[matchId];
        return newScores;
      });
    } catch (err) {
      setError('Failed to update match result: ' + err.message);
      console.error('Error updating match result:', err);
    } finally {
      setUpdatingScore(prev => ({ ...prev, [matchId]: false }));
    }
  };

  const formatMatchDate = (match) => {
    const matchDateTime = new Date(`${match.match_date}T${match.match_time}:00Z`);
    return matchDateTime.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div style={{ 
      padding: 'var(--spacing-07)', 
      maxWidth: '800px', 
      margin: '0 auto',
      animation: 'fadeIn 0.5s ease-out'
    }}>
      {/* Header */}
      <div style={{ marginBottom: 'var(--spacing-07)', animation: 'slideIn 0.5s ease-out' }}>
        <h1 style={{ 
          color: 'var(--ibm-gray-100)', 
          marginBottom: 'var(--spacing-02)',
          fontSize: '2rem',
          fontWeight: '600'
        }}>
          🔧 Admin Panel
        </h1>
        <p style={{ 
          color: 'var(--ibm-gray-70)', 
          fontSize: '1rem',
          fontWeight: '400'
        }}>
          Create new matches for the tournament
        </p>
      </div>

      {/* Success Message */}
      {message && (
        <div className="card" style={{
          padding: 'var(--spacing-05)',
          background: 'linear-gradient(135deg, #f0fff4 0%, #c6f6d5 100%)',
          border: '2px solid #48bb78',
          borderRadius: '8px',
          marginBottom: 'var(--spacing-06)',
          animation: 'scaleIn 0.3s ease-out',
          color: '#22543d'
        }}>
          <strong>✓ Success:</strong> {message}
        </div>
      )}

      {/* Error Message */}
      {error && (
        <div className="card" style={{
          padding: 'var(--spacing-05)',
          background: 'linear-gradient(135deg, #fff5f5 0%, #ffe5e5 100%)',
          border: '2px solid var(--error)',
          borderRadius: '8px',
          marginBottom: 'var(--spacing-06)',
          animation: 'scaleIn 0.3s ease-out',
          color: 'var(--error)'
        }}>
          <strong>⚠️ Error:</strong> {error}
        </div>
      )}

      {/* Create Match Form */}
      <div className="card" style={{
        padding: 'var(--spacing-07)',
        background: 'white',
        borderRadius: '12px',
        border: '2px solid var(--ibm-blue-30)',
        animation: 'scaleIn 0.4s ease-out'
      }}>
        <h2 style={{ 
          marginBottom: 'var(--spacing-06)',
          color: 'var(--ibm-gray-100)',
          fontSize: '1.5rem',
          fontWeight: '600'
        }}>
          Create New Match
        </h2>

        <form onSubmit={handleSubmit} style={{ display: 'grid', gap: 'var(--spacing-05)' }}>
          {/* Match Date */}
          <div>
            <label style={{ 
              display: 'block',
              marginBottom: 'var(--spacing-02)',
              fontSize: '0.875rem',
              fontWeight: '600',
              color: 'var(--ibm-gray-100)'
            }}>
              Match Date *
            </label>
            <input
              type="date"
              name="matchDate"
              value={formData.matchDate}
              onChange={handleChange}
              className="input"
              style={{ width: '100%' }}
              required
            />
          </div>

          {/* Match Time */}
          <div>
            <label style={{ 
              display: 'block',
              marginBottom: 'var(--spacing-02)',
              fontSize: '0.875rem',
              fontWeight: '600',
              color: 'var(--ibm-gray-100)'
            }}>
              Match Time (UTC) *
            </label>
            <input
              type="time"
              name="matchTime"
              value={formData.matchTime}
              onChange={handleChange}
              className="input"
              style={{ width: '100%' }}
              required
            />
          </div>

          {/* Home Team */}
          <div>
            <label style={{ 
              display: 'block',
              marginBottom: 'var(--spacing-02)',
              fontSize: '0.875rem',
              fontWeight: '600',
              color: 'var(--ibm-gray-100)'
            }}>
              Home Team *
            </label>
            <input
              type="text"
              name="homeTeam"
              value={formData.homeTeam}
              onChange={handleChange}
              placeholder="e.g., Brazil"
              className="input"
              style={{ width: '100%' }}
              required
            />
          </div>

          {/* Away Team */}
          <div>
            <label style={{ 
              display: 'block',
              marginBottom: 'var(--spacing-02)',
              fontSize: '0.875rem',
              fontWeight: '600',
              color: 'var(--ibm-gray-100)'
            }}>
              Away Team *
            </label>
            <input
              type="text"
              name="awayTeam"
              value={formData.awayTeam}
              onChange={handleChange}
              placeholder="e.g., Argentina"
              className="input"
              style={{ width: '100%' }}
              required
            />
          </div>

          {/* Group */}
          <div>
            <label style={{ 
              display: 'block',
              marginBottom: 'var(--spacing-02)',
              fontSize: '0.875rem',
              fontWeight: '600',
              color: 'var(--ibm-gray-100)'
            }}>
              Group (Optional)
            </label>
            <input
              type="text"
              name="group"
              value={formData.group}
              onChange={handleChange}
              placeholder="e.g., Group A"
              className="input"
              style={{ width: '100%' }}
            />
          </div>

          {/* Submit Button */}
          <button 
            type="submit"
            className="btn btn-primary"
            disabled={loading}
            style={{ 
              marginTop: 'var(--spacing-04)',
              padding: 'var(--spacing-04) var(--spacing-06)',
              fontSize: '1rem',
              fontWeight: '600',
              opacity: loading ? 0.6 : 1,
              cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? '⏳ Creating...' : '✓ Create Match'}
          </button>
        </form>
      </div>

      {/* Match Results Section */}
      <div style={{ marginTop: 'var(--spacing-09)' }}>
        <h2 style={{
          marginBottom: 'var(--spacing-06)',
          color: 'var(--ibm-gray-100)',
          fontSize: '1.5rem',
          fontWeight: '600'
        }}>
          📊 Enter Match Results
        </h2>

        {loadingMatches ? (
          <div style={{
            display: 'flex',
            justifyContent: 'center',
            padding: 'var(--spacing-07)'
          }}>
            <div className="spinner"></div>
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 'var(--spacing-05)' }}>
            {matches.map((match) => {
              const matchScores = scores[match.id] || { home: match.home_score ?? '', away: match.away_score ?? '' };
              const isCompleted = match.status === 'completed';
              const isUpdating = updatingScore[match.id];

              return (
                <div
                  key={match.id}
                  className="card"
                  style={{
                    padding: 'var(--spacing-06)',
                    background: isCompleted ? 'linear-gradient(135deg, #f0fff4 0%, #e6ffed 100%)' : 'white',
                    borderRadius: '12px',
                    border: isCompleted ? '2px solid #48bb78' : '2px solid var(--ibm-gray-30)'
                  }}
                >
                  {/* Match Header */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 'var(--spacing-04)',
                    flexWrap: 'wrap',
                    gap: 'var(--spacing-03)'
                  }}>
                    <div style={{
                      fontSize: '0.875rem',
                      color: 'var(--ibm-gray-70)',
                      fontWeight: '500'
                    }}>
                      {formatMatchDate(match)}
                    </div>
                    
                    {isCompleted && (
                      <div style={{
                        padding: 'var(--spacing-02) var(--spacing-04)',
                        background: '#48bb78',
                        color: 'white',
                        borderRadius: '20px',
                        fontSize: '0.75rem',
                        fontWeight: '600'
                      }}>
                        ✓ COMPLETED
                      </div>
                    )}
                  </div>

                  {/* Match Teams */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 'var(--spacing-05)',
                    gap: 'var(--spacing-04)'
                  }}>
                    <div style={{ flex: 1, textAlign: 'center' }}>
                      <div style={{
                        fontSize: '1.25rem',
                        fontWeight: '600',
                        color: 'var(--ibm-gray-100)',
                        marginBottom: 'var(--spacing-02)'
                      }}>
                        {match.home_team}
                      </div>
                      {isCompleted && (
                        <div style={{
                          fontSize: '2rem',
                          fontWeight: '700',
                          color: 'var(--ibm-blue-60)'
                        }}>
                          {match.home_score}
                        </div>
                      )}
                    </div>
                    
                    <div style={{
                      fontSize: '1rem',
                      fontWeight: '700',
                      color: 'var(--ibm-gray-50)',
                      minWidth: '40px',
                      textAlign: 'center'
                    }}>
                      vs
                    </div>
                    
                    <div style={{ flex: 1, textAlign: 'center' }}>
                      <div style={{
                        fontSize: '1.25rem',
                        fontWeight: '600',
                        color: 'var(--ibm-gray-100)',
                        marginBottom: 'var(--spacing-02)'
                      }}>
                        {match.away_team}
                      </div>
                      {isCompleted && (
                        <div style={{
                          fontSize: '2rem',
                          fontWeight: '700',
                          color: 'var(--ibm-blue-60)'
                        }}>
                          {match.away_score}
                        </div>
                      )}
                    </div>
                  </div>

                  {/* Score Entry Form */}
                  {!isCompleted && (
                    <form onSubmit={(e) => handleScoreSubmit(match.id, e)} style={{
                      display: 'flex',
                      gap: 'var(--spacing-04)',
                      alignItems: 'center',
                      padding: 'var(--spacing-05)',
                      background: 'var(--ibm-gray-10)',
                      borderRadius: '8px',
                      flexWrap: 'wrap'
                    }}>
                      <label style={{
                        fontSize: '0.875rem',
                        fontWeight: '600',
                        color: 'var(--ibm-gray-100)'
                      }}>
                        Final Score:
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="20"
                        value={matchScores.home}
                        onChange={(e) => handleScoreChange(match.id, 'home', e.target.value)}
                        placeholder="Home"
                        className="input"
                        style={{
                          flex: '0 0 80px',
                          fontSize: '1rem',
                          fontWeight: '600',
                          textAlign: 'center',
                          padding: 'var(--spacing-03)'
                        }}
                        required
                      />
                      <span style={{ fontSize: '0.875rem', color: 'var(--ibm-gray-70)', fontWeight: '600' }}>
                        -
                      </span>
                      <input
                        type="number"
                        min="0"
                        max="20"
                        value={matchScores.away}
                        onChange={(e) => handleScoreChange(match.id, 'away', e.target.value)}
                        placeholder="Away"
                        className="input"
                        style={{
                          flex: '0 0 80px',
                          fontSize: '1rem',
                          fontWeight: '600',
                          textAlign: 'center',
                          padding: 'var(--spacing-03)'
                        }}
                        required
                      />
                      <button
                        type="submit"
                        className="btn btn-primary"
                        disabled={isUpdating}
                        style={{
                          marginLeft: 'auto',
                          padding: 'var(--spacing-03) var(--spacing-05)',
                          fontSize: '0.875rem',
                          fontWeight: '600',
                          opacity: isUpdating ? 0.6 : 1,
                          cursor: isUpdating ? 'not-allowed' : 'pointer'
                        }}
                      >
                        {isUpdating ? '⏳ Updating...' : '✓ Submit Result'}
                      </button>
                    </form>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Info Box */}
      <div className="card" style={{
        marginTop: 'var(--spacing-06)',
        padding: 'var(--spacing-05)',
        background: 'var(--ibm-blue-10)',
        border: '2px solid var(--ibm-blue-30)',
        borderRadius: '8px'
      }}>
        <div style={{ fontSize: '1.25rem', marginBottom: 'var(--spacing-03)' }}>ℹ️</div>
        <p style={{
          margin: 0,
          fontSize: '0.875rem',
          color: 'var(--ibm-gray-70)',
          lineHeight: '1.5'
        }}>
          <strong>Note:</strong> When you submit a match result, the system automatically calculates points
          for all user predictions. Users earn 100 points for exact predictions, with 10 points deducted
          for each goal difference.
        </p>
      </div>
    </div>
  );
}

// Made with Bob