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
        <div style={{ display: 'grid', gap: 'var(--spacing-06)' }}>
          {matches.map((match, index) => {
            const locked = isMatchLocked(match);
            const userPred = userPredictions[match.id];
            const currentPrediction = predictions[match.id] ?? (userPred ? userPred.predicted_goals : '');
            
            return (
              <div
                key={match.id}
                className="card hover-lift"
                style={{
                  padding: 0,
                  background: locked
                    ? 'linear-gradient(135deg, #f8f9fa 0%, #e9ecef 100%)'
                    : 'linear-gradient(135deg, #ffffff 0%, #f8f9ff 100%)',
                  borderRadius: '16px',
                  animation: `slideIn 0.5s ease-out ${index * 0.1}s both`,
                  border: locked ? '2px solid var(--ibm-gray-30)' : '2px solid var(--ibm-blue-40)',
                  opacity: locked ? 0.85 : 1,
                  transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                  overflow: 'hidden',
                  position: 'relative',
                  boxShadow: locked
                    ? '0 4px 12px rgba(0, 0, 0, 0.08)'
                    : '0 4px 20px rgba(15, 98, 254, 0.15)'
                }}
              >
                {/* Decorative top bar */}
                <div style={{
                  height: '6px',
                  background: locked
                    ? 'linear-gradient(90deg, var(--ibm-gray-40) 0%, var(--ibm-gray-50) 100%)'
                    : 'linear-gradient(90deg, var(--ibm-blue-60) 0%, var(--ibm-purple-50) 100%)',
                  width: '100%'
                }} />
                
                <div style={{ padding: 'var(--spacing-06)' }}>
                  {/* Match Header */}
                  <div style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginBottom: 'var(--spacing-06)',
                    flexWrap: 'wrap',
                    gap: 'var(--spacing-03)'
                  }}>
                    <div style={{
                      display: 'flex',
                      alignItems: 'center',
                      gap: 'var(--spacing-03)'
                    }}>
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '8px',
                        background: locked
                          ? 'linear-gradient(135deg, var(--ibm-gray-30) 0%, var(--ibm-gray-40) 100%)'
                          : 'linear-gradient(135deg, var(--ibm-blue-50) 0%, var(--ibm-blue-60) 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1.25rem',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)'
                      }}>
                        ⚽
                      </div>
                      <div>
                        <div style={{
                          fontSize: '0.875rem',
                          color: 'var(--ibm-gray-70)',
                          fontWeight: '600',
                          marginBottom: '2px'
                        }}>
                          {formatMatchTime(match)}
                        </div>
                        <div style={{
                          fontSize: '0.75rem',
                          color: 'var(--ibm-gray-60)',
                          fontWeight: '500'
                        }}>
                          Match #{match.id.split('_')[1]}
                        </div>
                      </div>
                    </div>
                    
                    {locked ? (
                      <div style={{
                        padding: 'var(--spacing-03) var(--spacing-05)',
                        background: 'linear-gradient(135deg, var(--ibm-gray-60) 0%, var(--ibm-gray-70) 100%)',
                        color: 'white',
                        borderRadius: '24px',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--spacing-02)',
                        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.15)',
                        letterSpacing: '0.5px'
                      }}>
                        🔒 LOCKED
                      </div>
                    ) : (
                      <div style={{
                        padding: 'var(--spacing-03) var(--spacing-05)',
                        background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
                        color: 'white',
                        borderRadius: '24px',
                        fontSize: '0.75rem',
                        fontWeight: '700',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--spacing-02)',
                        boxShadow: '0 2px 8px rgba(16, 185, 129, 0.3)',
                        letterSpacing: '0.5px',
                        animation: 'pulse 2s ease-in-out infinite'
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
                    marginBottom: 'var(--spacing-06)',
                    padding: 'var(--spacing-05)',
                    background: locked
                      ? 'rgba(0, 0, 0, 0.02)'
                      : 'linear-gradient(135deg, rgba(15, 98, 254, 0.03) 0%, rgba(138, 63, 252, 0.03) 100%)',
                    borderRadius: '12px',
                    border: `1px solid ${locked ? 'var(--ibm-gray-20)' : 'var(--ibm-blue-20)'}`
                  }}>
                    <div style={{ flex: 1, textAlign: 'center' }}>
                      <div style={{
                        fontSize: '2.5rem',
                        marginBottom: 'var(--spacing-02)'
                      }}>
                        🏴
                      </div>
                      <div style={{
                        fontSize: '1.25rem',
                        fontWeight: '700',
                        color: locked ? 'var(--ibm-gray-70)' : 'var(--ibm-gray-100)',
                        marginBottom: 'var(--spacing-01)',
                        lineHeight: 1.2
                      }}>
                        {match.home_team}
                      </div>
                      <div style={{
                        fontSize: '0.75rem',
                        color: 'var(--ibm-gray-60)',
                        fontWeight: '500',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        Home
                      </div>
                    </div>
                    
                    <div style={{
                      padding: '0 var(--spacing-05)',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: 'var(--spacing-02)'
                    }}>
                      <div style={{
                        width: '48px',
                        height: '48px',
                        borderRadius: '50%',
                        background: locked
                          ? 'linear-gradient(135deg, var(--ibm-gray-30) 0%, var(--ibm-gray-40) 100%)'
                          : 'linear-gradient(135deg, var(--ibm-blue-60) 0%, var(--ibm-purple-50) 100%)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '1rem',
                        fontWeight: '900',
                        color: 'white',
                        boxShadow: locked
                          ? '0 4px 12px rgba(0, 0, 0, 0.1)'
                          : '0 4px 16px rgba(15, 98, 254, 0.3)',
                        letterSpacing: '1px'
                      }}>
                        VS
                      </div>
                    </div>
                    
                    <div style={{ flex: 1, textAlign: 'center' }}>
                      <div style={{
                        fontSize: '2.5rem',
                        marginBottom: 'var(--spacing-02)'
                      }}>
                        🏴
                      </div>
                      <div style={{
                        fontSize: '1.25rem',
                        fontWeight: '700',
                        color: locked ? 'var(--ibm-gray-70)' : 'var(--ibm-gray-100)',
                        marginBottom: 'var(--spacing-01)',
                        lineHeight: 1.2
                      }}>
                        {match.away_team}
                      </div>
                      <div style={{
                        fontSize: '0.75rem',
                        color: 'var(--ibm-gray-60)',
                        fontWeight: '500',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                      }}>
                        Away
                      </div>
                    </div>
                  </div>

                  {/* Prediction Form */}
                  {!locked && (
                    <form onSubmit={(e) => handleSubmit(match.id, e)} style={{
                      display: 'flex',
                      gap: 'var(--spacing-04)',
                      alignItems: 'center',
                      padding: 'var(--spacing-06)',
                      background: 'linear-gradient(135deg, var(--ibm-blue-10) 0%, rgba(138, 63, 252, 0.08) 100%)',
                      borderRadius: '12px',
                      flexWrap: 'wrap',
                      border: '2px dashed var(--ibm-blue-30)'
                    }}>
                      <label style={{
                        fontSize: '0.875rem',
                        fontWeight: '700',
                        color: 'var(--ibm-gray-100)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 'var(--spacing-02)'
                      }}>
                        <span style={{ fontSize: '1.25rem' }}>🎯</span>
                        Your Prediction:
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="20"
                        value={currentPrediction}
                        onChange={(e) => handlePredictionChange(match.id, e.target.value)}
                        placeholder="?"
                        className="input"
                        style={{
                          flex: '0 0 100px',
                          fontSize: '1.5rem',
                          fontWeight: '700',
                          textAlign: 'center',
                          padding: 'var(--spacing-04)',
                          border: '2px solid var(--ibm-blue-40)',
                          background: 'white',
                          boxShadow: '0 2px 8px rgba(15, 98, 254, 0.1)'
                        }}
                        required
                      />
                      <span style={{
                        fontSize: '0.875rem',
                        color: 'var(--ibm-gray-70)',
                        fontWeight: '600'
                      }}>
                        total goals
                      </span>
                      <button
                        type="submit"
                        className="btn btn-primary"
                        style={{
                          marginLeft: 'auto',
                          padding: 'var(--spacing-04) var(--spacing-06)',
                          fontSize: '0.875rem',
                          fontWeight: '700',
                          background: 'linear-gradient(135deg, var(--ibm-blue-60) 0%, var(--ibm-purple-50) 100%)',
                          boxShadow: '0 4px 12px rgba(15, 98, 254, 0.3)',
                          letterSpacing: '0.5px'
                        }}
                      >
                        {userPred ? '✏️ Update Prediction' : '✓ Submit Prediction'}
                      </button>
                    </form>
                  )}

                  {/* Show existing prediction if locked */}
                  {locked && userPred && (
                    <div style={{
                      padding: 'var(--spacing-06)',
                      background: 'linear-gradient(135deg, #f0f9ff 0%, #e0f2fe 100%)',
                      borderRadius: '12px',
                      textAlign: 'center',
                      border: '2px solid #bae6fd'
                    }}>
                      <div style={{
                        fontSize: '0.75rem',
                        color: 'var(--ibm-gray-70)',
                        marginBottom: 'var(--spacing-03)',
                        fontWeight: '600',
                        textTransform: 'uppercase',
                        letterSpacing: '1px'
                      }}>
                        Your Prediction
                      </div>
                      <div style={{
                        fontSize: '2.5rem',
                        fontWeight: '900',
                        color: 'var(--ibm-blue-60)',
                        marginBottom: 'var(--spacing-02)'
                      }}>
                        {userPred.predicted_goals}
                      </div>
                      <div style={{
                        fontSize: '0.875rem',
                        color: 'var(--ibm-gray-70)',
                        fontWeight: '600'
                      }}>
                        total goals
                      </div>
                    </div>
                  )}

                  {/* No prediction made and locked */}
                  {locked && !userPred && (
                    <div style={{
                      padding: 'var(--spacing-06)',
                      background: 'linear-gradient(135deg, #fef2f2 0%, #fee2e2 100%)',
                      borderRadius: '12px',
                      textAlign: 'center',
                      color: 'var(--ibm-gray-70)',
                      fontSize: '0.875rem',
                      fontWeight: '600',
                      border: '2px solid #fecaca'
                    }}>
                      <div style={{ fontSize: '2rem', marginBottom: 'var(--spacing-02)' }}>😔</div>
                      No prediction made
                    </div>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

// Made with Bob
