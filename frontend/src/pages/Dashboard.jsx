import { useState, useEffect } from 'react';
import { api } from '../api';

export function Dashboard({ userId }) {
  const [matches, setMatches] = useState([]);
  const [predictions, setPredictions] = useState({});
  const [userPredictions, setUserPredictions] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    loadData();
    // Update current time every second for countdown
    const timer = setInterval(() => {
      setCurrentTime(new Date());
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const loadData = async () => {
    try {
      setLoading(true);
      const [upcomingMatches, userPreds] = await Promise.all([
        api.getUpcomingMatches(),
        api.getUserPredictions(userId)
      ]);
      
      setMatches(upcomingMatches);
      
      // Create a map of user predictions by match_id
      const predMap = {};
      userPreds.forEach(pred => {
        predMap[pred.match_id] = pred;
      });
      setUserPredictions(predMap);
      
    } catch (err) {
      setError('Failed to load data: ' + err.message);
      console.error('Error loading data:', err);
    } finally {
      setLoading(false);
    }
  };

  const handlePredictionChange = (matchId, value) => {
    setPredictions(prev => ({
      ...prev,
      [matchId]: value
    }));
  };

  const handleSubmit = async (matchId, e) => {
    e.preventDefault();
    const goals = predictions[matchId];
    
    if (goals === undefined || goals === '') {
      setError('Please enter a prediction');
      return;
    }

    try {
      await api.submitPrediction(userId, matchId, parseInt(goals));
      setError(null);
      // Reload data to get updated predictions
      await loadData();
      // Clear the input for this match
      setPredictions(prev => {
        const newPreds = { ...prev };
        delete newPreds[matchId];
        return newPreds;
      });
    } catch (err) {
      setError('Failed to submit prediction: ' + err.message);
      console.error('Error submitting:', err);
    }
  };

  const formatTimeUntilLock = (match) => {
    const matchDateTime = new Date(`${match.match_date}T${match.match_time}:00Z`);
    const diff = matchDateTime - currentTime;
    
    if (diff <= 0) return 'LOCKED';
    
    const hours = Math.floor(diff / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((diff % (1000 * 60)) / 1000);
    
    if (hours > 24) {
      const days = Math.floor(hours / 24);
      return `${days}d ${hours % 24}h`;
    }
    
    return `${hours}h ${minutes}m ${seconds}s`;
  };

  const isMatchLocked = (match) => {
    const matchDateTime = new Date(`${match.match_date}T${match.match_time}:00Z`);
    return currentTime >= matchDateTime || match.status !== 'scheduled';
  };

  const formatMatchTime = (match) => {
    const matchDateTime = new Date(`${match.match_date}T${match.match_time}:00Z`);
    return matchDateTime.toLocaleString('en-US', {
      weekday: 'short',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  if (loading) {
    return (
      <div style={{ 
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        minHeight: '60vh',
        flexDirection: 'column',
        gap: 'var(--spacing-05)'
      }}>
        <div className="spinner"></div>
        <p style={{ color: 'var(--ibm-gray-70)', fontSize: '0.875rem' }}>Loading matches...</p>
      </div>
    );
  }

  return (
    <div style={{ 
      padding: 'var(--spacing-07)', 
      maxWidth: '1200px', 
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
          Upcoming Matches
        </h1>
        <p style={{ 
          color: 'var(--ibm-gray-70)', 
          fontSize: '1rem',
          fontWeight: '400'
        }}>
          Make your predictions before each match starts
        </p>
      </div>

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

      {/* Matches Section */}
      {matches.length === 0 ? (
        <div className="card glass" style={{
          padding: 'var(--spacing-08)',
          textAlign: 'center',
          marginBottom: 'var(--spacing-07)',
          animation: 'scaleIn 0.4s ease-out'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: 'var(--spacing-04)' }}>📅</div>
          <h3 style={{ marginBottom: 'var(--spacing-03)', color: 'var(--ibm-gray-100)' }}>
            No upcoming matches
          </h3>
          <p style={{ color: 'var(--ibm-gray-70)', margin: 0 }}>
            Check back when new matches are scheduled!
          </p>
        </div>
      ) : (
        <div style={{ display: 'grid', gap: 'var(--spacing-05)' }}>
          {matches.map((match, index) => {
            const locked = isMatchLocked(match);
            const userPred = userPredictions[match.id];
            const currentPrediction = predictions[match.id] ?? (userPred ? userPred.predicted_goals : '');
            
            return (
              <div 
                key={match.id} 
                className="card hover-lift"
                style={{ 
                  padding: 'var(--spacing-06)', 
                  background: locked ? 'linear-gradient(135deg, #f4f4f4 0%, #e0e0e0 100%)' : 'white',
                  borderRadius: '12px',
                  animation: `slideIn 0.5s ease-out ${index * 0.1}s both`,
                  border: locked ? '2px solid var(--ibm-gray-30)' : '2px solid var(--ibm-blue-30)',
                  opacity: locked ? 0.7 : 1,
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
                }}
              >
                {/* Match Header */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: 'var(--spacing-05)',
                  flexWrap: 'wrap',
                  gap: 'var(--spacing-03)'
                }}>
                  <div style={{ 
                    fontSize: '0.875rem', 
                    color: 'var(--ibm-gray-70)',
                    fontWeight: '500'
                  }}>
                    {formatMatchTime(match)}
                  </div>
                  
                  {locked ? (
                    <div style={{
                      padding: 'var(--spacing-02) var(--spacing-04)',
                      background: 'var(--ibm-gray-50)',
                      color: 'white',
                      borderRadius: '20px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--spacing-02)'
                    }}>
                      🔒 LOCKED
                    </div>
                  ) : (
                    <div style={{
                      padding: 'var(--spacing-02) var(--spacing-04)',
                      background: 'linear-gradient(135deg, var(--ibm-blue-60) 0%, var(--ibm-blue-70) 100%)',
                      color: 'white',
                      borderRadius: '20px',
                      fontSize: '0.75rem',
                      fontWeight: '600',
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--spacing-02)'
                    }}>
                      ⏰ {formatTimeUntilLock(match)}
                    </div>
                  )}
                </div>

                {/* Match Teams */}
                <div style={{ 
                  display: 'flex', 
                  justifyContent: 'space-between', 
                  alignItems: 'center',
                  marginBottom: 'var(--spacing-05)'
                }}>
                  <div style={{ flex: 1, textAlign: 'center' }}>
                    <div style={{ 
                      fontSize: '1.5rem', 
                      fontWeight: '600',
                      color: locked ? 'var(--ibm-gray-70)' : 'var(--ibm-gray-100)'
                    }}>
                      {match.home_team}
                    </div>
                  </div>
                  
                  <div style={{ 
                    padding: '0 var(--spacing-06)',
                    fontSize: '1.25rem',
                    fontWeight: '700',
                    color: 'var(--ibm-gray-50)',
                    minWidth: '60px',
                    textAlign: 'center'
                  }}>
                    vs
                  </div>
                  
                  <div style={{ flex: 1, textAlign: 'center' }}>
                    <div style={{ 
                      fontSize: '1.5rem', 
                      fontWeight: '600',
                      color: locked ? 'var(--ibm-gray-70)' : 'var(--ibm-gray-100)'
                    }}>
                      {match.away_team}
                    </div>
                  </div>
                </div>

                {/* Prediction Form */}
                {!locked && (
                  <form onSubmit={(e) => handleSubmit(match.id, e)} style={{
                    display: 'flex',
                    gap: 'var(--spacing-04)',
                    alignItems: 'center',
                    padding: 'var(--spacing-05)',
                    background: 'var(--ibm-blue-10)',
                    borderRadius: '8px',
                    flexWrap: 'wrap'
                  }}>
                    <label style={{ 
                      fontSize: '0.875rem', 
                      fontWeight: '600',
                      color: 'var(--ibm-gray-100)'
                    }}>
                      Your Prediction:
                    </label>
                    <input
                      type="number"
                      min="0"
                      max="20"
                      value={currentPrediction}
                      onChange={(e) => handlePredictionChange(match.id, e.target.value)}
                      placeholder="Goals"
                      className="input"
                      style={{ 
                        flex: '0 0 100px',
                        fontSize: '1.125rem',
                        fontWeight: '600',
                        textAlign: 'center',
                        padding: 'var(--spacing-03)'
                      }}
                      required
                    />
                    <span style={{ fontSize: '0.875rem', color: 'var(--ibm-gray-70)', fontWeight: '500' }}>
                      goals
                    </span>
                    <button 
                      type="submit"
                      className="btn btn-primary"
                      style={{ 
                        marginLeft: 'auto',
                        padding: 'var(--spacing-03) var(--spacing-05)',
                        fontSize: '0.875rem',
                        fontWeight: '600'
                      }}
                    >
                      {userPred ? '✏️ Update' : '✓ Submit'}
                    </button>
                  </form>
                )}

                {/* Show existing prediction if locked */}
                {locked && userPred && (
                  <div style={{
                    padding: 'var(--spacing-05)',
                    background: 'var(--ibm-gray-20)',
                    borderRadius: '8px',
                    textAlign: 'center'
                  }}>
                    <div style={{ 
                      fontSize: '0.875rem', 
                      color: 'var(--ibm-gray-70)',
                      marginBottom: 'var(--spacing-02)'
                    }}>
                      Your Prediction
                    </div>
                    <div style={{ 
                      fontSize: '1.5rem', 
                      fontWeight: '700',
                      color: 'var(--ibm-gray-100)'
                    }}>
                      {userPred.predicted_goals} goals
                    </div>
                  </div>
                )}

                {/* No prediction made and locked */}
                {locked && !userPred && (
                  <div style={{
                    padding: 'var(--spacing-05)',
                    background: 'var(--ibm-gray-20)',
                    borderRadius: '8px',
                    textAlign: 'center',
                    color: 'var(--ibm-gray-70)',
                    fontSize: '0.875rem'
                  }}>
                    No prediction made
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Made with Bob
