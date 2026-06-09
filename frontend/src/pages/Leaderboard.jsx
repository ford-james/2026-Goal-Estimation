import { useState, useEffect } from 'react';
import { api } from '../api';

export function Leaderboard() {
  const [leaderboard, setLeaderboard] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadLeaderboard();
  }, []);

  const loadLeaderboard = async () => {
    try {
      const data = await api.getLeaderboard();
      setLeaderboard(data);
    } catch (err) {
      console.error('Error loading leaderboard:', err);
    } finally {
      setLoading(false);
    }
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
        <p style={{ color: 'var(--ibm-gray-70)', fontSize: '0.875rem' }}>Loading leaderboard...</p>
      </div>
    );
  }

  const getMedalEmoji = (rank) => {
    if (rank === 1) return '🥇';
    if (rank === 2) return '🥈';
    if (rank === 3) return '🥉';
    return '';
  };

  const getRankColor = (rank) => {
    if (rank === 1) return 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)';
    if (rank === 2) return 'linear-gradient(135deg, #C0C0C0 0%, #A8A8A8 100%)';
    if (rank === 3) return 'linear-gradient(135deg, #CD7F32 0%, #B8860B 100%)';
    return 'var(--ibm-gray-10)';
  };

  return (
    <div style={{ 
      padding: 'var(--spacing-07)', 
      maxWidth: '1000px', 
      margin: '0 auto',
      animation: 'fadeIn 0.5s ease-out'
    }}>
      {/* Header */}
      <div style={{ 
        marginBottom: 'var(--spacing-07)',
        animation: 'slideIn 0.5s ease-out'
      }}>
        <h1 style={{ 
          color: 'var(--ibm-gray-100)', 
          marginBottom: 'var(--spacing-02)',
          fontSize: '2rem',
          fontWeight: '600',
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--spacing-03)'
        }}>
          <span style={{ fontSize: '2.5rem' }}>🏆</span>
          Leaderboard
        </h1>
        <p style={{ 
          color: 'var(--ibm-gray-70)', 
          fontSize: '1rem'
        }}>
          Top predictors competing for the championship
        </p>
      </div>

      {leaderboard.length === 0 ? (
        <div className="card glass" style={{
          padding: 'var(--spacing-08)',
          textAlign: 'center',
          animation: 'scaleIn 0.4s ease-out'
        }}>
          <div style={{ fontSize: '3rem', marginBottom: 'var(--spacing-04)' }}>📊</div>
          <h3 style={{ marginBottom: 'var(--spacing-03)', color: 'var(--ibm-gray-100)' }}>
            No predictions yet
          </h3>
          <p style={{ color: 'var(--ibm-gray-70)', margin: 0 }}>
            Be the first to make a prediction!
          </p>
        </div>
      ) : (
        <>
          {/* Leaderboard Cards */}
          <div style={{ marginBottom: 'var(--spacing-07)' }}>
            {leaderboard.map((player, idx) => {
              const rank = idx + 1;
              const isTopThree = rank <= 3;
              
              return (
                <div 
                  key={player.id}
                  className="card hover-lift"
                  style={{ 
                    padding: 'var(--spacing-06)',
                    marginBottom: 'var(--spacing-04)',
                    background: isTopThree 
                      ? `linear-gradient(135deg, white 0%, ${rank === 1 ? '#fff9e6' : rank === 2 ? '#f5f5f5' : '#fff5e6'} 100%)`
                      : 'white',
                    borderRadius: '12px',
                    border: isTopThree ? '2px solid var(--ibm-blue-30)' : '2px solid transparent',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 'var(--spacing-05)',
                    animation: `slideIn 0.5s ease-out ${idx * 0.05}s both`,
                    transition: 'all 0.3s cubic-bezier(0.4, 0, 0.2, 1)',
                    position: 'relative',
                    overflow: 'hidden'
                  }}
                >
                  {/* Rank Badge */}
                  <div style={{
                    minWidth: '60px',
                    height: '60px',
                    borderRadius: '12px',
                    background: getRankColor(rank),
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: isTopThree ? '1.5rem' : '1.25rem',
                    fontWeight: '700',
                    color: isTopThree ? 'white' : 'var(--ibm-gray-100)',
                    boxShadow: isTopThree ? '0 4px 12px rgba(0, 0, 0, 0.15)' : 'none',
                    flexShrink: 0
                  }}>
                    {getMedalEmoji(rank) || `#${rank}`}
                  </div>

                  {/* Player Info */}
                  <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--spacing-03)', marginBottom: 'var(--spacing-02)' }}>
                      <div style={{ 
                        width: '32px',
                        height: '32px',
                        borderRadius: '50%',
                        background: `linear-gradient(135deg, ${player.avatar_color} 0%, ${player.avatar_color}dd 100%)`,
                        flexShrink: 0,
                        boxShadow: `0 2px 8px ${player.avatar_color}40`
                      }} />
                      <span style={{ 
                        fontSize: '1.125rem',
                        fontWeight: '600',
                        color: 'var(--ibm-gray-100)',
                        overflow: 'hidden',
                        textOverflow: 'ellipsis',
                        whiteSpace: 'nowrap'
                      }}>
                        {player.display_name}
                      </span>
                    </div>
                    
                    {/* Stats Row */}
                    <div style={{ 
                      display: 'flex', 
                      gap: 'var(--spacing-05)',
                      fontSize: '0.75rem',
                      color: 'var(--ibm-gray-70)',
                      flexWrap: 'wrap'
                    }}>
                      <span>
                        <strong style={{ color: 'var(--ibm-gray-100)' }}>{player.predictions || 0}</strong> predictions
                      </span>
                      <span>•</span>
                      <span>
                        <strong style={{ color: 'var(--success)' }}>{player.perfect_predictions || 0}</strong> perfect
                      </span>
                      {player.predictions > 0 && (
                        <>
                          <span>•</span>
                          <span>
                            <strong style={{ color: 'var(--ibm-blue-60)' }}>±{player.avg_accuracy.toFixed(1)}</strong> avg
                          </span>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Points */}
                  <div style={{
                    textAlign: 'right',
                    flexShrink: 0
                  }}>
                    <div style={{ 
                      fontSize: '1.75rem',
                      fontWeight: '700',
                      color: isTopThree ? 'var(--ibm-blue-60)' : 'var(--ibm-gray-100)',
                      lineHeight: 1
                    }}>
                      {player.total_points || 0}
                    </div>
                    <div style={{ 
                      fontSize: '0.75rem',
                      color: 'var(--ibm-gray-60)',
                      marginTop: 'var(--spacing-01)'
                    }}>
                      points
                    </div>
                  </div>

                  {/* Top 3 Shine Effect */}
                  {isTopThree && (
                    <div style={{
                      position: 'absolute',
                      top: 0,
                      left: 0,
                      right: 0,
                      height: '3px',
                      background: getRankColor(rank),
                      animation: 'shimmer 2s infinite'
                    }} />
                  )}
                </div>
              );
            })}
          </div>

          {/* Scoring Info Card */}
          <div className="card glass" style={{
            padding: 'var(--spacing-06)',
            borderRadius: '12px',
            border: '2px solid var(--ibm-blue-20)',
            animation: 'fadeIn 0.8s ease-out 0.5s both'
          }}>
            <h3 style={{ 
              marginTop: 0, 
              marginBottom: 'var(--spacing-04)',
              color: 'var(--ibm-gray-100)',
              fontSize: '1.125rem',
              fontWeight: '600'
            }}>
              📊 Scoring System
            </h3>
            <div style={{ 
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: 'var(--spacing-04)',
              fontSize: '0.875rem',
              color: 'var(--ibm-gray-70)'
            }}>
              <div>
                <strong style={{ color: 'var(--success)' }}>Perfect:</strong> 100 points
              </div>
              <div>
                <strong style={{ color: 'var(--ibm-blue-60)' }}>Off by 1:</strong> 90 points
              </div>
              <div>
                <strong style={{ color: 'var(--ibm-purple-50)' }}>Off by 2:</strong> 80 points
              </div>
              <div>
                <strong style={{ color: 'var(--ibm-gray-70)' }}>Off by 5:</strong> 50 points
              </div>
            </div>
            <p style={{ 
              margin: 'var(--spacing-04) 0 0 0', 
              fontSize: '0.75rem', 
              color: 'var(--ibm-gray-60)',
              fontFamily: 'var(--font-mono)'
            }}>
              Formula: Points = max(0, 100 - (|predicted - actual| × 10))
            </p>
          </div>
        </>
      )}
    </div>
  );
}

// Made with Bob
